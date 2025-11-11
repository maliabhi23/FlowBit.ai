from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from groq import Groq
from typing import Optional
import json
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables from .env file
load_dotenv()
logger.info(f"Environment loaded - GROQ_API_KEY present: {bool(os.getenv('GROQ_API_KEY'))}")
logger.info(f"Environment loaded - DATABASE_URL present: {bool(os.getenv('DATABASE_URL'))}")

app = FastAPI(title="Vanna AI Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq client
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    logger.error("GROQ_API_KEY not found in environment variables!")
    raise ValueError("GROQ_API_KEY must be set in .env file")

if GROQ_API_KEY.startswith("project_"):
    logger.warning("GROQ_API_KEY appears to be a project ID, not an API key. Get your API key from https://console.groq.com/keys")

groq_client = Groq(api_key=GROQ_API_KEY)

# Database connection
def get_db_connection():
    database_url = os.getenv("DATABASE_URL") or os.getenv("VANNA_DATABASE_URL")
    if not database_url:
        raise ValueError("DATABASE_URL or VANNA_DATABASE_URL must be set")
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

# Request/Response models
class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    sql: str
    result: list

# Schema information for SQL generation
SCHEMA_INFO = """
Database Schema (PostgreSQL - case-sensitive, use double quotes for table and column names):

Table: "Invoice" (must use quotes)
Columns:
  - "id" (uuid, primary key)
  - "documentId" (string, unique)
  - "invoiceId" (string)
  - "invoiceDate" (timestamp)
  - "deliveryDate" (timestamp)
  - "vendorName" (string)
  - "vendorAddress" (string)
  - "vendorTaxId" (string)
  - "customerName" (string)
  - "customerAddress" (string)
  - "subTotal" (float)
  - "totalTax" (float)
  - "invoiceTotal" (float)
  - "currency" (string)
  - "status" (string)
  - "organizationId" (string)
  - "departmentId" (string)
  - "createdAt" (timestamp)
  - "updatedAt" (timestamp)

Table: "LineItem" (must use quotes)
Columns:
  - "id" (uuid, primary key)
  - "invoiceId" (uuid, foreign key to "Invoice"."id")
  - "srNo" (integer)
  - "description" (string)
  - "quantity" (float)
  - "unitPrice" (float)
  - "totalPrice" (float)
  - "category" (string)
  - "createdAt" (timestamp)
"""
#...
@app.get("/")
def root():
    return {"message": "Vanna AI Service", "status": "running"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/query", response_model=QueryResponse)
async def query(request: QueryRequest):
    """
    Accepts a natural language query and returns SQL query + results.
    Uses Groq API to generate SQL from natural language.
    """
    if not request.query:
        raise HTTPException(status_code=400, detail="Query is required")

    logger.info(f"Received query: {request.query}")
    
    try:
        # Generate SQL using Groq
        system_prompt = f"""You are a SQL expert. Given a natural language query about invoice data, generate a valid PostgreSQL query.

{SCHEMA_INFO}

CRITICAL Rules:
1. ALWAYS use double quotes for table names: "Invoice" and "LineItem" (they are case-sensitive)
2. ALWAYS use double quotes for column names (e.g., "invoiceTotal", "invoiceDate")
3. Only generate SELECT queries (no INSERT, UPDATE, DELETE, DROP)
4. Return ONLY the SQL query without code blocks, explanations, or markdown
5. Use proper JOINs when needed
6. For date ranges, use: "invoiceDate" >= CURRENT_DATE - INTERVAL '90 days'
7. Handle NULL values properly

Example: SELECT "invoiceTotal" FROM "Invoice" WHERE "invoiceDate" >= CURRENT_DATE - INTERVAL '90 days'
"""

        user_prompt = f"Generate a PostgreSQL query for: {request.query}"

        logger.info("Calling Groq API to generate SQL...")
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.1,
        )

        sql_query = chat_completion.choices[0].message.content.strip()
        logger.info(f"Generated SQL (raw): {sql_query}")

        # Remove markdown code blocks if present
        if "```" in sql_query:
            # Extract SQL from code blocks
            parts = sql_query.split("```")
            for part in parts:
                if "SELECT" in part.upper():
                    sql_query = part.strip()
                    if sql_query.startswith("sql"):
                        sql_query = sql_query[3:].strip()
                    break
        
        # Remove any explanatory text after the query
        sql_query = sql_query.split("\n\n")[0].strip()
        
        # Only fix unquoted identifiers (don't double-quote already quoted ones)
        import re
        
        # Fix unquoted table names (but not already quoted ones)
        sql_query = re.sub(r'(?<!")(\bInvoice\b)(?!")', r'"\1"', sql_query)
        sql_query = re.sub(r'(?<!")(\bLineItem\b)(?!")', r'"\1"', sql_query)
        
        # Fix unquoted column names (but not already quoted ones)
        columns = [
            'invoiceTotal', 'invoiceDate', 'invoiceId', 'vendorName', 'vendorAddress',
            'customerName', 'subTotal', 'totalTax', 'status', 'documentId', 'deliveryDate',
            'vendorTaxId', 'customerAddress', 'currency', 'organizationId', 'departmentId',
            'createdAt', 'updatedAt', 'id', 'srNo', 'description', 'quantity', 'unitPrice',
            'totalPrice', 'category'
        ]
        for col in columns:
            # Only quote if not already quoted
            sql_query = re.sub(rf'(?<!")(\b{col}\b)(?!")', rf'"\1"', sql_query)
        
        logger.info(f"Generated SQL (cleaned): {sql_query}")

        # Execute SQL query
        logger.info("Connecting to database...")
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            logger.info("Executing SQL query...")
            cursor.execute(sql_query)
            columns = [desc[0] for desc in cursor.description] if cursor.description else []
            rows = cursor.fetchall()
            
            logger.info(f"Query returned {len(rows)} rows")
            
            # Convert to list of dicts (RealDictCursor already returns dicts)
            result = []
            for row in rows:
                row_dict = {}
                for col in columns:
                    value = row[col]  # Access by column name, not index
                    # Convert datetime, decimal and other types to string
                    if hasattr(value, 'isoformat'):
                        value = value.isoformat()
                    elif isinstance(value, (dict, list)):
                        value = json.dumps(value)
                    elif value is None:
                        value = None  # Keep None as-is
                    else:
                        # Convert Decimal and other numeric types to standard Python types
                        value = str(value) if not isinstance(value, (int, float, bool, str)) else value
                    row_dict[col] = value
                result.append(row_dict)
            
            logger.info(f"Successfully processed query")
            return QueryResponse(sql=sql_query, result=result)
        except Exception as e:
            logger.error(f"SQL execution error: {str(e)}")
            raise HTTPException(
                status_code=400,
                detail=f"SQL execution error: {str(e)}. Generated SQL: {sql_query}"
            )
        finally:
            cursor.close()
            conn.close()

    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("VANNA_PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)



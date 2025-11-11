'use client'

import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  sql?: string
  data?: any[]  // Raw data for table rendering
}

export default function ChatWithDataPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  // Helper to format values (especially numbers/currency)
  const formatValue = (key: string, value: any): string => {
    if (value === null || value === undefined) return 'N/A'
    
    // Check if it looks like a currency/money field
    if (typeof value === 'number' || !isNaN(Number(value))) {
      const numValue = Number(value)
      if (key.toLowerCase().includes('total') || 
          key.toLowerCase().includes('amount') || 
          key.toLowerCase().includes('price') ||
          key.toLowerCase().includes('sum')) {
        return `$${numValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      }
      return numValue.toLocaleString('en-US')
    }
    
    return String(value)
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch(`${apiUrl}/chat-with-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input }),
      })

      const data = await response.json()
      
      // Format the result for display
      let formattedResult = 'No results found'
      let resultData = null
      
      if (data.result && Array.isArray(data.result) && data.result.length > 0) {
        if (data.result.length === 1 && Object.keys(data.result[0]).length === 1) {
          // Single value result (like SUM, COUNT, AVG)
          const value = Object.values(data.result[0])[0]
          const key = Object.keys(data.result[0])[0]
          const formattedValue = formatValue(key, value)
          formattedResult = `${key}: ${formattedValue}`
        } else if (data.result.length <= 10) {
          // Multiple rows - store for table rendering
          formattedResult = `Found ${data.result.length} result(s)`
          resultData = data.result
        } else {
          // Too many rows - just show count
          formattedResult = `Found ${data.result.length} results (showing first 10)`
          resultData = data.result.slice(0, 10)
        }
      }
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: formattedResult,
        sql: data.sql,
        data: resultData,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Error: Could not process your query. Please try again.',
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Chat with Data</h1>
        <p className="text-gray-600 mt-1">Ask questions about your invoice data in natural language</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-white rounded-lg shadow">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            <p className="text-lg mb-2">Start a conversation</p>
            <p className="text-sm">Try asking: "What are the top 5 vendors by total spend?"</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              
              {/* Render table if data is present */}
              {msg.data && msg.data.length > 0 && (
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full text-sm border border-gray-300">
                    <thead className="bg-gray-200">
                      <tr>
                        {Object.keys(msg.data[0]).map((key) => (
                          <th key={key} className="px-3 py-2 text-left font-semibold border-b border-gray-300">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {msg.data.map((row, rowIdx) => (
                        <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          {Object.entries(row).map(([key, value], colIdx) => (
                            <td key={colIdx} className="px-3 py-2 border-b border-gray-200">
                              {formatValue(key, value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {msg.sql && (
                <details className="mt-2">
                  <summary className="text-xs opacity-75 cursor-pointer">View SQL</summary>
                  <pre className="mt-2 text-xs bg-black/20 p-2 rounded overflow-x-auto">
                    {msg.sql}
                  </pre>
                </details>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-4">
              <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question about your data..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
          Send
        </button>
      </div>
    </div>
  )
}



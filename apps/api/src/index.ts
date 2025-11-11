import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'

dotenv.config()

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: "http://localhost:3000"
}))
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// GET /stats - Summary metrics
app.get('/stats', async (req, res) => {
  try {
    // Calculate year-to-date (YTD) - from January 1st of current year
    const currentYear = new Date().getFullYear()
    const ytdStart = new Date(currentYear, 0, 1) // January 1st

    const [totalInvoices, totalSpend, ytdSpend, avgInvoice, documentsUploaded] = await Promise.all([
      prisma.invoice.count({
        where: { status: 'processed' },
      }),
      prisma.invoice.aggregate({
        _sum: { invoiceTotal: true },
      }),
      prisma.invoice.aggregate({
        where: {
          invoiceDate: { gte: ytdStart },
        },
        _sum: { invoiceTotal: true },
      }),
      prisma.invoice.aggregate({
        _avg: { invoiceTotal: true },
      }),
      prisma.invoice.count(), // Total documents uploaded
    ])

    res.json({
      totalInvoicesProcessed: totalInvoices,
      totalSpendYTD: ytdSpend._sum.invoiceTotal || 0,
      documentsUploaded,
      averageInvoiceValue: avgInvoice._avg.invoiceTotal || 0,
      totalSpend: totalSpend._sum.invoiceTotal || 0, // Keep for backward compatibility
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

// GET /invoice-trends - Monthly invoice count and spend
app.get('/invoice-trends', async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        invoiceDate: { not: null },
      },
      select: {
        invoiceDate: true,
        invoiceTotal: true,
      },
    })

    const trendsMap = new Map<string, { count: number; spend: number }>()

    invoices.forEach((invoice) => {
      if (invoice.invoiceDate) {
        const month = invoice.invoiceDate.toISOString().substring(0, 7) // YYYY-MM
        const existing = trendsMap.get(month) || { count: 0, spend: 0 }
        trendsMap.set(month, {
          count: existing.count + 1,
          spend: existing.spend + (invoice.invoiceTotal || 0),
        })
      }
    })

    const trends = Array.from(trendsMap.entries())
      .map(([month, data]) => ({
        month,
        count: data.count,
        spend: data.spend,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))

    res.json(trends)
  } catch (error) {
    console.error('Error fetching invoice trends:', error)
    res.status(500).json({ error: 'Failed to fetch invoice trends' })
  }
})

// GET /vendors/top10 - Top 10 vendors by total spend
app.get('/vendors/top10', async (req, res) => {
  try {
    const vendors = await prisma.invoice.groupBy({
      by: ['vendorName'],
      where: {
        vendorName: { not: null },
      },
      _sum: {
        invoiceTotal: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          invoiceTotal: 'desc',
        },
      },
      take: 10,
    })

    const result = vendors
      .filter((v) => v.vendorName)
      .map((v) => ({
        vendorName: v.vendorName!,
        totalSpend: v._sum.invoiceTotal || 0,
        invoiceCount: v._count.id,
      }))

    res.json(result)
  } catch (error) {
    console.error('Error fetching top vendors:', error)
    res.status(500).json({ error: 'Failed to fetch top vendors' })
  }
})

// GET /category-spend - Spend by category
app.get('/category-spend', async (req, res) => {
  try {
    const categories = await prisma.lineItem.groupBy({
      by: ['category'],
      where: {
        category: { not: null },
      },
      _sum: {
        totalPrice: true,
      },
    })

    const result = categories
      .filter((c) => c.category)
      .map((c) => ({
        category: c.category || 'Uncategorized',
        total: c._sum.totalPrice || 0,
      }))
      .sort((a, b) => b.total - a.total)

    res.json(result)
  } catch (error) {
    console.error('Error fetching category spend:', error)
    res.status(500).json({ error: 'Failed to fetch category spend' })
  }
})

// GET /cash-outflow - Forecast by date range
app.get('/cash-outflow', async (req, res) => {
  try {
    const { months = '6' } = req.query
    const monthsCount = parseInt(months as string, 10)
    
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - monthsCount)

    // Get monthly spend for forecast
    const invoices = await prisma.invoice.findMany({
      where: {
        invoiceDate: { gte: startDate },
        invoiceTotal: { not: null },
      },
      select: {
        invoiceDate: true,
        invoiceTotal: true,
      },
    })

    // Group by month
    const monthlyData = new Map<string, number>()
    invoices.forEach((invoice) => {
      if (invoice.invoiceDate) {
        const month = invoice.invoiceDate.toISOString().substring(0, 7) // YYYY-MM
        const existing = monthlyData.get(month) || 0
        monthlyData.set(month, existing + (invoice.invoiceTotal || 0))
      }
    })

    // Convert to array and sort
    const forecast = Array.from(monthlyData.entries())
      .map(([month, spend]) => ({
        month,
        spend,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))

    // Calculate average for next month forecast
    const totalSpend = forecast.reduce((sum, item) => sum + item.spend, 0)
    const averageMonthly = forecast.length > 0 ? totalSpend / forecast.length : 0

    // Add forecast for next month
    const lastMonth = forecast[forecast.length - 1]?.month || ''
    if (lastMonth) {
      const [year, month] = lastMonth.split('-').map(Number)
      const nextMonth = new Date(year, month, 1)
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      const nextMonthStr = nextMonth.toISOString().substring(0, 7)
      
      forecast.push({
        month: nextMonthStr,
        spend: averageMonthly,
      })
    }

    res.json(forecast)
  } catch (error) {
    console.error('Error fetching cash outflow:', error)
    res.status(500).json({ error: 'Failed to fetch cash outflow forecast' })
  }
})

// GET /invoices - List invoices with search
app.get('/invoices', async (req, res) => {
  try {
    const { search, page = '1', limit = '50' } = req.query
    const pageNum = parseInt(page as string, 10)
    const limitNum = parseInt(limit as string, 10)
    const skip = (pageNum - 1) * limitNum

    const where: any = {}
    if (search) {
      where.OR = [
        { invoiceId: { contains: search as string, mode: 'insensitive' } },
        { vendorName: { contains: search as string, mode: 'insensitive' } },
      ]
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        select: {
          id: true,
          invoiceId: true,
          invoiceDate: true,
          vendorName: true,
          invoiceTotal: true,
          status: true,
        },
        orderBy: {
          invoiceDate: 'desc',
        },
        skip,
        take: limitNum,
      }),
      prisma.invoice.count({ where }),
    ])

    res.json(invoices)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    res.status(500).json({ error: 'Failed to fetch invoices' })
  }
})

// POST /chat-with-data - Proxy to Vanna AI service
app.post('/chat-with-data', async (req, res) => {
  try {
    const { query } = req.body

    if (!query) {
      return res.status(400).json({ error: 'Query is required' })
    }

    const vannaUrl = process.env.VANNA_SERVICE_URL || 'http://localhost:8000'
    const response = await fetch(`${vannaUrl}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    })

    if (!response.ok) {
      throw new Error(`Vanna service error: ${response.statusText}`)
    }

    const data = await response.json()
    res.json(data)
  } catch (error) {
    console.error('Error proxying to Vanna service:', error)
    res.status(500).json({ error: 'Failed to process query' })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  process.exit(0)
})



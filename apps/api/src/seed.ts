import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface InvoiceData {
  _id: string
  invoiceId?: string
  invoiceDate?: string
  deliveryDate?: string
  vendorName?: string
  vendorAddress?: string
  vendorTaxId?: string
  customerName?: string
  customerAddress?: string
  subTotal?: number
  totalTax?: number
  invoiceTotal?: number
  currency?: string
  status?: string
  organizationId?: string
  departmentId?: string
  createdAt?: string
  updatedAt?: string
  lineItems?: Array<{
    srNo?: number
    description?: string
    quantity?: number
    unitPrice?: number
    totalPrice?: number
    Sachkonto?: string
    [key: string]: any
  }>
}

function extractNestedValue(obj: any, path: string): any {
  const keys = path.split('.')
  let value = obj
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key]
    } else {
      return null
    }
  }
  return value
}

function parseDate(dateStr: any): Date | null {
  if (!dateStr) return null
  if (typeof dateStr === 'object' && dateStr.$date) {
    return new Date(dateStr.$date)
  }
  if (typeof dateStr === 'string') {
    const date = new Date(dateStr)
    return isNaN(date.getTime()) ? null : date
  }
  return null
}

async function seed() {
  console.log('🌱 Starting seed process...')

  const dataPath = path.join(__dirname, '../../../data/Analytics_Test_Data.json')
  const rawData = fs.readFileSync(dataPath, 'utf-8')
  const invoices: any[] = JSON.parse(rawData)

  console.log(`📦 Found ${invoices.length} invoices to process`)

  let processed = 0
  let skipped = 0

  for (const invoice of invoices) {
    try {
      const extractedData = invoice.extractedData?.llmData || {}

      // Extract invoice data
      const invoiceData = extractedData.invoice?.value || {}
      const vendorData = extractedData.vendor?.value || {}
      const customerData = extractedData.customer?.value || {}
      const paymentData = extractedData.payment?.value || {}
      const summaryData = extractedData.summary?.value || {}
      const lineItemsData = extractedData.lineItems?.value?.items || []

      const invoiceId = invoiceData.invoiceId?.value || invoice.metadata?.title || invoice._id
      const invoiceDate = parseDate(invoiceData.invoiceDate?.value)
      const deliveryDate = parseDate(invoiceData.deliveryDate?.value)
      const vendorName = vendorData.vendorName?.value
      const vendorAddress = vendorData.vendorAddress?.value
      const vendorTaxId = vendorData.vendorTaxId?.value
      const customerName = customerData.customerName?.value
      const customerAddress = customerData.customerAddress?.value
      const subTotal = summaryData.subTotal?.value
      const totalTax = summaryData.totalTax?.value
      const invoiceTotal = summaryData.invoiceTotal?.value
      const status = invoice.status || 'processed'
      const organizationId = invoice.organizationId
      const departmentId = invoice.departmentId
      const createdAt = parseDate(invoice.createdAt) || new Date()
      const updatedAt = parseDate(invoice.updatedAt) || new Date()

      // Skip if no invoice total (likely invalid data)
      if (!invoiceTotal && invoiceTotal !== 0) {
        skipped++
        continue
      }

      // Create or update invoice
      const dbInvoice = await prisma.invoice.upsert({
        where: { documentId: invoice._id },
        update: {
          invoiceId,
          invoiceDate,
          deliveryDate,
          vendorName,
          vendorAddress,
          vendorTaxId,
          customerName,
          customerAddress,
          subTotal: typeof subTotal === 'number' ? subTotal : null,
          totalTax: typeof totalTax === 'number' ? totalTax : null,
          invoiceTotal: typeof invoiceTotal === 'number' ? invoiceTotal : null,
          status,
          organizationId,
          departmentId,
          updatedAt,
        },
        create: {
          documentId: invoice._id,
          invoiceId,
          invoiceDate,
          deliveryDate,
          vendorName,
          vendorAddress,
          vendorTaxId,
          customerName,
          customerAddress,
          subTotal: typeof subTotal === 'number' ? subTotal : null,
          totalTax: typeof totalTax === 'number' ? totalTax : null,
          invoiceTotal: typeof invoiceTotal === 'number' ? invoiceTotal : null,
          status,
          organizationId,
          departmentId,
          createdAt,
          updatedAt,
        },
      })

      // Delete existing line items and create new ones
      await prisma.lineItem.deleteMany({
        where: { invoiceId: dbInvoice.id },
      })

      // Process line items
      if (Array.isArray(lineItemsData) && lineItemsData.length > 0) {
        for (const item of lineItemsData) {
          const srNo = item.srNo?.value
          const description = item.description?.value
          const quantity = item.quantity?.value
          const unitPrice = item.unitPrice?.value
          const totalPrice = item.totalPrice?.value
          const category = item.Sachkonto?.value || item.category?.value || null

          if (description || totalPrice) {
            await prisma.lineItem.create({
              data: {
                invoiceId: dbInvoice.id,
                srNo: typeof srNo === 'number' ? srNo : null,
                description: description || null,
                quantity: typeof quantity === 'number' ? quantity : null,
                unitPrice: typeof unitPrice === 'number' ? unitPrice : null,
                totalPrice: typeof totalPrice === 'number' ? totalPrice : null,
                category: category || null,
              },
            })
          }
        }
      }

      processed++
      if (processed % 100 === 0) {
        console.log(`✅ Processed ${processed} invoices...`)
      }
    } catch (error) {
      console.error(`❌ Error processing invoice ${invoice._id}:`, error)
      skipped++
    }
  }

  console.log(`\n✨ Seed completed!`)
  console.log(`   ✅ Processed: ${processed}`)
  console.log(`   ⏭️  Skipped: ${skipped}`)
}

seed()
  .catch((error) => {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })



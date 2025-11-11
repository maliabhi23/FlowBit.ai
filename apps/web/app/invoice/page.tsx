import { InvoicesTable } from '@/components/InvoicesTable'

export default function InvoicePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <p className="text-gray-600 mt-1">View and manage all invoices</p>
      </div>

      <InvoicesTable />
    </div>
  )
}

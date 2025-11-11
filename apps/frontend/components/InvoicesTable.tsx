'use client'

import { useEffect, useState } from 'react'
import { Search, ArrowUpDown } from 'lucide-react'

interface Invoice {
  id: string
  invoiceId: string
  invoiceDate: string
  vendorName: string
  invoiceTotal: number
  status: string
}

type SortField = 'invoiceDate' | 'invoiceTotal' | 'vendorName'
type SortDirection = 'asc' | 'desc'

export function InvoicesTable() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('invoiceDate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [loading, setLoading] = useState(true)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch(`${apiUrl}/invoices`)
        const data = await response.json()
        setInvoices(data)
        setFilteredInvoices(data)
      } catch (error) {
        console.error('Error fetching invoices:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInvoices()
  }, [apiUrl])

  useEffect(() => {
    let filtered = invoices.filter(
      (invoice) =>
        invoice.invoiceId.toLowerCase().includes(search.toLowerCase()) ||
        invoice.vendorName.toLowerCase().includes(search.toLowerCase())
    )

    filtered.sort((a, b) => {
      let aVal: any = a[sortField]
      let bVal: any = b[sortField]

      if (sortField === 'invoiceDate') {
        aVal = new Date(aVal).getTime()
        bVal = new Date(bVal).getTime()
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    setFilteredInvoices(filtered)
  }, [search, sortField, sortDirection, invoices])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
        <div className="text-center py-8 text-gray-500">Loading invoices...</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900">Invoices by Vendor</h3>
          <span className="text-sm text-gray-500">{filteredInvoices.length} invoices</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by invoice ID or vendor name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto max-h-96">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
            <tr>
              <th
                className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('vendorName')}
              >
                <div className="flex items-center gap-1">
                  Vendor
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                # Invoices
              </th>
              <th
                className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('invoiceDate')}
              >
                <div className="flex items-center gap-1">
                  Date
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('invoiceTotal')}
              >
                <div className="flex items-center gap-1">
                  Net Value
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-500">
                  No invoices found
                </td>
              </tr>
            ) : (
              filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.vendorName}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-600">
                    1
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-600">
                    {new Date(invoice.invoiceDate).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    €{invoice.invoiceTotal.toLocaleString('de-DE', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}



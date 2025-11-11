'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts'

interface InvoiceTrend {
  month: string
  count: number
  spend: number
}

interface TopVendor {
  vendorName: string
  totalSpend: number
  invoiceCount: number
}

interface CategorySpend {
  category: string
  total: number
}

interface CashOutflow {
  month: string
  spend: number
}

interface ChartsProps {
  trends: InvoiceTrend[]
  topVendors: TopVendor[]
  categorySpend: CategorySpend[]
  cashOutflow: CashOutflow[]
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

// Custom tooltip formatter
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm font-semibold text-gray-900 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function Charts({ trends, topVendors, categorySpend, cashOutflow }: ChartsProps) {
  const [vendorSearchQuery, setVendorSearchQuery] = useState('')
  const [tableSearchQuery, setTableSearchQuery] = useState('')

  // Filter vendors based on search query for chart
  const filteredVendors = topVendors.filter(vendor =>
    vendor.vendorName.toLowerCase().includes(vendorSearchQuery.toLowerCase())
  )

  // Filter vendors based on search query for table
  const filteredTableVendors = topVendors.filter(vendor =>
    vendor.vendorName.toLowerCase().includes(tableSearchQuery.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {/* First Row - 2 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Invoice Trends Line Chart */}
      <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200 hover:shadow-md transition-shadow">
        <h3 className="text-base font-semibold text-gray-900 mb-1">Invoice Volume + Value Trend</h3>
        <p className="text-xs text-gray-500 mb-4">Invoice count and total spend over 12 months.</p>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart 
            data={trends.map(item => {
              const maxCount = Math.max(...trends.map(t => t.count))
              return {
                ...item,
                maxCount: maxCount
              }
            })}
          >
            <defs>
              <linearGradient id="backgroundGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(244, 245, 253)" stopOpacity={1} />
                <stop offset="100%" stopColor="rgb(220, 222, 240)" stopOpacity={1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
              tickFormatter={(value) => {
                const [year, month] = value.split('-')
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                return monthNames[parseInt(month) - 1]
              }}
            />
            <YAxis 
              yAxisId="left" 
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
            />
            <YAxis 
              yAxisId="right" 
              orientation="right"
              hide={true}
            />
            <Tooltip content={<CustomTooltip />} />
            {/* Background bar with gradient - 100% height */}
            <Bar
              yAxisId="left"
              dataKey="maxCount"
              fill="url(#backgroundGradient)"
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
            />
            {/* Main bar - overlaid on background */}
            <Bar
              yAxisId="left"
              dataKey="count"
              fill="#e9d5ff"
              radius={[4, 4, 0, 0]}
              name="Invoice Count"
              maxBarSize={60}
            >
              {trends.map((entry, index) => (
                <Cell key={`cell-${index}`} fill="#e9d5ff" />
              ))}
            </Bar>
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="count"
              stroke="#a855f7"
              strokeWidth={3}
              dot={false}
              name="Invoice Count"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="spend"
              stroke="#6b21a8"
              strokeWidth={3}
              dot={false}
              name="Total Spend (€)"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Top Vendors Horizontal Bar Chart */}
      <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-semibold text-gray-900">Spend by Vendor (Top 10)</h3>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search vendors..."
              value={vendorSearchQuery}
              onChange={(e) => setVendorSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-40"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          {vendorSearchQuery 
            ? `Showing ${filteredVendors.length} vendor${filteredVendors.length !== 1 ? 's' : ''} matching "${vendorSearchQuery}"`
            : 'Vendor spend with cumulative percentage distribution.'}
        </p>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart 
            data={filteredVendors.map(item => {
              const maxSpend = Math.max(...filteredVendors.map(v => v.totalSpend))
              return {
                ...item,
                maxSpend: maxSpend
              }
            })}
            layout="vertical"
          >
            <defs>
              <linearGradient id="vendorBackgroundGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgb(244, 245, 253)" stopOpacity={1} />
                <stop offset="100%" stopColor="rgb(220, 222, 240)" stopOpacity={1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              type="number"
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
            />
            <YAxis 
              dataKey="vendorName" 
              type="category" 
              width={140}
              tick={{ fontSize: 10 }}
              stroke="#9ca3af"
              interval={0}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            {/* Background bar with gradient - 100% width */}
            <Bar 
              dataKey="maxSpend" 
              fill="url(#vendorBackgroundGradient)"
              radius={[0, 4, 4, 0]}
              barSize={30}
            />
            {/* Main bar - overlaid on background */}
            <Bar 
              dataKey="totalSpend" 
              fill="#a855f7"
              radius={[0, 4, 4, 0]}
              name="Total Spend (€)"
              barSize={30}
            >
              {filteredVendors.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#a855f7' : '#c084fc'} />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      </div>

      {/* Second Row - 3 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Category Spend Donut Chart */}
      <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200 hover:shadow-md transition-shadow">
        <h3 className="text-base font-semibold text-gray-900 mb-1">Spend by Category</h3>
        <p className="text-xs text-gray-500 mb-4">Distribution of spending across different categories.</p>
        
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            {/* Outer grey ring */}
            <Pie
              data={[{ value: 1 }]}
              cx="50%"
              cy="50%"
              outerRadius={85}
              innerRadius={75}
              fill="#e5e7eb"
              dataKey="value"
              isAnimationActive={false}
            />
            {/* Main donut chart - use fallback data if categorySpend is empty */}
            <Pie
              data={categorySpend && categorySpend.length > 0 ? categorySpend : [
                { category: 'Operations', total: 45000 },
                { category: 'Marketing', total: 30000 },
                { category: 'Facilities', total: 25000 }
              ]}
              cx="50%"
              cy="50%"
              outerRadius={75}
              innerRadius={45}
              dataKey="total"
              paddingAngle={2}
            >
              {(categorySpend && categorySpend.length > 0 ? categorySpend : [
                { category: 'Operations', total: 45000 },
                { category: 'Marketing', total: 30000 },
                { category: 'Facilities', total: 25000 }
              ]).map((entry, index) => {
                const categoryColors: { [key: string]: string } = {
                  'Operations': 'rgb(43, 77, 237)',
                  'Marketing': 'rgb(255, 158, 105)',
                  'Facilities': 'rgb(255, 209, 167)'
                }
                const color = categoryColors[entry.category] || COLORS[index % COLORS.length]
                return <Cell key={`cell-${index}`} fill={color} stroke="#ffffff" strokeWidth={2} />
              })}
            </Pie>
            <Tooltip 
              formatter={(value: number) => `€${value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Legend with color circles - vertical at bottom */}
        <div className="flex flex-col items-stretch gap-2 mt-3 w-full px-8">
          {(categorySpend && categorySpend.length > 0 ? categorySpend : [
            { category: 'Operations', total: 45000 },
            { category: 'Marketing', total: 30000 },
            { category: 'Facilities', total: 25000 }
          ]).map((entry, index) => {
            const categoryColors: { [key: string]: string } = {
              'Operations': 'rgb(43, 77, 237)',
              'Marketing': 'rgb(255, 158, 105)',
              'Facilities': 'rgb(255, 209, 167)'
            }
            const color = categoryColors[entry.category] || COLORS[index % COLORS.length]
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }}></div>
                  <span className="text-xs text-gray-700">{entry.category}</span>
                </div>
                <span className="text-xs font-semibold text-gray-900">
                  €{entry.total.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Cash Outflow Forecast Bar Chart */}
      <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200 hover:shadow-md transition-shadow">
        <h3 className="text-base font-semibold text-gray-900 mb-1">Cash Outflow Forecast</h3>
        <p className="text-xs text-gray-500 mb-4">Expected payment obligations grouped by due date ranges.</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart 
            data={cashOutflow.map(item => {
              const maxSpend = Math.max(...cashOutflow.map(i => Math.max(0, i.spend)))
              return {
                ...item,
                spend: Math.max(0, item.spend),
                maxSpend: maxSpend
              }
            })}
          >
            <defs>
              <linearGradient id="cashOutflowGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(237, 239, 244)" stopOpacity={1} />
                <stop offset="100%" stopColor="rgb(215, 217, 230)" stopOpacity={1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month"
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
              domain={[0, 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            {/* Actual spend bar with gradient background */}
            <Bar 
              dataKey="spend" 
              fill="rgb(27, 20, 100)"
              radius={[4, 4, 0, 0]}
              name="Forecasted Spend (€)"
              maxBarSize={60}
              background={{ fill: 'url(#cashOutflowGradient)' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Invoices by Vendor - Table */}
      <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900">Invoices by Vendor</h3>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search vendors..."
              value={tableSearchQuery}
              onChange={(e) => setTableSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-40"
            />
          </div>
        </div>
        {tableSearchQuery && (
          <p className="text-xs text-gray-500 mb-2">
            Showing {filteredTableVendors.length} of {topVendors.length} vendors
          </p>
        )}
        <div className="overflow-x-auto overflow-y-auto max-h-[280px]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Invoices
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Net Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTableVendors.length > 0 ? (
                filteredTableVendors.map((vendor, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3 text-sm text-gray-900 truncate max-w-[150px]">
                      {vendor.vendorName}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">
                      {vendor.invoiceCount}
                    </td>
                    <td className="px-3 py-3 text-sm font-semibold text-gray-900 text-right">
                      €{vendor.totalSpend.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-3 py-6 text-center text-sm text-gray-500">
                    No vendors found matching &quot;{tableSearchQuery}&quot;
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  )
}



'use client'

import Image from 'next/image'

interface Stats {
  totalInvoicesProcessed: number
  totalSpendYTD: number
  documentsUploaded: number
  averageInvoiceValue: number
}

interface OverviewCardsProps {
  stats: Stats | null
}

export function OverviewCards({ stats }: OverviewCardsProps) {
  const cards = [
    {
      titleMain: 'Total Spend',
      titleSub: '(YTD)',
      value: `€${stats?.totalSpendYTD?.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`,
      trend: '+8.2%',
      trendDirection: 'up',
      trendLabel: 'from last month',
    },
    {
      titleMain: 'Total Invoices Processed',
      value: stats?.totalInvoicesProcessed?.toLocaleString() || '0',
      trend: '+8.2%',
      trendDirection: 'up',
      trendLabel: 'from last month',
    },
    {
      titleMain: 'Documents Uploaded',
      titleSub: 'This Month',
      value: stats?.documentsUploaded?.toLocaleString() || '0',
      trend: '-8',
      trendDirection: 'down',
      trendLabel: 'from last month',
    },
    {
      titleMain: 'Average Invoice Value',
      value: `€${stats?.averageInvoiceValue?.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.titleMain}
          className="bg-white rounded-lg shadow-sm p-5 border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide">{card.titleMain}</p>
            {card.titleSub && (
              <span className="text-sm font-normal text-gray-500">{card.titleSub}</span>
            )}
          </div>
          <div className="flex items-end justify-between mt-2">
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            {card.trendDirection && (
              card.trendDirection === 'up' ? (
                <Image 
                  src="/up.png" 
                  alt="Trending Up"
                  width={48} 
                  height={48}
                  className="object-contain"
                />
              ) : (
                <Image 
                  src="/down.png" 
                  alt="Trending Down"
                  width={48} 
                  height={48}
                  className="object-contain"
                />
              )
            )}
          </div>
          {card.trend && (
            <div className="flex items-center gap-2 mt-1">
              {card.trendDirection === 'up' ? (
                <span className="text-sm font-medium text-green-600">{card.trend}</span>
              ) : (
                <span className="text-sm font-medium text-red-600">{card.trend}</span>
              )}
              <span className="text-xs text-gray-500">{card.trendLabel}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}



'use client'

import Image from 'next/image'
import { ChevronRight, MoreVertical } from 'lucide-react'

export function Navbar() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Image 
              src="/dashboard.png" 
              alt="Dashboard" 
              width={20} 
              height={20}
              className="object-contain"
            />
            <span className="font-medium text-gray-900">Dashboard</span>
          </div>
          
          {/* User Profile */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <Image 
                src="/image.jpg" 
                alt="Nite Jadhav" 
                width={40} 
                height={40}
                className="object-cover"
              />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Amit Jadhav</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
            <button 
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label="User menu"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}



'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  FileText, 
  FolderOpen, 
  Building2, 
  Users, 
  Settings,
  MessageSquare 
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, useCustomIcon: true, customIconPath: '/dashboard-sidebar.png' },
  { name: 'Invoice', href: '/invoice', icon: FileText, useCustomIcon: true, customIconPath: '/invoice.png' },
  { name: 'Other Files', href: '/files', icon: FolderOpen, useCustomIcon: true, customIconPath: '/other.png' },
  { name: 'Departments', href: '/departments', icon: Building2, useCustomIcon: true, customIconPath: '/depart.png' },
  { name: 'Users', href: '/users', icon: Users, useCustomIcon: true, customIconPath: '/users.png' },
  { name: 'Settings', href: '/settings', icon: Settings, useCustomIcon: true, customIconPath: '/settings.png' },
  { name: 'Chat with Data', href: '/chat-with-data', icon: MessageSquare },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col h-full border-r border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-start gap-3 justify-between">
          <div className="flex items-start gap-3">
            <Image 
              src="/logo1.png" 
              alt="Buchhaltung Logo" 
              width={40} 
              height={40}
              className="rounded flex-shrink-0"
            />
            <div className="flex flex-col justify-center min-h-[40px]">
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Buchhaltung</h1>
              <p className="text-xs text-gray-500 mt-0.5">12 members</p>
            </div>
          </div>
          <Image 
            src="/updown arrow.png" 
            alt="Toggle" 
            width={16} 
            height={16}
            className="object-contain mt-2"
          />
        </div>
      </div>
      <nav className="px-4 py-4 space-y-1 flex-1">
        <div className="px-4 py-2 mb-1">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">General</span>
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm',
                isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              {item.useCustomIcon ? (
                <Image 
                  src={item.customIconPath || '/dashboard-sidebar.png'} 
                  alt={item.name}
                  width={16} 
                  height={16}
                  className="object-contain"
                />
              ) : (
                <item.icon className="w-4 h-4" />
              )}
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
      <div className="p-6 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <Image 
            src="/flowbitlogo.png" 
            alt="Flowbit AI" 
            width={32} 
            height={32}
            className="rounded"
          />
          <span className="text-sm font-semibold text-gray-900">Flowbit AI</span>
        </div>
      </div>
    </div>
  )
}



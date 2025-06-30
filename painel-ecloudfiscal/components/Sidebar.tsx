'use client'
import React from "react"
import { useRouter, usePathname } from "next/navigation"
import { HomeIcon, DocumentTextIcon, ArrowDownTrayIcon, Cog6ToothIcon } from '@heroicons/react/24/solid'

const menu = [
  { label: 'Dashboard', icon: <HomeIcon className="h-6 w-6" />, href: '/dashboard' },
  { label: 'Relatórios', icon: <DocumentTextIcon className="h-6 w-6" />, href: '/relatorios' },
  { label: 'XMLs', icon: <ArrowDownTrayIcon className="h-6 w-6" />, href: '/xmls' },
  { label: 'Configuração', icon: <Cog6ToothIcon className="h-6 w-6" />, href: '/perfil' },
]

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  return (
    <aside className="hidden md:flex flex-col bg-white border-r border-orange-200 w-64 min-h-screen p-0 shadow-xl">
      <div className="flex items-center gap-3 px-8 py-6 border-b border-orange-100">
        <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-full w-12 h-12 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg">eC</div>
        <span className="text-2xl font-extrabold text-orange-700 tracking-tight">eCloudFiscal</span>
      </div>
      <nav className="flex flex-col gap-1 mt-6">
        {menu.map((item) => {
          const isActive = pathname === item.href
          return (
            <a key={item.label} href={item.href} className={`flex items-center gap-4 px-8 py-3 rounded-l-full font-semibold text-base transition-all hover:bg-orange-50 hover:text-orange-700 ${isActive ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-lg' : 'text-gray-700'}`}>
              {item.icon}
              {item.label}
            </a>
          )
        })}
      </nav>
      <div className="flex-1" />
      <div className="text-xs text-gray-400 mt-8 mb-4 px-8 select-none">© {new Date().getFullYear()} eCloudFiscal</div>
    </aside>
  )
}

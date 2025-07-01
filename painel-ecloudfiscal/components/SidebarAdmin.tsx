'use client'
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { UserIcon, HomeIcon, BellIcon, CpuChipIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'

const adminMenu = [
  { label: 'Dashboard', icon: <HomeIcon className="h-6 w-6" />, href: '/admin' },
  { label: 'Usuários', icon: <UserIcon className="h-6 w-6" />, href: '/admin/usuarios' },
  { label: 'Monitoramento', icon: <CpuChipIcon className="h-6 w-6" />, href: '/admin/monitoramento' },
  { label: 'Notificações', icon: <BellIcon className="h-6 w-6" />, href: '/admin/notificacoes' },
]

export function SidebarAdmin() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuth = localStorage.getItem('admin_token')
      if (!isAuth) {
        router.push('/admin/login')
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    router.replace('/admin/login')
  }

  return (
    <aside className="hidden md:flex flex-col bg-white border-r border-orange-200 w-64 min-h-screen p-0 shadow-xl">
      <div className="flex items-center gap-3 px-8 py-6 border-b border-orange-100">
        <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-full w-12 h-12 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg">ADM</div>
        <span className="text-2xl font-extrabold text-orange-700 tracking-tight">Painel Administrador</span>
      </div>
      <button onClick={handleLogout} className="mx-8 mt-4 mb-2 px-4 py-2 rounded bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold shadow hover:scale-105 transition-all">Sair</button>
      <nav className="flex flex-col gap-1 mt-6">
        {adminMenu.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.label} href={item.href} className={`flex items-center gap-4 px-8 py-3 rounded-l-full font-semibold text-base transition-all hover:bg-orange-50 hover:text-orange-700 ${isActive ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-lg' : 'text-gray-700'}`}>
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="flex-1" />
      <div className="text-xs text-gray-400 mb-4 px-8 select-none">© {new Date().getFullYear()} eCloudFiscal</div>
    </aside>
  )
}

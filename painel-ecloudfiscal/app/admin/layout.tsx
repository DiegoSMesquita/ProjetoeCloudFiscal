"use client"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { SidebarAdmin } from "../../components/SidebarAdmin"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)
  const [isAuth, setIsAuth] = useState<boolean | null>(null)

  useEffect(() => {
    setIsClient(true)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('admin_token')
      if (!token && pathname !== '/admin/login') {
        setIsAuth(false)
        router.replace('/admin/login')
      } else {
        setIsAuth(true)
      }
    }
  }, [pathname])

  if (!isClient || isAuth === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-400 via-orange-200 to-orange-600 animate-gradient-x">
        <div className="flex flex-col items-center gap-4">
          <span className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></span>
          <span className="text-2xl font-bold text-orange-700">Carregando...</span>
        </div>
      </div>
    )
  }

  // Se está na tela de login, renderiza só o formulário, sem sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  if (!isAuth) {
    return null
  }

  // Renderiza o painel admin com sidebar
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarAdmin />
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 p-6 md:p-10 bg-gray-50 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}

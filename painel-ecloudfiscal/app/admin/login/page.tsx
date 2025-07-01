"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"

export default function AdminLogin() {
  const [usuario, setUsuario] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('admin_token')) {
        router.replace('/admin')
      }
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErro("")
    try {
      const res = await axios.post("http://localhost:8080/api/admin/login", {
        usuario,
        senha
      })
      if (res.data?.token) {
        localStorage.removeItem("admin_token")
        localStorage.setItem("admin_token", res.data.token)
        setTimeout(() => {
          setLoading(false)
          window.location.assign("/admin")
        }, 800) // animação de carregando
      } else {
        setErro("Usuário ou senha inválidos")
        setLoading(false)
      }
    } catch (err) {
      setErro("Usuário ou senha inválidos")
      setLoading(false)
      console.error('Erro login:', err)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Animação de fundo gradiente */}
      <div className="absolute inset-0 -z-10 animate-gradient bg-gradient-to-br from-orange-400 via-orange-200 to-orange-600 bg-[length:400%_400%]" style={{animation: 'gradientBG 10s ease-in-out infinite'}} />
      <style jsx global>{`
        @keyframes gradientBG {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
      <form onSubmit={handleLogin} className="bg-white/90 rounded-2xl shadow-2xl p-12 w-full max-w-xl flex flex-col gap-6 border border-orange-200 backdrop-blur-xl">
        <h1 className="text-3xl font-extrabold text-orange-700 mb-2 text-center">Painel Administrador</h1>
        <input type="text" placeholder="Usuário" className="p-4 border rounded bg-orange-50 border-orange-200 text-orange-900 text-lg" value={usuario} onChange={e => setUsuario(e.target.value)} autoFocus disabled={loading} />
        <input type="password" placeholder="Senha" className="p-4 border rounded bg-orange-50 border-orange-200 text-orange-900 text-lg" value={senha} onChange={e => setSenha(e.target.value)} disabled={loading} />
        {erro && <div className="text-red-500 text-center font-bold text-base">{erro}</div>}
        <button type="submit" disabled={loading} className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-6 py-3 rounded font-bold text-lg shadow hover:scale-105 transition-all disabled:opacity-60">{loading ? <span className="flex items-center gap-2 justify-center"><span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>Entrando...</span> : "Entrar"}</button>
      </form>
    </div>
  )
}

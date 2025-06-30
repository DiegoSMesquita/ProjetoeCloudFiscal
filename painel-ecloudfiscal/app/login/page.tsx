'use client'
import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { LockClosedIcon } from '@heroicons/react/24/solid'

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cnpjs, setCnpjs] = useState<any[]>([])
  const [selectedCnpj, setSelectedCnpj] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setCnpjs([])
    setSelectedCnpj('')
    if (!validateEmail(email)) {
      setError('E-mail inválido')
      return
    }
    if (!password || password.length < 4) {
      setError('Senha inválida (mínimo 4 caracteres)')
      return
    }
    setLoading(true)
    try {
      const res = await axios.post('http://localhost:8080/api/login', { email, password })
      if (res.data.cnpjs && res.data.cnpjs.length > 0) {
        setCnpjs(res.data.cnpjs)
      } else {
        localStorage.setItem('user', JSON.stringify(res.data))
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao autenticar')
    } finally {
      setLoading(false)
    }
  }

  const handleCnpjSelect = () => {
    if (!selectedCnpj) return
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    user.selectedCnpj = selectedCnpj
    localStorage.setItem('user', JSON.stringify(user))
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 flex flex-col gap-8 border border-orange-100 animate-fade-in">
        <div className="flex flex-col items-center gap-2">
          <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-full p-3 mb-2 shadow-lg">
            <LockClosedIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-orange-700 tracking-tight">eCloudFiscal</h1>
          <span className="text-orange-400 text-sm">Acesso ao Painel do Cliente</span>
        </div>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-gray-700 font-semibold">E-mail</label>
            <input className="w-full p-3 rounded-xl border border-orange-200 bg-orange-50 text-gray-800 placeholder:text-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400/60 transition" placeholder="Digite seu e-mail" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-gray-700 font-semibold">Senha</label>
            <input className="w-full p-3 rounded-xl border border-orange-200 bg-orange-50 text-gray-800 placeholder:text-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400/60 transition" placeholder="Digite sua senha" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          {error && <div className="text-red-500 text-center font-semibold animate-pulse text-sm mt-2">{error}</div>}
          <button className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white py-3 rounded-xl font-bold shadow hover:scale-105 transition-all duration-200 focus:ring-2 focus:ring-orange-400/60 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2" type="submit" disabled={loading}>
            {loading ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></span> : null}
            Entrar
          </button>
        </form>
        {cnpjs.length > 0 && (
          <div className="flex flex-col gap-3 mt-2 animate-fade-in">
            <label className="block font-semibold text-gray-700 text-sm">Selecione o CNPJ</label>
            <select className="w-full p-3 rounded-xl border border-orange-200 bg-orange-50 text-gray-800 mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400/60 transition" value={selectedCnpj} onChange={e => setSelectedCnpj(e.target.value)}>
              <option value="">Selecione...</option>
              {cnpjs.map((c: any) => (
                <option key={c.cnpj} value={c.cnpj}>{c.cnpj} - {c.nome_loja}</option>
              ))}
            </select>
            <button type="button" className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white py-3 rounded-xl font-bold shadow hover:scale-105 transition-all duration-200 focus:ring-2 focus:ring-orange-400/60 disabled:opacity-60 disabled:cursor-not-allowed" onClick={handleCnpjSelect} disabled={!selectedCnpj}>
              Acessar painel
            </button>
          </div>
        )}
        <footer className="mt-4 text-center text-orange-300 text-xs opacity-80 select-none">
          © {new Date().getFullYear()} eCloudFiscal
        </footer>
      </div>
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fade-in {
          animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both;
        }
      `}</style>
    </div>
  )
}
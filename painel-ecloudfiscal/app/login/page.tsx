'use client'
import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { LockClosedIcon } from '@heroicons/react/24/solid'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cnpjs, setCnpjs] = useState<any[]>([])
  const [selectedCnpj, setSelectedCnpj] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setCnpjs([])
    setSelectedCnpj('')
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-900 animate-gradient-x">
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-8 w-full max-w-md relative">
        <div className="flex flex-col items-center mb-6">
          <span className="bg-blue-600 p-3 rounded-full shadow-lg mb-2 animate-bounce">
            <LockClosedIcon className="h-8 w-8 text-white" />
          </span>
          <h1 className="text-3xl font-extrabold text-white drop-shadow mb-1 tracking-tight">eCloudFiscal</h1>
          <span className="text-blue-100 text-sm">Acesso ao Painel do Cliente</span>
        </div>
        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input className="w-full p-3 rounded-lg border border-white/30 bg-white/20 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="w-full p-3 rounded-lg border border-white/30 bg-white/20 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" placeholder="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          {error && <div className="text-red-300 text-center font-semibold animate-pulse">{error}</div>}
          <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-bold shadow-lg hover:scale-105 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200" type="submit">Entrar</button>
        </form>
        {cnpjs.length > 0 && (
          <div className="mt-8">
            <label className="block mb-2 font-semibold text-white">Selecione o CNPJ</label>
            <select className="w-full p-3 rounded-lg border border-white/30 bg-white/20 text-white mb-3" value={selectedCnpj} onChange={e => setSelectedCnpj(e.target.value)}>
              <option value="">Selecione...</option>
              {cnpjs.map((c: any) => (
                <option key={c.cnpj} value={c.cnpj}>{c.cnpj} - {c.nome_loja}</option>
              ))}
            </select>
            <button type="button" className="w-full bg-gradient-to-r from-green-500 to-green-700 text-white py-3 rounded-lg font-bold shadow-lg hover:scale-105 transition-all duration-200" onClick={handleCnpjSelect} disabled={!selectedCnpj}>
              Acessar painel
            </button>
          </div>
        )}
      </div>
      <style jsx global>{`
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 6s ease-in-out infinite;
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  )
}
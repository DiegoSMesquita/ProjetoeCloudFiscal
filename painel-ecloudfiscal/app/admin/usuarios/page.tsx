import { useState } from "react"

const usuariosMock = [
  { id: 1, nome: "João Silva", email: "joao@email.com", status: "ativo", plano: "Pro", cnpjs: ["12.345.678/0001-99"] },
  { id: 2, nome: "Maria Souza", email: "maria@email.com", status: "bloqueado", plano: "Free", cnpjs: [] },
]

export default function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState(usuariosMock)
  const [showModal, setShowModal] = useState(false)
  const [novoUsuario, setNovoUsuario] = useState({ nome: "", email: "", plano: "Free" })

  const handleBloquear = (id: number) => {
    setUsuarios(us => us.map(u => u.id === id ? { ...u, status: u.status === "ativo" ? "bloqueado" : "ativo" } : u))
  }
  const handleCriar = () => {
    setUsuarios(us => [...us, { ...novoUsuario, id: Date.now(), status: "ativo", cnpjs: [] }])
    setShowModal(false)
    setNovoUsuario({ nome: "", email: "", plano: "Free" })
  }
  // Associa/desassocia CNPJ (mock)
  const handleAssociarCnpj = (id: number) => {
    setUsuarios(us => us.map(u => u.id === id ? { ...u, cnpjs: u.cnpjs.length ? [] : ["99.999.999/0001-00"] } : u))
  }
  // Libera plano (mock)
  const handleLiberarPlano = (id: number) => {
    setUsuarios(us => us.map(u => u.id === id ? { ...u, plano: u.plano === "Pro" ? "Free" : "Pro" } : u))
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-orange-700 mb-6">Gestão de Usuários</h1>
      <button onClick={() => setShowModal(true)} className="mb-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-2 rounded font-bold shadow hover:scale-105 transition-all">Novo Usuário</button>
      <div className="bg-white rounded-2xl shadow p-6 border border-orange-100 overflow-x-auto">
        <table className="min-w-full text-gray-700 text-sm">
          <thead>
            <tr className="border-b border-orange-100">
              <th className="p-2 text-left font-semibold">Nome</th>
              <th className="p-2 text-left font-semibold">E-mail</th>
              <th className="p-2 text-left font-semibold">Status</th>
              <th className="p-2 text-left font-semibold">Plano</th>
              <th className="p-2 text-left font-semibold">CNPJs</th>
              <th className="p-2 text-left font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(u => (
              <tr key={u.id} className="border-b border-orange-50">
                <td className="p-2 font-medium">{u.nome}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">
                  <span className={u.status === "ativo" ? "text-green-600 font-bold" : "text-red-500 font-bold"}>{u.status}</span>
                </td>
                <td className="p-2">{u.plano}</td>
                <td className="p-2">{u.cnpjs.join(", ") || <span className="text-gray-400">Nenhum</span>}</td>
                <td className="p-2 flex gap-2">
                  <button onClick={() => handleBloquear(u.id)} className="px-2 py-1 rounded bg-orange-100 text-orange-700 text-xs font-semibold border border-orange-200 hover:bg-orange-200 transition">{u.status === "ativo" ? "Bloquear" : "Liberar"}</button>
                  <button onClick={() => handleAssociarCnpj(u.id)} className="px-2 py-1 rounded bg-orange-100 text-orange-700 text-xs font-semibold border border-orange-200 hover:bg-orange-200 transition">{u.cnpjs.length ? "Desassociar CNPJ" : "Associar CNPJ"}</button>
                  <button onClick={() => handleLiberarPlano(u.id)} className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold border border-green-200 hover:bg-green-200 transition">{u.plano === "Pro" ? "Mudar para Free" : "Liberar Pro"}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col gap-4">
            <h2 className="text-lg font-bold text-orange-700 mb-2">Novo Usuário</h2>
            <input type="text" placeholder="Nome" className="p-2 border rounded bg-orange-50 border-orange-200 text-orange-900" value={novoUsuario.nome} onChange={e => setNovoUsuario({ ...novoUsuario, nome: e.target.value })} />
            <input type="email" placeholder="E-mail" className="p-2 border rounded bg-orange-50 border-orange-200 text-orange-900" value={novoUsuario.email} onChange={e => setNovoUsuario({ ...novoUsuario, email: e.target.value })} />
            <select className="p-2 border rounded bg-orange-50 border-orange-200 text-orange-900" value={novoUsuario.plano} onChange={e => setNovoUsuario({ ...novoUsuario, plano: e.target.value })}>
              <option value="Free">Free</option>
              <option value="Pro">Pro</option>
            </select>
            <div className="flex gap-2 justify-end mt-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded border border-orange-400 text-orange-700 font-semibold bg-white hover:bg-orange-50 transition">Cancelar</button>
              <button onClick={handleCriar} className="px-4 py-2 rounded bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold shadow">Criar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

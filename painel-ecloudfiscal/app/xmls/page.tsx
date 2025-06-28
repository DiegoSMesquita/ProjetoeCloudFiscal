'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function XmlsPage() {
  const [xmls, setXmls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Exemplo: buscar XMLs pendentes
    axios.get('http://localhost:8080/api/files/pending')
      .then(res => setXmls(res.data))
      .catch(() => setError('Erro ao buscar XMLs'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">XMLs Pendentes</h1>
      {loading && <div>Carregando...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && (
        <table className="w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Arquivo</th>
              <th className="p-2 text-left">CNPJ</th>
              <th className="p-2 text-left">Data</th>
              <th className="p-2 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {xmls.map((xml: any) => (
              <tr key={xml.id} className="border-b">
                <td className="p-2">{xml.nome_arquivo || xml.nome || xml.id}</td>
                <td className="p-2">{xml.cnpj || '-'}</td>
                <td className="p-2">{xml.created_at ? new Date(xml.created_at).toLocaleString() : '-'}</td>
                <td className="p-2">
                  <button className="bg-blue-600 text-white px-3 py-1 rounded mr-2 hover:bg-blue-700">Baixar</button>
                  <button className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Enviar ao contador</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

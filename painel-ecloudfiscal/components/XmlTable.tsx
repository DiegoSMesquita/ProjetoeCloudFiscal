'use client'
import React from 'react'

interface XmlTableProps {
  xmls: any[]
  onDownload?: (xml: any) => void
  onSend?: (xml: any) => void
}

export default function XmlTable({ xmls, onDownload, onSend }: XmlTableProps) {
  return (
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
        {xmls.map((xml) => (
          <tr key={xml.id} className="border-b">
            <td className="p-2">{xml.nome_arquivo || xml.nome || xml.id}</td>
            <td className="p-2">{xml.cnpj || '-'}</td>
            <td className="p-2">{xml.created_at ? new Date(xml.created_at).toLocaleString() : '-'}</td>
            <td className="p-2">
              <button className="bg-blue-600 text-white px-3 py-1 rounded mr-2 hover:bg-blue-700" onClick={() => onDownload?.(xml)}>Baixar</button>
              <button className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700" onClick={() => onSend?.(xml)}>Enviar ao contador</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

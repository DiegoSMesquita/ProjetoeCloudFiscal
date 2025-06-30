'use client'
import React from 'react'

interface CnpjSelectorProps {
  cnpjs: { cnpj: string, nome_loja: string }[]
  value: string
  onChange: (v: string) => void
  inputClassName?: string
}

export default function CnpjSelector({ cnpjs, value, onChange, inputClassName }: CnpjSelectorProps) {
  return (
    <div>
      <label className="block mb-2 font-semibold text-orange-700">Selecione o CNPJ</label>
      <select className={`w-full p-2 border rounded mb-3 ${inputClassName || ''}`} value={value} onChange={e => onChange(e.target.value)}>
        <option value="">Selecione...</option>
        {cnpjs.map((c) => (
          <option key={c.cnpj} value={c.cnpj}>{c.cnpj} - {c.nome_loja}</option>
        ))}
      </select>
    </div>
  )
}

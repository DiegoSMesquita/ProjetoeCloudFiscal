'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

interface Xml {
  id: string;
  [key: string]: any;
}

interface XmlsContextType {
  xmls: Xml[];
  loading: boolean;
  error: string;
  refetch: () => void;
}

const XmlsContext = createContext<XmlsContextType | undefined>(undefined);

export const XmlsProvider = ({ children }: { children: React.ReactNode }) => {
  const [xmls, setXmls] = useState<Xml[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchXmls = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:8080/api/files/pending');
      setXmls(res.data);
    } catch {
      setError('Erro ao buscar XMLs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchXmls();
  }, []);

  return (
    <XmlsContext.Provider value={{ xmls, loading, error, refetch: fetchXmls }}>
      {children}
    </XmlsContext.Provider>
  );
};

export function useXmls() {
  const ctx = useContext(XmlsContext);
  if (!ctx) throw new Error('useXmls deve ser usado dentro de XmlsProvider');
  return ctx;
}

'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Cliente {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono?: string;
}

interface ClienteAuthContextType {
  cliente: Cliente | null;
  token: string | null;
  login: (data: { cliente: Cliente; token: string }) => void;
  logout: () => void;
  loading: boolean;
}

const ClienteAuthContext = createContext<ClienteAuthContextType | undefined>(undefined);

export function ClienteAuthProvider({ children }: { children: ReactNode }) {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const savedToken = localStorage.getItem('clienteToken');
  const savedCliente = localStorage.getItem('clienteData');

  if (savedToken && savedCliente) {
    try {
      const payload = JSON.parse(atob(savedToken.split('.')[1]));
      if (payload.exp * 1000 > Date.now()) {
        setToken(savedToken);
        setCliente(JSON.parse(savedCliente)); // aquí vienen nombre y apellidos
      } else {
        localStorage.removeItem('clienteToken');
        localStorage.removeItem('clienteData');
      }
    } catch (err) {
      localStorage.removeItem('clienteToken');
      localStorage.removeItem('clienteData');
    }
  }
  setLoading(false);
}, []);

const login = (data: { cliente: Cliente; token: string }) => {
  localStorage.setItem('clienteToken', data.token);
  localStorage.setItem('clienteData', JSON.stringify(data.cliente));
  setToken(data.token);
  setCliente(data.cliente);
};


  const logout = () => {
    localStorage.removeItem('clienteToken');
    setToken(null);
    setCliente(null);
  };

  return (
    <ClienteAuthContext.Provider value={{ cliente, token, login, logout, loading }}>
      {children}
    </ClienteAuthContext.Provider>
  );
}

export function useClienteAuth() {
  const context = useContext(ClienteAuthContext);
  if (context === undefined) {
    throw new Error('useClienteAuth must be used within a ClienteAuthProvider');
  }
  return context;
}

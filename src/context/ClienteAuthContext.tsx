"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
// import { Cliente } from "@/types/cliente";


interface Cliente {
  id: string;
  _id?: string;
  nombre: string;
  apellidos?: string;
  email: string;
  telefono?: string;
  direccion?: string;
  direccionComplementaria?: string;
  codigoPostal?: string;
  ciudad?: string;
  pais?: string;
  provincia?: string;
  empresa?: string;
  nif?: string;
}


interface ClienteAuthContextType {
  cliente: Cliente | null;
  token: string | null;
  loading: boolean;
  login: (cliente: Cliente, token: string) => void;
  logout: () => void;
  setCliente: React.Dispatch<React.SetStateAction<Cliente | null>>;
}

const ClienteAuthContext = createContext<ClienteAuthContextType | undefined>(undefined);


export function ClienteAuthProvider({ children }: { children: ReactNode }) {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 🧠 Normaliza el objeto cliente para asegurar que tenga la propiedad 'id'
  const normalizeCliente = (data: any): Cliente => {
    if (!data) return data;
    if (data._id && !data.id) {
      return { ...data, id: data._id };
    }
    return data;
  };

  // 🔹 Cargar cliente y token del almacenamiento local
  useEffect(() => {
    const storedToken = localStorage.getItem("cliente_token");
    const storedCliente = localStorage.getItem("cliente_datos");

    if (storedToken && storedCliente) {
      setToken(storedToken);
      const parsed = JSON.parse(storedCliente);
      setCliente(normalizeCliente(parsed));
    }

    setLoading(false);
  }, []);

  // 🔹 Login y guardado del cliente normalizado
  const login = (clienteData: Cliente, newToken: string) => {
    const normalized = normalizeCliente(clienteData);

    localStorage.setItem("cliente_token", newToken);
    localStorage.setItem("cliente_datos", JSON.stringify(normalized));

    setToken(newToken);
    setCliente(normalized);
  };

  // 🔹 Logout y limpieza total
  const logout = () => {
    localStorage.removeItem("cliente_token");
    localStorage.removeItem("cliente_datos");
    setToken(null);
    setCliente(null);
  };

  return (
    <ClienteAuthContext.Provider value={{ cliente, token, loading, login, logout, setCliente }}>
      {children}
    </ClienteAuthContext.Provider>
  );
}

export function useClienteAuth() {
  const context = useContext(ClienteAuthContext);
  if (context === undefined) {
    throw new Error("useClienteAuth must be used within ClienteAuthProvider");
  }
  return context;
}


// "use client";

// import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// interface Cliente {
//   id: string;
//   _id?: string;
//   nombre: string;
//   apellidos?: string;
//   email: string;
//   telefono?: string;
//   direccion?: string;
//   ciudad?: string;
//   cp?: string;
// }

// interface ClienteAuthContextType {
//   cliente: Cliente | null;
//   token: string | null;
//   loading: boolean;
//   login: (cliente: Cliente, token: string) => void;
//   logout: () => void;
//   setCliente: React.Dispatch<React.SetStateAction<Cliente | null>>;
// }

// const ClienteAuthContext = createContext<ClienteAuthContextType | undefined>(undefined);

// export function ClienteAuthProvider({ children }: { children: ReactNode }) {
//   const [cliente, setCliente] = useState<Cliente | null>(null);
//   const [token, setToken] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const storedToken = localStorage.getItem("cliente_token");
//     const storedCliente = localStorage.getItem("cliente_datos");

//     if (storedToken && storedCliente) {
//       setToken(storedToken);
//       setCliente(JSON.parse(storedCliente));
//     }
//     setLoading(false);
//   }, []);

//   const login = (clienteData: Cliente, newToken: string) => {
//     localStorage.setItem("cliente_token", newToken);
//     localStorage.setItem("cliente_datos", JSON.stringify(clienteData));
//     setToken(newToken);
//     setCliente(clienteData);
//   };

//   const logout = () => {
//     localStorage.removeItem("cliente_token");
//     localStorage.removeItem("cliente_datos");
//     setToken(null);
//     setCliente(null);
//   };

//   return (
//     <ClienteAuthContext.Provider value={{ cliente, token, loading, login, logout, setCliente }}>
//       {children}
//     </ClienteAuthContext.Provider>
//   );
// }

// export function useClienteAuth() {
//   const context = useContext(ClienteAuthContext);
//   if (context === undefined) {
//     throw new Error("useClienteAuth must be used within ClienteAuthProvider");
//   }
//   return context;
// }



// "use client";

// import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// interface Cliente {
//   id: string;
//   nombre: string;
//   apellidos?: string;
//   email: string;
//   telefono?: string;
//   direccion?: string;
//   ciudad?: string;
//   cp?: string;
// }

// interface ClienteAuthContextType {
//   cliente: Cliente | null;
//   token: string | null;
//   loading: boolean;
//   login: (cliente: Cliente, token: string) => void;
//   logout: () => void;
//   setCliente: React.Dispatch<React.SetStateAction<Cliente | null>>;
// }

// const ClienteAuthContext = createContext<ClienteAuthContextType | undefined>(undefined);

// export function ClienteAuthProvider({ children }: { children: ReactNode }) {
//   const [cliente, setCliente] = useState<Cliente | null>(null);
//   const [token, setToken] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const storedToken = localStorage.getItem("cliente_token");
//     const storedCliente = localStorage.getItem("cliente_datos");

//     if (storedToken && storedCliente) {
//       setToken(storedToken);
//       setCliente(JSON.parse(storedCliente));
//     }
//     setLoading(false);
//   }, []);

//   const login = (clienteData: Cliente, newToken: string) => {
//     localStorage.setItem("cliente_token", newToken);
//     localStorage.setItem("cliente_datos", JSON.stringify(clienteData));
//     setToken(newToken);
//     setCliente(clienteData);
//   };

//   const logout = () => {
//     localStorage.removeItem("cliente_token");
//     localStorage.removeItem("cliente_datos");
//     setToken(null);
//     setCliente(null);
//   };

//   return (
//     <ClienteAuthContext.Provider value={{ cliente, token, loading, login, logout, setCliente }}>
//       {children}
//     </ClienteAuthContext.Provider>
//   );
// }

// export function useClienteAuth() {
//   const context = useContext(ClienteAuthContext);
//   if (context === undefined) {
//     throw new Error("useClienteAuth must be used within ClienteAuthProvider");
//   }
//   return context;
// }


//"use client";

// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   ReactNode,
// } from "react";

// interface Cliente {
//   id: string;
//   nombre: string;
//   apellidos: string;
//   email: string;
//   telefono?: string;
//   direccion?: string;
//   ciudad?: string;
//   cp?: string;
// }

// interface ClienteAuthContextType {
//   cliente: Cliente | null;
//   token: string | null;
//   login: (data: { cliente: Cliente; token: string }) => void;
//   logout: () => void;
//   loading: boolean;
//   setCliente: (cliente: Cliente | null) => void; // 👈 nuevo
// }

// const ClienteAuthContext = createContext<ClienteAuthContextType | undefined>(
//   undefined
// );

// export function ClienteAuthProvider({ children }: { children: ReactNode }) {
//   const [cliente, setCliente] = useState<Cliente | null>(null);
//   const [token, setToken] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
  

//   useEffect(() => {
//     const savedToken = localStorage.getItem("clienteToken");
//     const savedCliente = localStorage.getItem("clienteData");

//     if (savedToken && savedCliente) {
//       try {
//         const payload = JSON.parse(atob(savedToken.split(".")[1]));
//         if (payload.exp * 1000 > Date.now()) {
//           setToken(savedToken);
//           setCliente(JSON.parse(savedCliente)); // aquí vienen nombre, apellidos, etc.
//         } else {
//           localStorage.removeItem("clienteToken");
//           localStorage.removeItem("clienteData");
//         }
//       } catch (err) {
//         localStorage.removeItem("clienteToken");
//         localStorage.removeItem("clienteData");
//       }
//     }
//     setLoading(false);
//   }, []);

//   const login = (data: { cliente: Cliente; token: string }) => {
//     localStorage.setItem("clienteToken", data.token);
//     localStorage.setItem("clienteData", JSON.stringify(data.cliente));
//     setToken(data.token);
//     setCliente(data.cliente);
//   };

//   const logout = () => {
//     localStorage.removeItem("clienteToken");
//     localStorage.removeItem("clienteData");
//     setToken(null);
//     setCliente(null);
//   };

//   return (
//     <ClienteAuthContext.Provider
//       value={{ cliente, token, login, logout, loading, setCliente }}
//     >
//       {children}
//     </ClienteAuthContext.Provider>
//   );
// }

// export function useClienteAuth() {
//   const context = useContext(ClienteAuthContext);
//   if (context === undefined) {
//     throw new Error(
//       "useClienteAuth must be used within a ClienteAuthProvider"
//     );
//   }

 

//   return context;
// }

 
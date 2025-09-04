// context/AuthContext.js
import React, { createContext, useState, useContext } from 'react';

// 1. Cria o Contexto
const AuthContext = createContext({});

// 2. Cria o Provedor do Contexto
// Este componente irá "abraçar" nossa aplicação e fornecer os dados do usuário
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // O estado que irá guardar os dados do usuário

  // Função para ser chamada no Login
  const login = (userData) => {
    setUser(userData);
  };

  // Função para ser chamada no Logout
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Cria um "Hook" customizado para facilitar o uso do contexto
// Em vez de importar o useContext e AuthContext em todo lugar, só usaremos o useAuth()
export const useAuth = () => {
  return useContext(AuthContext);
};
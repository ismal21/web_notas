"use client";

/**
 * ============================================================
 *  CONTEXTO DE AUTENTICACIÓN
 * ============================================================
 *  Un "Context" de React permite compartir datos (en este caso
 *  el usuario conectado) con cualquier componente sin tener que
 *  pasarlos manualmente de padre a hijo con props.
 *
 *  "use client" indica que este archivo se ejecuta en el
 *  navegador, porque usa estado y localStorage.
 * ============================================================
 */

import { createContext, use, useContext, useState } from "react";
import { browser } from "react-dom";
import {
  getSessionUser,
  loginUser,
  logoutUser,
  registerUser,
} from "@/lib/storage";

// Creamos el contexto. El valor inicial es null.
const AuthContext = createContext(null);

/**
 * AuthProvider envuelve toda la aplicación (se usa en layout.js)
 * y pone a disposición de los componentes:
 *   - user:      usuario conectado o null
 *   - login:     función para iniciar sesión
 *   - register:  función para registrarse
 *   - logout:    función para cerrar sesión
 */
export function AuthProvider({ children }) {
  /**
   * browser() es una API de React 19.3.
   * Durante el renderizado en el servidor "suspende" este
   * componente y se muestra el <Suspense> del layout. En el
   * navegador devuelve undefined y podemos leer localStorage
   * desde el primer render, sin parpadeos ni errores de
   * hidratación.
   */
  use(browser("La sesión se guarda en localStorage."));

  // useState con función inicializadora: solo se ejecuta una vez,
  // leyendo la sesión guardada en el navegador.
  const [user, setUser] = useState(() => getSessionUser());

  /** Inicia sesión y actualiza el usuario global. */
  async function login(username, password) {
    const loggedUser = await loginUser(username, password);
    setUser(loggedUser);
    return loggedUser;
  }

  /** Registra al usuario y lo deja conectado. */
  async function register(username, password) {
    const newUser = await registerUser(username, password);
    setUser(newUser);
    return newUser;
  }

  /** Cierra la sesión y limpia el usuario global. */
  function logout() {
    logoutUser();
    setUser(null);
  }

  // El "value" es lo que recibirán los componentes con useAuth().
  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook personalizado para consumir el contexto desde cualquier
 * componente. Uso: const { user, login } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>.");
  }

  return context;
}

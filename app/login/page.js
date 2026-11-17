"use client";

/**
 * ============================================================
 *  PÁGINA DE INICIO DE SESIÓN  (/login)
 * ============================================================
 *  "use client" es necesario porque usamos estado (useState),
 *  efectos (useEffect) y eventos del navegador.
 * ============================================================
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import AuthShell from "@/components/AuthShell";
import LoadingScreen from "@/components/LoadingScreen";
import PasswordField from "@/components/PasswordField";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { user, login } = useAuth();

  // Estados locales del formulario.
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Si ya hay una sesión iniciada, no tiene sentido mostrar el
  // login: redirigimos al panel de notas.
  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  // Mientras se redirige, evitamos mostrar el formulario un instante.
  if (user) {
    return <LoadingScreen label="Redirigiendo a tus notas..." />;
  }

  /**
   * Se ejecuta al enviar el formulario.
   * "e.preventDefault()" evita que el navegador recargue la página.
   */
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(username, password);
      router.replace("/");
    } catch (err) {
      setError(err.message || "No se pudo iniciar sesión.");
    } finally {
      // finally se ejecuta siempre, haya error o no.
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Bienvenido de nuevo"
      subtitle="Inicia sesión para acceder a todas tus notas."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="username">Nombre de usuario</label>
          <input
            id="username"
            name="username"
            type="text"
            className="text-input"
            placeholder="Tu nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
            autoFocus
          />
        </div>

        <PasswordField
          id="password"
          label="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        {/* role="alert" hace que los lectores de pantalla anuncien el error. */}
        {error && (
          <p className="error-box" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={submitting}
        >
          {submitting ? "Entrando..." : "Iniciar sesión"}
        </button>
      </form>

      <p className="auth-switch">
        ¿Todavía no tienes cuenta?{" "}
        <Link href="/register">Crear una cuenta</Link>
      </p>
    </AuthShell>
  );
}

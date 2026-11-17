"use client";

/**
 * ============================================================
 *  PÁGINA DE REGISTRO  (/register)
 * ============================================================
 *  Crea un usuario nuevo en localStorage y deja la sesión
 *  iniciada automáticamente.
 * ============================================================
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import AuthShell from "@/components/AuthShell";
import LoadingScreen from "@/components/LoadingScreen";
import PasswordField from "@/components/PasswordField";
import { useAuth } from "@/components/AuthProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { user, register } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Si el usuario ya está conectado, lo enviamos al panel.
  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  if (user) {
    return <LoadingScreen label="Redirigiendo a tus notas..." />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Comprobaciones antes de guardar nada.
    if (username.trim().length < 3) {
      setError("El nombre de usuario debe tener al menos 3 caracteres.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setSubmitting(true);

    try {
      await register(username, password);
      router.replace("/");
    } catch (err) {
      setError(err.message || "No se pudo crear la cuenta.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Crea tu cuenta"
      subtitle="Solo necesitas un nombre de usuario y una contraseña."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="field">
          <div className="field-label-row">
            <label htmlFor="username">Nombre de usuario</label>
            <span className="field-hint">Mínimo 3 caracteres</span>
          </div>
          <input
            id="username"
            name="username"
            type="text"
            className="text-input"
            placeholder="Elige un nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            minLength={3}
            required
            autoFocus
          />
        </div>

        <PasswordField
          id="password"
          label="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          hint="Mínimo 6 caracteres"
        />

        <PasswordField
          id="confirmPassword"
          label="Repite la contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          placeholder="Escríbela otra vez"
        />

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
          {submitting ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <p className="auth-switch">
        ¿Ya tienes cuenta? <Link href="/login">Iniciar sesión</Link>
      </p>
    </AuthShell>
  );
}

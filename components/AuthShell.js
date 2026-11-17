import Brand from "./Brand";

/**
 * Estructura visual compartida por las páginas de login y registro.
 * Los "children" son el contenido que se coloca dentro de la tarjeta.
 */
export default function AuthShell({ title, subtitle, children }) {
  return (
    <main className="auth-page">
      {/* Adornos de fondo (no son interactivos). */}
      <div className="auth-orb auth-orb-one" aria-hidden="true" />
      <div className="auth-orb auth-orb-two" aria-hidden="true" />

      <div className="auth-container">
        <Brand href="/login" />

        <section className="auth-card">
          <header className="auth-header">
            <span className="eyebrow">Tu espacio personal</span>
            <h1 className="auth-title">{title}</h1>
            <p className="auth-subtitle">{subtitle}</p>
          </header>

          {children}
        </section>

        <p className="local-note">
          Demo frontend · Tus datos se guardan solo en este navegador.
        </p>
      </div>
    </main>
  );
}

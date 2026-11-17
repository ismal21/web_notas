import { NoteIcon } from "./Icons";

/**
 * Pantalla que se muestra mientras comprobamos la sesión guardada
 * o mientras el usuario es redirigido a otra página.
 */
export default function LoadingScreen({ label = "Cargando tus notas..." }) {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <div className="loading-mark" aria-hidden="true">
        <NoteIcon width="28" height="28" />
      </div>
      <div className="loading-bar" aria-hidden="true">
        <span />
      </div>
      <p>{label}</p>
    </div>
  );
}

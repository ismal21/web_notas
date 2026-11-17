import Link from "next/link";
import { NoteIcon } from "./Icons";

/**
 * Marca de la aplicación (logo + nombre).
 * Se reutiliza en el login, el registro y la cabecera del panel.
 *
 * En Next.js, <Link> navega entre páginas sin recargar todo el
 * navegador, igual que una SPA (Single Page Application).
 */
export default function Brand({ href = "/" }) {
  return (
    <Link href={href} className="brand">
      <span className="brand-mark" aria-hidden="true">
        <NoteIcon width="21" height="21" />
      </span>
      <span className="brand-text">
        Nota<span>Flow</span>
      </span>
    </Link>
  );
}

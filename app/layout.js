import { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import LoadingScreen from "@/components/LoadingScreen";

/**
 * METADATOS de la página (título y descripción que ve el navegador).
 * En Next.js 16 se exporta este objeto desde el layout raíz.
 */
export const metadata = {
  title: "NotaFlow · Tus notas personales",
  description:
    "Una aplicación sencilla para crear, editar y eliminar notas personales.",
};

/**
 * LAYOUT RAÍZ
 * Es el marco común de todas las páginas. Next.js exige que
 * contenga las etiquetas <html> y <body>.
 *
 * AuthProvider envuelve toda la app para que cualquier página
 * pueda saber si hay un usuario conectado.
 *
 * El <Suspense> es necesario porque AuthProvider lee localStorage
 * y solo puede renderizarse en el navegador: mientras tanto se
 * muestra la pantalla de carga.
 */
export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <Suspense fallback={<LoadingScreen label="Cargando tu sesión..." />}>
          <AuthProvider>{children}</AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}

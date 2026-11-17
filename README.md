# NotaFlow · Web de notas

Aplicación de notas hecha **solo con frontend** usando **Next.js 16** y **React 19**.

Permite:

- Registrarse con nombre de usuario y contraseña.
- Ver u ocultar la contraseña en login y registro.
- Iniciar y cerrar sesión.
- Crear notas con título y mensaje.
- Editar y eliminar notas.
- Buscar notas.
- Mantener las notas separadas para cada usuario.

> **Importante:** al ser solo frontend, los usuarios y las notas se guardan en
> `localStorage` (el almacenamiento del navegador). No hay servidor ni base de
> datos. Esto es ideal para aprender, pero **no es seguro para producción**: en
> una app real las contraseñas deben gestionarse en un backend.

---

## Requisitos

- Node.js 20.9 o superior (este proyecto se creó con Node 24).
- npm.

## Cómo arrancar el proyecto

```bash
# 1. Instalar dependencias (ya están instaladas, pero por si acaso)
npm install

# 2. Arrancar el entorno de desarrollo
npm run dev
```

Después abre [http://localhost:3000](http://localhost:3000).

Otros comandos:

```bash
npm run build   # compilar para producción
npm start       # ejecutar la versión compilada
npm run lint    # revisar el código con ESLint
```

---

## Estructura del proyecto

```text
web_notas/
├── app/
│   ├── layout.js          # Marco general de la app + AuthProvider
│   ├── page.js            # Panel de notas (página principal)
│   ├── globals.css        # Todos los estilos
│   ├── login/page.js      # Página /login
│   └── register/page.js   # Página /register
├── components/
│   ├── AuthProvider.js    # Contexto de sesión (usuario conectado)
│   ├── AuthShell.js       # Diseño común de login y registro
│   ├── Brand.js           # Logo y nombre de la app
│   ├── Icons.js           # Iconos SVG reutilizables
│   ├── LoadingScreen.js   # Pantalla de carga
│   └── PasswordField.js   # Campo de contraseña con ver / ocultar
├── lib/
│   └── storage.js         # Usuarios, sesión y notas en localStorage
└── package.json
```

### Rutas

| Ruta        | Contenido                          |
| ----------- | ---------------------------------- |
| `/`         | Panel de notas (requiere sesión)   |
| `/login`    | Iniciar sesión                     |
| `/register` | Crear una cuenta                   |

---

## Conceptos de React usados (explicados)

### 1. Componentes

Un **componente** es una función de JavaScript que devuelve HTML (JSX).
Por ejemplo, `PasswordField` es un componente reutilizable:

```jsx
export default function PasswordField({ id, label, value, onChange }) {
  return <input id={id} value={value} onChange={onChange} />;
}
```

Se usa como si fuera una etiqueta HTML:

```jsx
<PasswordField id="password" label="Contraseña" value={password} onChange={...} />
```

### 2. Props

Las **props** son los datos que un componente recibe de su padre. En el ejemplo
anterior, `id`, `label`, `value` y `onChange` son props. Son de solo lectura.

### 3. Estado (`useState`)

El estado son variables que, al cambiar, hacen que React vuelva a dibujar la
interfaz. Por ejemplo, en el login:

```jsx
const [username, setUsername] = useState("");
```

- `username` es el valor actual.
- `setUsername` es la función para cambiarlo.
- `""` es el valor inicial.

Cuando el usuario escribe, se ejecuta `setUsername(...)` y el input se actualiza.

### 4. Efectos (`useEffect`)

Sirve para ejecutar código después de que la página se dibuja. Lo usamos para:

- Recuperar la sesión guardada al cargar la app.
- Cargar las notas del usuario.
- Redirigir al login si no hay sesión.

### 5. Contexto (`createContext` + `useContext`)

El usuario conectado se necesita en varias páginas. En lugar de pasar props por
todas partes, `AuthProvider` lo comparte mediante un contexto. Cualquier
componente puede obtenerlo con:

```jsx
const { user, login, logout } = useAuth();
```

### 6. Eventos

`onClick`, `onChange` y `onSubmit` ejecutan funciones cuando el usuario
interactúa con la interfaz. En los formularios usamos `e.preventDefault()` para
evitar que el navegador recargue la página.

### 7. Renderizado condicional y listas

```jsx
{error && <p>{error}</p>}          // solo se muestra si hay error
{notes.map((note) => (             // una tarjeta por cada nota
  <article key={note.id}>{note.title}</article>
))}
```

La prop `key` ayuda a React a identificar cada elemento de la lista.

---

## Cómo funcionan los datos

### Usuarios

Se guardan en `localStorage` con la clave `notaflow:usuarios`. La contraseña no se
guarda en texto plano: se guarda un **hash SHA-256** con un `salt` aleatorio por
usuario. Aun así, esto es solo una demostración educativa, no seguridad real.

### Sesión

Se guarda el nombre del usuario en `notaflow:sesion`. Al recargar la página, la
app lee esa sesión y mantiene al usuario conectado.

### Notas

Cada usuario tiene su propia clave, por ejemplo `notaflow:notas:ana`. Cada nota
contiene:

```js
{
  id: "uuid",
  title: "Título",
  content: "Mensaje",
  createdAt: "2026-11-10T...",
  updatedAt: "2026-11-10T..."
}
```

### Para borrar todos los datos de prueba

Abre la consola del navegador (F12) y ejecuta:

```js
localStorage.clear();
```

Después recarga la página.

---

## Notas sobre Next.js 16

- Cada carpeta dentro de `app/` es una ruta. `app/login/page.js` crea `/login`.
- `app/layout.js` envuelve todas las páginas y es obligatorio.
- Los componentes que usan estado, eventos o `localStorage` necesitan la
  directiva `"use client"` al principio del archivo.
- `next/link` se usa para navegar entre páginas sin recargar el navegador.
- `next/navigation` (`useRouter`) se usa para redirigir por código.
- `AuthProvider` usa `browser()` de `react-dom` para indicar que solo puede
  renderizarse en el navegador (necesita `localStorage`). El layout lo envuelve
  en `<Suspense>` para mostrar una pantalla de carga mientras se prepara.
- En `next.config.mjs` están desactivadas las Cache Components porque esta app
  no obtiene datos de un servidor: todo vive en el navegador.

---

## Posibles mejoras

- Añadir un backend real (por ejemplo con una base de datos) para que las notas
  no se pierdan al borrar los datos del navegador.
- Usar contraseñas cifradas y sesiones con cookies seguras.
- Añadir etiquetas, colores o notas fijadas.
- Sincronizar entre dispositivos.

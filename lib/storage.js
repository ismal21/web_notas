/**
 * ============================================================
 *  CAPA DE DATOS (solo navegador)
 * ============================================================
 *  Este proyecto es SOLO frontend: no hay servidor ni base de
 *  datos. Por eso usamos "localStorage", que es un pequeño
 *  almacén que el navegador guarda en el ordenador del usuario.
 *
 *  IMPORTANTE:
 *  - Los datos desaparecen si el usuario borra los datos del
 *    navegador.
 *  - Esto NO es seguro para producción. En una app real las
 *    contraseñas deben validarse en un backend y nunca guardarse
 *    en el navegador. Aquí las guardamos "hasheadas" (SHA-256)
 *    solo como ejercicio didáctico.
 * ============================================================
 */

// Claves con las que guardamos la información en localStorage.
const USERS_KEY = "notaflow:usuarios";
const SESSION_KEY = "notaflow:sesion";

/**
 * Lee un valor JSON de localStorage de forma segura.
 * Si no existe o está dañado, devuelve el valor por defecto.
 */
function readJSON(key, fallback) {
  // En el servidor (Next.js renderiza en el servidor) no existe
  // window, así que devolvemos el valor por defecto.
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/** Guarda un valor como JSON en localStorage. */
function writeJSON(key, value) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

/** Genera un identificador único para usuarios y notas. */
function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Convierte una contraseña en un "hash" usando SHA-256.
 * Un hash es un texto irreversible: no se puede volver a
 * convertir en la contraseña original.
 *
 * "salt" es un valor aleatorio distinto para cada usuario, para
 * que dos personas con la misma contraseña tengan hashes distintos.
 */
async function hashPassword(password, salt) {
  const text = `${salt}:${password}`;
  const bytes = new TextEncoder().encode(text);
  const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", bytes);

  // Convertimos los bytes del hash a texto hexadecimal.
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** Devuelve la lista de usuarios registrados. */
function getUsers() {
  return readJSON(USERS_KEY, []);
}

/** Guarda la lista completa de usuarios. */
function saveUsers(users) {
  writeJSON(USERS_KEY, users);
}

/**
 * Normaliza el nombre de usuario para comparar:
 * elimina espacios de los extremos y lo pasa a minúsculas.
 * Así "Ana" y "ana" se consideran el mismo usuario.
 */
function normalizeUsername(username) {
  return username.trim().toLowerCase();
}

/**
 * Registra un usuario nuevo.
 * Lanza un Error con un mensaje claro si algo no es válido.
 */
export async function registerUser(username, password) {
  const cleanUsername = username.trim();

  // Validaciones básicas.
  if (cleanUsername.length < 3) {
    throw new Error("El nombre de usuario debe tener al menos 3 caracteres.");
  }
  if (password.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres.");
  }

  const users = getUsers();
  const exists = users.some(
    (user) => normalizeUsername(user.username) === normalizeUsername(cleanUsername)
  );

  if (exists) {
    throw new Error("Ese nombre de usuario ya está registrado.");
  }

  // Cada usuario tiene su propio "salt" aleatorio.
  const salt = createId();
  const passwordHash = await hashPassword(password, salt);

  const newUser = {
    username: cleanUsername,
    salt,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  saveUsers([...users, newUser]);

  // Iniciamos sesión automáticamente después del registro.
  writeJSON(SESSION_KEY, { username: newUser.username });

  // Devolvemos solo los datos públicos (nunca el hash).
  return { username: newUser.username };
}

/**
 * Comprueba el usuario y la contraseña.
 * Si son correctos, guarda la sesión y devuelve el usuario.
 */
export async function loginUser(username, password) {
  const users = getUsers();
  const user = users.find(
    (item) => normalizeUsername(item.username) === normalizeUsername(username)
  );

  // Mensaje genérico a propósito: no revelamos si el usuario
  // existe o si solo falló la contraseña.
  if (!user) {
    throw new Error("Usuario o contraseña incorrectos.");
  }

  const passwordHash = await hashPassword(password, user.salt);
  if (passwordHash !== user.passwordHash) {
    throw new Error("Usuario o contraseña incorrectos.");
  }

  writeJSON(SESSION_KEY, { username: user.username });
  return { username: user.username };
}

/** Cierra la sesión actual. */
export function logoutUser() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
}

/**
 * Devuelve el usuario con sesión iniciada, o null.
 * Se usa al cargar la app para recordar la sesión.
 */
export function getSessionUser() {
  const session = readJSON(SESSION_KEY, null);
  if (!session?.username) return null;

  const users = getUsers();
  const user = users.find(
    (item) => normalizeUsername(item.username) === normalizeUsername(session.username)
  );

  // Si el usuario ya no existe, limpiamos la sesión.
  if (!user) {
    logoutUser();
    return null;
  }

  return { username: user.username };
}

/* ============================================================
 *  NOTAS
 *  Cada usuario tiene su propia lista, guardada con una clave
 *  distinta: "notaflow:notas:<usuario>"
 * ============================================================ */

function notesKey(username) {
  return `notaflow:notas:${normalizeUsername(username)}`;
}

/** Devuelve las notas del usuario (un array). */
export function getNotes(username) {
  const notes = readJSON(notesKey(username), []);
  return Array.isArray(notes) ? notes : [];
}

/** Guarda las notas del usuario. */
function saveNotes(username, notes) {
  writeJSON(notesKey(username), notes);
}

/**
 * Crea una nota y devuelve la lista actualizada.
 * Cada nota tiene: id, título, mensaje y fechas.
 */
export function addNote(username, title, content) {
  const now = new Date().toISOString();

  const note = {
    id: createId(),
    title: title.trim(),
    content: content.trim(),
    createdAt: now,
    updatedAt: now,
  };

  const notes = [note, ...getNotes(username)];
  saveNotes(username, notes);
  return notes;
}

/** Actualiza una nota existente y devuelve la lista actualizada. */
export function updateNote(username, id, title, content) {
  const notes = getNotes(username).map((note) =>
    note.id === id
      ? {
          ...note,
          title: title.trim(),
          content: content.trim(),
          updatedAt: new Date().toISOString(),
        }
      : note
  );

  saveNotes(username, notes);
  return notes;
}

/** Elimina una nota y devuelve la lista actualizada. */
export function deleteNote(username, id) {
  const notes = getNotes(username).filter((note) => note.id !== id);
  saveNotes(username, notes);
  return notes;
}

/**
 * Formatea una fecha ISO a un texto legible en español.
 * Ejemplo: "10 nov 2026, 16:40".
 */
export function formatDate(isoDate) {
  try {
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(isoDate));
  } catch {
    return "";
  }
}

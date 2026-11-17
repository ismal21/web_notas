"use client";

/**
 * ============================================================
 *  PANEL DE NOTAS  (/)
 * ============================================================
 *  Aquí está la lógica principal:
 *    - Comprobar que hay sesión iniciada.
 *    - Crear, editar y eliminar notas.
 *    - Buscar entre las notas.
 * ============================================================
 */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import Brand from "@/components/Brand";
import LoadingScreen from "@/components/LoadingScreen";
import {
  EditIcon,
  LogoutIcon,
  NoteIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from "@/components/Icons";
import { useAuth } from "@/components/AuthProvider";
import {
  addNote,
  deleteNote,
  formatDate,
  getNotes,
  updateNote,
} from "@/lib/storage";

export default function NotesPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  // --- Estados de las notas ---
  // El estado inicial se lee directamente de localStorage.
  // Esta página solo se renderiza en el navegador (ver AuthProvider).
  const [notes, setNotes] = useState(() =>
    user ? getNotes(user.username) : []
  );
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState("");
  const [search, setSearch] = useState("");

  // Referencias al formulario y al input de título.
  const formRef = useRef(null);
  const titleInputRef = useRef(null);

  // Si no hay usuario, lo mandamos al login.
  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  // Mientras se redirige, no mostramos el panel.
  if (!user) {
    return <LoadingScreen label="Redirigiendo al inicio de sesión..." />;
  }

  /** Limpia el formulario y sale del modo edición. */
  function resetForm() {
    setTitle("");
    setContent("");
    setEditingId(null);
    setFormError("");
  }

  /**
   * Crear o guardar una nota.
   * Si "editingId" tiene valor, estamos editando; si es null,
   * estamos creando una nota nueva.
   */
  function handleSubmit(e) {
    e.preventDefault();

    const cleanTitle = title.trim();
    const cleanContent = content.trim();

    if (!cleanTitle) {
      setFormError("Escribe un título para la nota.");
      return;
    }
    if (!cleanContent) {
      setFormError("Escribe el mensaje de la nota.");
      return;
    }

    const updatedNotes = editingId
      ? updateNote(user.username, editingId, cleanTitle, cleanContent)
      : addNote(user.username, cleanTitle, cleanContent);

    setNotes(updatedNotes);
    resetForm();
  }

  /** Carga una nota en el formulario para editarla. */
  function startEdit(note) {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setFormError("");

    // Llevamos al usuario al formulario y enfocamos el título.
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    titleInputRef.current?.focus({ preventScroll: true });
  }

  /** Elimina una nota después de pedir confirmación. */
  function handleDelete(note) {
    const confirmed = window.confirm(
      `¿Eliminar la nota "${note.title}"? Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    setNotes(deleteNote(user.username, note.id));

    // Si estábamos editando esa misma nota, limpiamos el formulario.
    if (editingId === note.id) resetForm();
  }

  /** Cierra la sesión y vuelve al login. */
  function handleLogout() {
    logout();
    router.replace("/login");
  }

  // Filtro de búsqueda (se calcula en cada render, sin estado extra).
  const searchTerm = search.trim().toLowerCase();
  const filteredNotes = searchTerm
    ? notes.filter((note) =>
        `${note.title} ${note.content}`.toLowerCase().includes(searchTerm)
      )
    : notes;

  return (
    <div className="app-shell">
      {/* ---------- CABECERA ---------- */}
      <header className="app-header">
        <div className="header-inner">
          <Brand href="/" />

          <div className="user-area">
            <div className="user-chip" title={`Sesión de ${user.username}`}>
              <span className="avatar" aria-hidden="true">
                {user.username.charAt(0).toUpperCase()}
              </span>
              <span className="user-name">{user.username}</span>
            </div>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleLogout}
              title="Cerrar sesión"
            >
              <LogoutIcon width="17" height="17" />
              <span className="logout-label">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        {/* ---------- PRESENTACIÓN ---------- */}
        <section className="dashboard-hero">
          <div>
            <span className="eyebrow">Panel personal</span>
            <h1>Mis notas</h1>
            <p className="hero-subtitle">
              Captura ideas, recordatorios y todo lo que no quieras olvidar.
            </p>
          </div>

          <div className="stat-pill">
            <strong>{notes.length}</strong>
            <span>{notes.length === 1 ? "nota guardada" : "notas guardadas"}</span>
          </div>
        </section>

        {/* ---------- FORMULARIO ---------- */}
        <section className="note-form-card" ref={formRef}>
          <div className="form-header">
            <h2>
              <span className="form-icon" aria-hidden="true">
                <NoteIcon width="18" height="18" />
              </span>
              {editingId ? "Editar nota" : "Nueva nota"}
            </h2>

            {editingId && <span className="editing-badge">Modo edición</span>}
          </div>

          <form className="note-form" onSubmit={handleSubmit}>
            <div className="field">
              <div className="field-label-row">
                <label htmlFor="note-title">Título</label>
                <span className="field-hint">{title.length}/100</span>
              </div>
              <input
                ref={titleInputRef}
                id="note-title"
                name="title"
                type="text"
                className="text-input"
                placeholder="Ej. Ideas para el fin de semana"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                required
              />
            </div>

            <div className="field">
              <div className="field-label-row">
                <label htmlFor="note-content">Mensaje</label>
                <span className="field-hint">{content.length}/2000</span>
              </div>
              <textarea
                id="note-content"
                name="content"
                className="text-input textarea"
                placeholder="Escribe aquí el contenido de tu nota..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                maxLength={2000}
                required
              />
            </div>

            {formError && (
              <p className="error-box" role="alert">
                {formError}
              </p>
            )}

            <div className="form-actions">
              {editingId && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={resetForm}
                >
                  Cancelar
                </button>
              )}

              <button type="submit" className="btn btn-primary">
                {editingId ? (
                  <>
                    <EditIcon width="17" height="17" />
                    Guardar cambios
                  </>
                ) : (
                  <>
                    <PlusIcon width="17" height="17" />
                    Agregar nota
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* ---------- LISTA DE NOTAS ---------- */}
        <section className="notes-section" aria-labelledby="notes-heading">
          <div className="notes-toolbar">
            <h2 id="notes-heading">
              Tus notas{" "}
              {notes.length > 0 && (
                <span className="count-badge">{notes.length}</span>
              )}
            </h2>

            <div className="search-wrap">
              <SearchIcon
                className="search-icon"
                width="17"
                height="17"
                aria-hidden="true"
              />
              <input
                type="search"
                className="text-input search-input"
                placeholder="Buscar en tus notas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Buscar notas"
              />
            </div>
          </div>

          {filteredNotes.length > 0 ? (
            <div className="notes-grid">
              {/* map() recorre el array y crea una tarjeta por nota. */}
              {filteredNotes.map((note, index) => (
                <article
                  key={note.id}
                  className="note-card"
                  style={{ animationDelay: `${index * 45}ms` }}
                >
                  <h3>{note.title}</h3>
                  <p className="note-content">{note.content}</p>

                  <div className="note-footer">
                    <time dateTime={note.updatedAt}>
                      {formatDate(note.updatedAt)}
                    </time>

                    <div className="note-actions">
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => startEdit(note)}
                        aria-label={`Editar ${note.title}`}
                        title="Editar nota"
                      >
                        <EditIcon width="17" height="17" />
                      </button>

                      <button
                        type="button"
                        className="icon-btn icon-btn-danger"
                        onClick={() => handleDelete(note)}
                        aria-label={`Eliminar ${note.title}`}
                        title="Eliminar nota"
                      >
                        <TrashIcon width="17" height="17" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon" aria-hidden="true">
                <NoteIcon width="30" height="30" />
              </div>
              <h3>{searchTerm ? "No hay resultados" : "Tu bloc está en blanco"}</h3>
              <p>
                {searchTerm
                  ? `No encontramos notas que coincidan con "${search.trim()}".`
                  : "Escribe tu primera nota en el formulario de arriba y aparecerá aquí."}
              </p>
            </div>
          )}
        </section>

        <footer className="app-footer">
          Hecho con Next.js y React · Tus notas se guardan localmente en este
          navegador.
        </footer>
      </main>
    </div>
  );
}

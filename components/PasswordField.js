"use client";

/**
 * ============================================================
 *  CAMPO DE CONTRASEÑA CON BOTÓN PARA VER / OCULTAR
 * ============================================================
 *  Es un componente reutilizable. Recibe "props" (datos que le
 *  pasa el componente padre) y devuelve el HTML del campo.
 *
 *  El estado "visible" es local: cada campo decide de forma
 *  independiente si muestra u oculta su contraseña.
 * ============================================================
 */

import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "./Icons";

export default function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder = "••••••••",
  autoComplete = "current-password",
  hint,
  required = true,
}) {
  // false = contraseña oculta (type="password")
  // true  = contraseña visible (type="text")
  const [visible, setVisible] = useState(false);

  return (
    <div className="field">
      <div className="field-label-row">
        <label htmlFor={id}>{label}</label>
        {hint && <span className="field-hint">{hint}</span>}
      </div>

      <div className="input-wrap">
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          className="text-input has-toggle"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          minLength={6}
        />

        {/* type="button" evita que este botón envíe el formulario. */}
        <button
          type="button"
          className="password-toggle"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          title={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {visible ? (
            <EyeOffIcon width="19" height="19" />
          ) : (
            <EyeIcon width="19" height="19" />
          )}
        </button>
      </div>
    </div>
  );
}

"use client";

import React from "react";

export const Input = React.forwardRef(function Input(
  {
    label,
    error,
    helperText,
    icon: Icon,
    type = "text",
    className = "",
    id,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <div className="input-wrapper">
        {Icon && <Icon className="input-icon" style={{ width: "1rem", height: "1rem" }} />}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`input-field ${Icon ? "has-icon" : ""} ${
            error ? "input-error" : ""
          } ${className}`.trim()}
          {...props}
        />
      </div>
      {error ? (
        <p className="error-message">{error}</p>
      ) : helperText ? (
        <p className="helper-text">{helperText}</p>
      ) : null}
    </div>
  );
});

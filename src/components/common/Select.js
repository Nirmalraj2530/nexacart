"use client";

import React from "react";

export const Select = React.forwardRef(function Select(
  {
    label,
    options = [],
    error,
    placeholder = "Select an option",
    className = "",
    id,
    ...props
  },
  ref
) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label}
        </label>
      )}
      <div className="input-wrapper">
        <select
          ref={ref}
          id={selectId}
          className={`select-field ${error ? "input-error" : ""} ${className}`.trim()}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
});

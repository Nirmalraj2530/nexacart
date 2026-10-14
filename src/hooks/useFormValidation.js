"use client";

import { useState, useCallback } from "react";

/**
 * Custom Hook to handle form field validation, touched states, and submit checks.
 * 
 * @param {object} initialValues - Initial form state
 * @param {function} validateFn - Custom validation function returning error object
 */
export function useFormValidation(initialValues = {}, validateFn) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    setValues((prev) => ({ ...prev, [name]: fieldValue }));

    if (validateFn) {
      const validationResult = validateFn({ ...values, [name]: fieldValue });
      setErrors((prev) => ({
        ...prev,
        [name]: validationResult.errors?.[name] || null,
      }));
    }
  }, [values, validateFn]);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    if (validateFn) {
      const validationResult = validateFn(values);
      setErrors(validationResult.errors || {});
    }
  }, [values, validateFn]);

  const setValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const resetForm = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const handleSubmit = useCallback((onSubmit) => async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsSubmitting(true);

    let currentErrors = {};
    if (validateFn) {
      const validationResult = validateFn(values);
      currentErrors = validationResult.errors || {};
      setErrors(currentErrors);
    }

    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    if (Object.keys(currentErrors).length === 0) {
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(false);
    }
  }, [values, validateFn]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    setValue,
    resetForm,
    handleSubmit,
    setValues,
  };
}

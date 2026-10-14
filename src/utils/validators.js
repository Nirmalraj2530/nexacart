/**
 * Validation rules and helper functions for E-commerce forms (Products, Users, Auth)
 */

export const validateEmail = (email) => {
  if (!email || !email.trim()) return "Email address is required";
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email.trim())) return "Invalid email address format";
  return null;
};

export const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < 6) return "Password must be at least 6 characters long";
  return null;
};

export const validateProductTitle = (title) => {
  if (!title || !title.trim()) return "Product title is required";
  if (title.trim().length < 3) return "Title must be at least 3 characters long";
  if (title.trim().length > 100) return "Title cannot exceed 100 characters";
  return null;
};

export const validatePrice = (price) => {
  if (price === undefined || price === null || price === "") return "Price is required";
  const num = Number(price);
  if (isNaN(num)) return "Price must be a valid number";
  if (num <= 0) return "Price must be greater than 0";
  if (num > 100000) return "Price cannot exceed $100,000";
  return null;
};

export const validateCategory = (categoryId) => {
  if (!categoryId) return "Please select a category";
  return null;
};

export const validateDescription = (desc) => {
  if (!desc || !desc.trim()) return "Description is required";
  if (desc.trim().length < 10) return "Description must be at least 10 characters long";
  return null;
};

export const validateImageUrl = (url) => {
  if (!url || !url.trim()) return "Image URL is required";
  try {
    const parsed = new URL(url.trim());
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "URL must start with http:// or https://";
    }
  } catch {
    return "Please enter a valid URL";
  }
  return null;
};

/**
 * Validates an entire product form object
 */
export const validateProductForm = (formData) => {
  const errors = {};

  const titleError = validateProductTitle(formData.title);
  if (titleError) errors.title = titleError;

  const priceError = validatePrice(formData.price);
  if (priceError) errors.price = priceError;

  const categoryError = validateCategory(formData.categoryId || formData.category?.id);
  if (categoryError) errors.categoryId = categoryError;

  const descriptionError = validateDescription(formData.description);
  if (descriptionError) errors.description = descriptionError;

  const imageError = validateImageUrl(
    Array.isArray(formData.images) ? formData.images[0] : formData.image || formData.images
  );
  if (imageError) errors.images = imageError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

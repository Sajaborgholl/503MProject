// utils/validators.js

// Validate that a string is not empty and does not exceed a max length
export const isValidString = (value, maxLength = 255) => {
    return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;
};

// Validate that a number is a positive integer or zero
export const isValidQuantity = (value) => {
    const quantity = parseInt(value, 10);
    return Number.isInteger(quantity) && quantity >= 0;
};

// Validate price as a positive number
export const isValidPrice = (value) => {
    const price = parseFloat(value);
    return !isNaN(price) && price > 0;
};

// Sanitize string to remove risky characters and patterns
export const sanitizeString = (value) => {
    if (typeof value !== 'string') return '';
    
    // Remove specific characters commonly used in scripting
    const sanitizedValue = value
      .replace(/[`~!@#$%^*()_|+\-=?;:'",.<>{}[\]\\\/]/gi, '') // Remove special characters
      .replace(/(script|javascript|onerror|onload|alert|eval|href|src)/gi, ''); // Remove keywords
    
    // Trim any extra whitespace
    return sanitizedValue.trim();
  };

// Example validation for product data
export const validateProductData = (data) => {  
    const { name, description, price, stock_quantity, category_id, subcategory_id } = data;
    return (
        isValidString(name) &&
        isValidString(description, 500) &&
        isValidPrice(price) &&
        isValidQuantity(stock_quantity) &&
        isValidQuantity(category_id) &&
        isValidQuantity(subcategory_id)
    );
};

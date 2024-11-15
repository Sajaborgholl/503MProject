// src/utils/api.js

// Helper function to fetch with authorization headers
const fetchWithAuth = (url, options = {}) => {
    const token = localStorage.getItem('token');
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  };


export const fetchProducts = async () => {
    const response = await fetch('http://127.0.0.1:5000/product/all', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    return response.json();
  };
  
  export const deleteProduct = async (productId) => {
    const response = await fetch(`http://127.0.0.1:5000/product/${productId}/delete`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (!response.ok) {
      throw new Error('Failed to delete product');
    }
    return response.json();
  };


// Update a product by ID
export const updateProduct = async (productId, productData) => {
    const response = await fetchWithAuth(`http://127.0.0.1:5000/product/${productId}/update`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Update product error response:", errorData);
      throw new Error(errorData.message || 'Failed to update product');
    }
  
    return response.json();
  };
  
  
  // Add a new product
  export const addProduct = async (productData) => {
    const response = await fetchWithAuth(`http://127.0.0.1:5000/product/add`, {
      method: 'POST',
      body: JSON.stringify(productData),
    });
    if (!response.ok) {
      throw new Error('Failed to add product');
    }
    return response.json();
  };
  
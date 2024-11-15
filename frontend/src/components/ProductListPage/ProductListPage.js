// src/components/ProductList/ProductList.js
import React, { useEffect, useState } from 'react';
import { Typography, CircularProgress, List } from '@mui/material';
import ProductItem from './ProductItem';
import DeleteDialog from './DeleteDialog';
import EditDialog from './EditDialog';
import { fetchProducts, deleteProduct, updateProduct } from '../../utils/api'; // Import updateProduct
import './ProductListPage.css';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data.products);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const handleOpenDeleteDialog = (product) => {
    setSelectedProduct(product);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedProduct(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;

    try {
      await deleteProduct(selectedProduct.product_id);
      setProducts((prevProducts) => prevProducts.filter((product) => product.product_id !== selectedProduct.product_id));
      handleCloseDeleteDialog();
    } catch (err) {
      setError(err.message);
    }
  };

  // Opens the EditDialog with the selected product's information
  const handleOpenEditDialog = (product) => {
    setSelectedProduct(product);
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedProduct(null);
  };

  const handleSaveEdit = async (updatedProductData) => {
    if (!selectedProduct) return;

    try {
      // Call the updateProduct API function
      const updatedProduct = await updateProduct(selectedProduct.product_id, updatedProductData);
      console.log("Updated product:", updatedProduct); 
      // Update the products array with the updated product data
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.product_id === updatedProduct.product_id ? updatedProduct : product
        )
      );
      handleCloseEditDialog();
    } catch (err) {
      setError(err.message); // Display error message if update fails
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <div>
      <Typography variant="h4" gutterBottom>All Products</Typography>
      <List>
        {products.map((product) => (
          <ProductItem
            key={product.product_id}
            product={product}
            onDelete={() => handleOpenDeleteDialog(product)}
            onEdit={() => handleOpenEditDialog(product)}
          />
        ))}
      </List>

      {/* Delete Dialog */}
      <DeleteDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        productName={selectedProduct?.name}
      />

      {/* Edit Dialog */}
      <EditDialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        product={selectedProduct}
        onSave={handleSaveEdit}
      />
    </div>
  );
}

export default ProductList;

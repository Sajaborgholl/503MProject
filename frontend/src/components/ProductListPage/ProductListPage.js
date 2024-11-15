// src/components/ProductList/ProductList.js
import React, { useEffect, useState } from 'react';
import { Typography, CircularProgress, List } from '@mui/material';
import ProductItem from './ProductItem';
import DeleteDialog from './DeleteDialog';
import { fetchProducts, deleteProduct } from '../../utils/api';
import './ProductListPage.css';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

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
      setProducts(products.filter((product) => product.product_id !== selectedProduct.product_id));
      handleCloseDeleteDialog();
    } catch (err) {
      setError(err.message);
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
          />
        ))}
      </List>

      <DeleteDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        productName={selectedProduct?.name}
      />
    </div>
  );
}

export default ProductList;

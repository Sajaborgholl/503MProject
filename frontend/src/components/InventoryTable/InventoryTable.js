// src/components/InventoryTable/InventoryTable.js

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TablePagination,
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';

function InventoryTable({ inventory, criticalThreshold, lowThreshold }) {
  // State variables for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWarehouseId, setFilterWarehouseId] = useState('');
  const [filterStockStatus, setFilterStockStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  // Process inventory data into an array of items
  const inventoryItems = [];
  for (const [productId, productData] of Object.entries(inventory)) {
    const productName = productData.product_name;
    const categoryName = productData.category_name;
    const warehouses = productData.warehouses;
    warehouses.forEach((warehouse) => {
      inventoryItems.push({
        productId,
        productName,
        categoryName,
        warehouseId: warehouse.warehouse_id,
        stockQuantity: warehouse.stock_quantity,
      });
    });
  }

  // Extract unique warehouse IDs and category names for filter options
  const warehouseIds = [...new Set(inventoryItems.map((item) => item.warehouseId))].sort(
    (a, b) => a - b
  );
  const categoryNames = [...new Set(inventoryItems.map((item) => item.categoryName))].sort();

  // Filter the inventory items based on user input
  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWarehouse = filterWarehouseId ? item.warehouseId === filterWarehouseId : true;
    let matchesStockStatus = true;
    if (filterStockStatus === 'low') {
      matchesStockStatus =
        item.stockQuantity <= lowThreshold && item.stockQuantity > criticalThreshold;
    } else if (filterStockStatus === 'critical') {
      matchesStockStatus = item.stockQuantity <= criticalThreshold;
    }
    const matchesCategory = filterCategory ? item.categoryName === filterCategory : true;
    return matchesSearch && matchesWarehouse && matchesStockStatus && matchesCategory;
  });

  const paginatedItems = filteredItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Function to determine the background color based on stock levels
  function getStockColor(stockQuantity) {
    if (stockQuantity <= criticalThreshold) {
      return '#e27272';
    } else if (stockQuantity <= lowThreshold) {
      return '#e7df7e';
    } else {
      return 'inherit'; // Default color
    }
  }

  return (
    <Box>
      {/* Table Title */}
      <Typography variant="h6" gutterBottom sx={{ color: '#3f51b5', fontWeight: 'bold' }}>
      <InventoryIcon sx={{ mr: 1, color: '#3f51b5' }} />
        Inventory Table
      </Typography>

      {/* Filters */}
      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <TextField
          label="Search Product"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mr: 1, width: '200px' }}
        />
        <FormControl variant="outlined" size="small" sx={{ mr: 1, minWidth: '150px' }}>
          <InputLabel>Warehouse</InputLabel>
          <Select
            label="Warehouse"
            value={filterWarehouseId}
            onChange={(e) => setFilterWarehouseId(e.target.value)}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 200,
                },
              },
            }}
          >
            <MenuItem value="">All</MenuItem>
            {warehouseIds.map((id) => (
              <MenuItem key={id} value={id}>
                {id}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl variant="outlined" size="small" sx={{ mr: 1, minWidth: '150px' }}>
          <InputLabel>Category</InputLabel>
          <Select
            label="Category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 200,
                },
              },
            }}
          >
            <MenuItem value="">All</MenuItem>
            {categoryNames.map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl variant="outlined" size="small" sx={{ minWidth: '150px' }}>
          <InputLabel>Stock Status</InputLabel>
          <Select
            label="Stock Status"
            value={filterStockStatus}
            onChange={(e) => setFilterStockStatus(e.target.value)}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 200,
                },
              },
            }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="low">Low Stock</MenuItem>
            <MenuItem value="critical">Critical Stock</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Inventory Table */}
      <TableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Product ID</TableCell>
              <TableCell>Product Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Warehouse ID</TableCell>
              <TableCell>Stock Quantity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedItems.map((item, index) => (

                <TableRow key={index}>
                  <TableCell>{item.productId}</TableCell>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>{item.categoryName}</TableCell>
                  <TableCell>{item.warehouseId}</TableCell>
                  <TableCell
                    style={{
                      backgroundColor: getStockColor(item.stockQuantity),
                    }}
                  >
                    {item.stockQuantity}
                  </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 20, 30]}
          component="div"
          count={filteredItems.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
}

InventoryTable.propTypes = {
  inventory: PropTypes.object.isRequired,
  criticalThreshold: PropTypes.number.isRequired,
  lowThreshold: PropTypes.number.isRequired,
};

export default InventoryTable;

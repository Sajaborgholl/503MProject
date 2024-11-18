// src/components/InventoryReport/InventoryTurnoverChart.js

import React from 'react';
import PropTypes from 'prop-types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Typography, Box } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';

function InventoryTurnoverChart({ data }) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ color: '#3f51b5', fontWeight: 'bold' }}>
      <BarChartIcon sx={{ mr: 1, color: '#3f51b5' }} />
          Inventory Turnover Rate
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis label={{ value: 'Turnover Rate', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Bar dataKey="turnover_rate" fill="#3f51b5" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}

InventoryTurnoverChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      month: PropTypes.string.isRequired,
      turnover_rate: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default InventoryTurnoverChart;

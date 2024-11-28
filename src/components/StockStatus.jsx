import { Chip } from '@mui/material';

const StockStatus = ({ quantity }) => {
  if (quantity <= 0) {
    return (
      <Chip 
        label="Out of Stock" 
        size="small"
        sx={{ 
          fontWeight: 'medium',
          minWidth: '100px',
          bgcolor: '#ffebee',
          color: '#d32f2f',
          '& .MuiChip-label': {
            fontSize: '0.75rem',
          },
        }} 
      />
    );
  }
  
  if (quantity <= 10) {
    return (
      <Chip 
        label="Low Stock" 
        size="small"
        sx={{ 
          fontWeight: 'medium',
          minWidth: '100px',
          bgcolor: '#fff3e0',
          color: '#ed6c02',
          '& .MuiChip-label': {
            fontSize: '0.75rem',
          },
        }} 
      />
    );
  }
  
  return (
    <Chip 
      label="In Stock" 
      size="small"
      sx={{ 
        fontWeight: 'medium',
        minWidth: '100px',
        bgcolor: '#e8f5e9',
        color: '#2e7d32',
        '& .MuiChip-label': {
          fontSize: '0.75rem',
        },
      }} 
    />
  );
};

export default StockStatus;

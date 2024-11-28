import { useState } from 'react'
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  IconButton,
  Typography,
  Box,
  Snackbar,
} from '@mui/material'
import {
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material'
import StockStatus from './StockStatus'

function ProductCard({ product, onAddToCart, showAddToCart = true }) {
  const { name, price, image_url, stock_quantity } = product
  const [quantity, setQuantity] = useState(1)
  const [showSuccess, setShowSuccess] = useState(false)
  
  const hasStock = stock_quantity > 0

  const handleIncrement = () => {
    if (quantity < stock_quantity) {
      setQuantity(prev => prev + 1)
    }
  }

  const handleDecrement = () => {
    setQuantity(prev => Math.max(1, prev - 1))
  }

  const handleAddToCart = () => {
    onAddToCart(product, quantity)
    setQuantity(1)
    setShowSuccess(true)
  }

  return (
    <Card 
      elevation={3}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'row',
        flexGrow: 1,
        p: 2,
        pb: 0,
      }}>
        {/* Product Info (aa) */}
        <Box sx={{ 
          width: '65%',
          pr: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <Typography 
            variant="h6" 
            component="h2" 
            sx={{ 
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 1,
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            {name}
          </Typography>
          <Typography 
            variant="h6" 
            color="primary" 
            sx={{ 
              mb: 1,
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            AED {price.toFixed(2)}
          </Typography>
          <Box>
            <StockStatus quantity={stock_quantity} />
          </Box>
        </Box>

        {/* Product Image (b) */}
        <Box sx={{
          width: '35%',
          aspectRatio: '1',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 2,
        }}>
          <CardMedia
            component="img"
            image={image_url || 'https://via.placeholder.com/200'}
            alt={name}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </Box>
      </Box>

      {/* Add to Cart Button (cccc) */}
      {showAddToCart && (
        <Box sx={{ p: 2, pt: 1, width: '100%' }}>
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            mb: 1,
            opacity: hasStock ? 1 : 0.6
          }}>
            <IconButton 
              size="small"
              onClick={handleDecrement}
              disabled={!hasStock || quantity <= 1}
            >
              <RemoveIcon />
            </IconButton>
            <Typography>
              {quantity}
            </Typography>
            <IconButton
              size="small"
              onClick={handleIncrement}
              disabled={!hasStock || quantity >= stock_quantity}
            >
              <AddIcon />
            </IconButton>
          </Box>
          <Button
            variant="contained"
            fullWidth
            onClick={handleAddToCart}
            disabled={!hasStock}
            sx={{
              borderRadius: 1,
              opacity: hasStock ? 1 : 0.6,
              '&.Mui-disabled': {
                backgroundColor: theme => theme.palette.primary.main,
                color: 'white',
                opacity: 0.6
              }
            }}
          >
            {hasStock ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </Box>
      )}

      <Snackbar
        open={showSuccess}
        autoHideDuration={2000}
        onClose={() => setShowSuccess(false)}
        message="Added to cart"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Card>
  )
}

export default ProductCard

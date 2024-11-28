import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  IconButton,
  Grid,
  Divider,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile } from '../services/supabase';
import { useState } from 'react';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, total } = useCart();
  const { user } = useAuth();
  const [error, setError] = useState(null);

  if (cart.length === 0) {
    return (
      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
        <Paper elevation={3} sx={{ 
          mt: { xs: 4, sm: 8 }, 
          p: { xs: 2, sm: 4 }
        }}>
          <Typography variant="h5" gutterBottom>
            Your cart is empty
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/shop')}
            sx={{ mt: 2 }}
          >
            Continue Shopping
          </Button>
        </Paper>
      </Container>
    );
  }

  const handleCheckout = async () => {
    if (!user) {
      // If user is not logged in, redirect to login page
      navigate('/login', { 
        state: { 
          returnTo: '/cart',
          message: 'Please sign in to complete your purchase.' 
        }
      });
      return;
    }

    try {
      // Check if user has a profile
      const { data: profile, error: profileError } = await getUserProfile(user.id);
      
      if (profileError) {
        throw profileError;
      }

      if (!profile) {
        setError('Please complete your profile before checking out');
        setTimeout(() => {
          navigate('/login?tab=signup');
        }, 2000);
        return;
      }

      // If profile exists, proceed to checkout
      navigate('/checkout');
    } catch (error) {
      console.error('Error checking profile:', error);
      setError('Failed to proceed to checkout. Please try again.');
    }
  };

  return (
    <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
      <Paper elevation={3} sx={{ 
        mt: { xs: 4, sm: 8 }, 
        p: { xs: 2, sm: 4 }
      }}>
        <Typography variant="h4" gutterBottom>
          Shopping Cart
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {cart.map((item) => (
          <Box key={item.id} sx={{ my: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">{item.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  AED {item.price.toFixed(2)} each
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box display="flex" alignItems="center">
                  <IconButton
                    size="small"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <Typography sx={{ mx: 2 }}>{item.quantity}</Typography>
                  <IconButton
                    size="small"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Typography>
                  AED {(item.price * item.quantity).toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={1}>
                <IconButton
                  color="error"
                  onClick={() => removeFromCart(item.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />
          </Box>
        ))}

        <Box sx={{ mt: 4 }}>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Typography variant="h6">
                Total: AED {total.toFixed(2)}
              </Typography>
            </Grid>
            <Grid item>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/shop')}
                >
                  Continue Shopping
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCheckout}
                  size="large"
                >
                  {user ? 'Proceed to Checkout' : 'Sign in to Checkout'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

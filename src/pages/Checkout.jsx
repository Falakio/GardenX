import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { createOrder, getUserProfile } from '../services/supabase';
import ziinaService from '../services/ziinaService';

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, total, clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const { data, error } = await getUserProfile(user.id);
        if (error) throw error;
        
        if (!data) {
          // Redirect to complete profile if not found
          navigate('/login?tab=signup');
          return;
        }

        setProfile(data);
      } catch (error) {
        console.error('Error loading profile:', error);
        setError('Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, navigate]);

  useEffect(() => {
    // Redirect to shop if cart is empty
    if (!loading && cart.length === 0) {
      navigate('/shop');
    }
  }, [cart, loading, navigate]);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ziinaService.createPaymentRequest({
        amount: total,
        currency: 'AED',
        customerEmail: user.email,
        customerName: profile.full_name,
        customerPhone: profile.phone,
        orderId: `order-${Date.now()}`,
        description: 'Purchase from Gems Garden',
      });
      if (response && response.url) {
        window.location.href = response.url; // Redirect to Ziina checkout
      } else {
        setError('Failed to initiate payment.');
      }
    } catch (err) {
      setError('An error occurred during checkout.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/profile')}>
          Complete Profile
        </Button>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Please complete your profile before checking out.
        </Alert>
        <Button variant="contained" onClick={() => navigate('/profile')}>
          Complete Profile
        </Button>
      </Container>
    );
  }

  if (cart.length === 0) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Your cart is empty. Add some items before checking out.
        </Alert>
        <Button variant="contained" onClick={() => navigate('/shop')}>
          Go to Shop
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" gutterBottom>
        Checkout
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {profile ? (
        <Paper elevation={3} sx={{ 
          mt: { xs: 4, sm: 8 }, 
          p: { xs: 2, sm: 4 }
        }}>
          <Typography variant="h6" gutterBottom>
            Order Summary
          </Typography>
          <Typography>Student: {profile.student_name}</Typography>
          <Typography>Class: {profile.student_class}-{profile.student_section}</Typography>
          <Typography>GEMS ID: xxxxxx{profile.gems_id_last_six}</Typography>
          <Typography variant="h6" sx={{ mt: 3 }}>
            Items:
          </Typography>
          {cart.map((item) => (
            <Box key={item.id} sx={{ mt: 1 }}>
              <Typography>
                {item.name} x {item.quantity} = AED {(item.price * item.quantity).toFixed(2)}
              </Typography>
            </Box>
          ))}
          <Typography variant="h6" sx={{ mt: 3 }}>
            Total: AED {total.toFixed(2)}
          </Typography>
        </Paper>
      ) : (
        <CircularProgress />
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {cart.length > 0 && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Proceed to Ziina Checkout'}
          </Button>
        )}
        <Button
          variant="outlined"
          onClick={() => navigate('/cart')}
        >
          Back to Cart
        </Button>
      </Box>
    </Container>
  );
}

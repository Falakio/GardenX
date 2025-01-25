import { useNavigate } from "react-router-dom";
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
} from "@mui/material";
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { getUserProfile } from "../services/supabase";
import { useState } from "react";

export default function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, total } = useCart();
  const { user } = useAuth();
  const [error, setError] = useState(null);

  if (cart.length === 0) {
    return (
      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
        <Paper
          elevation={3}
          sx={{
            mt: { xs: 4, sm: 8 },
            p: { xs: 2, sm: 4 },
            background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          borderRadius: "15px",
          color: "white"
          }}
        >
          <Typography variant="h5" gutterBottom>
            Your cart is empty
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/shop")}
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
      navigate("/login", {
        state: {
          returnTo: "/cart",
          message: "Please sign in to complete your purchase.",
        },
      });
      return;
    }

    try {
      // Check if user has a profile
      const { data: profile, error: profileError } = await getUserProfile(
        user.id
      );

      if (profileError) {
        throw profileError;
      }

      if (!profile) {
        setError("Please complete your profile before checking out");
        setTimeout(() => {
          navigate("/login?tab=signup");
        }, 2000);
        return;
      }

      // If profile exists, proceed to checkout
      navigate("/checkout");
    } catch (error) {
      console.error("Error checking profile:", error);
      setError("Failed to proceed to checkout. Please try again.");
    }
  };

  return (
    <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
      <Paper
        elevation={3}
        sx={{
          mt: { xs: 4, sm: 8 },
          p: { xs: 2, sm: 4 },
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          borderRadius: "15px",
          color: "white",
        }}
      >
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
              <Grid item xs={6} sm={9}>
                <Typography variant="subtitle1">{item.name}</Typography>

                <Typography variant="body2" sx={{ color: "lightgray" }}>
                  AED {item.price.toFixed(2)} each
                </Typography>
              </Grid>
              <Grid
                item
                xs={4}
                sm={2}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >
                <Box display="flex" alignItems="center">
                  <IconButton
                    size="small"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <Typography
                    sx={{ mx: 2 }}
                    contentEditable
                    onBlur={(e) => {
                      const newQuantity = parseInt(e.target.innerText, 10);
                      if (!isNaN(newQuantity) && newQuantity > 0) {
                        updateQuantity(item.id, newQuantity);
                      } else {
                        e.target.innerText = item.quantity;
                      }
                    }}
                    onInput={(e) => {
                      e.target.innerText = e.target.innerText.replace(
                        /\D/g,
                        ""
                      );
                    }}
                  >
                    {item.quantity}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
                <Typography>
                  AED {(item.price * item.quantity).toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={1} sm={1}>
                <IconButton onClick={() => removeFromCart(item.id)}>
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />
          </Box>
        ))}

        <Box sx={{ mt: 2 }}>
          <Grid
            container
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Grid item>
              <Typography variant="h6">
                Total: AED {total.toFixed(2)}
              </Typography>
            </Grid>
            <Grid
              item
              sx={{ display: "flex",  width: "100%", flexDirection: "column", gap: 2, justifyContent: "center", alignItems: "center" }}
            >
              <Button
                sx={{ color: "#fff", outline: "1px solid white", width: "100%" }}
                onClick={() => navigate("/shop")}
              >
                Continue Shopping
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCheckout}
                size="large"
                sx={{  width: "100%", py: 3, fontweight: "bold" }}
              >
                {user ? "Proceed to Checkout" : "Sign in to Checkout"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}
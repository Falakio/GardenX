import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { createOrder, getUserProfile } from "../services/supabase";
// import { sendEmail } from '../services/smtp';

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, total, clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [orderMode, setOrderMode] = useState("pickup"); // Default to 'pickup'

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const { data, error } = await getUserProfile(user.id);
        if (error) throw error;

        if (!data) {
          navigate("/login?tab=signup");
          return;
        }

        setProfile(data);
      } catch (error) {
        console.error("Error loading profile:", error);
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, navigate]);

  useEffect(() => {
    // Redirect to shop if cart is empty
    if (!loading && cart.length === 0) {
      navigate("/shop");
    }
  }, [cart, loading, navigate]);

  const handleOrderModeChange = (e) => {
    setOrderMode(e.target.value);
  };

  const generateInvoiceHtml = (profile, cart, total, orderMode, orderId, orderStatus) => {
    const itemsHtml = cart
      .map(
        (item) => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.quantity}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">AED ${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `
      )
      .join("");
  
    const orderModeMessage = profile.role !== "visitor" ? `<p><strong>Order Mode:</strong> ${orderMode[0].toUpperCase() + orderMode.slice(1)}</p>` : "";
    const status = orderStatus[0].toUpperCase() + orderStatus.slice(1);

    return `
      <div style="padding: 3px; display: flex; justify-content: center; align-items: center; min-height: 100vh;">
        <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); max-width: 600px; width: 100%;">
          <div style="text-align: center; margin-bottom: 20px; background-color: f2f2f2; padding: 10px; border-radius: 8px;">
            <img src="https://i.imgur.com/j5AOMcr.png" alt="App Logo" style="height: 50px; margin-bottom: 10px;" />
            <h1 style="color: green; margin: 0;">OIS Organic Garden</h1>
          </div>
          <h4 style="color: green;">Order ID: ${orderId}</h4>
          <span style="background-color: ${orderStatus === 'completed' ? 'green' : 'orange'}; color: white; padding: 5px 10px; border-radius: 20px;">${status}</span>
          <h2 style="color: green;">Order Summary</h2>
          <p><strong>Name:</strong> ${profile.firstName} ${profile.lastName}</p>
          ${profile.role === "parent" ? `
            <h3 style="color: green;">Student Information</h3>
            <p><strong>Name:</strong> ${profile.details.student_first_name} ${profile.details.student_last_name}</p>
            <p><strong>Class:</strong> ${profile.details.student_class} ${profile.details.student_section}</p>
            <p><strong>GEMS ID:</strong> ${profile.details.student_gems_id}</p>
          ` : ""}
          ${profile.role === "staff" ? `
            <h3 style="color: green;">Staff Information</h3>
            <p><strong>Staff GEMS ID:</strong> ${profile.details.staff_gems_id}</p>
          ` : ""}
          <h3 style="color: green;">Items</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr>
                <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">Item</th>
                <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">Quantity</th>
                <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <h3 style="color: green; margin-top: 20px;">Total: AED ${total.toFixed(2)}</h3>
          ${orderModeMessage}
          <br>
          <p style="text-align: center;">Thank you for your order!</p>
        </div>
      </div>
    `;
  };

  const handleCheckout = async () => {
    if (!user || !profile) return;
  
    setLoading(true);
    setError(null);
  
    try {
      const orderData = {
        user_id: user.id,
        total_amount: total,
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        mode: orderMode,
      };
  
      const { data: order, error } = await createOrder(orderData);
      if (error) throw error;
  
      const invoiceHtml = generateInvoiceHtml(profile, cart, total, orderMode, order.id, order.status);
      // await sendEmail(profile.email, 'Your Order Invoice', 'Thank you for your order!', invoiceHtml);
  
      clearCart();
      navigate("/orders");
    } catch (error) {
      console.error("Error during checkout:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
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
        <Button variant="contained" onClick={() => navigate("/profile")}>
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
        <Button variant="contained" onClick={() => navigate("/shop")}>
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

      {profile && (
        <Paper
          elevation={3}
          sx={{
            mt: { xs: 4, sm: 8 },
            p: { xs: 2, sm: 4 },
          }}
        >
          <Typography variant="h6" gutterBottom>
            Order Summary
          </Typography>

          <Typography>First Name: {profile.firstName}</Typography>
          <Typography>Last Name: {profile.lastName}</Typography>
          {profile.role === "parent" && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle1" color="text.secondary">
                Student Information
              </Typography>
              <Typography>
                First Name: {profile.details.student_first_name}
              </Typography>
              <Typography>
                Last Name: {profile.details.student_last_name}
              </Typography>
              <Typography>Class: {profile.details.student_class}</Typography>
              <Typography>
                Section: {profile.details.student_section}
              </Typography>
              <Typography>
                GEMS ID: {profile.details.student_gems_id}
              </Typography>
            </Box>
          )}
          {profile.role === "staff" && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle1" color="text.secondary">
                Staff GEMS ID
              </Typography>
              <Typography variant="body1">
                {profile.details.staff_gems_id}
              </Typography>
            </Box>
          )}

          <Typography variant="h6" sx={{ mt: 3 }}>
            Items:
          </Typography>
          {cart.map((item) => (
            <Box key={item.id} sx={{ mt: 1 }}>
              <Typography>
                {item.name} x {item.quantity} = AED{" "}
                {(item.price * item.quantity).toFixed(2)}
              </Typography>
            </Box>
          ))}

          <Typography variant="h6" sx={{ mt: 3 }}>
            Total: AED {total.toFixed(2)}
          </Typography>

          {(profile.role === "parent" || profile.role === "staff") && (
            <FormControl component="fieldset" sx={{ mt: 2 }}>
              <FormLabel component="legend">Order Mode</FormLabel>
              <RadioGroup
                row
                name="orderMode"
                value={orderMode}
                onChange={handleOrderModeChange}
              >
                <FormControlLabel
                  value="pickup"
                  control={<Radio />}
                  label="Pickup"
                />
                <FormControlLabel
                  value="delivery"
                  control={<Radio />}
                  label="Delivery"
                />
              </RadioGroup>
            </FormControl>
          )}
        </Paper>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCheckout}
          disabled={loading || cart.length === 0}
          size="large"
          fullWidth
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Place Order"
          )}
        </Button>

        <Button
          variant="outlined"
          onClick={() => navigate("/cart")}
          startIcon={<ArrowBack />}
          size="large"
          fullWidth
        >
          Return to Cart
        </Button>
      </Box>
    </Container>
  );
}
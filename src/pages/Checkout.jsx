import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Import the global styles index.css
import "../index.css";
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
import { sendEmail } from "../services/smtp";

const ziinaAPI = import.meta.env.VITE_ZIINA_API_KEY;

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, total, clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [orderMode, setOrderMode] = useState("pickup"); // Default to 'pickup'
  const [paymentMethod, setPaymentMethod] = useState("card"); // Default to 'cash'

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

  useEffect(() => {
    if (!loading && user && cart.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const payStatus = params.get("status");

      if (payStatus === "success") {
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
        createOrder(orderData).then(() => {
          clearCart();
          navigate("/orders");
        });
      } else if (payStatus === "failure") {
        navigate("/checkout");
      } else if (payStatus === "cancel") {
        navigate("/cart");
      }
    }
  }, [loading, user, cart, orderMode, total, navigate, clearCart]);

  const handleOrderModeChange = (e) => {
    setOrderMode(e.target.value);
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const generateInvoiceHtml = (
    profile,
    cart,
    total,
    orderMode,
    orderId,
    orderStatus
  ) => {
    const itemsHtml = cart.map((item) => (
      <tr key={item.id}>
        <td style={{ padding: "8px", border: "1px solid #ddd" }}>
          {item.name}
        </td>
        <td style={{ padding: "8px", border: "1px solid #ddd" }}>
          {item.quantity}
        </td>
        <td style={{ padding: "8px", border: "1px solid #ddd" }}>
          AED {(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    ));

    const orderModeMessage =
      profile.role !== "visitor" ? (
        <p>
          <strong>Order Mode:</strong>{" "}
          {orderMode[0].toUpperCase() + orderMode.slice(1)}
        </p>
      ) : null;
    const status = orderStatus[0].toUpperCase() + orderStatus.slice(1);

    return (
      <div
        style={{
          padding: "3px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            maxWidth: "600px",
            width: "100%",
          }}
        >
          <div
            style={{
              textAlign: "center",
              marginBottom: "20px",
              backgroundColor: "#f2f2f2",
              padding: "10px",
              borderRadius: "8px",
            }}
          >
            <img
              src="https://i.imgur.com/j5AOMcr.png"
              alt="App Logo"
              style={{ height: "50px", marginBottom: "10px" }}
            />
            <h1 style={{ color: "green", margin: 0 }}>OIS Organic Garden</h1>
          </div>
          <h4 style={{ color: "green" }}>Order ID: {orderId}</h4>
          <span
            style={{
              backgroundColor: orderStatus === "completed" ? "green" : "orange",
              color: "white",
              padding: "5px 10px",
              borderRadius: "20px",
            }}
          >
            {status}
          </span>
          <h2 style={{ color: "green" }}>Order Summary</h2>
          <p>
            <strong>Name:</strong> {profile.firstName} {profile.lastName}
          </p>
          {profile.role === "parent" && (
            <>
              <h3 style={{ color: "green" }}>Student Information</h3>
              <p>
                <strong>Name:</strong> {profile.details.student_first_name}{" "}
                {profile.details.student_last_name}
              </p>
              <p>
                <strong>Class:</strong> {profile.details.student_class}{" "}
                {profile.details.student_section}
              </p>
              <p>
                <strong>GEMS ID:</strong> {profile.details.student_gems_id}
              </p>
            </>
          )}
          {profile.role === "staff" && (
            <>
              <h3 style={{ color: "green" }}>Staff Information</h3>
              <p>
                <strong>Staff GEMS ID:</strong> {profile.details.staff_gems_id}
              </p>
            </>
          )}
          <h3 style={{ color: "green" }}>Items</h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "10px",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    padding: "8px",
                    border: "1px solid #ddd",
                    backgroundColor: "#f2f2f2",
                  }}
                >
                  Item
                </th>
                <th
                  style={{
                    padding: "8px",
                    border: "1px solid #ddd",
                    backgroundColor: "#f2f2f2",
                  }}
                >
                  Quantity
                </th>
                <th
                  style={{
                    padding: "8px",
                    border: "1px solid #ddd",
                    backgroundColor: "#f2f2f2",
                  }}
                >
                  Price
                </th>
              </tr>
            </thead>
            <tbody>{itemsHtml}</tbody>
          </table>
          <h3 style={{ color: "green", marginTop: "20px" }}>
            Total: AED {total.toFixed(2)}
          </h3>
          {orderModeMessage}
          <br />
          <p style={{ textAlign: "center" }}>Thank you for your order!</p>
        </div>
      </div>
    );
  };

  const handleCheckout = async () => {
    if (!user || !profile) return;

    setLoading(true);
    setError(null);

    try {
      if (error) throw error;

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

      if (paymentMethod === "card") {
        const options = {
          method: "POST",
          headers: {
            Authorization: "Bearer " + ziinaAPI,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: total * 100,
            currency_code: "AED",
            test: false,
            transaction_source: "directApi",
            // GardenX Order:
            // Item Name x1
            // Item Name x2

            // The length of each line should be 27 characters, fill the rest with spaces
            message: "Payment on GardenX",
            failure_url: window.location.href + "?status=failure",
            success_url: window.location.href + "?status=success",
            cancel_url: window.location.href + "?status=cancel",
          }),
        };

        const response = await fetch(
          "https://api-v2.ziina.com/api/payment_intent",
          options
        );
        const data = await response.json();
        const paymentID = data.id;
        window.location.href = data.redirect_url;
      } else if (paymentMethod === "cash") {
        window.location.href = window.location.href + "?status=success";
      }
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
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            borderRadius: "15px",
            color: "white",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Order Summary
          </Typography>

          <Typography>
            Name: {profile.firstName} {profile.lastName}
          </Typography>
          {profile.role === "parent" && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle1" color="text.secondary">
                Student Information
              </Typography>
              <Typography>
                Name: {profile.details.student_first_name}{" "}
                {profile.details.student_last_name}
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
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Order Mode
              </Typography>
              <Button
                variant={orderMode === "pickup" ? "contained" : "outlined"}
                onClick={() => setOrderMode("pickup")}
                sx={{ mr: 2 }}
              >
                Pickup
              </Button>
              <Button
                variant={orderMode === "delivery" ? "contained" : "outlined"}
                onClick={() => setOrderMode("delivery")}
              >
                Delivery
              </Button>
            </Box>
          )}
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Payment Method
            </Typography>
            <Button
              variant={paymentMethod === "card" ? "contained" : "outlined"}
              onClick={() => setPaymentMethod("card")}
              sx={{ mr: 2 }}
              style={{ color: "white", outline: "0.5px solid white" }}

            >
              Card (Apple Pay / Google Pay)
            </Button>
            <Button
              variant={paymentMethod === "cash" ? "contained" : "outlined"}
              onClick={() => setPaymentMethod("cash")}
              style={{ color: "white", outline: "0.5px solid white" }}

            >
              Cash
            </Button>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
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
              onClick={() => navigate("/cart")}
              startIcon={<ArrowBack />}
              size="large"
              style={{ color: "white", outline: "1px solid white" }}
              fullWidth
            >
              Return to Cart
            </Button>
          </Box>
        </Paper>
      )}
    </Container>
  );
}

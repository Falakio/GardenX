import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Grid,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { getUserOrders } from "../services/supabase";

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "warning";
    case "confirmed":
      return "info";
    case "delivered":
      return "success";
    case "cancelled":
      return "error";
  }
};

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function Orders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const { data, error } = await getUserOrders(user.id);
        if (error) {
          console.error("Error details:", error);
          throw error;
        }
        setOrders(data || []);
      } catch (error) {
        console.error("Failed to load orders:", error);
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user, navigate]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 },  }}>
      <Typography variant="h4" gutterBottom>
        My Orders
      </Typography>
      {orders.length === 0 ? (
        <Typography>No orders found.</Typography>
      ) : (
        <Grid container spacing={3} >
          {orders.map((order) => (
            <Grid item xs={12} key={order.id}>
              <Paper sx={{ p: 2, background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          borderRadius: "15px",
          color: "white" }}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="h6" gutterBottom>
                    Order #{order.id.substring(0, 8)}
                  </Typography>
                  <Chip
                    label={capitalizeFirstLetter(order.status)}
                    color={getStatusColor(order.status)}
                    sx={{ mr: 2 }}
                  />
                </Box>
                <Typography variant="body2" color="lightgray">
                  Placed on {formatDate(order.created_at)}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1">Items:</Typography>
                  {order.items.map((item, index) => (
                    <Typography key={index} variant="body2">
                      {item.name} - {item.quantity} x {item.price} AED ={" "}
                      {item.quantity * item.price} AED
                    </Typography>
                  ))}
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6">
                    Total Price:{" "}
                    {order.items.reduce(
                      (total, item) => total + item.quantity * item.price,
                      0
                    )}{" "}
                    AED
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

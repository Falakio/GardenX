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
    default:
      return "default";
  }
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
        console.error("Error loading orders:", error);
        setError(`Failed to load orders: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user, navigate]);

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
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (orders.length === 0) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="info">
          You haven't placed any orders yet. Visit our shop to place your first
          order!
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        My Orders
      </Typography>

      <Grid container spacing={2}>
        {orders.map((order) => (
          <Grid item xs={12} key={order.id}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography variant="h6" sx={{ fontSize: "1.2rem" }}>
                  Order #{order.id.slice(0, 8)}
                </Typography>
                <Chip
                  label={
                    order.status.charAt(0).toUpperCase() + order.status.slice(1)
                  }
                  color={getStatusColor(order.status)}
                  variant="filled"
                  size="small"
                />
              </Box>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                Placed on {formatDate(order.created_at)}
              </Typography>

              <Box>
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  sx={{ fontSize: "1rem" }}
                >
                  Items:
                </Typography>
                <Box sx={{ ml: 1 }}>
                  {order.items.map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5,
                        gap: 1,
                      }}
                    >
                      <Typography variant="body1" sx={{ flex: 1, minWidth: 0 }}>
                        {item.name} × {item.quantity}
                      </Typography>
                      <Typography variant="body1" sx={{ flexShrink: 0 }}>
                        AED {(item.price * item.quantity).toFixed(2)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Box
                sx={{
                  mt: 1,
                  pt: 1,
                  borderTop: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, fontSize: "1.1rem" }}
                >
                  Total: AED {order.total_amount.toFixed(2)}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

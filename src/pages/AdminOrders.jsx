import { useEffect, useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Button,
  Select,
  MenuItem,
  Snackbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from "@mui/material";
import { MoreVert, Visibility } from "@mui/icons-material";
import { getAdminOrders, updateOrderStatus } from "../services/supabase";

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const getStatusColorCode = (status) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "orange";
    case "confirmed":
      return "#2196f3";
    case "delivered":
      return "#4caf50";
    case "cancelled":
      return "#f44336";
  }
};

const getStatusTextColor = (status) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "#fff";
    case "confirmed":
      return "#fff";
    case "delivered":
      return "#fff";
    case "cancelled":
      return "#fff";
  }
};

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const { data, error } = await getAdminOrders();
        if (error) throw error;
        setOrders(data || []);
      } catch (error) {
        console.error("Failed to load orders:", error);
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const { error } = await updateOrderStatus(orderId, newStatus);
      if (error) throw error;
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      setSnackbar({
        open: true,
        message: "Order status updated successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to update order status:", error);
      setSnackbar({
        open: true,
        message: "Failed to update order status",
        severity: "error",
      });
    }
  };

  const handleViewMore = (order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedOrder(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

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
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" gutterBottom>
        Admin Orders
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Mode</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id.substring(0, 8)}</TableCell>
                <TableCell>{order.user_profiles.firstName}</TableCell>
                <TableCell>{order.user_profiles.lastName}</TableCell>
                <TableCell>
                  <Box
                    component="a"
                    href={`tel:${order.user_profiles.phone}`}
                    sx={{ textDecoration: "none", color: "inherit" }}
                  >
                    {order.user_profiles.phone}
                  </Box>
                </TableCell>
                <TableCell>{capitalizeFirstLetter(order.mode)}</TableCell>
                <TableCell>
                  {capitalizeFirstLetter(order.user_profiles.role)}
                </TableCell>
                <TableCell>
                  <Select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order.id, e.target.value)
                    }
                    size="small"
                    sx={{
                      backgroundColor: getStatusColorCode(order.status),
                      "& .MuiSelect-icon": {
                        color: "#fff",
                      },
                      width: 125,
                      color: getStatusTextColor(order.status),
                    }}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="confirmed">Confirmed</MenuItem>
                    <MenuItem value="delivered">Delivered</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleViewMore(order)}>
                    <Visibility />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        severity={snackbar.severity}
      />
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className="no-print">Order Details</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography variant="h6">
                    Order ID: {selectedOrder.id}
                  </Typography>
                  <Typography variant="body1">
                    First Name: {selectedOrder.user_profiles.firstName}
                  </Typography>
                  <Typography variant="body1">
                    Last Name: {selectedOrder.user_profiles.lastName}
                  </Typography>
                  <Typography variant="body1">
                    Phone: {selectedOrder.user_profiles.phone}
                  </Typography>
                  <Typography variant="body1">
                    Role:{" "}
                    {capitalizeFirstLetter(selectedOrder.user_profiles.role)}
                  </Typography>
                  <Typography variant="body1">
                    Mode: {capitalizeFirstLetter(selectedOrder.mode)}
                  </Typography>
                  {selectedOrder.user_profiles.role === "parent" &&
                    selectedOrder.mode === "delivery" && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="h6">
                          Student Information
                        </Typography>
                        <Typography variant="body1">
                          Student First Name:{" "}
                          {
                            selectedOrder.user_profiles.details
                              .student_first_name
                          }
                        </Typography>
                        <Typography variant="body1">
                          Student Last Name:{" "}
                          {
                            selectedOrder.user_profiles.details
                              .student_last_name
                          }
                        </Typography>
                        <Typography variant="body1">
                          Student Class:{" "}
                          {selectedOrder.user_profiles.details.student_class}
                        </Typography>
                        <Typography variant="body1">
                          Student Section:{" "}
                          {selectedOrder.user_profiles.details.student_section}
                        </Typography>
                        <Typography variant="body1">
                          Student GEMS ID:{" "}
                          {selectedOrder.user_profiles.details.student_gems_id}
                        </Typography>
                      </Box>
                    )}
                </Grid>
                <Grid
                  item
                  xs={4}
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                >
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${selectedOrder.id}`}
                    alt="Order QR Code"
                    style={{ height: "130px" }}
                  />
                </Grid>
              </Grid>
              <Typography variant="h6" sx={{ mt: 2 }}>
                Items:
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item Name</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedOrder.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>AED {item.price}</TableCell>
                      <TableCell>AED {item.quantity * item.price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </DialogContent>
        <DialogActions className="no-print">
          <Button onClick={handleCloseDialog}>Close</Button>
          <Button
            onClick={() => window.print()}
            variant="contained"
            color="primary"
          >
            Print
          </Button>
        </DialogActions>
      </Dialog>
      <style>
        {`
          @media print {
            .no-print {
              display: none;
            }
          }
        `}
      </style>
    </Container>
  );
}


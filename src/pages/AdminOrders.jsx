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
  TextField,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

import { Visibility, Assessment } from "@mui/icons-material";
import { sendEmail } from '../services/smtp';
import { getAdminOrders, getUserProfile, getOrderInfo, supabase } from "../services/supabase";

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const generateStatusEmailHtml = (profile, cart, total, orderMode, orderId, orderStatus) => {
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

    const orderModeMessage = profile.role !== "visitor" ? `<p><strong>Order Mode:</strong> ${orderMode}</p>` : "";
    const status = orderStatus[0].toUpperCase() + orderStatus.slice(1);

  let statusMessage = "";
  let reorderButton = "";

  if (orderStatus === "cancelled") {
    statusMessage = orderMode === "pickup"
      ? "<p>Your order has been cancelled as it was not collected on the same day.</p>"
      : "<p>Your order has been cancelled as the payment could not be made or the recipient was not present to receive the order.</p>";
      reorderButton = `<p>You can reorder the same items if you wish using the green 'Reorder' button below.</p>
                     <a href="https://oisgarden.vercel.app/reorder/${orderId}" style="display: inline-block; padding: 10px 20px; color: white; background-color: green; border-radius: 5px; text-decoration: none;">Reorder</a>`;
  } else if (orderStatus === "delivered") {
    statusMessage = orderMode === "pickup"
      ? "<p>Your order has been picked up.</p>"
      : "<p>Your order has been delivered.</p>";
      reorderButton = `<p>You can reorder the same items if you wish using the green 'Reorder' button below.</p>
      <a href="https://oisgarden.vercel.app/reorder/${orderId}" style="display: inline-block; padding: 10px 20px; color: white; background-color: green; border-radius: 5px; text-decoration: none;">Reorder</a>`;
  } else if (orderStatus === "picked up") {
    statusMessage = "<p>Your order has been picked up.</p>";
  } else {
    statusMessage = `<p>Your order status is now <span style="background-color: ${getStatusColorCode(orderStatus)}; color: ${getStatusTextColor(orderStatus)}; padding: 5px 10px; border-radius: 20px;">${status}</span>.</p>`;
  }

  return `
    <div style="padding: 3px; display: flex; justify-content: center; align-items: center; min-height: 100vh;">
        <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); max-width: 600px; width: 100%;">
          <div style="text-align: center; margin-bottom: 20px; background-color: f2f2f2; padding: 10px; border-radius: 8px;">
            <img src="https://i.imgur.com/j5AOMcr.png" alt="App Logo" style="height: 50px; margin-bottom: 10px;" />
             <h1 style="color: green; margin: 0;">OIS Organic Garden</h1>
          </div>
        <h4 style="color: green;">Order ID: ${orderId}</h4>
        <span style="background-color: ${getStatusColorCode(orderStatus)}; color: ${getStatusTextColor(orderStatus)}; padding: 8px 12px; font-weight: bold; border: 2px solid ${getStatusTextColor(orderStatus)}; border-radius: 20px;">${status}</span>
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
        ${statusMessage}
        ${reorderButton}
        <p>In case of any discrepancies, you can contact us at 05012345.</p>
      </div>
    </div>
  `;
};

const getStatusColorCode = (status) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "#fff3e0"; // Light orange
    case "confirmed":
      return "#e3f2fd"; // Light blue
    case "delivered":
      return "#e8f5e9"; // Light green
    case "cancelled":
      return "#ffebee"; // Light red
    default:
      return "#f5f5f5"; // Light grey
  }
};

const getStatusTextColor = (status) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "#ed6c02"; // Orange
    case "confirmed":
      return "#0288d1"; // Blue
    case "delivered":
      return "#2e7d32"; // Green
    case "cancelled":
      return "#d32f2f"; // Red
    default:
      return "#757575"; // Grey
  }
};

function EarningsReportDialog({ open, onClose, orders }) {
  const [reportData, setReportData] = useState(null);
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [error, setError] = useState(null);

  const generateReport = () => {
    try {
      if (!orders || orders.length === 0) {
        setError("No orders available");
        setReportData(null);
        return;
      }

      // Filter orders by date range and delivered status
      const filteredOrders = orders.filter((order) => {
        if (!order.delivered_at || order.status !== "delivered") return false;
        const deliveryDate = new Date(order.delivered_at);
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date();
        end.setHours(23, 59, 59, 999); // Include the entire end date
        return deliveryDate >= start && deliveryDate <= end;
      });

      if (filteredOrders.length === 0) {
        setError("No delivered orders found in the selected date range");
        setReportData(null);
        return;
      }

      // Group orders by delivery date for daily totals
      const ordersByDate = filteredOrders.reduce((acc, order) => {
        const date = new Date(order.delivered_at).toLocaleDateString("en-GB");
        if (!acc[date]) {
          acc[date] = {
            orders: [],
            total: 0,
          };
        }
        acc[date].orders.push(order);
        acc[date].total += parseFloat(order.total_amount || 0);
        return acc;
      }, {});

      // Calculate items summary
      const itemsSummary = filteredOrders.reduce((acc, order) => {
        if (!order.items) return acc;
        order.items.forEach((item) => {
          if (!acc[item.name]) {
            acc[item.name] = {
              quantity: 0,
              revenue: 0,
            };
          }
          acc[item.name].quantity += item.quantity || 0;
          acc[item.name].revenue += (item.quantity || 0) * (item.price || 0);
        });
        return acc;
      }, {});

      // Calculate total statistics
      const report = {
        totalOrders: filteredOrders.length,
        totalEarnings: filteredOrders.reduce(
          (sum, order) => sum + parseFloat(order.total_amount || 0),
          0
        ),
        ordersByDate,
        itemsSummary,
      };

      setError(null);
      setReportData(report);
    } catch (err) {
      console.error("Error generating report:", err);
      setError("Error generating report. Please try again.");
      setReportData(null);
    }
  };

  const printReport = () => {
    if (!reportData) return;

    const printWindow = window.open("", "_blank");
    const dateRange =
      startDate && endDate
        ? `${new Date(startDate).toLocaleDateString("en-GB")} to ${new Date(
            endDate
          ).toLocaleDateString("en-GB")}`
        : "All Time";

    printWindow.document.write(`
      <html>
        <head>
          <title>Earnings Report - ${dateRange}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px;
              font-size: 12px;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
            }
            .section { 
              margin-bottom: 20px; 
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 10px; 
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 6px; 
              text-align: left;
              vertical-align: top;
            }
            th { 
              background-color: #f5f5f5; 
            }
            .total { 
              font-weight: bold; 
            }
            .items-list {
              margin: 0;
              padding-left: 20px;
            }
            .items-summary td:nth-child(2),
            .items-summary td:nth-child(3) {
              text-align: right;
            }
            .order-total {
              text-align: right;
            }
            .day-total {
              background-color: #f8f8f8;
              font-weight: bold;
            }
            .day-total td {
              text-align: right;
            }
            @media print {
              thead {
                display: table-header-group;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>OIS Organic Garden - Earnings Report</h1>
            <h3>Period: ${dateRange}</h3>
            <p><strong>Note:</strong> This report includes delivered orders only</p>
          </div>
          
          <div class="section">
            <h2>Summary</h2>
            <table>
              <tr>
                <th>Total Delivered Orders</th>
                <td>${reportData.totalOrders}</td>
              </tr>
              <tr>
                <th>Total Earnings</th>
                <td>AED ${reportData.totalEarnings.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <div class="section">
            <h2>Items Summary</h2>
            <table class="items-summary">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Total Quantity</th>
                  <th>Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(reportData.itemsSummary)
                  .sort((a, b) => b[1].revenue - a[1].revenue)
                  .map(
                    ([itemName, data]) => `
                    <tr>
                      <td>${itemName}</td>
                      <td>${data.quantity}</td>
                      <td>AED ${data.revenue.toFixed(2)}</td>
                    </tr>
                  `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>All Orders</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Items Ordered</th>
                  <th>Order Total</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(reportData.ordersByDate)
                  .sort(
                    (a, b) =>
                      new Date(b[0].split("/").reverse().join("-")) -
                      new Date(a[0].split("/").reverse().join("-"))
                  )
                  .map(
                    ([date, dayData]) => `
                    ${dayData.orders
                      .map(
                        (order) => `
                      <tr>
                        <td>${new Date(order.delivered_at).toLocaleDateString(
                          "en-GB"
                        )}</td>
                        <td>${order.user_profiles?.firstName || "N/A"} ${order.user_profiles?.lastName || "N/A"}</td>
                        <td>
                          <ul class="items-list">
                            ${order.items
                              .map(
                                (item) => `
                              <li>${item.name} × ${item.quantity}</li>
                            `
                              )
                              .join("")}
                          </ul>
                        </td>
                        <td class="order-total">AED ${parseFloat(
                          order.total_amount
                        ).toFixed(2)}</td>
                      </tr>
                    `
                      )
                      .join("")}
                    <tr class="day-total">
                      <td colspan="3">Day Earnings (${date}):</td>
                      <td>AED ${dayData.total.toFixed(2)}</td>
                    </tr>
                  `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>

          <div class="footer">
            <p>Generated on: ${new Date().toLocaleString("en-GB")}</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  useEffect(() => {
    if (open) {
      generateReport();
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Earnings Report</DialogTitle>

      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              onClick={generateReport}
              sx={{ mb: 2 }}
            >
              Generate Report
            </Button>
            {reportData && (
              <Button
                fullWidth
                variant="outlined"
                onClick={printReport}
                sx={{ mb: 2 }}
              >
                Print Report
              </Button>
            )}
          </Grid>

          {error && (
            <Grid item xs={12}>
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            </Grid>
          )}

          {reportData && (
            <>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Summary
                </Typography>
                <Typography>
                  Total Delivered Orders: {reportData.totalOrders}
                </Typography>
                <Typography>
                  Total Earnings: AED {reportData.totalEarnings.toFixed(2)}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Items Summary
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Item Name</TableCell>
                        <TableCell align="right">Total Quantity</TableCell>
                        <TableCell align="right">Total Revenue</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(reportData.itemsSummary)
                        .sort((a, b) => b[1].revenue - a[1].revenue)
                        .map(([itemName, data]) => (
                          <TableRow key={itemName}>
                            <TableCell>{itemName}</TableCell>
                            <TableCell align="right">{data.quantity}</TableCell>
                            <TableCell align="right">
                              AED {data.revenue.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  All Orders
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Parent Name</TableCell>
                        <TableCell>Items Ordered</TableCell>
                        <TableCell align="right">Order Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(reportData.ordersByDate)
                        .sort(
                          (a, b) =>
                            new Date(b[0].split("/").reverse().join("-")) -
                            new Date(a[0].split("/").reverse().join("-"))
                        )
                        .map(([date, dayData]) => (
                          <Fragment key={date}>
                            {dayData.orders.map((order) => (
                              <TableRow key={order.id}>
                                <TableCell>
                                  {order.delivered_at
                                    ? new Date(
                                        order.delivered_at
                                      ).toLocaleDateString("en-GB")
                                    : "-"}
                                </TableCell>
                                <TableCell>
                                  {order.user_profiles?.parent_name || "N/A"}
                                  {order.user_profiles?.student_class === "NA"
                                    ? " (S)"
                                    : ""}
                                </TableCell>
                                <TableCell>
                                  <List dense>
                                    {order.items.map((item) => (
                                      <ListItem key={item.name}>
                                        <ListItemText
                                          primary={`${item.name} × ${item.quantity}`}
                                        />
                                      </ListItem>
                                    ))}
                                  </List>
                                </TableCell>
                                <TableCell align="right">
                                  AED{" "}
                                  {parseFloat(order.total_amount).toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow
                              sx={{
                                backgroundColor: "#f8f8f8",
                                fontWeight: "bold",
                              }}
                            >
                              <TableCell colSpan={3} align="right">
                                Day Earnings ({date}):
                              </TableCell>
                              <TableCell align="right">
                                AED {dayData.total.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          </Fragment>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
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
      const updateData = {
        status: newStatus,
        ...(newStatus === "delivered"
          ? { delivered_at: new Date().toISOString() }
          : {}),
      };
  
      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId);
  
      if (error) throw error;
  
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
  
      // Fetch order info
      const { profile, cartItems, total, orderMode } = await getOrderInfo(orderId);
  
      // Generate email content
      const emailHtml = generateStatusEmailHtml(profile, cartItems, total, orderMode, orderId, newStatus);
  
      // Send email notification
      // await sendEmail(profile.email, `Your Order has been ${newStatus}`, 'Your order status has been updated.', emailHtml);
  
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          my: 3,
          px: { xs: 0, sm: 3 },
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ paddingTop: 2 }}>
          Orders
        </Typography>
        <Button
          variant="contained"
          startIcon={<Assessment />}
          onClick={() => setReportDialogOpen(true)}
        >
          Earnings Report
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Mode</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Delivered</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id.substring(0, 8)}</TableCell>
                <TableCell>{order.created_at.substring(0, 10)}</TableCell>
                <TableCell>{order.user_profiles.firstName} {order.user_profiles.lastName}</TableCell>
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
                  {order.delivered_at
                    ? order.delivered_at.substring(0, 10)
                    : "⠀⠀⠀-"}
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
                  {selectedOrder.user_profiles.role === "staff" && (
                    <Typography variant="body1">
                      Staff GEMS ID:{" "}
                      {selectedOrder.user_profiles.details.staff_gems_id}
                    </Typography>
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
                Grand Total: AED {selectedOrder.total_amount}
              </Typography>
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
      <EarningsReportDialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        orders={orders}
      />
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

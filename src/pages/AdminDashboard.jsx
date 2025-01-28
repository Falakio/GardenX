import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { supabase, isAdmin } from "../services/supabase";
import { useAuth } from "../contexts/AuthContext";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    popularProducts: [],
    revenueByDay: [],
  });

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        if (!user) {
          console.log("Please sign in to access the admin panel");
          navigate("/");
          return;
        }

        if (!isAdmin(user)) {
          console.log("You do not have admin privileges");
          navigate("/");
          return;
        }

        fetchData();
      } catch (error) {
        console.error("Auth error:", error);
        setError("Authentication error: " + error.message);
        setLoading(false);
      }
    };

    checkAdmin();
  }, [navigate, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      // Filter delivered orders
      const deliveredOrders = ordersData.filter(
        (order) => order.status === "delivered"
      );

      // Process analytics data
      const revenue = deliveredOrders.reduce(
        (sum, order) => sum + Number(order.total_amount),
        0
      );
      const productCounts = {};
      const dailyRevenue = {};

      deliveredOrders.forEach((order) => {
        // Count products
        const items = order.items || [];
        items.forEach((item) => {
          productCounts[item.name] =
            (productCounts[item.name] || 0) + item.quantity;
        });

        // Daily revenue
        const date = new Date(order.created_at).toLocaleDateString("en-GB");
        dailyRevenue[date] =
          (dailyRevenue[date] || 0) + Number(order.total_amount);
      });

      // Format data for charts
      const popularProducts = Object.entries(productCounts)
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      const revenueByDay = Object.entries(dailyRevenue)
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-7);

      setAnalytics({
        totalRevenue: revenue,
        totalOrders: deliveredOrders.length,
        popularProducts,
        revenueByDay,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Error loading data: " + error.message);
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
        {!user && (
          <Button variant="contained" onClick={() => navigate("/login")}>
            Sign In
          </Button>
        )}
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Admin Dashboard
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Paper
            sx={{
              p: 2,
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              borderRadius: "15px",
              color: "white",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Total Revenue
            </Typography>
            <Typography variant="h4">
              {analytics.totalRevenue.toFixed(2)} AED
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper
            sx={{
              p: 2,
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              borderRadius: "15px",
              color: "white",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Total Orders
            </Typography>
            <Typography variant="h4">{analytics.totalOrders}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              borderRadius: "15px",
              color: "white",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Popular Products
            </Typography>
            <PieChart width={400} height={300}>
              <Pie
                data={analytics.popularProducts}
                dataKey="quantity"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {analytics.popularProducts.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              borderRadius: "15px",
              color: "black",
            }}
          >
            <Typography variant="h6" gutterBottom sx={{color: "white"}}>
              Revenue by Day (Last 7 Days)
            </Typography>
            <BarChart width={400} height={300} data={analytics.revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" name="Revenue" fill="#1b3b2e" />
            </BarChart>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default AdminDashboard;

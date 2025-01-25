import { Routes, Route, useLocation } from "react-router-dom";
import { Container, Fab, Badge, Box } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { ShoppingCart as ShoppingCartIcon } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import theme from "./theme";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider, useCart } from "./contexts/CartContext";
import Footer from "./components/Footer";
import Credits from "./pages/Credits";
import Reorder from "./pages/Reorder";
import { useState, useEffect } from "react";
import SplashScreen from "./components/SplashScreen"; // Import the SplashScreen component
import "./index.css"; // Import the global styles

function MainContent() {
  const { itemCount } = useCart();
  const location = useLocation();

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Navbar />
      <Container
        maxWidth="lg"
        sx={{
          mb: 4,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#2c604a",
          color: "white",
        }}
      >
        <Routes>
          <Route path="/" element={<Shop />} /> // Set Shop as the homepage
          <Route path="/shop" element={<Shop />} />
          <Route path="/login" element={<Login />} />
          <Route path="/credits" element={<Credits />} />
          <Route path="/reorder/:orderId" element={<Reorder />} />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute adminOnly>
                <AdminProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute adminOnly>
                <AdminOrders />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Container>
      <Box
        sx={{ 
          display: { xs: "block", md: "none" },
          position: "fixed",
          bottom: 0,
          pb: 1,
          right: 0,
          alignContent: "center",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "white",
          height: "10vh",
          borderRadius: "100px 0px 0px 0px",
          width: "100%",
          outline: "3px solid #8fb8a8",
          zIndex: (theme) => theme.zIndex.drawer + 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Fab
            component={RouterLink}
            to="/orders"
            color="primary"
            aria-label="cart"
            sx={{
              width: 64,
              height: 64,
              mr: 2,
              ml: 3,
              boxShadow: "none",
              backgroundColor:
                window.location.pathname === "/orders" ? "#2c604a" : "#fff",
              color:
                window.location.pathname === "/orders" ? "#fff" : "#2c604a",
              ":hover": { backgroundColor: "#2c604a", color: "#fff" },
            }}
          >
            <i class="fas fa-receipt" style={{ fontSize: "25px" }}></i>
          </Fab>
          <Fab
            component={RouterLink}
            to="/"
            color="primary"
            aria-label="cart"
            sx={{
              width: 64,
              height: 64,
              mr: 2,
              boxShadow: "none",
              backgroundColor:
                window.location.pathname === "/" ? "#2c604a" : "#fff",
              color: window.location.pathname === "/" ? "#fff" : "#2c604a",
              ":hover": { backgroundColor: "#2c604a", color: "#fff" },
            }}
          >
            <i class="fa-regular fa-home" style={{ fontSize: "25px" }}></i>
          </Fab>
          <Fab
            component={RouterLink}
            to="/cart"
            color="primary"
            aria-label="cart"
            sx={{
              width: 64,
              height: 64,
              mr: 2,
              boxShadow: "none",
              backgroundColor:
                window.location.pathname === "/cart" ? "#2c604a" : "#fff",
              color: window.location.pathname === "/cart" ? "#fff" : "#2c604a",
              ":hover": { backgroundColor: "#2c604a", color: "#fff" },
            }}
          >
            <Badge badgeContent={itemCount} color="error">
              <i class="fas fa-shopping-cart" style={{ fontSize: "20px" }}></i>
            </Badge>
          </Fab>
        </Box>
      </Box>
    </div>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000); // Display splash screen for 3 seconds

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <CartProvider>
          <MainContent />
        </CartProvider>
      </AuthProvider>
      <Footer />
    </ThemeProvider>
  );
}

export default App;

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Grid,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { getProducts, isAdmin } from "../services/supabase";
import ProductCard from "../components/ProductCard";
import { useCart } from "../contexts/CartContext";
import "../index.css"; // Import the global styles

export default function Shop() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart(); // Import addToCart function from useCart context
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("search") || "";
  const [searchQuery, setSearchQuery] = useState(query);

  useEffect(() => {
    setSearchQuery(query);
  }, [query]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await getProducts();
        if (error) throw error;
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Error loading products: " + error.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Redirect admin to dashboard
  useEffect(() => {
    if (user && isAdmin(user)) {
      navigate("/admin");
    }
  }, [user, navigate]);

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const handleStockChange = (e) => {
    setInStockOnly(e.target.checked);
  };

  const filteredProducts = products
    .filter((product) => {
      return (
        (category === "" || product.category === category) &&
        (!inStockOnly || product.stock_quantity > 0) &&
        (searchQuery === "" ||
          product.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    })
    .sort((a, b) => b.stock_quantity - a.stock_quantity); // Sort by stock quantity

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        pb: { xs: 2, sm: 3 },
        backgroundColor: "#2c604a",
        color: "white",
        fontFamily: "Montserrat, sans-serif",
      }}
    >
      <Box sx={{ mt: { xs: 4, sm: 6 }, mb: 4 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            color: "white",
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 600,
          }}
        >
          Categories
        </Typography>
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              backgroundColor: "#2c604a",
              color: "white",
              fontFamily: "Montserrat, sans-serif",
            }}
          >
            {error}
          </Alert>
        )}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "nowrap",
            mb: 2,
            overflowX: "auto",
          }}
        >
          {[
            { emoji: "🧺", value: "" },
            { emoji: "🍅", value: "Vegetable" },
            { emoji: "🌱", value: "Plant" },
            { emoji: "🫘", value: "Seed" },
            { emoji: "✏️", value: "Misc" },
          ].map((cat) => (
            <Box
              key={cat.value}
              component="button"
              onClick={() => setCategory(cat.value)}
              sx={{
                backgroundColor: "#51826d",
                borderRadius: "25px 2px",
                color: "white",
                border: "none",
                padding: "8px 16px",
                cursor: "pointer",
                height: "4rem",
                width: "4rem",
                fontSize: "1.5rem",
                fontFamily: "Montserrat, sans-serif",
                "&:hover": {
                  backgroundColor: "#1e3d2b",
                },
              }}
            >
              {cat.emoji}
            </Box>
          ))}
        </Box>
        <Box
          component="button"
          onClick={() => setInStockOnly(!inStockOnly)}
          sx={{
            backgroundColor: inStockOnly ? "#1e3d2b" : "#51826d",
            borderRadius: "25px",
            color: "white",
            border: "none",
            padding: "8px 16px",
            cursor: "pointer",
            height: "3rem",
            width: "100%",
            fontSize: "1rem",
            fontFamily: "Montserrat, sans-serif",
            "&:hover": {
              backgroundColor: "#1e3d2b",
            },
          }}
        >
          {inStockOnly ? "Show All" : "Show in Stock Only"}
        </Box>
      </Box>
      <Grid container spacing={3} alignItems="stretch" sx={{ color: "white" }}>
        {filteredProducts.map((product) => (
          <Grid
            item
            key={product.id}
            xs={12}
            sm={6}
            md={4}
            sx={{
              display: "flex",
              "& > *": { width: "100%" },
            }}
          >
            <ProductCard
              product={product}
              onAddToCart={addToCart}
              showAddToCart={!isAdmin(user)}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
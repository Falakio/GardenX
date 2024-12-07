import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

export default function Shop() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart(); // Import addToCart function from useCart context
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);

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
        (!inStockOnly || product.stock_quantity > 0)
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
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
      <Box sx={{ mt: { xs: 4, sm: 8 }, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Products
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <FormControl fullWidth margin="normal">
          <InputLabel>Category</InputLabel>
          <Select value={category} onChange={handleCategoryChange}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Vegetable">Vegetable</MenuItem>
            <MenuItem value="Plant">Plant</MenuItem>
            <MenuItem value="Seed">Seed</MenuItem>
            <MenuItem value="Misc">Misc</MenuItem>
          </Select>
        </FormControl>
        <FormControlLabel
          control={
            <Checkbox
              checked={inStockOnly}
              onChange={handleStockChange}
              color="primary"
            />
          }
          label="In Stock Only"
        />
      </Box>
      <Grid container spacing={3} alignItems="stretch">
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

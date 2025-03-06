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
  Button,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { getProducts, createOrder } from "../services/supabase";
import ProductCard from "../components/ProductCard";
import { useCart } from "../contexts/CartContext";

export default function AdminManualEntry() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, cart, clearCart, total } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [freeOrder, setFreeOrder] = useState(false);

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

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const handleStockChange = (e) => {
    setInStockOnly(e.target.checked);
  };

  const handleFreeOrderChange = (e) => {
    setFreeOrder(e.target.checked);
  };

  const handlePlaceOrder = async () => {
    try {
      const orderData = {
        user_id: user.id,
        total_amount: freeOrder ? 0 : total,
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        status: "delivered",
        mode: "pickup",
        delivered_at: new Date().toISOString(),
      };

      const { data, error } = await createOrder(orderData);
      if (error) throw error;

      clearCart();
      navigate("/admin/orders");
    } catch (error) {
      console.error("Error placing order:", error);
      setError("Failed to place order. Please try again.");
    }
  };

  const filteredProducts = products
    .filter((product) => {
      return (
        (category === "" || product.category === category) &&
        product.stock_quantity > 0 // Ensure only in-stock items are displayed
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
    <Container maxWidth="lg" sx={{ pb: { xs: 2, sm: 3 } }}>
      <Box sx={{ mt: { xs: 4, sm: 6 }, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Manual Entry
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Category</InputLabel>
          <Select value={category} onChange={handleCategoryChange}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Vegetable">Vegetable</MenuItem>
            <MenuItem value="Plant">Plant</MenuItem>
          </Select>
        </FormControl>
        <FormControlLabel
          control={
            <Checkbox checked={inStockOnly} onChange={handleStockChange} />
          }
          label="In Stock Only"
        />
      </Box>
      <Grid container spacing={3}>
        {filteredProducts.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4}>
            <ProductCard product={product} onAddToCart={() => addToCart(product)} />
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6">Total: AED {freeOrder ? 0 : total.toFixed(2)}</Typography>
        <FormControlLabel
          control={
            <Checkbox checked={freeOrder} onChange={handleFreeOrderChange} />
          }
          label="Free Order"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handlePlaceOrder}
          disabled={cart.length === 0}
        >
          Place Order
        </Button>
      </Box>
    </Container>
  );
}
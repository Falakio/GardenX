import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import {
  supabase,
  uploadProductImage,
  deleteProductImage,
  isAdmin,
} from "../services/supabase";
import StockStatus from "../components/StockStatus";

function AdminProducts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    stock_quantity: "",
    image_url: "",
    category: "",
    weight: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!isAdmin(user)) {
      navigate("/");
      return;
    }

    fetchProducts();
  }, [navigate, user]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name");

      if (error) throw error;
      setProducts(data || []);
      setError(null);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Error loading products: " + error.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const returnWeight = (name) => {
    const match = name.match(/\(([^)]+)\)/);
    return match ? match[1] : "";
  };

  const returnName = (name) => {
    const match = name.match(/^(.*?)\s*\(/);
    return match ? match[1].trim() : name;
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        price: product.price.toString(),
        stock_quantity: product.stock_quantity.toString(),
        image_url: product.image_url || "",
        category: product.category || "",
        weight: product.weight || "",
      });
      setPreviewUrl(product.image_url || "");
    } else {
      setEditingProduct(null);
      setProductForm({
        name: "",
        price: "",
        stock_quantity: "",
        image_url: "",
        category: "",
        weight: "",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProduct(null);
    setSelectedFile(null);
    setPreviewUrl("");
    setUploadError("");
  };

  const handleFormChange = (e) => {
    setProductForm({ ...productForm, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    try {
      const productData = {
        name: `${productForm.name} (${productForm.weight})`,
        price: parseFloat(productForm.price),
        stock_quantity: parseInt(productForm.stock_quantity),
        image_url: productForm.image_url,
        category: productForm.category,
      };

      let productId = editingProduct?.id;

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert([productData])
          .select();
        if (error) throw error;
        productId = data[0].id;
      }

      // Handle image upload if a new file is selected
      if (selectedFile) {
        const { publicUrl, error: uploadError } = await uploadProductImage(
          selectedFile,
          productId
        );
        if (uploadError) {
          setUploadError("Failed to upload image. Please try again.");
          return;
        }

        // Update product with new image URL
        const { error: updateError } = await supabase
          .from("products")
          .update({ image_url: publicUrl })
          .eq("id", productId);

        if (updateError) throw updateError;
      }

      handleCloseDialog();
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      setUploadError("Failed to save product. Please try again.");
    }
  };

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (selectedProduct.image_url) {
        const fileName = selectedProduct.image_url.split("/").pop();
        await deleteProductImage(fileName);
      }

      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", selectedProduct.id);

      if (error) throw error;

      setDeleteDialogOpen(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
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
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
      <Paper
        elevation={3}
        sx={{
          mt: { xs: 4, sm: 8 },
          p: { xs: 2, sm: 4 },
        }}
      >
        <Box
          sx={{
            mb: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h4">Manage Products</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ ml: 2 }}
          >
            Add Product
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Weight</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{returnName(product.name)}</TableCell>
                  <TableCell>{product.price.toFixed(2)}</TableCell>
                  <TableCell>{returnWeight(product.name)}</TableCell>
                  <TableCell>{product.stock_quantity}</TableCell>
                  <TableCell>
                    {capitalizeFirstLetter(product.category)}
                  </TableCell>
                  <TableCell>
                    <StockStatus quantity={product.stock_quantity} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex" }}>
                      <IconButton onClick={() => handleOpenDialog(product)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteClick(product)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Product Dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog}>
          <DialogTitle>
            {editingProduct ? "Edit Product" : "New Product"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {editingProduct
                ? "Edit the product details below."
                : "Fill in the product details below to create a new product."}
            </DialogContentText>

            {uploadError && (
              <Typography color="error" sx={{ mt: 2, mb: 1 }}>
                {uploadError}
              </Typography>
            )}

            <TextField
              autoFocus
              margin="dense"
              label="Name"
              name="name"
              value={productForm.name}
              onChange={handleFormChange}
              fullWidth
              required
            />
            <TextField
              margin="dense"
              label="Price (AED)"
              name="price"
              type="number"
              value={productForm.price}
              onChange={handleFormChange}
              fullWidth
              required
            />
            <TextField
              margin="dense"
              label="Weight"
              name="weight"
              value={productForm.weight}
              onChange={handleFormChange}
              fullWidth
              required
            />
            <TextField
              margin="dense"
              label="Stock Quantity"
              name="stock_quantity"
              type="number"
              value={productForm.stock_quantity}
              onChange={handleFormChange}
              fullWidth
              required
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Category</InputLabel>
              <Select
                value={productForm.category}
                onChange={(e) =>
                  setProductForm({ ...productForm, category: e.target.value })
                }
              >
                <MenuItem value="Vegetable">Vegetable</MenuItem>
                <MenuItem value="Plant">Plant</MenuItem>
                <MenuItem value="Seed">Seed</MenuItem>
                <MenuItem value="Misc">Misc</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mt: 2, mb: 1 }}>
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="product-image"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="product-image">
                <Button variant="outlined" component="span">
                  {editingProduct ? "Change Image" : "Upload Image"}
                </Button>
              </label>
              {previewUrl && (
                <Box sx={{ mt: 2 }}>
                  <img
                    src={previewUrl}
                    alt="Product preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "200px",
                      objectFit: "contain",
                    }}
                  />
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {editingProduct ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete {selectedProduct?.name}? This
              action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
}

export default AdminProducts;

import { useState } from "react";
import {
  Button,
  Card,
  IconButton,
  Typography,
  Box,
  Snackbar,
} from "@mui/material";
import { Add as AddIcon, Remove as RemoveIcon } from "@mui/icons-material";
import StockStatus from "./StockStatus";

function ProductCard({ product, onAddToCart, showAddToCart = true }) {
  const { name, price, image_url, stock_quantity, category, weight } = product;
  const [quantity, setQuantity] = useState(0); 
  const [showSuccess, setShowSuccess] = useState(false);

  const hasStock = stock_quantity > 0;

  const handleIncrement = () => {
    if (quantity < stock_quantity) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(0, prev - 1)); // Ensure quantity doesn't go below 0
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setQuantity(0); // Reset quantity to 0 after adding to cart
    setShowSuccess(true);
  };

  const totalPrice = price * (quantity || 1); // Show price for 1 even if quantity is 0
  const totalWeight = weight ? weight * quantity : null;

  return (
    <>
      <Card
        elevation={3}
        sx={{
          height: "40vh",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          background: `url(${image_url}) no-repeat center center / cover`,
          backdropFilter: "blur(10px)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          borderRadius: "50px 5px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            flexGrow: 1,
            p: 2,
            pb: 0,
          }}
        >
          {/* Product Info */}
          <Box
            sx={{
              width: "65%",
              pr: 2,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box>
              <StockStatus quantity={stock_quantity} />
            </Box>
          </Box>
        </Box>

        {/* Add to Cart Button */}
        {showAddToCart && (
          <Box
            sx={{
              p: 2,
              width: "100%",
              backgroundColor: "#ffd079",
              borderRadius: "30px 5px",
            }}
          >
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Typography
                variant="h6"
                component="h2"
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  mb: 1,
                  fontSize: "1rem",
                  fontWeight: "bold",
                }}
              >
                {name}
              </Typography>
              <Typography
                variant="h6"
                component="h2"
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  mb: 1,
                  fontSize: "0.8rem",
                }}
              >
                {category}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography
                variant="h6"
                color="primary"
                sx={{
                  mb: 1,
                  fontSize: "1rem",
                  fontWeight: "bold",
                }}
              >
                AED {totalPrice.toFixed(2)}
              </Typography>
              {totalWeight && (
                <Typography
                  variant="h6"
                  color="primary"
                  sx={{
                    mb: 1,
                    fontSize: "1rem",
                    fontWeight: "bold",
                  }}
                >
                  {totalWeight.toFixed(2)} kg
                </Typography>
              )}
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                mb: 1,
                opacity: hasStock ? 1 : 0.6,
              }}
            >
              <IconButton
                size="small"
                onClick={handleDecrement}
                disabled={!hasStock || quantity <= 0}
              >
                <RemoveIcon />
              </IconButton>
              <Typography>{quantity}</Typography>
              <IconButton
                size="small"
                onClick={handleIncrement}
                disabled={!hasStock || quantity >= stock_quantity}
              >
                <AddIcon />
              </IconButton>
              <Button
                variant="contained"
                fullWidth
                onClick={handleAddToCart}
                disabled={!hasStock || quantity === 0}
                sx={{
                  borderRadius: 1,
                  ":hover": { color: "#fff" },
                  background: "transparent",
                  opacity: hasStock ? 1 : 0.6,
                  border: "1px solid",
                  color: "black",
                  "&.Mui-disabled": {
                    backgroundColor: (theme) => theme.palette.primary.main,
                    color: "white",
                    opacity: 0.6,
                  },
                }}
              >
                {hasStock ? (
                  <i
                    className="fas fa-shopping-cart"
                    style={{ fontSize: "20px" }}
                  ></i>
                ) : (
                  "Out of Stock"
                )}
              </Button>
            </Box>
          </Box>
        )}
      </Card>
      <Snackbar
        open={showSuccess}
        autoHideDuration={2000}
        onClose={() => setShowSuccess(false)}
        message="Added to cart"
        anchorOrigin={
          window.innerWidth > 600
            ? { vertical: "bottom", horizontal: "right" }
            : { vertical: "top", horizontal: "center" }
        }
        sx={{ zIndex: 9999 }}
      />
    </>
  );
}

export default ProductCard;
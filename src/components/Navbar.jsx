import { useState, useEffect } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  AppBar,
  Badge,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  ShoppingCart as ShoppingCartIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { signOut, isAdmin, switchDatabase } from "../services/supabase";
import logo from "../assets/logo-red.png";

function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { itemCount } = useCart();
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState("school1");
  const [schools, setSchools] = useState([]);

  useEffect(() => {
    // Fetch the list of schools from the server or a static list
    setSchools([
      { id: "school1", name: "Our Own Indian School" },
      { id: "school2", name: "Our Own English High School" },
      { id: "school3", name: "Our Own Al Ain" },
    ]);
  }, []);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleSchoolChange = (event) => {
    const selectedSchoolId = event.target.value;
    setSelectedSchool(selectedSchoolId);
    switchDatabase(selectedSchoolId); // Switch the database context
    console.log(`Switched to ${selectedSchoolId}`);
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{ mr: 2, display: { xs: "none", md: "flex" } }}
          >
            <img src={logo} alt="Logo" style={{ height: 40 }} />
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
              }}
            >
              <MenuItem onClick={handleCloseNavMenu}>
                <Typography textAlign="center">Shop</Typography>
              </MenuItem>
              <MenuItem onClick={handleCloseNavMenu}>
                <Typography textAlign="center">Orders</Typography>
              </MenuItem>
              <MenuItem onClick={handleCloseNavMenu}>
                <Typography textAlign="center">Profile</Typography>
              </MenuItem>
            </Menu>
          </Box>

          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}
          >
            <img src={logo} alt="Logo" style={{ height: 40 }} />
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            <Button
              component={RouterLink}
              to="/shop"
              sx={{ my: 2, color: "white", display: "block" }}
            >
              Shop
            </Button>
            <Button
              component={RouterLink}
              to="/orders"
              sx={{ my: 2, color: "white", display: "block" }}
            >
              Orders
            </Button>
            <Button
              component={RouterLink}
              to="/profile"
              sx={{ my: 2, color: "white", display: "block" }}
            >
              Profile
            </Button>
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <FormControl variant="outlined" sx={{ minWidth: 120, mr: 2 }}>
              <InputLabel id="school-select-label">School</InputLabel>
              <Select
                labelId="school-select-label"
                id="school-select"
                value={selectedSchool}
                onChange={handleSchoolChange}
                label="School"
              >
                {schools.map((school) => (
                  <MenuItem key={school.id} value={school.id}>
                    {school.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <IconButton
              component={RouterLink}
              to="/cart"
              color="inherit"
              sx={{ mr: 2 }}
            >
              <Badge badgeContent={itemCount} color="secondary">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>

            {user ? (
              <Button
                color="inherit"
                onClick={() => {
                  signOut();
                  navigate("/login");
                }}
              >
                Logout
              </Button>
            ) : (
              <Button
                color="inherit"
                component={RouterLink}
                to="/login"
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
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
import { signOut, isAdmin } from "../services/supabase";
import logo from "../assets/logo-red.png";

function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { itemCount } = useCart();
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(localStorage.getItem('selectedSchool') || "school1");
  const [schools, setSchools] = useState([]);

  useEffect(() => {
    // Fetch the list of schools from the server or a static list
    const fetchedSchools = [
      { id: "school1", name: "Our Own Indian School" },
      { id: "school2", name: "Our Own English High School" },
      { id: "school3", name: "Our Own Al Ain" },
    ];
    setSchools(fetchedSchools);

    // Ensure the selectedSchool is valid
    if (!fetchedSchools.some(school => school.id === selectedSchool)) {
      setSelectedSchool(fetchedSchools[0].id);
      localStorage.setItem('selectedSchool', fetchedSchools[0].id);
    }
  }, []);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleSchoolChange = async (event) => {
    const selectedSchoolId = event.target.value;
    setSelectedSchool(selectedSchoolId);
    localStorage.setItem('selectedSchool', selectedSchoolId);
    console.log(`Switched to ${selectedSchoolId}`);
    await signOut(); // Log out the user
    window.location.reload(); // Refresh the page
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
              {isAdmin(user) ? (
                <>
                  <MenuItem onClick={handleCloseNavMenu}>
                    <Typography textAlign="center" component={RouterLink} to="/admin">Dashboard</Typography>
                  </MenuItem>
                  <MenuItem onClick={handleCloseNavMenu}>
                    <Typography textAlign="center" component={RouterLink} to="/admin/products">Products</Typography>
                  </MenuItem>
                  <MenuItem onClick={handleCloseNavMenu}>
                    <Typography textAlign="center" component={RouterLink} to="/admin/orders">Orders</Typography>
                  </MenuItem>
                  <MenuItem onClick={handleCloseNavMenu}>
                    <Typography textAlign="center" component={RouterLink} to="/admin/manual-entry">Manual Entry</Typography>
                  </MenuItem>
                </>
              ) : (
                <>
                  <MenuItem onClick={handleCloseNavMenu}>
                    <Typography textAlign="center" component={RouterLink} to="/shop">Shop</Typography>
                  </MenuItem>
                  <MenuItem onClick={handleCloseNavMenu}>
                    <Typography textAlign="center" component={RouterLink} to="/orders">Orders</Typography>
                  </MenuItem>
                  <MenuItem onClick={handleCloseNavMenu}>
                    <Typography textAlign="center" component={RouterLink} to="/profile">Profile</Typography>
                  </MenuItem>
                </>
              )}
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
            {isAdmin(user) ? (
              <>
                <Button
                  component={RouterLink}
                  to="/admin"
                  sx={{ my: 2, color: "white", display: "block" }}
                >
                  Dashboard
                </Button>
                <Button
                  component={RouterLink}
                  to="/admin/products"
                  sx={{ my: 2, color: "white", display: "block" }}
                >
                  Products
                </Button>
                <Button
                  component={RouterLink}
                  to="/admin/orders"
                  sx={{ my: 2, color: "white", display: "block" }}
                >
                  Orders
                </Button>
                <Button
                  component={RouterLink}
                  to="/admin/manual-entry"
                  sx={{ my: 2, color: "white", display: "block" }}
                >
                  Manual Entry
                </Button>
              </>
            ) : (
              <>
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
              </>
            )}
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
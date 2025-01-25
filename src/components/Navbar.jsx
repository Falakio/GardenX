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
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField, // Import TextField component
} from "@mui/material";
import {
  ShoppingCart as ShoppingCartIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { signOut, isAdmin } from "../services/supabase";
import logo2 from "../assets/logo-red.png";
import logo from "../assets/logo.png";
import "../index.css"; // Import the global styles

function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { itemCount } = useCart();
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(localStorage.getItem('selectedSchool') || "school1");
  const [schools, setSchools] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSchoolChange = async (event) => {
    const selectedSchoolId = event.target.value;
    setSelectedSchool(selectedSchoolId);
    localStorage.setItem('selectedSchool', selectedSchoolId);
    console.log(`Switched to ${selectedSchoolId}`);
    await signOut(); // Log out the user
    window.location.reload(); // Refresh the page
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    event.preventDefault();
    navigate(`/shop?search=${searchQuery}`);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    navigate(`/shop?search=${searchQuery}`);
  };

  const drawer = (
    <Box sx={{ width: 250 }} onClick={handleDrawerToggle}>
      <Typography variant="h6" sx={{ my: 2, textAlign: "center" }}>
        <img src={logo} alt="Logo" style={{ height: 40 }} />
      </Typography>
      <Divider />
      <List>
        <ListItem button component={RouterLink} to="/shop">
          <ListItemText primary="Shop" />
        </ListItem>
        <ListItem button component={RouterLink} to="/orders">
          <ListItemText primary="Orders" />
        </ListItem>
        <ListItem button component={RouterLink} to="/profile">
          <ListItemText primary="Profile" />
        </ListItem>
        <ListItem button component={RouterLink} to="/credits">
          <ListItemText primary="Credits" />
        </ListItem>
        <Divider />
        <ListItem>
          <FormControl sx={{ minWidth: 120, width: "100%" }}>
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
        </ListItem>
        <ListItem button component={RouterLink} to="/cart">
          <Badge badgeContent={itemCount} color="secondary">
            <ShoppingCartIcon />
          </Badge>
          <ListItemText primary="Cart" />
        </ListItem>
        <Divider />
        {user ? (
          <ListItem
            button
            onClick={() => {
              signOut();
              navigate("/login");
            }}
          >
            <ListItemText primary="Logout" />
          </ListItem>
        ) : (
          <ListItem button component={RouterLink} to="/login">
            <ListItemText primary="Login" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <AppBar
      sx={{
        background: "#2c604a",
        boxShadow: "none",
        position: "sticky",
        t: 0,
        color: "white",
        pb: 2,
        pt: 1,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{ mr: 2, display: { xs: "none", md: "flex" }, color: "white" }}
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
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "flex", md: "none" },
              color: "white",
            }}
          >
            <Typography variant="h6" sx={{pr: 2, pt: 1}}>
              <img src={logo} alt="Logo" style={{ height: 55,  color: "white"}} />
            </Typography>

            <Drawer
              anchor="left"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={
                {
                  // Better open performance on mobile.
                }
              }
            >
              {drawer}
            </Drawer>
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
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "none", md: "flex" },
              color: "white",
            }}
          >
            <Button
              component={RouterLink}
              to="/shop"
              sx={{
                my: 2,
                color: "white",
                display: "block",
                backgroundColor: "#2c604a",
              }}
            >
              Shop
            </Button>
            <Button
              component={RouterLink}
              to="/orders"
              sx={{
                my: 2,
                color: "white",
                display: "block",
                backgroundColor: "#2c604a",
              }}
            >
              Orders
            </Button>
            <Button
              component={RouterLink}
              to="/profile"
              sx={{
                my: 2,
                color: "white",
                display: "block",
                backgroundColor: "#2c604a",
              }}
            >
              Profile
            </Button>
          </Box>

          <Box
            component="form"
            onSubmit={handleSearchSubmit}
            sx={{
              flexGrow: 1,
              marginTop: 2,
              width: { xs: "100%", md: "10%" },
              color: "white",
              border: "none",
              backgroundColor: "#638a7b",
              borderRadius: "30px 10px",
              mr: 2,
            }}
          >
            <TextField
              placeholder="Search..."
              value={searchQuery}
              onInputCapture={handleSearchChange}
              onChange={handleSearchChange}
              onInput={handleSearchChange}
              onEmptied={handleSearchChange}
              onClick={handleSearchChange}
              sx={{
                width: "100%",
                color: "white",
                border: "none",
              }}
              InputProps={{
                sx: {
                  color: "#fff",
                  borderRadius: "30px 10px",
                  border: "none",
                },
              }}
            />
          </Box>

          <IconButton
            size="large"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            color="inherit"
            sx={{ mr: 0, color: "white", marginTop: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Box
            alignItems="center"
            justifyContent="center"
            display={{ xs: "none", md: "flex" }}
            sx={{ flexGrow: 0, color: "white" }}
          >
            <FormControl
              sx={{
                minWidth: 120,
                mr: 2,
                backgroundColor: "#2c604a",
                color: "white",
              }}
            >
              <InputLabel id="school-select-label" sx={{ color: "white" }}>
                School
              </InputLabel>
              <Select
                labelId="school-select-label"
                id="school-select"
                value={selectedSchool}
                onChange={handleSchoolChange}
                label="School"
                sx={{
                  color: "#fff",
                  outlineColor: "#fff",
                  backgroundColor: "#2c604a",
                }}
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
              sx={{ mr: 2, color: "white" }}
            >
              <Badge badgeContent={itemCount} color="secondary">
                <i className="fas fa-shopping-cart"></i>
              </Badge>
            </IconButton>

            {user ? (
              <Button
                color="inherit"
                onClick={() => {
                  signOut();
                  navigate("/login");
                }}
                sx={{ color: "white" }}
              >
                Logout
              </Button>
            ) : (
              <Button
                color="inherit"
                component={RouterLink}
                to="/login"
                sx={{ color: "white" }}
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

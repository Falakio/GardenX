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
  TextField,
  useMediaQuery, // Import useMediaQuery hook
} from "@mui/material";
import {
  ShoppingCart as ShoppingCartIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { signOut, isAdmin } from "../services/supabase";
import logo from "../assets/logo.png";
import JSON from "../../schools.json";

function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { itemCount } = useCart();
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(
    localStorage.getItem("selectedSchool") || "school1"
  );
  const [schools, setSchools] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md")); // Check if the screen size is mobile

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const data = JSON;
        setSchools(data);

        if (!data.some((school) => school.id === selectedSchool)) {
          setSelectedSchool(data[0].id);
          localStorage.setItem("selectedSchool", data[0].id);
        }
      } catch (error) {
        console.error("Error fetching schools:", error);
      }
    };

    fetchSchools();
  }, [selectedSchool]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSchoolChange = async (event) => {
    const selectedSchoolId = event.target.value;
    setSelectedSchool(selectedSchoolId);
    localStorage.setItem("selectedSchool", selectedSchoolId);
    console.log(`Switched to ${selectedSchoolId}`);
    await signOut();
    window.location.reload();
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
    <Box
      sx={{ width: 250, background: "#ffd079", height: "100%" }}
      onClick={handleDrawerToggle}
    >
      <Typography variant="h6" sx={{ my: 2, textAlign: "center" }}>
        <img src={logo} alt="Logo" style={{ height: 40 }} />
      </Typography>
      <Divider />
      <List>
        {!isAdmin(user) && user && (
          <ListItem component={RouterLink} to="/shop">
            <ListItemText primary="Shop" />
          </ListItem>
        )}
        <ListItem component={RouterLink} to="/plans">
          <ListItemText primary="Pricing Plans" />
        </ListItem>
        {!isAdmin(user) && user && (
          <ListItem component={RouterLink} to="/orders">
            <ListItemText primary="Orders" />
          </ListItem>
        )}
        {!isAdmin(user) && user && (
          <ListItem component={RouterLink} to="/profile">
            <ListItemText primary="Profile" />
          </ListItem>
        )}
        {isAdmin(user) && user && (
          <ListItem component={RouterLink} to="/admin">
            <ListItemText primary="Dashboard" />
          </ListItem>
        )}
        {isAdmin(user) && user && (
          <ListItem component={RouterLink} to="/admin/products">
            <ListItemText primary="Products" />
          </ListItem>
        )}
        {isAdmin(user) && user && (
          <ListItem component={RouterLink} to="/admin/orders">
            <ListItemText primary="Orders" />
          </ListItem>
        )}
        {isAdmin(user) && user && (
          <ListItem component={RouterLink} to="/admin/manual-entry">
            <ListItemText primary="New Order" />
          </ListItem>
        )}

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
        {!isAdmin(user) && user && (
          <ListItem button component={RouterLink} to="/cart">
            <Badge badgeContent={itemCount} color="secondary" sx={{ mr: 1 }}>
              <ShoppingCartIcon />
            </Badge>
            <ListItemText primary="Cart" />
          </ListItem>
        )}
        <Divider />
        {user ? (
          <ListItem
            onClick={() => {
              signOut();
              navigate("/login");
            }}
          >
            <ListItemText primary="Logout" />
          </ListItem>
        ) : (
          <ListItem component={RouterLink} to="/login">
            <ListItemText primary="Login" />
          </ListItem>
        )}
      </List>

      <Box sx={{ flexGrow: 1 }} />
      <Typography variant="body2" sx={{ textAlign: "center", mb: 2 }}>
        Copyright &copy; 2025 GardenX
      </Typography>
      <Typography variant="body2" sx={{ textAlign: "center", mb: 2 }}>
        All Rights Reserved.
      </Typography>
      <Typography variant="body2" sx={{ textAlign: "center", mb: 2 }}>
        Al Falak Network
      </Typography>
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

          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "flex", md: "none" },
              color: "white",
            }}
          >
            <Typography variant="h6" sx={{ pr: 2, pt: 1 }}>
              <img
                src={logo}
                alt="Logo"
                style={{ height: 55, color: "white" }}
              />
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

          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "none", md: "flex" },
              color: "white",
            }}
          >
            {!isAdmin(user) && user && (
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
            )}

            

            {!isAdmin(user) && user && (
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
            )}

            {!isAdmin(user) && user && (
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
            )}
            <Button
              component={RouterLink}
              to="/plans"
              sx={{
                my: 2,
                color: "white",
                display: "block",
                backgroundColor: "#2c604a",
              }}
            >
              Pricing Plans
            </Button>
            {isAdmin(user) && (
              <Button
                component={RouterLink}
                to="/admin"
                sx={{
                  my: 2,
                  color: "white",
                  display: "block",
                  backgroundColor: "#2c604a",
                }}
              >
                Dashboard
              </Button>
            )}

            {isAdmin(user) && (
              <Button
                component={RouterLink}
                to="/admin/products"
                sx={{
                  my: 2,
                  color: "white",
                  display: "block",
                  backgroundColor: "#2c604a",
                }}
              >
                Products
              </Button>
            )}
            {isAdmin(user) && (
              <Button
                component={RouterLink}
                to="/admin/orders"
                sx={{
                  my: 2,
                  color: "white",
                  display: "block",
                  backgroundColor: "#2c604a",
                }}
              >
                Orders
              </Button>
            )}
            {isAdmin(user) && (
              <Button
                component={RouterLink}
                to="/admin/manual-entry"
                sx={{
                  my: 2,
                  color: "white",
                  display: "block",
                  backgroundColor: "#2c604a",
                }}
              >
                New Order
              </Button>
            )}
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

          {isMobile && (
            <IconButton
              size="large"
              aria-label="open drawer"
              onClick={handleDrawerToggle}
              color="inherit"
              sx={{ mr: 0, color: "white", marginTop: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

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
                mt: 1,
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

            {!isAdmin(user) && user && (
              <IconButton
                component={RouterLink}
                to="/cart"
                color="inherit"
                sx={{ mr: 2, color: "white" }}
              >
                <Badge badgeContent={itemCount} color="secondary">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
            )}

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

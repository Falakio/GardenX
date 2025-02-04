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
  Close as CloseIcon, // <-- new import for cross mark
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
  const [menuButtonPosition, setMenuButtonPosition] = useState({
    top: 0,
    left: 0,
  });

  // Inside the component, compute the max radius for full expansion.
  const maxRadius = Math.hypot(window.innerWidth, window.innerHeight);

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

  const handleMenuButtonClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuButtonPosition({
      top: rect.top + rect.height / 2,
      left: rect.left + rect.width / 2,
    });
    handleDrawerToggle();
  };

  const drawer = (
    <Box
      sx={{ width: "100%", height: "100%", color: "white" }} // Cover the entire screen
      onClick={handleDrawerToggle}
    >
      <List>
        {!isAdmin(user) && user && (
          <ListItem component={RouterLink} to="/shop" button>
            <ListItemText primary="Shop" />
          </ListItem>
        )}

        {!isAdmin(user) && user && (
          <ListItem component={RouterLink} to="/orders" button>
            <ListItemText primary="Orders" />
          </ListItem>
        )}
        {!isAdmin(user) && user && (
          <ListItem component={RouterLink} to="/profile" button>
            <ListItemText primary="Profile" />
          </ListItem>
        )}
        {isAdmin(user) && user && (
          <ListItem component={RouterLink} to="/admin" button>
            <ListItemText primary="Dashboard" />
          </ListItem>
        )}
        {isAdmin(user) && user && (
          <ListItem component={RouterLink} to="/admin/products" button>
            <ListItemText primary="Products" />
          </ListItem>
        )}
        {isAdmin(user) && user && (
          <ListItem component={RouterLink} to="/admin/orders" button>
            <ListItemText primary="Orders" />
          </ListItem>
        )}
        {isAdmin(user) && user && (
          <ListItem component={RouterLink} to="/admin/manual-entry" button>
            <ListItemText primary="New Order" />
          </ListItem>
        )}
        {/* <ListItem component={RouterLink} to="/plans" button>
          <ListItemText primary="Pricing Plans" />
        </ListItem> */}
        <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.12)", mb: 1 }} />
        <ListItem>
          <FormControl sx={{ minWidth: 120, width: "100%" }}>
            <InputLabel id="school-select-label" sx={{ color: "white" }}>
              School
            </InputLabel>
            <Select
              labelId="school-select-label"
              id="school-select"
              value={selectedSchool}
              onChange={handleSchoolChange}
              label="School"
              sx={{ color: "white" }}
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
        <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.12)" }} />
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
          <ListItem component={RouterLink} to="/login" button>
            <ListItemText primary="Login" />
          </ListItem>
        )}
      </List>

      {/* Footer at the bottom */}
      <Box sx={{ flexGrow: 1, mt: 20 }} />
      <Typography variant="body2" sx={{ textAlign: "center", mb: 2 }}>
        Copyright &copy; 2025 GardenX. All Rights Reserved.
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

            <Box
              sx={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: mobileOpen
                  ? "linear-gradient(135deg, #2c604a, #3e8a75)"
                  : "#2c604a",
                zIndex: 1300,
                pointerEvents: mobileOpen ? "auto" : "none",
                opacity: mobileOpen ? 1 : 0,
                transition:
                  "clip-path 1.2s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease-out",
                clipPath: mobileOpen
                  ? `circle(${maxRadius}px at ${menuButtonPosition.left}px ${menuButtonPosition.top}px)`
                  : `circle(0px at ${menuButtonPosition.left}px ${menuButtonPosition.top}px)`,
                boxShadow: "inset 0 0 30px rgba(0,0,0,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={handleDrawerToggle}
            >
              <Box
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                sx={{
                  position: "relative",
                  bottom: 50,
                  width: "90%",
                  height: "80%",
                  maxWidth: "400px",
                  borderRadius: 3,
                  overflow: "hidden",
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  color: "white",
                  p: 0,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <img src={logo} alt="Logo" style={{ height: 40 }} />{" "}
                    <Typography variant="h6">GardenX</Typography>
                  </Typography>
                  <IconButton
                    onClick={handleDrawerToggle}
                    sx={{ color: "#fff" }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
                <Box sx={{ p: 2, color: "#fff" }}>{drawer}</Box>
              </Box>
            </Box>
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
            {/* <Button
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
            </Button> */}
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
              onClick={handleMenuButtonClick} // Use the new click handler
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

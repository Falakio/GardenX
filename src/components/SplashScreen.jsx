import { Box, Typography } from "@mui/material";
import logo from "../assets/logo.png"; // Adjust the path to your logo
import "../index.css"; // Import the global styles

function SplashScreen() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#2c604a",
        color: "white",
      }}
    >
      <img src={logo} alt="Logo" style={{ width: 200, marginBottom: 20 }} />
    </Box>
  );
}

export default SplashScreen;

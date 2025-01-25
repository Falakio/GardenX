import React from "react";
import { Container, Typography, Box } from "@mui/material";

const Credits = () => {
  return (
    <Container
      maxWidth="md"
      sx={{
        py: 4,
        mt: 6,
        position: "relative",
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        borderRadius: "15px",
      }}
    >
      <Typography variant="h4" gutterBottom>
        Credits
      </Typography>
      <Box sx={{ mt: 2, color: "white" }}>
        <Typography variant="h6">Developers:</Typography>
        <Typography variant="body1">
          <a
            href="https://github.com/AmanSanoj"
            style={{ textDecoration: "none", color: "lightgreen" }}
          >
            Aman Sanoj
          </a>
        </Typography>
        <Typography variant="body1">
          <a
            href="https://github.com/AR1VU/"
            style={{ textDecoration: "none", color: "lightgreen" }}
          >
            AbdulRahman Maniar
          </a>
        </Typography>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">Logistics:</Typography>
        <Typography variant="body1">Selvarance Johnson</Typography>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">Support:</Typography>
        <Typography variant="body1">Prathima Nag A</Typography>
        <Typography variant="body1">Devanand Vijayjumar</Typography>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">Logo:</Typography>
        <Typography variant="body1">Arjun Krishna</Typography>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">Special Thanks:</Typography>
        <Typography variant="body1">ChatGPT</Typography>
        <Typography variant="body1">Cascade</Typography>
        <Typography variant="body1">Claude</Typography>

      </Box>
    </Container>
  );
};

export default Credits;

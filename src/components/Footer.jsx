import React from "react";
import { Box, Typography, Link } from "@mui/material";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 3,
        mt: "auto",
        textAlign: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Typography variant="body2" color="textSecondary">
        Made with{" "}
        <span role="img" aria-label="love">
          ❤️
        </span>{" "}
        by{" "}
        <Link href="https://amansanoj.tech" target="_blank" rel="noopener">
          Aman
        </Link>{" "}
        and{" "}
        <Link href="https://ar1vu.com" target="_blank" rel="noopener">
          AbdulRahman
        </Link>{" "}
        (C) {currentYear}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        <Link href="/credits">Credits</Link>
      </Typography>
    </Box>
  );
};

export default Footer;

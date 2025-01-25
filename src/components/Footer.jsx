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
        backgroundColor: "#2c604a",
      }}
    >
      <Typography color="#fff">
        Copyright &copy; {currentYear}. All Rights Reserved.{" "}
      </Typography>
      <Typography color="#fff">
        GardenX is a subsidiary of Al Falak Network
      </Typography>
      <Typography variant="body2" color="textSecondary">
        <Link href="/credits" sx={{textDecoration: "none"}}>Credits</Link>
      </Typography>
    </Box>
  );
};

export default Footer;

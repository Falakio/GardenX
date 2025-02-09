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
        textAlign: "center",
      }}
    >
      <Typography variant="h2" gutterBottom sx={{ fontWeight: 600 }}>
        GardenX Plans
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          gap: 5,
          // fixed width for the two plans
          width: 800,
          margin: "auto",
        }}
      >
        <Box sx={{ mt: 2 }}>
          <Typography variant="h3">Sapling Plan</Typography>
          <Typography
            variant="h5"
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            AED 299 /{" "}
            <Typography variant="body1" sx={{ ml: 0.5 }}>
              month
            </Typography>
          </Typography>

          <Typography variant="body1" sx={{ ml: 1 }}>
            The foundation for schools to manage and sell their produce.
          </Typography>

          {/* unordered list */}
          <Box
            component="ul"
            sx={{
              listStyleType: "none",
              p: 0,
              m: 0,
              mt: 2,
              textAlign: "left",
            }}
          >
            {[
              "Sales & Order Management",
              "Inventory Tracking",
              "Analytics & Reports",
              "Customer Management",
              "Email Support",
            ].map((item) => (
              <Box
                key={item}
                component="li"
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  gap: 1,
                  my: 1,
                }}
              >
                <Typography variant="body1">✅</Typography>
                <Typography variant="body1">{item}</Typography>
              </Box>
            ))}

            
          </Box>
        </Box>

        <Box
          component="hr"
          sx={{
            height: "35vh",
            border: "none",
            borderLeft: "1px solid rgba(255, 255, 255, 1)",
            mx: 1,
          }}
        />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <Box sx={{ mt: 2 }}>
            <Typography variant="h3">Bloom Plan</Typography>
            <Typography
              variant="h5"
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              AED 399 /{" "}
              <Typography variant="body1" sx={{ ml: 0.5 }}>
                month
              </Typography>
            </Typography>

            <Typography variant="body1" sx={{ ml: 1 }}>
              For schools looking to scale and optimize their gardening
              operations.
            </Typography>

            {/* unordered list */}
            <Box
              component="ul"
              sx={{
                listStyleType: "none",
                p: 0,
                m: 0,
                mt: 2,
                textAlign: "left",
              }}
            >
              {[
                "All Sapling Plan features",
                "AI-powered Recommendations",
                "Custom Branding",
                "Marketing & SEO Tools",
                "Priority Support",
              ].map((item) => (
                <Box
                  key={item}
                  component="li"
                  sx={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    gap: 1,
                    my: 1,
                  }}
                >
                  <Typography variant="body1">✅</Typography>
                  <Typography variant="body1">{item}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
            {/* contact us button */}
            <Box sx={{ mt: 5, width: "100%",  backgroundColor: "#fff", borderRadius: 50, padding: 1 }} onClick={() => window.open("mailto: gardenx@falaknet.com")}>
              <Typography variant="body1" sx={{width: "100%", textAlign: "center"}}>
                <a
                  href="mailto:gardenx@falaknet.com"
                  style={{ textDecoration: "none", color: "#2c604a", width: "100%" }}
                >
                  Contact us
                </a>{" "}
              </Typography>
            </Box>
    </Container>
  );
};

export default Credits;

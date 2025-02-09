import { useState, useEffect } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Tab,
  Tabs,
  Alert,
  Link,
  Tooltip,
  IconButton,
} from "@mui/material";
import { signInWithEmail } from "../services/supabase";
import SignUpForm from "../components/SignUpForm";
import { useAuth } from "../contexts/AuthContext";
import InfoIcon from "@mui/icons-material/Info";
import MagicIcon from "@mui/icons-material/AutoAwesome";
import { sendMagicLink } from "../services/supabase";

function Login() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (user) {
      navigate("/shop");
    }
  }, [user, navigate]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSendMagicLink = async () => {
    setLoading(true);
    if (!email) {
      setError("Please enter your email");
      setLoading(false);
      return;
    }
    const { data, error } = await sendMagicLink(email);
    if (error) {
      if (error.message === "Signups not allowed for otp") {
        setError("You do not have an account. Please sign up first.");
      } else {
        setError("Failed to send magic link. Please try again.");
      }
      setMessage("");
    } else {
      setMessage("A magic link has been sent to your email.");
      setError("");
      setCountdown(60);
    }
    setLoading(false);
  };

  const handleEmailSignIn = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const { data, error } = await signInWithEmail(email, password);
      if (error) throw error;
      navigate("/shop");
    } catch (err) {
      console.error("Sign in error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3 } }}>
      <Paper
        elevation={3}
        sx={{
          mt: { xs: 4, sm: 8 },
          p: { xs: 2, sm: 4 },
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          borderRadius: "15px",
          color: "white",
        }}
      >
        <Tabs
          value={tab}
          onChange={(e, newValue) => setTab(newValue)}
          centered
          sx={{ mb: 3 }}
        >
          <Tab
            label="Sign In"
            sx={{
              color: tab === 0 ? "white" : "lightgray",
              "&.Mui-selected": { color: "white", borderBottom: "1px solid white" },
            }}
          />
          <Tab
            label="Sign Up"
            sx={{
              color: tab === 1 ? "white" : "lightgray",
              "&.Mui-selected": { color: "white", borderBottom: "1px solid white" },
            }}
          />
        </Tabs>
        {tab === 0 ? (
          <>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              Sign In
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {message && <Alert severity="success">{message}</Alert>}
            <Box
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                handleEmailSignIn(email, password);
              }}
              noValidate
              sx={{ mt: 1 }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                sx={{
                  color: "white",
                  borderColor: "white",
                  "& .MuiInputBase-input": { color: "white" },
                  "& .MuiInputLabel-root": { color: "white" },
                  "& .MuiInput-focused": { color: "white" },
                  "& .MuiOutlinedInput-root": { color: "white" },
                  "& .MuiInputFocused": { color: "white" },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "white",
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={handlePasswordChange}
                sx={{
                  color: "white",
                  borderColor: "white",
                  "& .MuiInputBase-input": { color: "white" },
                  "& .MuiInputLabel-root": { color: "white" },
                  "& .MuiInput-focused": { color: "white" },
                  "& .MuiInputFocused": { color: "white" },
                  "& .MuiOutlinedInput-root": { color: "white" },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "white",
                  },
                }}
                disabled={loading}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                Sign In
              </Button>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mt: 2,
              }}
            >
              <Button
                variant="outlined"
                onClick={handleSendMagicLink}
                fullWidth
                startIcon={<MagicIcon />}
                sx={{ mr: 1, outline: "1px solid white", color: "white" }}
                disabled={countdown > 0}
              >
                {countdown > 0
                  ? `Send Magic Link (${countdown}s)`
                  : "Send Magic Link"}
              </Button>
              <Tooltip
                title="If you forgot your password we can help you sign in using a one time link sent to your email"
                placement="right"
              >
                <IconButton>
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </>
        ) : (
          <SignUpForm />
        )}
      </Paper>
    </Container>
  );
}

export default Login;
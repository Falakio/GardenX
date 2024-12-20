import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  getUserProfile,
  updateUserProfile,
  checkGemsIdExists,
} from "../services/supabase";
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  TextField,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Grid,
} from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";

const CLASSES = [
  "KG1",
  "KG2",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
];

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    phone: "",
    role: "",
    details: {
      firstName: "",
      lastName: "",
      student_first_name: "",
      student_last_name: "",
      student_class: "",
      student_section: "",
      student_gems_id: "",
      staff_gems_id: "",
    },
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        navigate("/login");
        return;
      }
      try {
        const { data, error } = await getUserProfile(user.id);
        if (error) throw error;
        setProfile(data);
        setEditForm({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          role: data.role,
          details: data.details,
        });
      } catch (error) {
        console.error("Error loading profile:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user, navigate]);

  const handleEditClick = () => {
    setEditDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditDialogOpen(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("details.")) {
      setEditForm((prev) => ({
        ...prev,
        details: {
          ...prev.details,
          [name.split(".")[1]]: value,
        },
      }));
    } else {
      setEditForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePhoneChange = (e) => {
    const { value } = e.target;
    if (/^\d*$/.test(value) && value.length <= 10) {
      setEditForm((prev) => ({
        ...prev,
        phone: value,
      }));
    }
  };

  const validateForm = () => {
    // Validate phone number
    if (!/^05\d{8}$/.test(editForm.phone)) {
      setSnackbar({
        open: true,
        message: "Phone number must be 10 digits starting with 05",
        severity: "error",
      });
      return false;
    }
    // Validate GEMS ID (6 digits for parent, 8 digits for staff)
    if (
      editForm.role === "parent" &&
      !/^[1-9]\d{5}$/.test(editForm.details.student_gems_id)
    ) {
      setSnackbar({
        open: true,
        message:
          "GEMS ID must be exactly 6 digits starting with a non-zero digit",
        severity: "error",
      });
      return false;
    }
    if (
      editForm.role === "staff" &&
      !/^\d{8}$/.test(editForm.details.staff_gems_id)
    ) {
      setSnackbar({
        open: true,
        message: "Staff GEMS ID must be exactly 8 digits",
        severity: "error",
      });
      return false;
    }
    // Validate section (single uppercase letter)
    if (
      editForm.role === "parent" &&
      !/^[A-Z]$/.test(editForm.details.student_section)
    ) {
      setSnackbar({
        open: true,
        message: "Section must be a single uppercase letter (A-Z)",
        severity: "error",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      setLoading(true);
      const { data, error } = await updateUserProfile(user.id, editForm);
      if (error) throw error;
      setProfile(data);
      setEditDialogOpen(false);
      setSnackbar({
        open: true,
        message: "Profile updated successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to update profile",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm">
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="sm">
        <Paper sx={{ p: 3, mt: 4, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            No Profile Found
          </Typography>
          <Typography color="text.secondary" paragraph>
            Please complete your profile to continue using OIS Garden.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/login?tab=signup")}
          >
            Complete Profile
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3 } }}>
      <Paper elevation={3} sx={{ mt: { xs: 4, sm: 8 }, p: { xs: 2, sm: 4 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h5">Profile</Typography>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEditClick}
          >
            Edit Profile
          </Button>
        </Box>
        <Box sx={{ mt: 1 }}>
          <Typography variant="subtitle1" color="text.secondary">
            First Name
          </Typography>
          <Typography variant="body1">{profile.firstName}</Typography>
        </Box>
        <Box sx={{ mt: 1 }}>
          <Typography variant="subtitle1" color="text.secondary">
            Last Name
          </Typography>
          <Typography variant="body1">{profile.lastName}</Typography>
        </Box>
        <Box sx={{ mt: 1 }}>
          <Typography variant="subtitle1" color="text.secondary">
            Email
          </Typography>
          <Typography variant="body1">{profile.email}</Typography>
        </Box>
        <Box sx={{ mt: 1 }}>
          <Typography variant="subtitle1" color="text.secondary">
            Phone
          </Typography>
          <Typography variant="body1">{profile.phone}</Typography>
        </Box>
        {profile.role === "parent" && (
          <>
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle1" color="text.secondary">
                Student First Name
              </Typography>
              <Typography variant="body1">
                {profile.details.student_first_name}
              </Typography>
            </Box>
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle1" color="text.secondary">
                Student Last Name
              </Typography>
              <Typography variant="body1">
                {profile.details.student_last_name}
              </Typography>
            </Box>
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle1" color="text.secondary">
                Student Class
              </Typography>
              <Typography variant="body1">
                {profile.details.student_class}
              </Typography>
            </Box>
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle1" color="text.secondary">
                Student Section
              </Typography>
              <Typography variant="body1">
                {profile.details.student_section}
              </Typography>
            </Box>
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle1" color="text.secondary">
                Student GEMS ID
              </Typography>
              <Typography variant="body1">
                {profile.details.student_gems_id}
              </Typography>
            </Box>
          </>
        )}
        {profile.role === "staff" && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle1" color="text.secondary">
              Staff GEMS ID
            </Typography>
            <Typography variant="body1">
              {profile.details.staff_gems_id}
            </Typography>
          </Box>
        )}
      </Paper>
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={editForm.firstName}
                  onChange={handleFormChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={editForm.lastName}
                  onChange={handleFormChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={editForm.phone}
                  onChange={handlePhoneChange}
                  margin="normal"
                  inputProps={{ maxLength: 10 }}
                  helperText="Phone number must be 10 digits starting with 05"
                />
              </Grid>
              {editForm.role === "parent" && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Student First Name"
                      name="details.student_first_name"
                      value={editForm.details.student_first_name}
                      onChange={handleFormChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Student Last Name"
                      name="details.student_last_name"
                      value={editForm.details.student_last_name}
                      onChange={handleFormChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="Student Class"
                      name="details.student_class"
                      value={editForm.details.student_class}
                      onChange={handleFormChange}
                      margin="normal"
                    >
                      {CLASSES.map((cls) => (
                        <MenuItem key={cls} value={cls}>
                          {cls}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Student Section"
                      name="details.student_section"
                      value={editForm.details.student_section}
                      onChange={handleFormChange}
                      margin="normal"
                      inputProps={{ maxLength: 1 }}
                      helperText="Single uppercase letter (A-Z)"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Student GEMS ID"
                      name="details.student_gems_id"
                      value={editForm.details.student_gems_id}
                      onChange={handleFormChange}
                      margin="normal"
                      inputProps={{ maxLength: 6 }}
                      helperText="Enter the last 6 digits of your ward's GEMS ID"
                    />
                  </Grid>
                </>
              )}
              {editForm.role === "staff" && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Staff GEMS ID"
                    name="details.staff_gems_id"
                    value={editForm.details.staff_gems_id}
                    onChange={handleFormChange}
                    margin="normal"
                    inputProps={{ maxLength: 8 }}
                    helperText="Enter your GEMS ID"
                  />
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Container>
  );
}

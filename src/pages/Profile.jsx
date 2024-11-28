import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, updateUserProfile, checkGemsIdExists } from '../services/supabase';
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
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';

const CLASSES = ['KG1', 'KG2', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    parent_name: '',
    student_name: '',
    student_class: '',
    student_section: '',
    gems_id_last_six: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const { data, error } = await getUserProfile(user.id);
        if (error) throw error;
        setProfile(data);
        setEditForm({
          parent_name: data.parent_name,
          student_name: data.student_name,
          student_class: data.student_class,
          student_section: data.student_section,
          gems_id_last_six: data.gems_id_last_six,
        });
      } catch (error) {
        console.error('Error loading profile:', error);
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
    let updatedValue = value;
    
    if (name === 'student_section') {
      updatedValue = value.toUpperCase();
    }
    
    setEditForm(prev => ({
      ...prev,
      [name]: updatedValue
    }));
  };

  const validateForm = () => {
    // Validate GEMS ID (6 digits)
    if (!/^\d{6}$/.test(editForm.gems_id_last_six)) {
      setSnackbar({
        open: true,
        message: 'GEMS ID must be exactly 6 digits',
        severity: 'error'
      });
      return false;
    }

    // Validate section (single uppercase letter)
    if (!/^[A-Z]$/.test(editForm.student_section)) {
      setSnackbar({
        open: true,
        message: 'Section must be a single uppercase letter (A-Z)',
        severity: 'error'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Check if GEMS ID already exists (excluding current user)
      const { exists, error: checkError } = await checkGemsIdExists(editForm.gems_id_last_six, user.id);
      
      if (checkError) throw checkError;
      
      if (exists) {
        setSnackbar({
          open: true,
          message: 'This GEMS ID is already registered in the system',
          severity: 'error'
        });
        return;
      }

      const { data, error } = await updateUserProfile(user.id, editForm);
      
      if (error) throw error;
      
      setProfile(data);
      setEditDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to update profile',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
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
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="sm">
        <Paper sx={{ p: 3, mt: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No Profile Found
          </Typography>
          <Typography color="text.secondary" paragraph>
            Please complete your profile to continue using GEMS Garden.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/login?tab=signup')}
          >
            Complete Profile
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
      <Paper elevation={3} sx={{ 
        mt: { xs: 4, sm: 8 }, 
        p: { xs: 2, sm: 4 }
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">
            Student Profile
          </Typography>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEditClick}
          >
            Edit Profile
          </Button>
        </Box>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" color="text.secondary">
            Parent Information
          </Typography>
          <Typography variant="body1">Name: {profile.parent_name}</Typography>
          <Typography variant="body1">Email: {profile.parent_email}</Typography>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" color="text.secondary">
            Student Information
          </Typography>
          <Typography variant="body1">Name: {profile.student_name}</Typography>
          <Typography variant="body1">Class: {profile.student_class}</Typography>
          <Typography variant="body1">Section: {profile.student_section}</Typography>
          <Typography variant="body1">GEMS ID: {profile.gems_id_last_six}</Typography>
        </Box>
      </Paper>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Parent Name"
              name="parent_name"
              value={editForm.parent_name}
              onChange={handleFormChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Student Name"
              name="student_name"
              value={editForm.student_name}
              onChange={handleFormChange}
              margin="normal"
            />
            <TextField
              fullWidth
              select
              label="Class"
              name="student_class"
              value={editForm.student_class}
              onChange={handleFormChange}
              margin="normal"
            >
              {CLASSES.map((cls) => (
                <MenuItem key={cls} value={cls}>
                  {cls}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Section"
              name="student_section"
              value={editForm.student_section}
              onChange={handleFormChange}
              margin="normal"
              inputProps={{ maxLength: 1 }}
              helperText="Single uppercase letter (A-Z)"
            />
            <TextField
              fullWidth
              label="GEMS ID (Last 6 digits)"
              name="gems_id_last_six"
              value={editForm.gems_id_last_six}
              onChange={handleFormChange}
              margin="normal"
              inputProps={{ 
                maxLength: 6, 
                pattern: '[0-9]*',
              }}
              helperText="Enter the last 6 digits of your ward's GEMS ID"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

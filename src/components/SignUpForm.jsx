import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Fade,
} from '@mui/material';
import { CheckCircleOutline, CancelOutlined } from '@mui/icons-material';
import { signUpWithEmail, createUserProfile, signInWithEmail, deleteAuthUser, checkGemsIdExists } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

const CLASSES = ['KG1', 'KG2', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

export default function SignUpForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
  });
  const [formData, setFormData] = useState({
    password: '',
    parentName: '',
    parentEmail: '',
    studentName: '',
    studentClass: '',
    studentSection: '',
    gemsIdLastSix: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'password') {
      // Check password requirements
      setPasswordRequirements({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /\d/.test(value),
      });
    }
    
    // Convert section to uppercase
    if (name === 'studentSection') {
      setFormData(prev => ({
        ...prev,
        [name]: value.toUpperCase()
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const PasswordRequirementsList = () => (
    <List dense sx={{ mt: 1, bgcolor: 'background.paper' }}>
      <ListItem>
        <ListItemIcon sx={{ minWidth: 40 }}>
          {passwordRequirements.length ? (
            <CheckCircleOutline 
              sx={{ 
                bgcolor: 'white',
                borderRadius: '50%',
                color: 'success.main',
              }} 
            />
          ) : (
            <CancelOutlined 
              sx={{ 
                bgcolor: 'white',
                borderRadius: '50%',
                color: 'error.main',
              }} 
            />
          )}
        </ListItemIcon>
        <ListItemText primary="At least 8 characters long" />
      </ListItem>
      <ListItem>
        <ListItemIcon sx={{ minWidth: 40 }}>
          {passwordRequirements.uppercase ? (
            <CheckCircleOutline 
              sx={{ 
                bgcolor: 'white',
                borderRadius: '50%',
                color: 'success.main',
              }} 
            />
          ) : (
            <CancelOutlined 
              sx={{ 
                bgcolor: 'white',
                borderRadius: '50%',
                color: 'error.main',
              }} 
            />
          )}
        </ListItemIcon>
        <ListItemText primary="One uppercase letter" />
      </ListItem>
      <ListItem>
        <ListItemIcon sx={{ minWidth: 40 }}>
          {passwordRequirements.lowercase ? (
            <CheckCircleOutline 
              sx={{ 
                bgcolor: 'white',
                borderRadius: '50%',
                color: 'success.main',
              }} 
            />
          ) : (
            <CancelOutlined 
              sx={{ 
                bgcolor: 'white',
                borderRadius: '50%',
                color: 'error.main',
              }} 
            />
          )}
        </ListItemIcon>
        <ListItemText primary="One lowercase letter" />
      </ListItem>
      <ListItem>
        <ListItemIcon sx={{ minWidth: 40 }}>
          {passwordRequirements.number ? (
            <CheckCircleOutline 
              sx={{ 
                bgcolor: 'white',
                borderRadius: '50%',
                color: 'success.main',
              }} 
            />
          ) : (
            <CancelOutlined 
              sx={{ 
                bgcolor: 'white',
                borderRadius: '50%',
                color: 'error.main',
              }} 
            />
          )}
        </ListItemIcon>
        <ListItemText primary="One number" />
      </ListItem>
    </List>
  );

  const validateForm = () => {
    if (!formData.password || !formData.parentName || 
        !formData.parentEmail || !formData.studentName || !formData.studentClass || 
        !formData.studentSection || !formData.gemsIdLastSix) {
      setError('Please fill in all fields');
      return false;
    }
    
    if (formData.gemsIdLastSix.length !== 6 || !/^\d+$/.test(formData.gemsIdLastSix)) {
      setError('GEMS ID must be exactly 6 digits');
      return false;
    }

    if (!Object.values(passwordRequirements).every(Boolean)) {
      setError('Password does not meet the requirements');
      return false;
    }

    if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.parentEmail)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Validate section (single uppercase letter)
    if (!/^[A-Z]$/.test(formData.studentSection)) {
      setError('Section must be a single uppercase letter (A-Z)');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) return;

    setLoading(true);
    try {
      // Check if GEMS ID already exists
      const { exists, error: checkError } = await checkGemsIdExists(formData.gemsIdLastSix);
      
      if (checkError) throw checkError;
      
      if (exists) {
        throw new Error('This GEMS ID is already registered in the system');
      }

      // Sign up the user
      const { data: signUpData, error: signUpError } = await signUpWithEmail(
        formData.parentEmail,
        formData.password
      );

      if (signUpError) {
        console.error('Signup error:', signUpError);
        throw signUpError;
      }

      // Create user profile
      const profileData = {
        id: signUpData.user.id,
        parent_name: formData.parentName,
        parent_email: formData.parentEmail,
        student_name: formData.studentName,
        student_class: formData.studentClass,
        student_section: formData.studentSection.toUpperCase(),
        gems_id_last_six: formData.gemsIdLastSix,
      };

      const { error: profileError } = await createUserProfile(profileData);

      if (profileError) {
        // If profile creation fails, we should handle this error
        console.error('Profile creation error:', profileError);
        
        // Attempt to clean up the auth user since profile creation failed
        const { error: deleteError } = await deleteAuthUser(signUpData.user.id);
        if (deleteError) {
          console.error('Failed to delete auth user after profile creation failed:', deleteError);
        }
        
        throw new Error('Failed to create user profile. Please try again.');
      }

      setSuccess(true);

      // Sign in immediately after signup
      const { error: signInError } = await signInWithEmail(formData.parentEmail, formData.password);
      if (signInError) {
        console.error('Sign in error:', signInError);
        throw signInError;
      }

      navigate('/shop');
    } catch (error) {
      console.error('Error during sign up:', error);
      setError(error.message || 'An error occurred during sign up');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (success) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="success">
          Sign up successful! Please check your email to confirm your account. Redirecting to shop...
        </Alert>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="h6" gutterBottom>
        Parent Information
      </Typography>
      
      <TextField
        margin="normal"
        required
        fullWidth
        label="Parent Name"
        name="parentName"
        value={formData.parentName}
        onChange={handleChange}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        label="Parent Email"
        name="parentEmail"
        type="email"
        value={formData.parentEmail}
        onChange={handleChange}
        helperText="This email will be used for signing in"
      />

      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        Student Information
      </Typography>

      <TextField
        margin="normal"
        required
        fullWidth
        label="Student Name"
        name="studentName"
        value={formData.studentName}
        onChange={handleChange}
      />

      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          margin="normal"
          required
          select
          fullWidth
          label="Class"
          name="studentClass"
          value={formData.studentClass}
          onChange={handleChange}
        >
          {CLASSES.map((cls) => (
            <MenuItem key={cls} value={cls}>
              {cls}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          margin="normal"
          required
          fullWidth
          label="Section"
          name="studentSection"
          value={formData.studentSection}
          onChange={handleChange}
          inputProps={{ 
            maxLength: 1,
            style: { textTransform: 'uppercase' }
          }}
          helperText="Enter a single letter (A-Z)"
        />
      </Box>

      <TextField
        margin="normal"
        required
        fullWidth
        label="GEMS ID (Last 6 digits)"
        name="gemsIdLastSix"
        value={formData.gemsIdLastSix}
        onChange={handleChange}
        inputProps={{ maxLength: 6, pattern: '[0-9]*' }}
        helperText="Enter the last 6 digits of your ward's GEMS ID"
      />

      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        Account Information
      </Typography>

      <TextField
        margin="normal"
        required
        fullWidth
        label="Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        error={formData.password.length > 0 && !Object.values(passwordRequirements).every(Boolean)}
      />
      <PasswordRequirementsList />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={loading}
      >
        Sign Up
      </Button>
    </Box>
  );
}

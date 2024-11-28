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
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
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
  const [userType, setUserType] = useState('parent');
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
        number: /[0-9]/.test(value),
      });
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUserTypeChange = (event) => {
    setUserType(event.target.value);
    // Reset form data when switching user type
    setFormData({
      password: formData.password,
      parentName: '',
      parentEmail: '',
      studentName: '',
      studentClass: '',
      studentSection: '',
      gemsIdLastSix: '',
    });
    setError(null);
  };

  const validateForm = () => {
    if (!formData.password || !passwordRequirements.length || !passwordRequirements.uppercase || 
        !passwordRequirements.lowercase || !passwordRequirements.number) {
      setError('Please ensure your password meets all requirements.');
      return false;
    }

    if (userType === 'staff') {
      if (!formData.parentName || !formData.parentEmail || !formData.gemsIdLastSix) {
        setError('Please fill in all required fields.');
        return false;
      }
      if (!formData.parentEmail.endsWith('@gemsedu.com')) {
        setError('Staff email must end with @gemsedu.com');
        return false;
      }
      if (!/^\d{6}$/.test(formData.gemsIdLastSix)) {
        setError('GEMS ID must be exactly 6 digits.');
        return false;
      }
    } else {
      if (!formData.parentName || !formData.parentEmail || !formData.studentName || 
          !formData.studentClass || !formData.studentSection || !formData.gemsIdLastSix) {
        setError('Please fill in all required fields.');
        return false;
      }
      if (!/^[A-Z]$/.test(formData.studentSection)) {
        setError('Section must be a single letter (A-Z).');
        return false;
      }
      if (!/^\d{6}$/.test(formData.gemsIdLastSix)) {
        setError('GEMS ID must be exactly 6 digits.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form data
      if (!validateForm()) {
        setLoading(false);
        return;
      }

      // Sign up the user
      const { data: signUpData, error: signUpError } = await signUpWithEmail(formData.parentEmail, formData.password);
      if (signUpError) {
        throw new Error(signUpError.message);
      }

      if (!signUpData?.user?.id) {
        throw new Error('User creation failed');
      }

      try {
        // Create user profile
        const profile = {
          id: signUpData.user.id,
          parent_name: formData.parentName,
          parent_email: formData.parentEmail,
          student_name: userType === 'staff' ? formData.parentName : formData.studentName,
          student_class: userType === 'staff' ? 'NA' : formData.studentClass,
          student_section: userType === 'staff' ? 'S' : formData.studentSection.charAt(0).toUpperCase(),
          gems_id_last_six: formData.gemsIdLastSix
        };

        const { error: profileError } = await createUserProfile(profile);
        if (profileError) {
          // If profile creation fails, delete the user and throw error
          await deleteAuthUser(signUpData.user.id);
          throw new Error(`Profile creation failed: ${profileError.message}`);
        }

        // Sign in the user after successful registration
        const { error: signInError } = await signInWithEmail(formData.parentEmail, formData.password);
        if (signInError) {
          throw new Error(`Sign in failed: ${signInError.message}`);
        }

        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } catch (error) {
        // If any error occurs after user creation but before successful profile creation,
        // attempt to delete the user to maintain consistency
        if (signUpData?.user?.id) {
          await deleteAuthUser(signUpData.user.id);
        }
        throw error;
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
      <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
        <FormLabel component="legend">I am a:</FormLabel>
        <RadioGroup
          row
          value={userType}
          onChange={handleUserTypeChange}
        >
          <FormControlLabel value="parent" control={<Radio />} label="Parent" />
          <FormControlLabel value="staff" control={<Radio />} label="Staff" />
        </RadioGroup>
      </FormControl>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Sign up successful! Redirecting to login...
        </Alert>
      )}

      <TextField
        fullWidth
        label={userType === 'staff' ? "Name" : "Parent Name"}
        name="parentName"
        value={formData.parentName}
        onChange={handleChange}
        margin="normal"
        required
      />

      <TextField
        fullWidth
        label={userType === 'staff' ? "Staff Email" : "Parent Email"}
        name="parentEmail"
        type="email"
        value={formData.parentEmail}
        onChange={handleChange}
        margin="normal"
        required
        helperText={userType === 'staff' ? "Must end with @gemsedu.com" : ""}
      />

      {userType === 'parent' && (
        <>
          <TextField
            fullWidth
            label="Student Name"
            name="studentName"
            value={formData.studentName}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            select
            fullWidth
            label="Class"
            name="studentClass"
            value={formData.studentClass}
            onChange={handleChange}
            margin="normal"
            required
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
            name="studentSection"
            value={formData.studentSection}
            onChange={handleChange}
            margin="normal"
            required
            inputProps={{ 
              maxLength: 1,
              style: { textTransform: 'uppercase' }
            }}
            helperText="Enter a single letter (A-Z)"
          />
        </>
      )}

      <TextField
        fullWidth
        label="Last 6 digits of GEMS ID"
        name="gemsIdLastSix"
        value={formData.gemsIdLastSix}
        onChange={handleChange}
        margin="normal"
        required
        inputProps={{ maxLength: 6 }}
        helperText="Enter only the last 6 digits"
      />

      <TextField
        fullWidth
        label="Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        margin="normal"
        required
      />

      <Fade in={formData.password.length > 0}>
        <List dense sx={{ bgcolor: 'background.paper', mb: 2 }}>
          <ListItem>
            <ListItemIcon>
              {passwordRequirements.length ? <CheckCircleOutline color="success" /> : <CancelOutlined color="error" />}
            </ListItemIcon>
            <ListItemText primary="At least 8 characters" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              {passwordRequirements.uppercase ? <CheckCircleOutline color="success" /> : <CancelOutlined color="error" />}
            </ListItemIcon>
            <ListItemText primary="At least one uppercase letter" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              {passwordRequirements.lowercase ? <CheckCircleOutline color="success" /> : <CancelOutlined color="error" />}
            </ListItemIcon>
            <ListItemText primary="At least one lowercase letter" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              {passwordRequirements.number ? <CheckCircleOutline color="success" /> : <CancelOutlined color="error" />}
            </ListItemIcon>
            <ListItemText primary="At least one number" />
          </ListItem>
        </List>
      </Fade>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Sign Up'}
      </Button>
    </Box>
  );
}

import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  FormLabel,
  Typography,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { signUpWithEmail, createUserProfile } from "../services/supabase";

export default function SignUpForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    role: "parent",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    details: {},
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Phone validation
    if (!/^05\d{8}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be 10 digits starting with 05";
    }

    // Email validation
    if (
      ["staff"].includes(formData.role) &&
      !formData.email.endsWith("@gemsedu.com")
    ) {
      newErrors.email = "Email must end with @gemsedu.com";
    }

    // Role-specific validations
    if (formData.role === "parent") {
      if (!/^[1-9]\d{5}$/.test(formData.details.student_gems_id)) {
        newErrors.student_gems_id = "Must be 6 digits starting with non-zero";
      }
      if (!/^[A-Z]$/.test(formData.details.student_section)) {
        newErrors.student_section = "Must be a single capital letter";
      }
    }

    if (formData.role === "staff") {
      if (!/^[1-9]\d{5}$/.test(formData.details.staff_gems_id)) {
        newErrors.staff_gems_id = "Must be 6 digits starting with non-zero";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // Sign up the user
      const { data: authData, error: authError } = await signUpWithEmail(
        formData.email,
        formData.password
      );
      if (authError) throw authError;

      // Create user profile
      const profileData = {
        id: authData.user.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        details: formData.details,
      };

      const { error: profileError } = await createUserProfile(profileData);
      if (profileError) throw profileError;

      // Handle successful signup (e.g., redirect to shop)
      console.log("User signed up and profile created successfully");
      navigate("/shop");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "role") {
      setFormData({
        ...formData,
        role: value,
        details: {},
      });
    } else if (name.startsWith("details.")) {
      setFormData({
        ...formData,
        details: {
          ...formData.details,
          [name.split(".")[1]]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleKeyPress = (e) => {
    const charCode = e.which || e.keyCode;
    const charStr = String.fromCharCode(charCode);
    if (!/[a-zA-Z]/.test(charStr)) {
      e.preventDefault();
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: 600, mx: "auto", p: 3 }}
    >
      <FormControl component="fieldset" margin="normal">
        <FormLabel component="legend">Role</FormLabel>
        <RadioGroup
          row
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
        >
          <FormControlLabel value="parent" control={<Radio />} label="Parent" />
          <FormControlLabel value="staff" control={<Radio />} label="Staff" />
          <FormControlLabel
            value="visitor"
            control={<Radio />}
            label="Visitor"
          />
        </RadioGroup>
      </FormControl>

      <TextField
        fullWidth
        margin="normal"
        required
        label="First Name"
        name="firstName"
        value={formData.firstName}
        onChange={handleChange}
      />

      <TextField
        fullWidth
        margin="normal"
        required
        label="Last Name"
        name="lastName"
        value={formData.lastName}
        onChange={handleChange}
      />

      <TextField
        fullWidth
        margin="normal"
        required
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        error={!!errors.email}
        helperText={errors.email}
      />

      <TextField
        fullWidth
        margin="normal"
        required
        label="Phone"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        error={!!errors.phone}
        helperText={errors.phone || "Format: 0512345678"}
      />

      {formData.role === "parent" && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Student Information
          </Typography>
          <TextField
            fullWidth
            margin="normal"
            required
            label="Student First Name"
            name="details.student_first_name"
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            required
            label="Student Last Name"
            name="details.student_last_name"
            onChange={handleChange}
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Class</InputLabel>
            <Select
              value={formData.details.student_class || ""}
              name="details.student_class"
              onChange={handleChange}
              label="Class"
            >
              <MenuItem value="KG1">KG1</MenuItem>
              <MenuItem value="KG2">KG2</MenuItem>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                <MenuItem key={grade} value={grade.toString()}>
                  {grade}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            margin="normal"
            required
            label="Student Section"
            name="details.student_section"
            onChange={handleChange}
            onInput={(e) => (e.target.value = e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            error={!!errors.student_section}
            helperText={errors.student_section || "Single capital letter"}
            inputProps={{ maxLength: 1 }}
          />
          <TextField
            fullWidth
            margin="normal"
            required
            label="Student GEMS ID"
            name="details.student_gems_id"
            onChange={handleChange}
            error={!!errors.student_gems_id}
            helperText={errors.student_gems_id}
            inputProps={{ maxLength: 6 }}
          />
        </Box>
      )}

      {formData.role === "staff" && (
        <TextField
          fullWidth
          margin="normal"
          required
          label="Staff GEMS ID"
          name="details.staff_gems_id"
          onChange={handleChange}
          error={!!errors.staff_gems_id}
          helperText={errors.staff_gems_id}
          inputProps={{ maxLength: 6 }}
        />
      )}

      <TextField
        fullWidth
        margin="normal"
        required
        label="Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
      />

      <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
        Sign Up
      </Button>
    </Box>
  );
}

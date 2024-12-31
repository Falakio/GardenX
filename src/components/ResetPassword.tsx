import React, { useState, useEffect } from 'react';
import { TextField, Button, Container, Alert } from '@mui/material';
import { supabase } from '../services/supabase';
import { useSearchParams } from 'react-router-dom';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [searchParams] = useSearchParams();

  const handleResetPassword = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'http://localhost:3000/reset-password' // Update this URL to your application's reset password URL
      });
      if (error) throw error;
      setMessage('A reset password link has been sent to your email.');
      setError('');
    } catch (error) {
      console.error('Error resetting password:', error);
      setError('Failed to send reset password email. Please try again.');
      setMessage('');
    }
  };

  const handleUpdatePassword = async () => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setMessage('Password updated successfully!');
      setError('');
    } catch (error) {
      console.error('Error updating password:', error);
      setError('Failed to update password. Please try again.');
      setMessage('');
    }
  };

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'recovery') {
      setIsPasswordReset(true);
    }
  }, [searchParams]);

  return (
    <Container maxWidth="sm">
      <h2>{isPasswordReset ? 'Update Password' : 'Reset Password'}</h2>
      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      {!isPasswordReset ? (
        <>
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
          />
          <Button variant="contained" color="primary" onClick={handleResetPassword}>
            Send Reset Link
          </Button>
        </>
      ) : (
        <>
          <TextField
            label="New Password"
            type="password"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            margin="normal"
          />
          <Button variant="contained" color="primary" onClick={handleUpdatePassword}>
            Update Password
          </Button>
        </>
      )}
    </Container>
  );
};

export default ResetPassword;
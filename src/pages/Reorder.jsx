import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, getOrderInfo, reorderItems } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

const Reorder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleReorder = async () => {
      if (!user) {
        setError('Please log in to reorder items.');
        setLoading(false);
        setTimeout(() => {
          navigate('/login');
        }, 5000);
        return;
      }

      try {
        await reorderItems(orderId);
        navigate('/orders');
      } catch (error) {
        console.error('Failed to reorder items:', error);
        setError('Failed to reorder items.');
      } finally {
        setLoading(false);
      }
    };

    handleReorder();
  }, [orderId, user, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return null;
};

export default Reorder;
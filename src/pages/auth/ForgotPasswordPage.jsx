import React from 'react';
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm';
import { useNavigate } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#070d1b] flex items-center justify-center px-4">
      <ForgotPasswordForm onBackToLogin={() => navigate('/login')} />
    </div>
  );
};

export default ForgotPasswordPage;


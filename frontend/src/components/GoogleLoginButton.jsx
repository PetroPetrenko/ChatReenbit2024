import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { GoogleOAuthProvider } from '@react-oauth/google';
import styles from './GoogleLoginButton.module.css';
import { toast } from 'react-toastify';
import { BACKEND_URL, CLIENT_ID } from '../config';
import useUserStore from '../stores/userStore';

const GoogleLoginButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, clearUser } = useUserStore();

  const handleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    try {
      console.log('Attempting Google Login with Credential:', {
        clientId: credentialResponse.clientId,
        credentialLength: credentialResponse.credential.length
      });
      
      const response = await fetch(`${BACKEND_URL}/api/auth/google-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          token: credentialResponse.credential  
        }),
      });

      console.log('Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google login failed: ${errorText || 'Unknown error'}`);
      }

      const userData = await response.json();
      
      // Store user information in global state and local storage
      setUser(userData.user);
      localStorage.setItem('user', JSON.stringify(userData.user));
      localStorage.setItem('token', userData.token);
      
      // Notify user of successful login
      toast.success('Logged in successfully', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Optional: Redirect or update app state
      // window.location.href = '/dashboard';
    } catch (error) {
      // Clear any existing user data on error
      clearUser();
      localStorage.removeItem('user');
      localStorage.removeItem('token');

      console.error('Google Login Error Details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });

      toast.error(`Login failed: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
        type: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = (errorResponse) => {
    console.error('Google Login Initial Error:', errorResponse);
    toast.error('Google Login Failed. Please try again.', {
      position: "top-right",
      autoClose: 5000,
      type: "error"
    });
  };

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <div className={styles.googleLoginContainer}>
        {isLoading ? (
          <div className={styles.loadingSpinner}>Loading...</div>
        ) : (
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            useOneTap
            type="standard"
            theme="filled_blue"
            size="large"
            text="signin_with"
            shape="rectangular"
            disabled={isLoading}
          />
        )}
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleLoginButton;

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import styles from './GoogleLoginButton.module.css';
import { frontendUrl } from '../../config/host.config';

const GOOGLE_CLIENT_ID = '961833498122-6v0avue7jpved9fovgl5gcnatrq12497.apps.googleusercontent.com';

const GoogleLoginButton = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const loadGoogleAuth = async () => {
      try {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://apis.google.com/js/platform.js';
          script.async = true;
          script.defer = true;
          script.onload = resolve;
          document.head.appendChild(script);
        });

        window.gapi.load('auth2', () => {
          window.gapi.auth2
            .init({
              client_id: GOOGLE_CLIENT_ID,
              cookiepolicy: 'single_host_origin',
              scope: 'profile email',
              ux_mode: 'popup',
              redirect_uri: `${frontendUrl}/auth/callback`,
              hosted_domain: 'localhost'
            })
            .then(() => {
              console.log('Google Auth initialized successfully');
            })
            .catch((error) => {
              console.error('Google Auth2 Initialization Error:', error);
              toast.error('Failed to initialize Google authentication');
            });
        });
      } catch (error) {
        console.error('Error loading Google Auth:', error);
        toast.error('Failed to load Google authentication');
      }
    };

    loadGoogleAuth();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const auth2 = window.gapi.auth2.getAuthInstance();
      const googleUser = await auth2.signIn({
        prompt: 'select_account'
      });
      
      const profile = googleUser.getBasicProfile();
      const userData = {
        googleId: profile.getId(),
        email: profile.getEmail(),
        name: profile.getName(),
        imageUrl: profile.getImageUrl()
      };

      const authResponse = googleUser.getAuthResponse();
      const token = authResponse.id_token;

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('google_token', token);

      navigate('/');
      toast.success('Successfully logged in!');
      
      // Try multiple methods to close the window
      if (window.opener) {
        window.opener.focus();
        window.close();
      } else if (window.parent !== window) {
        window.parent.focus();
        window.close();
      } else {
        window.close();
      }
    } catch (error) {
      console.error('Google Login Error:', error);
      if (error.error === 'popup_closed_by_user') {
        toast.info('Login cancelled');
      } else {
        toast.error('Failed to login with Google');
      }
    }
  };

  return (
    <button 
      className={styles.googleButton}
      onClick={handleGoogleLogin}
    >
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
        alt="Google logo" 
        className={styles.googleIcon}
      />
      Sign in with Google
    </button>
  );
};

export default GoogleLoginButton;

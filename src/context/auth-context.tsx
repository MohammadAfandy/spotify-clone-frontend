import { createContext, useState, useEffect } from 'react';
import ApiSpotify from '../utils/api-spotify';
import ApiBackend from '../utils/api-backend';
import {
  getCookie,
  removeCookie,
  setCookie,
  getHashValue,
} from '../utils/helpers';

import User from '../types/User';
import { ACCESS_TOKEN_AGE, REFRESH_TOKEN_AGE } from '../utils/constants';
import { toast } from '../utils/toast';

type AuthContextObj = {
  isLoggedIn: boolean;
  isPremium: boolean;
  user: User;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextObj>({
  isLoggedIn: false,
  isPremium: false,
  user: {} as User,
  logout: () => {},
});

const AuthProvider: React.FC = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    !!getCookie('is_logged_in')
  );
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [user, setUser] = useState<User>({} as User);

  const logout = async (): Promise<void> => {
    try {
      // to remove server side cookie refresh token
      await ApiBackend.post('/logout', {}, {
        withCredentials: true,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoggedIn(false);
      setIsPremium(false);
      setUser({} as User);
      removeCookie('access_token');
      removeCookie('country');
      removeCookie('is_logged_in');

      window.location.href = '/';
    }
  };

  useEffect(() => {
    // const { access_token, refresh_token, country } = getHashValue();
    const { error, access_token, country, product } = getHashValue();
    if (error) {
      toast.error(error);
    } else {
      if (access_token) {
        setCookie('access_token', access_token, { expires: ACCESS_TOKEN_AGE });
        // setCookie('refresh_token', refresh_token, { expires: REFRESH_TOKEN_AGE });
        setCookie('country', country, { expires: REFRESH_TOKEN_AGE });
        setCookie('is_logged_in', 'true', { expires: REFRESH_TOKEN_AGE });
        setIsLoggedIn(true);
        setIsPremium(product === 'premium');
      }
    }
    window.location.hash = '';
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (isLoggedIn) {
        try {
          const response = await ApiSpotify.get('/me');
          setUser(response.data);
          setIsPremium(response.data.product === 'premium');
          setCookie('country', response.data.country, { expires: REFRESH_TOKEN_AGE });
        } catch (error) {
          console.error(error);
        }
      }
    };

    fetchUser();
  }, [isLoggedIn]);

  const contextValue = {
    user,
    logout,
    isLoggedIn,
    isPremium,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;

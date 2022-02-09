import { createContext, useState, useEffect, useCallback } from 'react';
import ApiSpotify from '../utils/api-spotify';
import {
  getCookie,
  removeCookie,
  setCookie,
  getHashValue,
} from '../utils/helpers';

import User from '../types/User';
import Playlist from '../types/Playlist';
import Track from '../types/Track';
import { ACCESS_TOKEN_AGE, REFRESH_TOKEN_AGE } from '../utils/constants';

type AuthContextObj = {
  isLoggedIn: boolean;
  isPremium: boolean;
  user: User;
  logout: () => void;
  playlists: Playlist[];
  refreshPlaylists: () => void;
};

export const AuthContext = createContext<AuthContextObj>({
  isLoggedIn: false,
  isPremium: false,
  user: {} as User,
  logout: () => {},
  playlists: [],
  refreshPlaylists: () => {},
});

const AuthProvider: React.FC = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    !!getCookie('is_logged_in')
  );
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [user, setUser] = useState<User>({} as User);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [savedTracks, setSavedTracks] = useState<Track[]>([]);

  const logout = (): void => {
    setIsLoggedIn(false);
    setIsPremium(false);
    setPlaylists([]);
    setSavedTracks([]);
    setUser({} as User);
    // removeCookie('refresh_token');
    removeCookie('access_token');
    removeCookie('country');
    removeCookie('is_logged_in');
  };

  useEffect(() => {
    // const { access_token, refresh_token, country } = getHashValue();
    const { access_token, country, product } = getHashValue();
    if (access_token) {
      setCookie('access_token', access_token, { expires: ACCESS_TOKEN_AGE });
      // setCookie('refresh_token', refresh_token, { expires: REFRESH_TOKEN_AGE });
      setCookie('country', country, { expires: REFRESH_TOKEN_AGE });
      setCookie('is_logged_in', 'true', { expires: REFRESH_TOKEN_AGE });
      setIsLoggedIn(true);
      setIsPremium(product === 'premium');
      window.location.hash = '';
    }
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

  const refreshPlaylists = useCallback(async () => {
    try {
      const response = await ApiSpotify.get('/me/playlists', {
        params: { limit: 20 },
      });
      setPlaylists(response.data.items);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const contextValue = {
    user,
    logout,
    isLoggedIn,
    isPremium,
    playlists,
    refreshPlaylists,
    savedTracks,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;

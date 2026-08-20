import React, {
  createContext,
  useState,
  useEffect
} from 'react';

import API from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(() => {

    const savedUser =
      localStorage.getItem('user');

    try {
      return savedUser
        ? JSON.parse(savedUser)
        : null;
    } catch (error) {
      console.error(
        'Failed to parse saved user:',
        error
      );

      localStorage.removeItem('user');

      return null;
    }

  });

  const [token, setToken] = useState(
    localStorage.getItem('token') || null
  );

  const [loading, setLoading] =
    useState(true);


  // ============================================================
  // RESTORE AUTH STATE
  // ============================================================

  useEffect(() => {

    const savedToken =
      localStorage.getItem('token');

    const savedUser =
      localStorage.getItem('user');

    if (savedToken) {
      setToken(savedToken);
    }

    if (savedUser) {

      try {

        setUser(
          JSON.parse(savedUser)
        );

      } catch (error) {

        console.error(
          'Invalid saved user:',
          error
        );

        localStorage.removeItem('user');

        setUser(null);
      }
    }

    setLoading(false);

  }, []);


  // ============================================================
  // SAVE TOKEN
  // ============================================================

  useEffect(() => {

    if (token) {

      localStorage.setItem(
        'token',
        token
      );

    } else {

      localStorage.removeItem(
        'token'
      );

    }

  }, [token]);


  // ============================================================
  // SAVE USER
  // ============================================================

  useEffect(() => {

    if (user) {

      localStorage.setItem(
        'user',
        JSON.stringify(user)
      );

    } else {

      localStorage.removeItem(
        'user'
      );

    }

  }, [user]);


  // ============================================================
  // LOGIN
  // ============================================================

  const login = (
    userData,
    authToken
  ) => {

    console.log(
      'LOGIN USER:',
      userData
    );

    console.log(
      'LOGIN ROLE:',
      userData?.role
    );

    setUser(userData);
    setToken(authToken);

  };


  // ============================================================
  // REGISTER
  // ============================================================

  const register = async (
    userData
  ) => {

    const response =
      await API.post(
        '/auth/register',
        userData
      );

    const data =
      response.data;

    const userToken =
      data.token ||
      data.access_token;

    if (
      userToken &&
      data.user
    ) {

      setToken(userToken);
      setUser(data.user);

    }

    return data;

  };


  // ============================================================
  // LOGOUT
  // ============================================================

  const logout = () => {

    setToken(null);
    setUser(null);

    localStorage.removeItem(
      'token'
    );

    localStorage.removeItem(
      'user'
    );

  };


  // ============================================================
  // CONTEXT
  // ============================================================

  return (

    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        loading
      }}
    >

      {children}

    </AuthContext.Provider>

  );

};

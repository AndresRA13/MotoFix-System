import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../firebase/config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: res.user };
    } catch (err) {
      console.error('Login error:', err);
      let message = 'Error al iniciar sesión';
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found'
      ) {
        message = 'Correo o contraseña incorrectos';
      } else if (err.code === 'auth/invalid-email') {
        message = 'El formato del correo es inválido';
      }
      return { success: false, error: message };
    }
  };

  const register = async (email, password) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      return { success: true, user: res.user };
    } catch (err) {
      console.error('Register error:', err);
      let message = 'Error al registrar la cuenta';
      if (err.code === 'auth/email-already-in-use') {
        message = 'El correo electrónico ya está registrado';
      } else if (err.code === 'auth/weak-password') {
        message = 'La contraseña debe tener al menos 6 caracteres';
      } else if (err.code === 'auth/invalid-email') {
        message = 'El correo electrónico no es válido';
      }
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (err) {
      console.error('Logout error:', err);
      return { success: false, error: err.message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


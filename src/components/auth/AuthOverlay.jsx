import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function AuthOverlay() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { showToast } = useToast();
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Por favor completa todos los campos', 'danger');
      return;
    }

    setSubmitting(true);
    if (isLoginTab) {
      const res = await login(email, password);
      if (res.success) {
        showToast('¡Sesión iniciada correctamente!');
        navigate('/dashboard');
      } else {
        showToast(res.error, 'danger');
      }
    } else {
      const res = await register(email, password);
      if (res.success) {
        showToast('¡Cuenta creada e ingreso exitoso!');
        navigate('/dashboard');
      } else {
        showToast(res.error, 'danger');
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,#111827_0%,#090d16_100%)] z-[9999] flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-dark-card border border-dark-border rounded-xl w-full max-w-md p-8 shadow-2xl flex flex-col gap-5 relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-amber-500 before:to-amber-600">
        <div className="text-center">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 text-black rounded-xl flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(245,158,11,0.25)] mx-auto mb-3">
            <i className="fa-solid fa-motorcycle"></i>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            MOTO<span className="text-amber-500">FIX</span> PRO
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Sistema de Gestión de Taller & Repuestos
          </p>
        </div>

        <div className="flex bg-black/30 p-1 rounded-lg border border-dark-border gap-1">
          <button
            type="button"
            className={`flex-1 py-2 text-center text-xs font-bold rounded-md transition-all cursor-pointer ${
              isLoginTab ? 'bg-amber-500 text-black shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setIsLoginTab(true)}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-center text-xs font-bold rounded-md transition-all cursor-pointer ${
              !isLoginTab ? 'bg-amber-500 text-black shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setIsLoginTab(false)}
          >
            Crear Cuenta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
              <i className="fa-solid fa-envelope text-amber-500"></i> Correo Electrónico
            </label>
            <input
              type="email"
              className="w-full bg-white/[0.03] border border-dark-border rounded-lg px-3.5 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all placeholder:text-gray-500"
              placeholder={isLoginTab ? 'admin@motofix.com' : 'nuevo.usuario@motofix.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
              <i className="fa-solid fa-key text-amber-500"></i> Contraseña
            </label>
            <input
              type="password"
              className="w-full bg-white/[0.03] border border-dark-border rounded-lg px-3.5 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all placeholder:text-gray-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 mt-2 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-black font-bold text-sm shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:brightness-110 hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            disabled={submitting}
          >
            <i className={`fa-solid ${isLoginTab ? 'fa-right-to-bracket' : 'fa-user-plus'}`}></i>
            {submitting
              ? ' Procesando...'
              : isLoginTab
              ? ' INGRESAR AL SISTEMA'
              : ' CREAR CUENTA Y ENTRAR'}
          </button>
        </form>
      </div>
    </div>
  );
}

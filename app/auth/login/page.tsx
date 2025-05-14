'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/app/components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (data: { email: string; password: string }) => {
    console.log('[FRONT] Iniciando login con datos:', data);
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      const result = await response.json();
      console.log('[FRONT] Respuesta del servidor:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Credenciales incorrectas');
      }

      console.log('[FRONT] Configurando cookie con token');
      document.cookie = `token=${result.token}; path=/; max-age=86400; SameSite=Lax${
        window.location.protocol === 'https:' ? '; Secure' : ''
      }`;

      console.log('[FRONT] Redirigiendo a dashboard');
      router.push('/dashboard/user');
      
    } catch (err: any) {
      console.error('[FRONT] Error en login:', err);
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold text-center">Iniciar Sesión</h1>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <LoginForm 
          onSubmit={handleLogin} 
          isSubmitting={isSubmitting} 
        />
      </div>
    </div>
  );
}
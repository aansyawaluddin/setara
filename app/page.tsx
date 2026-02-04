'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Poppins, Kaushan_Script } from 'next/font/google';
import { supabase } from '@/lib/supabase';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const kaushan = Kaushan_Script({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-kaushan',
});

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [isButtonHovered, setIsButtonHovered] = useState(false);

  const redirectBasedOnRole = async (userId: string) => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('profiles')
        .select('role, is_active')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        setErrorMsg(`Error Database: ${error.message}`);
        setLoading(false);
        return;
      }

      if (!data) {
        setErrorMsg("Data profil tidak ditemukan.");
        setLoading(false);
        return;
      }

      if (!data.is_active) {
        setErrorMsg("Akun nonaktif.");
        setLoading(false);
        return;
      }

      const routes: Record<string, string> = {
        super_admin: '/super_admin/dashboard',
        kepala_dinas: '/kepala_dinas/dashboard',
        staff: '/staff/dashboard',
      };

      const targetRoute = routes[data.role] || '/staff/dashboard';

      router.replace(targetRoute);

    } catch (err) {
      setErrorMsg("Gagal memproses role.");
      setLoading(false);
    } finally {
    }
  };


  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          await redirectBasedOnRole(data.session.user.id);
        } else {
          setCheckingSession(false);
        }
      } catch (error) {
        setCheckingSession(false);
      }
    };

    checkUserSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;

      if (data.user) {
        await redirectBasedOnRole(data.user.id);
      }

    } catch (error: any) {
      let message = error.message;
      if (message === 'Invalid login credentials') {
        message = 'Email atau Password salah.';
      }
      setErrorMsg(message);
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}>
        <Loader2 size={40} className="animate-spin text-[#007bff]" />
      </div>
    );
  }

  return (
    <div className={poppins.className} style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', backgroundColor: '#ffffff' }}>

      {/* Loading Overlay */}
      {loading && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#ffffff', padding: '32px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <Loader2 size={48} className="animate-spin text-[#007bff]" style={{ marginBottom: '16px' }} />
            <p style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Sedang Memproses...</p>
            <p style={{ fontSize: '14px', color: '#9ca3af' }}>Mohon tunggu sebentar</p>
          </div>
        </div>
      )}

      {/* Bagian Kiri (Desktop Only) */}
      <div className="hidden lg:flex" style={{
        width: '50%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #172433 30%, #3D4650 61%, #3D4650 74%, #172433 85%)',
        padding: '48px',
        color: '#ffffff',
        position: 'relative'
      }}>
        <div style={{ position: 'relative', marginBottom: '24px', width: '100%', maxWidth: '450px', zIndex: 10 }}>
          <Image
            src="/icon/ilustrasi.svg"
            alt="Ilustrasi Login"
            width={500}
            height={500}
            priority
            style={{ width: '100%', height: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 10px 8px rgb(0 0 0 / 0.2))' }}
          />
        </div>

        <div style={{ textAlign: 'center', zIndex: 10, width: '100%' }}>
          <h1 className={kaushan.className} style={{ fontSize: '60px', marginBottom: '8px' }}>Simreda</h1>
          <p style={{
            fontSize: '16px',
            fontWeight: '300',
            opacity: 0.9,
            letterSpacing: '0.05em',
            margin: '0 auto',
            whiteSpace: 'nowrap'
          }}>
            Sistem Informasi Manajemen Retribusi Daerah
          </p>
        </div>
      </div>

      {/* Bagian Kanan (Form) */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 40px',
        height: '100%',
        backgroundColor: '#ffffff'
      }}>
        <div style={{ width: '100%', maxWidth: '450px', margin: '0 auto' }}>

          {/* Header Mobile */}
          <div className="lg:hidden" style={{ marginBottom: '32px', textAlign: 'center' }}>
            <h1 className={kaushan.className} style={{ fontSize: '48px', color: '#007bff' }}>Simreda</h1>
            <p style={{
              fontSize: '11px',
              color: '#9ca3af',
              marginTop: '4px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              Sistem Informasi Manajemen Retribusi Daerah
            </p>
          </div>

          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <h2 className={kaushan.className} style={{ fontSize: '40px', color: '#111827', marginBottom: '8px' }}>
              Welcome Back!
            </h2>
            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>
              Masukkan Email dan Password untuk Mengakses.
            </p>
          </div>

          {/* Pesan Error */}
          {errorMsg && (
            <div style={{
              marginBottom: '16px', padding: '12px', borderRadius: '8px',
              backgroundColor: '#fef2f2', border: '1px solid #fecaca',
              color: '#dc2626', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <span style={{ fontWeight: 'bold' }}>Error:</span> {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Input Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="email" style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>Email</label>
              <input
                id="email"
                type="email"
                placeholder="Masukkan Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: '8px',
                  backgroundColor: '#f3f4f6', border: '1px solid transparent', outline: 'none',
                  fontSize: '14px', color: '#374151'
                }}
              />
            </div>

            {/* Input Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="password" style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '12px 48px 12px 16px', borderRadius: '8px',
                    backgroundColor: '#f3f4f6', border: '1px solid transparent', outline: 'none',
                    fontSize: '14px', color: '#374151'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ paddingTop: '16px' }}>
              <button
                type="submit"
                disabled={loading}
                onMouseEnter={() => setIsButtonHovered(true)}
                onMouseLeave={() => setIsButtonHovered(false)}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: loading ? '#9ca3af' : (isButtonHovered ? 'rgba(23, 36, 51, 0.9)' : '#172433'),
                  color: '#ffffff',
                  border: 'none',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Memuat...' : 'Masuk'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
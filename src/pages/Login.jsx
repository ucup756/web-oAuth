import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user) {
    navigate("/dashboard");
    return null;
  }

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard");
    } catch (err) {
      if (err.code === "auth/popup-closed-by-user") {
        setError("Login dibatalkan. Silakan coba lagi.");
      } else {
        setError("Login gagal: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">

      {/* LEFT PANEL */}
      <div className="login-left">
        <div className="geo-bg">
          <div className="geo-ring" />
          <div className="geo-ring" />
          <div className="geo-ring" />
          <div className="geo-dot" />
          <div className="geo-dot" />
          <div className="geo-dot" />
        </div>

        <div className="left-brand">
          <div className="brand-mark">
            <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="5" r="3" fill="white" opacity="0.9"/>
              <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.9"/>
            </svg>
          </div>
          <span className="brand-name">OAuth Demo</span>
        </div>

        <div className="left-headline">
          <h2>
            Autentikasi<br />
            yang <em>aman</em><br />
            &amp; modern
          </h2>
          <p className="left-desc">
            Implementasi Google OAuth 2.0 menggunakan React, Firebase Auth, dan Vite.
            Siap deploy ke Vercel.
          </p>
        </div>

        <div className="left-feature">
          <ul className="feature-list">
            <li className="feature-item">
              <span className="feature-check">✓</span>
              Login tanpa password dengan Google
            </li>
            <li className="feature-item">
              <span className="feature-check">✓</span>
              Token dikelola otomatis oleh Firebase
            </li>
            <li className="feature-item">
              <span className="feature-check">✓</span>
              Protected routes &amp; auth state persisten
            </li>
            <li className="feature-item">
              <span className="feature-check">✓</span>
              Deploy ke Vercel dalam 1 menit
            </li>
          </ul>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="login-right">
        <div className="login-card">
          <div className="card-pill">
            <span className="pill-dot" />
            <span className="pill-text">Masuk ke Akun</span>
          </div>

          <h1 className="card-title">
            Halo,<br /><em>Selamat Datang</em>
          </h1>
          <p className="card-subtitle">
            Masuk menggunakan akun Google kamu untuk melanjutkan ke aplikasi.
          </p>

          <div className="card-divider">
            <span>Lanjutkan dengan</span>
          </div>

          {error && <div className="error-box">{error}</div>}

          <button
            className="google-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loading">
                <span className="mini-spinner" />
                Menghubungkan ke Google...
              </span>
            ) : (
              <span className="btn-content">
                <span className="btn-icon-wrap">
                  <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </span>
                <span className="btn-text-wrap">
                  <span className="btn-label">Masuk dengan Google</span>
                  <span className="btn-sublabel">Aman &amp; terenkripsi</span>
                </span>
                <span className="btn-arrow">→</span>
              </span>
            )}
          </button>

          <p className="login-note">
            Dengan masuk, kamu menyetujui penggunaan akun Google untuk autentikasi.
            Kami tidak menyimpan password kamu.
          </p>
        </div>
      </div>

    </div>
  );
}

import { useState, useEffect } from "react";
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
          <div className="geo-line" />
          <div className="geo-line" />
        </div>

        <div className="left-brand">
          <span className="left-brand-dot" />
          OAuth Demo
        </div>

        <div className="left-headline">
          <h2>
            Masuk dengan<br />
            <em>aman & mudah</em><br />
            menggunakan Google
          </h2>
          <p className="left-tagline">— Powered by Firebase Auth v2</p>
        </div>

        <div className="tech-stack">
          <span className="tech-badge">React 19</span>
          <span className="tech-badge">Firebase Auth</span>
          <span className="tech-badge">OAuth 2.0</span>
          <span className="tech-badge">Vite 8</span>
          <span className="tech-badge">Vercel</span>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="login-right">
        <div className="login-card">
          <p className="card-eyebrow">Autentikasi</p>
          <h1 className="card-title">
            Selamat<br /><em>Datang</em>
          </h1>
          <p className="card-subtitle">
            Masuk untuk melanjutkan ke aplikasi
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
                  <span className="btn-sublabel">google.com/accounts</span>
                </span>
                <span className="btn-arrow">→</span>
              </span>
            )}
          </button>

          <p className="login-note">
            Dengan masuk, kamu menyetujui penggunaan akun Google untuk autentikasi.
            Kami tidak menyimpan password. Data kamu aman.
          </p>
        </div>
      </div>

    </div>
  );
}

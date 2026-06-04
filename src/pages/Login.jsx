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

  // Kalau sudah login, langsung ke dashboard
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
      <div className="login-card">
        {/* Logo / Icon */}
        <div className="login-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="8" r="4" fill="#4285F4"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#4285F4" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        <h1>Selamat Datang</h1>
        <p className="subtitle">Masuk untuk melanjutkan ke aplikasi</p>

        {error && <div className="error-box">{error}</div>}

        <button
          className="google-btn"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? (
            <span className="btn-loading">
              <span className="mini-spinner" />
              Menghubungkan...
            </span>
          ) : (
            <span className="btn-content">
              {/* Google Icon SVG */}
              <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Masuk dengan Google
            </span>
          )}
        </button>

        <p className="login-note">
          Kami hanya menggunakan akun Google kamu untuk autentikasi.
          Data kamu aman.
          Created by Ahmad Yusuf Kurniawan
        </p>
      </div>
    </div>
  );
}

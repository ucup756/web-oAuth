import { useState, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  CHAR_SETS,
  imageToAscii,
  asciiToCanvas,
  downloadTxt,
  downloadPng,
  fileToDataUrl,
} from "../utils/asciiConverter";
import "./Dashboard.css";

const CHAR_SET_LABELS = {
  standard: "@#%+=-.  (standar)",
  detailed: "@#&$%?!;: (detail)",
  block:    "█▓▒░  (blok)",
  binary:   "1 0  (biner)",
  minimal:  "@+.  (minimal)",
};

const COLOR_MODES = [
  { value: "none",  label: "Hijau klasik" },
  { value: "white", label: "Putih" },
  { value: "purple",label: "Ungu" },
  { value: "color", label: "Warna asli" },
];

const FG_COLORS = {
  none:   "#a3e635",
  white:  "#f0f0f0",
  purple: "#c084fc",
  color:  "#ffffff",
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [imageSrc, setImageSrc]     = useState(null);
  const [imageFile, setImageFile]   = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [converting, setConverting] = useState(false);
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState("");
  const [copied, setCopied]         = useState(false);
  const [history, setHistory]       = useState([]);

  const [opts, setOpts] = useState({
    width:     80,
    contrast:  1.1,
    invert:    false,
    charSet:   "standard",
    colorMode: "none",
  });

  const fileInputRef = useRef(null);
  const outputRef    = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const processFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith("image/")) {
      setError("File harus berupa gambar (JPG, PNG, WEBP).");
      return;
    }
    setError("");
    setResult(null);
    try {
      const src = await fileToDataUrl(file);
      setImageSrc(src);
      setImageFile(file);
    } catch {
      setError("Gagal membaca file.");
    }
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files[0]) processFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = ()  => setIsDragging(false);

  const handleConvert = async () => {
    if (!imageSrc) { setError("Pilih foto terlebih dahulu."); return; }
    setConverting(true);
    setError("");
    try {
      const res = await imageToAscii(imageSrc, {
        width:     opts.width,
        contrast:  opts.contrast,
        invert:    opts.invert,
        charSet:   opts.charSet,
        colorMode: opts.colorMode,
      });
      setResult(res);
      setHistory((prev) => [
        {
          id:        Date.now(),
          name:      imageFile?.name ?? "gambar",
          src:       imageSrc,
          result:    res,
          opts:      { ...opts },
          timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        },
        ...prev.slice(0, 4),
      ]);
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      setError("Konversi gagal: " + err.message);
    } finally {
      setConverting(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!result) return;
    const name = (imageFile?.name ?? "ascii-art").replace(/\.[^.]+$/, "");
    downloadTxt(result.text, `${name}.txt`);
  };

  const handleDownloadPng = () => {
    if (!result) return;
    const fgColor = FG_COLORS[opts.colorMode] ?? FG_COLORS.none;
    const canvas  = asciiToCanvas(result.lines, result.colorData, {
      fontSize:  7,
      bgColor:   "#0f0a1e",
      fgColor,
      colorMode: opts.colorMode,
    });
    const name = (imageFile?.name ?? "ascii-art").replace(/\.[^.]+$/, "");
    downloadPng(canvas, `${name}.png`);
  };

  const loadHistory = (item) => {
    setImageSrc(item.src);
    setResult(item.result);
    setOpts(item.opts);
  };

  const setOpt = (key, value) => setOpts((p) => ({ ...p, [key]: value }));

  return (
    <div className="dash-wrapper">
      <nav className="dash-nav">
        <div className="dash-nav-brand">
          <div className="dash-brand-icon">{"{ }"}</div>
          <span>ASCII Art Studio</span>
        </div>
        <div className="dash-nav-right">
          {user?.photoURL && (
            <img src={user.photoURL} alt="avatar" className="dash-avatar" referrerPolicy="no-referrer" />
          )}
          <span className="dash-username">{user?.displayName ?? user?.email}</span>
          <button className="dash-logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="dash-layout">
        <aside className="dash-sidebar">
          <div className="dash-card">
            <div className="dash-card-header">
              <span className="dash-card-title">Upload Foto</span>
              <span className="dash-badge">JPG · PNG · WEBP</span>
            </div>
            <div className="dash-card-body">
              <div
                className={`dash-upload-zone ${isDragging ? "dragging" : ""} ${imageSrc ? "has-image" : ""}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                {imageSrc ? (
                  <img src={imageSrc} alt="preview" className="dash-preview-img" />
                ) : (
                  <>
                    <div className="dash-upload-icon">📷</div>
                    <p className="dash-upload-text">Drag & drop foto di sini</p>
                    <p className="dash-upload-hint">atau klik untuk pilih file</p>
                  </>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              {imageSrc && (
                <button
                  className="dash-change-btn"
                  onClick={() => { setImageSrc(null); setImageFile(null); setResult(null); }}
                >
                  Ganti foto
                </button>
              )}
            </div>
          </div>

          <div className="dash-card">
            <div className="dash-card-header">
              <span className="dash-card-title">Pengaturan</span>
            </div>
            <div className="dash-card-body">
              <div className="dash-control-group">
                <div className="dash-control-row">
                  <label className="dash-control-label">Lebar</label>
                  <input
                    type="range" min="40" max="160" step="10"
                    value={opts.width}
                    onChange={(e) => setOpt("width", Number(e.target.value))}
                    className="dash-slider"
                  />
                  <span className="dash-control-val">{opts.width}</span>
                </div>

                <div className="dash-control-row">
                  <label className="dash-control-label">Kontras</label>
                  <input
                    type="range" min="0.5" max="2.5" step="0.1"
                    value={opts.contrast}
                    onChange={(e) => setOpt("contrast", Number(e.target.value))}
                    className="dash-slider"
                  />
                  <span className="dash-control-val">{opts.contrast.toFixed(1)}</span>
                </div>

                <div className="dash-control-row" style={{ alignItems: "flex-start" }}>
                  <label className="dash-control-label" style={{ paddingTop: 4 }}>Karakter</label>
                  <div className="dash-char-chips">
                    {Object.keys(CHAR_SETS).map((key) => (
                      <button
                        key={key}
                        className={`dash-char-chip ${opts.charSet === key ? "active" : ""}`}
                        onClick={() => setOpt("charSet", key)}
                      >
                        {CHAR_SET_LABELS[key]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="dash-control-row" style={{ alignItems: "flex-start" }}>
                  <label className="dash-control-label" style={{ paddingTop: 4 }}>Warna</label>
                  <div className="dash-char-chips">
                    {COLOR_MODES.map((m) => (
                      <button
                        key={m.value}
                        className={`dash-char-chip ${opts.colorMode === m.value ? "active" : ""}`}
                        onClick={() => setOpt("colorMode", m.value)}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="dash-control-row">
                  <label className="dash-control-label">Invert</label>
                  <label className="dash-toggle">
                    <input
                      type="checkbox"
                      checked={opts.invert}
                      onChange={(e) => setOpt("invert", e.target.checked)}
                    />
                    <span className="dash-toggle-track" />
                  </label>
                </div>
              </div>

              {error && <p className="dash-error">{error}</p>}

              <button
                className="dash-convert-btn"
                onClick={handleConvert}
                disabled={converting || !imageSrc}
              >
                {converting ? (
                  <><span className="dash-spinner" /> Mengkonversi...</>
                ) : (
                  "✦ Konversi ke ASCII"
                )}
              </button>
            </div>
          </div>

          {history.length > 0 && (
            <div className="dash-card">
              <div className="dash-card-header">
                <span className="dash-card-title">Riwayat</span>
              </div>
              <div className="dash-card-body" style={{ padding: "8px 16px" }}>
                {history.map((item) => (
                  <div key={item.id} className="dash-history-item" onClick={() => loadHistory(item)}>
                    <img src={item.src} alt={item.name} className="dash-history-thumb" />
                    <div className="dash-history-info">
                      <div className="dash-history-name">{item.name}</div>
                      <div className="dash-history-meta">
                        {item.timestamp} · {item.result.cols}×{item.result.rows}
                      </div>
                    </div>
                    <span className="dash-history-arrow">›</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        <main className="dash-main" ref={outputRef}>
          {!result ? (
            <div className="dash-empty">
              <div className="dash-empty-art">
                {`@@@##%%\n@@##%%+\n@##%++=\n##%++=-\n#%++=-.`}
              </div>
              <p className="dash-empty-text">Upload foto & klik Konversi untuk memulai</p>
            </div>
          ) : (
            <div className="dash-card dash-output-card">
              <div className="dash-card-header">
                <span className="dash-card-title">Hasil ASCII Art</span>
                <span className="dash-badge">{result.cols} × {result.rows} karakter</span>
              </div>
              <div className="dash-card-body">
                <div
                  className="dash-ascii-output"
                  style={{ color: FG_COLORS[opts.colorMode] ?? FG_COLORS.none }}
                >
                  {result.text}
                </div>
                <div className="dash-output-actions">
                  <button className="dash-out-btn" onClick={handleCopy}>
                    {copied ? "✓ Tersalin!" : "Salin teks"}
                  </button>
                  <button className="dash-out-btn" onClick={handleDownloadTxt}>
                    Download .txt
                  </button>
                  <button className="dash-out-btn dash-out-btn-primary" onClick={handleDownloadPng}>
                    Simpan PNG
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

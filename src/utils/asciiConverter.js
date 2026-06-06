const CHAR_SETS = {
  standard: '@#S%?*+;:,. ',
  detailed: '@#&$%?!;:~-,. ',
  block:    '█▓▒░ ',
  binary:   '10 ',
  minimal:  '@+. ',
};

/**
 * Hitung aspect ratio karakter monospace di browser.
 * Rata-rata charHeight/charWidth ≈ 1.6–2.0 tergantung font.
 * Kita ukur langsung pakai canvas supaya akurat.
 */
function getCharAspectRatio(fontSize = 10, fontFamily = 'monospace') {
  const canvas = document.createElement('canvas');
  const ctx    = canvas.getContext('2d');
  ctx.font     = `${fontSize}px ${fontFamily}`;
  const charW  = ctx.measureText('W').width;
  const charH  = fontSize * 1.2; // line-height 1.2
  return charH / charW; // biasanya ~1.8–2.0
}

/**
 * Konversi gambar ke ASCII art.
 * @param {string} imageSrc  - data URL atau URL gambar
 * @param {object} options
 *   width      {number}  kolom karakter (default 100)
 *   contrast   {number}  faktor kontras 0.5–2.5 (default 1.1)
 *   invert     {boolean} balik gelap-terang (default false)
 *   charSet    {string}  key dari CHAR_SETS (default 'standard')
 *   colorMode  {string}  'none'|'white'|'purple'|'color' (default 'none')
 */
function imageToAscii(imageSrc, options = {}) {
  return new Promise((resolve, reject) => {
    const {
      width      = 100,
      contrast   = 1.1,
      invert     = false,
      charSet    = 'standard',
      colorMode  = 'none',
    } = options;

    const img        = new Image();
    img.crossOrigin  = 'anonymous';

    img.onload = () => {
      // ── Hitung dimensi dengan aspect ratio correction ──
      const aspectRatio    = getCharAspectRatio();   // charH / charW
      const imgAspect      = img.height / img.width; // tinggi / lebar gambar
      const cols           = width;
      // Bagi dengan aspectRatio supaya hasil tidak memanjang
      const rows           = Math.floor(cols * imgAspect / aspectRatio);

      const canvas         = document.createElement('canvas');
      canvas.width         = cols;
      canvas.height        = rows;

      const ctx            = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, cols, rows);

      const imageData      = ctx.getImageData(0, 0, cols, rows);
      const pixels         = imageData.data;
      const chars          = CHAR_SETS[charSet] ?? CHAR_SETS.standard;
      const maxIndex       = chars.length - 1;

      const asciiLines     = [];
      const colorData      = [];

      for (let y = 0; y < rows; y++) {
        let line      = '';
        const lineClr = [];

        for (let x = 0; x < cols; x++) {
          const idx = (y * cols + x) * 4;
          const r   = pixels[idx];
          const g   = pixels[idx + 1];
          const b   = pixels[idx + 2];

          // Luminance perceptual
          let brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

          // Terapkan kontras
          brightness = Math.min(1, Math.max(0,
            (brightness - 0.5) * contrast + 0.5
          ));

          if (invert) brightness = 1 - brightness;

          const charIndex = Math.floor(brightness * maxIndex);
          line += chars[charIndex];

          if (colorMode === 'color') lineClr.push({ r, g, b });
        }

        asciiLines.push(line);
        if (colorMode === 'color') colorData.push(lineClr);
      }

      resolve({
        text:      asciiLines.join('\n'),
        lines:     asciiLines,
        colorData,
        cols,
        rows,
      });
    };

    img.onerror = () => reject(new Error('Gagal memuat gambar.'));
    img.src     = imageSrc;
  });
}

/**
 * Render ASCII art ke Canvas (untuk download PNG).
 */
function asciiToCanvas(lines, colorData = [], options = {}) {
  const {
    fontSize   = 7,
    fontFamily = 'monospace',
    bgColor    = '#0f0a1e',
    fgColor    = '#a3e635',
    colorMode  = 'none',
  } = options;

  const canvas  = document.createElement('canvas');
  const ctx     = canvas.getContext('2d');

  ctx.font      = `${fontSize}px ${fontFamily}`;
  const charW   = ctx.measureText('W').width;
  const charH   = fontSize * 1.2;
  const cols    = lines[0]?.length ?? 0;
  const rows    = lines.length;

  canvas.width  = Math.ceil(cols * charW);
  canvas.height = Math.ceil(rows * charH);

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font      = `${fontSize}px ${fontFamily}`;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (colorMode === 'color' && colorData[y]?.[x]) {
        const { r, g, b } = colorData[y][x];
        ctx.fillStyle = `rgb(${r},${g},${b})`;
      } else {
        ctx.fillStyle = fgColor;
      }
      ctx.fillText(
        lines[y][x] ?? ' ',
        x * charW,
        (y + 1) * charH - fontSize * 0.15,
      );
    }
  }

  return canvas;
}

/**
 * Copy ke clipboard dalam format yang kompatibel dengan
 * WhatsApp, Telegram, Notes, dll.
 *
 * Trik: gunakan <pre> agar browser menjaga whitespace saat
 * copy sebagai HTML, dan plain text fallback tetap ada.
 * Di WhatsApp desktop hasil lebih rapi karena menghormati
 * spasi. Di WhatsApp mobile hasilnya memang terbatas karena
 * app tidak mendukung monospace — solusi terbaik tetap PNG.
 */
async function copyAsciiToClipboard(text) {
  // Bungkus dengan tag <pre> dan font monospace
  const html = `<pre style="font-family:monospace;font-size:10px;line-height:1.1;letter-spacing:0;">${text}</pre>`;

  try {
    // Clipboard API modern — support HTML + plain text sekaligus
    const htmlBlob  = new Blob([html], { type: 'text/html' });
    const textBlob  = new Blob([text], { type: 'text/plain' });
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html':  htmlBlob,
        'text/plain': textBlob,
      }),
    ]);
    return true;
  } catch {
    // Fallback ke plain text jika ClipboardItem tidak tersedia
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }
}

/** Download sebagai file .txt */
function downloadTxt(text, filename = 'ascii-art.txt') {
  const blob = new Blob([text], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Download Canvas sebagai .png */
function downloadPng(canvas, filename = 'ascii-art.png') {
  canvas.toBlob((blob) => {
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  });
}

/** Konversi File object ke data URL */
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader     = new FileReader();
    reader.onload    = (e) => resolve(e.target.result);
    reader.onerror   = () => reject(new Error('Gagal membaca file.'));
    reader.readAsDataURL(file);
  });
}

export {
  CHAR_SETS,
  imageToAscii,
  asciiToCanvas,
  copyAsciiToClipboard,
  downloadTxt,
  downloadPng,
  fileToDataUrl,
};

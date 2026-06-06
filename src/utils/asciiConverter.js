const CHAR_SETS = {
  standard: '@#S%?*+;:,. ',
  detailed: '@#&$%?!;:~-,. ',
  block:    '█▓▒░ ',
  binary:   '1 0',
  minimal:  '@+. ',
};

function imageToAscii(imageSrc, options = {}) {
  return new Promise((resolve, reject) => {
    const {
      width      = 100,
      contrast   = 1.0,
      invert     = false,
      charSet    = 'standard',
      colorMode  = 'none',
    } = options;

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas  = document.createElement('canvas');
      const aspect  = img.height / img.width;
      const cols    = width;
      const rows    = Math.floor(cols * aspect * 0.45);

      canvas.width  = cols;
      canvas.height = rows;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, cols, rows);

      const imageData = ctx.getImageData(0, 0, cols, rows);
      const pixels    = imageData.data;
      const chars     = CHAR_SETS[charSet] ?? CHAR_SETS.standard;
      const len       = chars.length - 1;

      let asciiLines  = [];
      let colorData   = [];

      for (let y = 0; y < rows; y++) {
        let line      = '';
        let lineColor = [];

        for (let x = 0; x < cols; x++) {
          const idx = (y * cols + x) * 4;
          const r   = pixels[idx];
          const g   = pixels[idx + 1];
          const b   = pixels[idx + 2];

          let brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

          brightness = Math.min(1, Math.max(0, (brightness - 0.5) * contrast + 0.5));

          if (invert) brightness = 1 - brightness;

          const charIndex = Math.floor(brightness * len);
          line += chars[charIndex];

          if (colorMode === 'color') {
            lineColor.push({ r, g, b });
          }
        }

        asciiLines.push(line);
        if (colorMode === 'color') colorData.push(lineColor);
      }

      resolve({
        text:      asciiLines.join('\n'),
        lines:     asciiLines,
        colorData: colorData,
        cols,
        rows,
      });
    };

    img.onerror = () => reject(new Error('Gagal memuat gambar.'));
    img.src = imageSrc;
  });
}

function asciiToCanvas(lines, colorData = [], options = {}) {
  const {
    fontSize   = 6,
    fontFamily = 'monospace',
    bgColor    = '#0f0f0f',
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

function downloadTxt(text, filename = 'ascii-art.txt') {
  const blob = new Blob([text], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadPng(canvas, filename = 'ascii-art.png') {
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href    = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  });
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader  = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Gagal membaca file.'));
    reader.readAsDataURL(file);
  });
}

export {
  CHAR_SETS,
  imageToAscii,
  asciiToCanvas,
  downloadTxt,
  downloadPng,
  fileToDataUrl,
};

export interface SampleImage {
  id: string;
  name: string;
  description: string;
  generate: () => string; // returns data URL
}

export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'cyber-sunset',
    name: 'Cyber Grid & Sunset',
    description: 'Vibrant neon gradient, wireframe grid & retro sun',
    generate: () => {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 200;
      const ctx = canvas.getContext('2d')!;

      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 130);
      skyGrad.addColorStop(0, '#0f051d');
      skyGrad.addColorStop(0.5, '#4b1248');
      skyGrad.addColorStop(1, '#f85f73');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 320, 130);

      // Neon Sun
      const sunGrad = ctx.createLinearGradient(160, 40, 160, 130);
      sunGrad.addColorStop(0, '#ffea79');
      sunGrad.addColorStop(1, '#ff3366');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(160, 95, 45, 0, Math.PI * 2);
      ctx.fill();

      // Sun horizontal blinds/stripes
      ctx.fillStyle = '#0f051d';
      for (let y = 80; y < 130; y += 6) {
        ctx.fillRect(100, y, 120, (y - 75) * 0.08 + 1.2);
      }

      // Mountains silhouette
      ctx.fillStyle = '#1b0d2a';
      ctx.beginPath();
      ctx.moveTo(0, 130);
      ctx.lineTo(40, 90);
      ctx.lineTo(85, 120);
      ctx.lineTo(130, 80);
      ctx.lineTo(190, 125);
      ctx.lineTo(240, 85);
      ctx.lineTo(285, 115);
      ctx.lineTo(320, 95);
      ctx.lineTo(320, 130);
      ctx.closePath();
      ctx.fill();

      // Ground plane
      const groundGrad = ctx.createLinearGradient(0, 130, 0, 200);
      groundGrad.addColorStop(0, '#0a0314');
      groundGrad.addColorStop(1, '#1b032e');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, 130, 320, 70);

      // Perspective Grid
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 1;
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 3;

      // Horizontal grid lines
      for (let i = 1; i <= 8; i++) {
        const y = 130 + Math.pow(i / 8, 1.8) * 70;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(320, y);
        ctx.stroke();
      }

      // Vanishing perspective rays
      for (let x = -100; x <= 420; x += 35) {
        ctx.beginPath();
        ctx.moveTo(160, 130);
        ctx.lineTo(x, 200);
        ctx.stroke();
      }

      ctx.shadowBlur = 0;
      return canvas.toDataURL('image/png');
    },
  },
  {
    id: 'arcade-invader',
    name: 'Arcade Starship Battle',
    description: 'Classic 16-color arcade space pixel art with stars',
    generate: () => {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 200;
      const ctx = canvas.getContext('2d')!;

      // Deep space black
      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, 320, 200);

      // Starfield
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 90; i++) {
        const x = (i * 97) % 320;
        const y = (i * 73) % 200;
        const size = (i % 3 === 0) ? 2 : 1;
        ctx.fillStyle = i % 5 === 0 ? '#ffcc00' : i % 7 === 0 ? '#00ffff' : '#ffffff';
        ctx.fillRect(x, y, size, size);
      }

      // Nebula cloud
      const nebGrad = ctx.createRadialGradient(240, 80, 10, 240, 80, 80);
      nebGrad.addColorStop(0, 'rgba(180, 30, 140, 0.45)');
      nebGrad.addColorStop(0.7, 'rgba(40, 20, 90, 0.2)');
      nebGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = nebGrad;
      ctx.fillRect(150, 0, 170, 180);

      // Pixelated Star Fighter Ship
      const px = 6;
      const shipMap = [
        '      WW      ',
        '     WYYW     ',
        '     WYYW     ',
        '    WCCCCW    ',
        '   WCCCCCCW   ',
        '   WCCCCCCW   ',
        '  WCRCCRCCW   ',
        '  WCRCCRCCW   ',
        ' WWWWWWWWWWWW ',
        'WW  WRRRW  WW ',
        '    WFFFW     ',
        '     FFF      ',
      ];

      const colorMap: Record<string, string> = {
        W: '#ffffff',
        Y: '#ffdd00',
        C: '#00ccff',
        R: '#ff2244',
        F: '#ff7700',
      };

      const startX = 160 - (14 * px) / 2;
      const startY = 90;

      for (let r = 0; r < shipMap.length; r++) {
        for (let c = 0; c < shipMap[r].length; c++) {
          const ch = shipMap[r][c];
          if (ch !== ' ' && colorMap[ch]) {
            ctx.fillStyle = colorMap[ch];
            ctx.fillRect(startX + c * px, startY + r * px, px, px);
          }
        }
      }

      return canvas.toDataURL('image/png');
    },
  },
  {
    id: 'smpte-bars',
    name: 'SMPTE Test Bars & Ramp',
    description: 'Standard TV broadcast color bars and 16-step grayscale',
    generate: () => {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 200;
      const ctx = canvas.getContext('2d')!;

      // Top 7 bars (75% luminance)
      const topColors = [
        '#bfbfbf', // Gray
        '#bfbf00', // Yellow
        '#00bfbf', // Cyan
        '#00bf00', // Green
        '#bf00bf', // Magenta
        '#bf0000', // Red
        '#0000bf', // Blue
      ];
      const colW = 320 / 7;
      for (let i = 0; i < 7; i++) {
        ctx.fillStyle = topColors[i];
        ctx.fillRect(i * colW, 0, colW + 1, 130);
      }

      // Middle small bars
      const midColors = ['#0000bf', '#1a1a1a', '#bf00bf', '#1a1a1a', '#00bfbf', '#1a1a1a', '#bfbfbf'];
      for (let i = 0; i < 7; i++) {
        ctx.fillStyle = midColors[i];
        ctx.fillRect(i * colW, 130, colW + 1, 20);
      }

      // Bottom 16-step grayscale ramp
      const rampW = 320 / 16;
      for (let i = 0; i < 16; i++) {
        const val = Math.round((i / 15) * 255);
        ctx.fillStyle = `rgb(${val},${val},${val})`;
        ctx.fillRect(i * rampW, 150, rampW + 1, 50);
      }

      return canvas.toDataURL('image/png');
    },
  },
  {
    id: 'pixel-landscape',
    name: 'Midnight Pixel Castle',
    description: 'Charming 8-bit medieval landscape with full moon',
    generate: () => {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 200;
      const ctx = canvas.getContext('2d')!;

      // Dark night gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 160);
      skyGrad.addColorStop(0, '#080924');
      skyGrad.addColorStop(0.6, '#182449');
      skyGrad.addColorStop(1, '#2f4b75');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 320, 160);

      // Moon
      ctx.fillStyle = '#fffae0';
      ctx.beginPath();
      ctx.arc(60, 45, 22, 0, Math.PI * 2);
      ctx.fill();

      // Moon craters
      ctx.fillStyle = '#e2dcba';
      ctx.beginPath();
      ctx.arc(52, 40, 5, 0, Math.PI * 2);
      ctx.arc(68, 48, 6, 0, Math.PI * 2);
      ctx.arc(62, 56, 3, 0, Math.PI * 2);
      ctx.fill();

      // Distant mountains
      ctx.fillStyle = '#1c2847';
      ctx.beginPath();
      ctx.moveTo(0, 160);
      ctx.lineTo(80, 110);
      ctx.lineTo(150, 140);
      ctx.lineTo(240, 100);
      ctx.lineTo(320, 135);
      ctx.lineTo(320, 160);
      ctx.closePath();
      ctx.fill();

      // Castle silhouette
      ctx.fillStyle = '#0f1422';
      // Left tower
      ctx.fillRect(170, 90, 24, 70);
      ctx.fillRect(166, 82, 32, 10);
      // Main keep
      ctx.fillRect(194, 110, 40, 50);
      ctx.fillRect(190, 105, 48, 8);
      // Right tower
      ctx.fillRect(234, 80, 22, 80);
      ctx.fillRect(230, 72, 30, 10);
      // Flag
      ctx.fillStyle = '#e63946';
      ctx.fillRect(244, 60, 2, 15);
      ctx.beginPath();
      ctx.moveTo(246, 60);
      ctx.lineTo(258, 65);
      ctx.lineTo(246, 70);
      ctx.fill();

      // Yellow glowing windows
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(178, 110, 8, 14);
      ctx.fillRect(240, 100, 8, 14);
      ctx.fillRect(208, 125, 12, 18);

      // Water / River foreground
      const waterGrad = ctx.createLinearGradient(0, 160, 0, 200);
      waterGrad.addColorStop(0, '#10233b');
      waterGrad.addColorStop(1, '#08111e');
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, 160, 320, 40);

      // Moon reflection in water
      ctx.fillStyle = '#5c80a8';
      for (let y = 163; y < 198; y += 4) {
        const w = (y - 160) * 1.5;
        ctx.fillRect(60 - w / 2, y, w, 2);
      }

      return canvas.toDataURL('image/png');
    },
  },
];

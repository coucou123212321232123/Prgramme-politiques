import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Chemins relatifs : l'app peut être servie depuis n'importe quel sous-dossier (GitHub Pages…).
  base: './',
});

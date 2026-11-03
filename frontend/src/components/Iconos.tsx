// Íconos SVG (trazo, sin librerías externas)
import type { ReactNode } from 'react';

function Svg({ children, tam = 20 }: { children: ReactNode; tam?: number }) {
  return (
    <svg width={tam} height={tam} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

export const IconoLlave = ({ tam = 22 }: { tam?: number }) => (
  <svg width={tam} height={tam} viewBox="0 0 24 24" fill="none" stroke="#1A2B88" strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z" />
  </svg>
);
export const IconoPanel = () => <Svg><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></Svg>;
export const IconoCaja = () => <Svg><path d="M21 8 12 3 3 8v8l9 5 9-5z" /><path d="m3 8 9 5 9-5M12 13v8" /></Svg>;
export const IconoFlechas = () => <Svg><path d="M7 4v16M3 8l4-4 4 4M17 20V4M13 16l4 4 4-4" /></Svg>;
export const IconoCampana = () => <Svg><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" /></Svg>;
export const IconoReporte = () => <Svg><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></Svg>;
export const IconoCamion = () => <Svg><path d="M1 4h13v12H1zM14 9h4l4 4v3h-8" /><circle cx="5.5" cy="18.5" r="1.5" /><circle cx="17.5" cy="18.5" r="1.5" /></Svg>;
export const IconoUsuarios = () => <Svg><circle cx="9" cy="8" r="4" /><path d="M2 21a7 7 0 0 1 14 0M17 3.5a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6.3" /></Svg>;
export const IconoAuditoria = () => <Svg><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" /><path d="m9 12 2 2 4-4" /></Svg>;
export const IconoSalida = () => <Svg><path d="M12 5v14M5 12l7 7 7-7" /></Svg>;
export const IconoBuscar = ({ tam = 20 }: { tam?: number }) => <Svg tam={tam}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Svg>;
export const IconoCheck = () => (
  <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#1E5E43" strokeWidth="2.6"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
);
export const IconoCandado = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A2B88" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: 'none', marginTop: 1 }}>
    <rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);
export const IconoHistorial = () => <Svg><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5M12 7v5l3 3" /></Svg>;

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Repositorio FCyT UNCA | Buscador y Filtro Avanzado de Tesis',
  description:
    'Portal de búsqueda avanzada y catálogo facetado para el repositorio de tesis y publicaciones de la Facultad de Ciencias y Tecnologías (FCyT) - Universidad Nacional de Caaguazú, basado en DSpace 10.0 HAL+JSON.',
  keywords: [
    'FCyT',
    'UNCA',
    'Tesis FCyT',
    'DSpace UNCA',
    'Ingeniería Informática',
    'Ingeniería Civil',
    'Ingeniería en Electricidad',
    'Ingeniería Electrónica',
    'Coronel Oviedo',
    'Repositorio Digital',
  ],
  authors: [{ name: 'Facultad de Ciencias y Tecnologías - UNCA' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} antialiased`} suppressHydrationWarning>
      <body
        className="min-h-screen bg-slate-50/50 text-slate-900 selection:bg-blue-100 selection:text-blue-900 flex flex-col"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}

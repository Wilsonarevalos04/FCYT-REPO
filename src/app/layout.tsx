import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Dashboard Analítico FCyT - UNCA | Repositorio DSpace',
  description:
    'Sistema de Inteligencia Institucional y Dashboard Estadístico para el Repositorio DSpace de la Facultad de Ciencias y Tecnologías (FCyT) - Universidad Nacional de Caaguazú. Desarrollado por Wilson Javier Arévalos Peralta y Jorge Ronaldo Areco Falcón.',
  keywords: [
    'FCyT',
    'UNCA',
    'Tesis FCyT',
    'DSpace UNCA',
    'OAI-PMH',
    'Ingeniería Informática',
    'Ingeniería Civil',
    'Ingeniería en Electricidad',
    'Ingeniería Electrónica',
    'Coronel Oviedo',
    'Wilson Arévalos',
    'Jorge Areco',
  ],
  authors: [
    { name: 'Wilson Javier Arévalos Peralta', url: 'https://github.com/Wilsonarevalos04' },
    { name: 'Jorge Ronaldo Areco Falcón', url: 'https://github.com/Areco-Github' },
    { name: 'Facultad de Ciencias y Tecnologías - UNCA' },
  ],
  creator: 'Wilson Javier Arévalos Peralta & Jorge Ronaldo Areco Falcón',
  icons: {
    icon: '/logo-fcyt.png',
    shortcut: '/logo-fcyt.png',
    apple: '/logo-fcyt.png',
  },
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

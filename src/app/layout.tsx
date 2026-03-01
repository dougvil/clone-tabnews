import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "D'vilLab | Tecnologia & Inovação",
  description:
    'Transformando ideias em soluções digitais inovadoras. Desenvolvimento web, apps mobile, cloud e consultoria tech.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

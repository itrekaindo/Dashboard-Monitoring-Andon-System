// app/layout.tsx
import type { Metadata } from "next";
import { Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SINERGI",
  description: "Sistem Informasi Early Warning Terintegrasi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const applyTheme = () => {
    document.documentElement.classList.toggle('dark', media.matches);
  };
  applyTheme();
  if (media.addEventListener) {
    media.addEventListener('change', applyTheme);
  } else {
    media.addListener(applyTheme);
  }
})();`,
          }}
        />
      </head>
      <body
        className={`${montserrat.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
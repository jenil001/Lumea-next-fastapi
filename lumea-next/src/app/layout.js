import "./globals.css";
import DynamicBackground from "@/components/DynamicBackground";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = {
  title: "Lumea - AI Mental Health Companion",
  description: "Your compassionate AI mental health companion.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ThemeProvider>
          <DynamicBackground />
          {children}
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}

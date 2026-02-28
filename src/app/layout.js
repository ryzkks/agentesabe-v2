import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";

const syne = Syne({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: "--font-syne" });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500"], style: ["normal", "italic"], variable: "--font-dm" });

export const metadata = {
  title: "A Gente Sabe | Carrosséis Impecáveis",
  description: "Carrosséis Impecáveis para criadores de conteúdo",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={`${syne.variable} ${dmSans.variable} font-sans`}>{children}</body>
    </html>
  );
}

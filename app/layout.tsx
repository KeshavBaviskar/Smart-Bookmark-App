import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Tailwind ki CSS yahan import hoti hai

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Smart Bookmark App",
    description: "Save your links efficiently",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${inter.className} bg-gradient-to-b from-slate-50 via-sky-50/60 to-slate-100 text-slate-900 antialiased`}
            >
                <main className="min-h-screen flex items-center justify-center px-4 py-10">
                    {children}
                </main>
            </body>
        </html>
    );
}
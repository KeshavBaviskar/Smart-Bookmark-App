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
        // 👇 YE tags zaroori hain (HTML aur BODY)
        <html lang="en">
            <body className={inter.className}>
                <main className="min-h-screen bg-gray-50 text-gray-900">
                    {/* Navbar yahan aa sakta hai */}
                    {children}
                </main>
            </body>
        </html>
    );
}
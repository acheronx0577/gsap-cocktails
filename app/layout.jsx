import "./globals.css";

export const metadata = {
  title: "Velvet Pour | GSAP Cocktails",
  description:
    "A scroll-driven cocktail landing page built with Next.js, GSAP, and Tailwind CSS.",
  icons: {
    icon: "/images/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

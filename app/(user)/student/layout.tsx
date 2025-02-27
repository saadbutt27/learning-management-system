import { Inter } from "next/font/google";
import Navigation from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Student - LMS",
  description: "Student dashboard for Learning Management System",
};

export default function MyLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        {children}
      </body>
    </html>
  );
}

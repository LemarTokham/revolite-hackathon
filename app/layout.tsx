import "./globals.css";
import { getTheme } from "@/lib/themes";

export async function generateMetadata() {
  const theme = getTheme();
  return {
    title: theme.name,
    icons: { icon: theme.favicon },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

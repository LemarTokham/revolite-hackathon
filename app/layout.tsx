import "./globals.css";
import { getTheme } from "@/lib/themes";

export async function generateMetadata() {
  const theme = getTheme();
  return { title: theme.name };
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

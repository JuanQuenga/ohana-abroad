import { AuthKitProvider } from "@workos-inc/authkit-nextjs/components";
import { AppProviders } from "./providers";
import "../src/index.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthKitProvider>
          <AppProviders>{children}</AppProviders>
        </AuthKitProvider>
      </body>
    </html>
  );
}

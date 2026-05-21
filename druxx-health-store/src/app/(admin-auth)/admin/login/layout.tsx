import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Internal Portal Access",
  description: "Secure administrator authentication node.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

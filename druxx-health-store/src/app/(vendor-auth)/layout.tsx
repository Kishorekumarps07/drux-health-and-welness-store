import { MinimalHeader } from "@/components/layout/MinimalHeader";
import { MinimalFooter } from "@/components/layout/MinimalFooter";

export default function VendorAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white relative">
      <div className="absolute top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <MinimalHeader type="VENDOR" />
        </div>
      </div>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <MinimalFooter />
    </div>
  );
}

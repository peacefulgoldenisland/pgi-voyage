import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9fa] font-sans selection:bg-[#B88E52] selection:text-white overflow-x-hidden">
      <PublicHeader />
      {/* Konten halaman yang berubah-ubah akan masuk ke dalam {children} ini */}
      <div className="flex-grow flex flex-col">
        {children}
      </div>
      <PublicFooter /> 
    </div>
  );
}
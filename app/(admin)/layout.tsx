import { Suspense } from "react";
import AdminSidebar from "@/components/blog/Sidebar";

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <div className="flex min-h-screen w-full overflow-hidden bg-background">       
            <Suspense fallback={<div className="w-64 bg-[#FFF5E4] animate-pulse" />}>
                <AdminSidebar />
            </Suspense>

            <main className="flex-1 h-screen overflow-y-auto">
                {children}
            </main>

        </div>
    );
}
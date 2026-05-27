import { createClient } from "@/lib/supabase/server";
import SidebarUI from "./SidebarUI"; 
import { prisma } from '@/lib/prisma'

export default async function AdminSidebar() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    // console.log("User role in AdminSidebar:", user);

    const admin = await prisma.user.findUnique({
        where: { email: user?.email },
        select: { role: true }
    });

    return <SidebarUI user={admin?.role} />;
}
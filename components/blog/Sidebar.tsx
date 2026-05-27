import SidebarUI from "./SidebarUI"; 
import { getAuthUser } from "@/lib/auth";

export default async function AdminSidebar() {
    const user = await getAuthUser();
    return <SidebarUI user={user?.role} />;
}
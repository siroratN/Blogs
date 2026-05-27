'use client';

import React, { useState } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    LogOut,
    User,
    FileText,    
    MessageSquare, 
    Link2,        
    Home

} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const menuItems = [
    { title: 'Home', icon: Home, path: '/' },
    { title: 'Blog Posts', icon: FileText, path: '/admin' },
    { title: 'Comments', icon: MessageSquare, path: '/admin/commentsList' },
    { title: 'URL Slugs', icon: Link2, path: '/admin/slugList' },
];

interface SidebarUIProps {
    user: string | null | undefined;
}

export default function SidebarUI({ user }: SidebarUIProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/");
            router.refresh();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <aside
            className={`relative flex flex-col h-screen p-4 border-r bg-[#FFF5E4] border-[#FFE3E1] transition-all duration-300 ease-in-out ${isCollapsed ? 'w-[88px]' : 'w-[260px]'
                }`}
        >
            {/* Collapse Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute top-8 -right-3 flex items-center justify-center w-6 h-6 rounded-full border border-[#FFD1D1] bg-white text-[#FF9494] shadow-sm transition-transform hover:scale-110 dynamic-toggle z-10"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-2'} gap-3 mb-8 h-10`}>
                <div className="flex items-center justify-center min-w-[40px] h-10 rounded-xl font-bold text-white shadow-sm bg-[#FF9494]">
                    B
                </div>
                {!isCollapsed && (
                    <div className="flex flex-col animate-fadeIn">
                        <span className="font-bold text-gray-800 text-sm tracking-wide">BLOG</span>
                        <span className="text-[11px] text-gray-500 font-medium">Management</span>
                    </div>
                )}
            </div>

            <nav className="flex-1 space-y-1">
                {menuItems.map((item) => {
                    
                    const isActive = pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center w-full p-3 rounded-xl transition-all duration-200 group relative ${isCollapsed ? 'justify-center' : 'gap-3'
                                } ${isActive ? 'bg-[#FFE3E1] text-[#FF9494]' : 'text-gray-500 bg-transparent hover:bg-[#FFE3E1]/30'}`}
                        >
                            {isActive && (
                                <div className="absolute left-0 w-1 h-6 rounded-r-full bg-[#FF9494]" />
                            )}

                            <Icon
                                size={20}
                                className={`transition-transform duration-200 group-hover:scale-105 ${isActive ? 'text-[#FF9494]' : 'text-gray-400 group-hover:text-gray-600'
                                    }`}
                            />

                            {!isCollapsed && (
                                <span className={`text-sm font-semibold transition-colors duration-200 ${isActive ? 'text-gray-800' : 'text-gray-600 group-hover:text-gray-900'
                                    }`}>
                                    {item.title}
                                </span>
                            )}

                            {isCollapsed && (
                                <div className="absolute left-full ml-2 scale-0 group-hover:scale-100 bg-gray-900 text-white text-xs rounded py-1 px-2 pointer-events-none transition-all duration-150 shadow-md whitespace-nowrap z-50">
                                    {item.title}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <footer className="pt-4 border-t border-[#FFE3E1] flex flex-row gap-2 justify-between">
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-2'} gap-3 py-1`}>
                    <User size={20} className="text-gray-400 shrink-0" />
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0 animate-fadeIn">
                            <p className="text-sm font-semibold text-gray-800 truncate">{user || 'Guest'}</p>
                            <p className="text-xs text-gray-500 truncate">Super Admin</p>
                        </div>
                    )}
                </div>
                <button onClick={handleLogout}>
                    <LogOut size={20} className={`transition-transform duration-200 ${isCollapsed ? 'mx-auto' : 'ml-2'} text-gray-400 hover:text-gray-600`} />
                </button>
            </footer>
        </aside>
    );
}
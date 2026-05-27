"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export function SearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentQuery = searchParams.get("q") || "";

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const query = formData.get("q") as string;

        if (query.trim()) {
            router.push(`/?q=${encodeURIComponent(query.trim())}`);
        } else {
            router.push("/");
        }
    };

    return (
        <form onSubmit={handleSearch} className="flex w-full gap-2">
            <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                    type="text"
                    name="q"
                    defaultValue={currentQuery}
                    placeholder="ค้นหาจากชื่อ"
                    className="rounded-xl pl-9 bg-white text-black border-gray-300 focus-visible:ring-blue-600 "
                />
            </div>
            <Button type="submit" className="rounded-xl bg-[#FF9494] hover:bg-[#FFD1D1]">
                Search
            </Button>
        </form>
    );
}
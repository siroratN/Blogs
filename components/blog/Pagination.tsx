"use client";

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { useSearchParams } from "next/navigation";

interface PaginationBlogsProps {
    currentPage: number;
    totalPages: number;
}

export function PaginationBlogs({ currentPage, totalPages }: PaginationBlogsProps) {
    const searchParams = useSearchParams();

    const createPageUrl = (pageNumber: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", pageNumber.toString());
        return `/?${params.toString()}`;
    };

    // if (totalPages <= 1) return null;

    return (
        <Pagination>
            <PaginationContent className="">
                
                <PaginationItem>
                    <PaginationPrevious 
                        href={currentPage > 1 ? createPageUrl(currentPage - 1) : "#"}
                        className={currentPage <= 1 ? "pointer-events-none opacity-40" : "transition-colors duration-200"}
                    />
                </PaginationItem>

                {Array.from({ length: totalPages }).map((_, index) => {
                    const pageNumber = index + 1;
                    
                    return (
                        <PaginationItem key={pageNumber}>
                            <PaginationLink 
                                href={createPageUrl(pageNumber)}
                                isActive={pageNumber === currentPage}
                                className={
                                    pageNumber === currentPage 
                                        ? "bg-[#FF9494] hover:bg-[#FFD1D1] text-white hover:text-white font-bold shadow-md shadow-blue-500/10 rounded-xl" 
                                        : "rounded-xl hover:bg-slate-100 transition-colors"
                                }
                            >
                                {pageNumber}
                            </PaginationLink>
                        </PaginationItem>
                    );
                })}

                <PaginationItem>
                    <PaginationNext 
                        href={currentPage < totalPages ? createPageUrl(currentPage + 1) : "#"}
                        className={currentPage >= totalPages ? "pointer-events-none opacity-40" : "transition-colors duration-200"}
                    />
                </PaginationItem>
                
            </PaginationContent>
        </Pagination>
    );
}
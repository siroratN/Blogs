import { Suspense } from "react"; 
import CommentList from "@/components/blog/commentList"; 

export default function CommentPage() {
    return (
        <div className="p-4 bg-[#FFF5E4] min-h-screen">
            <Suspense 
                fallback={
                    <div className="min-h-[400px] flex items-center justify-center text-[#FF9494] animate-pulse font-medium text-sm">
                        loading
                    </div>
                }
            >
                <CommentList />
            </Suspense>
        </div>
    );
}
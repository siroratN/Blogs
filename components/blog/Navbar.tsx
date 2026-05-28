import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="bg-white shadow-md w-full sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">

                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="text-xl font-bold text-[#FF9494] tracking-wider hover:opacity-80 transition">
                            Blogs
                        </Link>
                    </div>

                    <div className="flex space-x-6 items-center">
                        <Link
                            href="/"
                            className="text-gray-700 hover:text-[#FF9494] px-3 py-2 rounded-md text-sm font-medium transition duration-150"
                        >
                            หน้าแรก
                        </Link>

                        <Link
                            href="/admin"
                            className="bg-[#FF9494] text-white hover:bg-[#FFD1D1] px-4 py-2 rounded-md text-sm font-medium transition duration-150 shadow-sm"
                        >
                            Admin
                        </Link>
                    </div>

                </div>
            </div>
        </nav>
    );
}
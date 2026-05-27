
export default function BlogLoading() {
    const mockComments = Array.from({ length: 2 });
    const mockImages = Array.from({ length: 3 });

    return (
        <main
            className="w-full bg-white min-h-screen animate-pulse"
            aria-busy="true"
            aria-live="polite"
        >
            <div className="w-full">
                <div className="w-full max-w-screen-2xl mx-auto px-0 sm:px-6 lg:px-10 pt-8">
                    <div className="relative w-full aspect-[21/9] sm:aspect-[16/7] sm:rounded-3xl overflow-hidden bg-gray-200 dark:bg-gray-100 shadow-sm" />
                </div>

                <header className="sm:hidden px-5 pt-7 pb-2 space-y-3">
                    <div className="h-3 bg-gray-200 rounded w-16" />
                    <div className="h-8 bg-gray-200 rounded w-5/6" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                </header>

                <div className="max-w-screen-xl mx-auto px-5 sm:px-8 lg:px-10 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-20 items-start pb-24">

                    <main className="lg:col-span-7 xl:col-span-8 space-y-4">
                        <div className="space-y-3">
                            <div className="h-4 bg-gray-200 rounded w-full" />
                            <div className="h-4 bg-gray-200 rounded w-full" />
                            <div className="h-4 bg-gray-200 rounded w-11/12" />
                            <div className="h-4 bg-gray-200 rounded w-4/5" /> 
                        </div>

                        <div className="space-y-3 pt-4">
                            <div className="h-4 bg-gray-200 rounded w-full" />
                            <div className="h-4 bg-gray-200 rounded w-full" />
                            <div className="h-4 bg-gray-200 rounded w-5/6" />
                        </div>

                        <div className="pt-8 space-y-4">
                            <div className="h-4 bg-gray-100 rounded w-24 mb-4" />
                            <section className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                                {mockImages.map((_, index) => (
                                    <div
                                        key={index}
                                        className="aspect-video overflow-hidden rounded-2xl bg-gray-200 ring-1 ring-black/5"
                                    />
                                ))}
                            </section>
                        </div>
                    </main>

                    <aside className="lg:col-span-5 xl:col-span-4 space-y-10">
                        <section className="rounded-3xl border border-gray-100 bg-gray-50/60 p-7 space-y-4">
                            <div className="h-5 bg-gray-200 rounded w-1/2" />
                            <div className="h-3 bg-gray-200 rounded w-3/4" />
                            <div className="h-24 bg-gray-200 rounded-xl w-full" /> 
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center justify-between mb-5">
                                <div className="h-4 bg-gray-200 rounded w-1/3" />
                                <div className="h-6 bg-gray-200 rounded-full w-8" />
                            </div>

                            <div className="space-y-3">
                                {mockComments.map((_, index) => (
                                    <div
                                        key={index}
                                        className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
                                            <div className="space-y-1.5 flex-1">
                                                <div className="h-3 bg-gray-200 rounded w-1/4" />
                                                <div className="h-2 bg-gray-200 rounded w-1/6" />
                                            </div>
                                        </div>
                                        <div className="pl-12 space-y-2">
                                            <div className="h-3 bg-gray-200 rounded w-full" />
                                            <div className="h-3 bg-gray-200 rounded w-5/6" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </aside>

                </div>
            </div>
        </main>
    );
}
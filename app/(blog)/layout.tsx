import Navbar from "@/components/blog/Navbar";

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <> 
      <Navbar />
      <main>
        {children}
      </main>
    </>
  );
}
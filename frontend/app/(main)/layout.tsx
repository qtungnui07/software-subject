import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

type Props = {
  children: React.ReactNode;
};

const MainLayout = async ({ children }: Props) => {
  await auth();

  return (
    <div className="min-h-screen bg-[#f6fbff] text-slate-800">
      <MobileHeader />
      <Sidebar className="hidden lg:flex" />

      <main className="min-h-screen pt-[56px] lg:pl-[304px] lg:pt-0">
        <div className="mx-auto w-full max-w-[1320px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;

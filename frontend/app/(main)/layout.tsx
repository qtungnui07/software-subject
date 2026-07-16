import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { auth } from "@/auth";
import { getUserProgress } from "@/db/queries";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  children: React.ReactNode;
};

const MainLayout = async ({ children }: Props) => {
  const [session, userProgressData] = await Promise.all([
    auth(),
    getUserProgress(),
  ]);

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const isLoggedIn = !!session?.user;

  return (
    <div className="flex flex-1 min-h-screen w-full flex-col bg-[#f6fbff] text-slate-800 transition-colors duration-300 dark:bg-[#131f24] dark:text-slate-100">
      <MobileHeader
        isLoggedIn={isLoggedIn}
        hearts={userProgressData?.hearts ?? 5}
        points={userProgressData?.points ?? 0}
      />
      <Sidebar className="hidden lg:flex" isLoggedIn={isLoggedIn} />

      <main className="min-h-screen pt-[56px] lg:pl-[304px] lg:pt-0">
        <div className="mx-auto w-full max-w-[1320px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;

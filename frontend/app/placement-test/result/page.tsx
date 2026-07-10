import Link from "next/link";
import { LogIn } from "lucide-react";

import { auth } from "@/auth";
import PlacementResultClient from "@/app/placement-test/result/placement-result-client";
import { Button } from "@/components/ui/button";
import { toPlacementResultResponse } from "@/lib/placement-test/placement-api-contract";
import { getPlacementTestResultForUser } from "@/services/placement-test-service";

export const dynamic = "force-dynamic";

export default async function PlacementResultPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6fbff] p-6 dark:bg-[#101a1e]">
        <div className="max-w-md rounded-3xl border-2 border-slate-200 bg-white p-8 text-center shadow-xl dark:border-[#263840] dark:bg-[#152126]">
          <LogIn className="mx-auto size-12 text-sky-500" />
          <h1 className="mt-4 text-2xl font-black text-slate-900 dark:text-white">Đăng nhập để xem kết quả</h1>
          <p className="mt-2 font-bold text-slate-500 dark:text-slate-400">Kết quả kiểm tra được lưu riêng cho từng tài khoản.</p>
          <Button asChild variant="primary" className="mt-6 h-12 rounded-2xl px-6">
            <Link href="/sign-in?redirect=%2Fplacement-test%2Fresult">Đăng nhập</Link>
          </Button>
        </div>
      </main>
    );
  }

  const result = await getPlacementTestResultForUser(userId);

  if (!result) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6fbff] p-6 dark:bg-[#101a1e]">
        <div className="max-w-md rounded-3xl border-2 border-slate-200 bg-white p-8 text-center shadow-xl dark:border-[#263840] dark:bg-[#152126]">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Chưa có kết quả kiểm tra</h1>
          <p className="mt-2 font-bold text-slate-500 dark:text-slate-400">Hãy hoàn thành bài kiểm tra 12 câu để nhận lộ trình đề xuất.</p>
          <Button asChild variant="primary" className="mt-6 h-12 rounded-2xl px-6">
            <Link href="/placement-test?start=1">Bắt đầu kiểm tra</Link>
          </Button>
        </div>
      </main>
    );
  }

  return <PlacementResultClient result={toPlacementResultResponse(result).result} />;
}

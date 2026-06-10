import Link from "next/link";
import { auth } from "@/auth";
import { signoutAction } from "@/app/actions/auth";
import Image from "next/image";

export const Header = async () => {
    const session = await auth();
    const user = session?.user;

    return (
        <header className="h-20 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Image src="/logo.svg" height={40} width={40} alt="Logo"/>
                <span className="text-xl font-extrabold text-[#1486CC] tracking-wide">Dinogo</span>
            </Link>

            {/* Nav */}
            <nav className="flex items-center gap-3">
                {user ? (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-sm text-slate-700 font-medium">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase">
                                {user.name?.charAt(0) ?? user.email?.charAt(0) ?? "U"}
                            </span>
                            <span className="max-w-[120px] truncate hidden sm:block">
                                {user.name ?? user.email}
                            </span>
                        </div>
                        <form action={signoutAction}>
                            <button
                                id="header-signout-btn"
                                type="submit"
                                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-150"
                            >
                                Đăng xuất
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <Link
                            id="header-signin-link"
                            href="/sign-in"
                            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-150"
                        >
                            Đăng nhập
                        </Link>
                        <Link
                            id="header-signup-link"
                            href="/sign-up"
                            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-sm shadow-indigo-200 hover:-translate-y-0.5 transition-all duration-150"
                        >
                            Đăng ký
                        </Link>
                    </div>
                )}
            </nav>
        </header>
    );
};
"use client";

import { BookOpen, Users } from "lucide-react";
import { useState } from "react";

import { AdminCourses } from "./courses";
import { AdminUsers } from "./users";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<"users" | "courses">("users");

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 pb-12 sm:px-6 lg:px-8">
      {/* Navigation Header / Tabs */}
      <div className="flex flex-wrap items-center gap-3 rounded-[24px] border-2 border-slate-200 bg-white p-2 dark:border-[#202f36] dark:bg-[#131f24]">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-black transition ${
            activeTab === "users"
              ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
              : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"
          }`}
        >
          <Users className="size-5" />
          Tài khoản
        </button>

        <button
          onClick={() => setActiveTab("courses")}
          className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-black transition ${
            activeTab === "courses"
              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
              : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"
          }`}
        >
          <BookOpen className="size-5" />
          Chương & Bài học
        </button>
      </div>

      {/* Main Active Tab Content */}
      {activeTab === "users" ? <AdminUsers /> : <AdminCourses />}
    </div>
  );
};

export default AdminPage;

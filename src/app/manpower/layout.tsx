"use client";

import React from "react";
import { HardHat } from "lucide-react";
import { Toaster } from "react-hot-toast"; // ✅ import Toaster

export default function ManpowerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-100">
      <header className="w-full bg-white dark:bg-gray-800 shadow-md py-4">
        <div className="max-w-screen-2xl mx-auto px-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <HardHat className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-2xl font-bold tracking-wide text-indigo-600 dark:text-indigo-400">
              Manpower Dashboard
            </h1>
          </div>
        </div>
      </header>

      {/* ✅ Toast akan tampil di pojok atas */}
      <Toaster position="top-right" />

      <main className="w-full max-w-screen-xl mx-auto px-6 py-10">
        {children}
      </main>

      <footer className="w-full bg-white dark:bg-gray-800 py-4 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
        © 2025 PT. Vuteq Indonesia | All rights reserved.
      </footer>
    </div>
  );
}

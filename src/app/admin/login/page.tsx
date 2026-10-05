"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // 🔒
  useEffect(() => {
    const checkToken = async () => {
      try {
        const res = await fetch("http://10.10.10.5:3001/auth/verify", {
          method: "POST",
          credentials: "include",
        });

        if (res.ok) {
          router.replace("/admin/dashboard");
        } else {
          setCheckingAuth(false);
        }
      } catch (err) {
        setCheckingAuth(false);
      }
    };

    checkToken();
  }, [router]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://10.10.10.5:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      if (res.ok) {
        router.push("/admin/dashboard");
      } else {
        const data = await res.json();
        alert(data.message || "Login gagal.");
      }
    } catch (error) {
      alert("Terjadi kesalahan saat login.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Memuat...
      </div>
    );
  }

  return (
    <main className="relative min-h-screen flex flex-col bg-gradient-to-r from-blue-200 to-blue-50 transition-colors duration-500">
      {/* Tombol Kembali */}
      <header className="absolute top-6 right-6 z-20 flex items-center gap-4">
        <a
          href="/"
          aria-label="Back to Home"
          className="w-10 h-10 flex items-center justify-center bg-black/60 hover:bg-black/80 text-white rounded-full shadow-lg transition-transform transform hover:scale-105"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </a>
      </header>

      {/* Overlay */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-md transition-opacity duration-500" />

      {/* Form Login */}
      <section className="relative z-10 flex flex-1 items-center justify-center px-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!loading && username && password) handleLogin();
          }}
          className="rounded-2xl p-10 max-w-md w-full bg-white text-gray-900 border border-gray-300 shadow-xl flex flex-col gap-6 transition-all duration-300"
        >
          <h2 className="text-3xl font-bold text-center">🔐 Admin Login</h2>

          <label className="block">
            <span className="font-semibold mb-1 block">Username</span>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white text-gray-900 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              required
            />
          </label>

          <label className="block">
            <span className="font-semibold mb-1 block">Password</span>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white text-gray-900 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full py-3 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white transition transform hover:scale-105"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}

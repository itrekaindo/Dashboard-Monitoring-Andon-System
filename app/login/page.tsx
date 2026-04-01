"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogIn, User, Lock, AlertCircle } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data.message ?? "Login gagal");
      return;
    }
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      {/* Background subtle grid */}
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#10B981 1px, transparent 1px), linear-gradient(90deg, #10B981 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glow accent */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image 
              src="/assets/logo/logoxreka.png" 
              alt="Andon Logo" 
              width={200} 
              height={60} 
              className="object-contain" />
          </div>
          <h1 className="text-lg font-bold text-white mb-2 whitespace-nowrap">Sistem Informasi Early Warning Terintegrasi</h1>
          <p className="text-gray-400 text-sm">
            Sign in to your production monitoring dashboard
          </p>
        </div>

        {/* Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-6">Welcome back</h2>

          <form onSubmit={submit} className="space-y-4">
            {/* Email field */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-400">NIP</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Masukkan nomor induk pegawai (NIP)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all hover:border-gray-600/50"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-400">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all hover:border-gray-600/50"
                />
              </div>
            </div>

            {/* Error message */}
            {err && (
              <div className="flex items-center gap-2 p-3 bg-rose-900/20 border border-rose-800/30 rounded-lg">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <p className="text-rose-400 text-sm">{err}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/40 disabled:cursor-not-allowed text-gray-950 font-semibold py-3 px-4 rounded-lg transition-all duration-200 text-sm shadow-lg shadow-emerald-500/20"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-gray-950/30 border-t-gray-950 rounded-full animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Masuk
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-6">
          Real-time monitoring • Production Intelligence Dashboard
        </p>
      </div>
    </div>
  );
}
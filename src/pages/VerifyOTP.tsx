import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { api } from "@/lib/api";

export default function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = String((location.state as { email?: string } | null)?.email || "");

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => otp.replace(/\s/g, "").length === 6, [otp]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError("Missing email. Please restart.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.auth.verifyOtp(email, otp);
      navigate("/reset-password", { state: { email, resetToken: res.resetToken } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Verify OTP" subtitle="Enter the 6-digit code we sent to your email">
      {error && <div className="mb-4 p-3 rounded-xl bg-rose-500/10 text-rose-200 text-sm border border-rose-500/20">{error}</div>}

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="flex justify-center">
          <InputOTP value={otp} onChange={setOtp} maxLength={6}>
            <InputOTPGroup>
              {Array.from({ length: 6 }).map((_, i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <div className="text-center text-xs text-slate-400">
          Sent to <span className="text-slate-200 font-medium">{email || "—"}</span>
        </div>

        <button
          type="submit"
          disabled={loading || !canSubmit}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-400 via-sky-400 to-cyan-300 text-slate-950 font-bold text-sm hover:opacity-90 transition-all duration-300 ease-in-out disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Verify
        </button>

        <div className="text-center text-sm">
          <Link to="/forgot-password" className="text-cyan-300 hover:text-cyan-200 hover:underline transition-colors">
            Back
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}


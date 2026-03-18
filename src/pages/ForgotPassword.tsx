import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { FloatingInput } from "@/components/auth/FloatingInput";
import { api } from "@/lib/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const canSubmitEmail = useMemo(() => email.trim().length > 3, [email]);

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.auth.forgotPassword(email.trim());
      navigate("/verify-otp", { state: { email: email.trim() } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Forgot password?" subtitle="Enter your email and we’ll send an OTP">
      {error && <div className="mb-4 p-3 rounded-xl bg-rose-500/10 text-rose-200 text-sm border border-rose-500/20">{error}</div>}

      <form onSubmit={sendOtp} className="space-y-4">
        <FloatingInput id="email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />

        <button
          type="submit"
          disabled={loading || !canSubmitEmail}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-400 via-sky-400 to-cyan-300 text-slate-950 font-bold text-sm hover:opacity-90 transition-all duration-300 ease-in-out disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Send OTP
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-400">
        Remembered it?{" "}
        <Link to="/login" className="text-cyan-300 hover:text-cyan-200 hover:underline transition-colors">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
};

export default ForgotPassword;


import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { FloatingInput } from "@/components/auth/FloatingInput";
import { api } from "@/lib/api";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { email?: string; resetToken?: string } | null;
  const email = String(state?.email || "");
  const resetToken = String(state?.resetToken || "");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => newPassword.length >= 6 && newPassword === confirmPassword,
    [newPassword, confirmPassword],
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !resetToken) {
      setError("Reset session missing. Please restart.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await api.auth.resetPassword(email, resetToken, newPassword);
      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Reset password" subtitle="Create a new password for your account">
      {error && <div className="mb-4 p-3 rounded-xl bg-rose-500/10 text-rose-200 text-sm border border-rose-500/20">{error}</div>}

      <form onSubmit={onSubmit} className="space-y-4">
        <FloatingInput id="newPassword" label="New password" type="password" value={newPassword} onChange={setNewPassword} autoComplete="new-password" />
        <FloatingInput id="confirmPassword" label="Confirm password" type="password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />

        <button
          type="submit"
          disabled={loading || !canSubmit}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-400 via-sky-400 to-cyan-300 text-slate-950 font-bold text-sm hover:opacity-90 transition-all duration-300 ease-in-out disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Reset password
        </button>

        <div className="text-center text-sm">
          <Link to="/login" className="text-cyan-300 hover:text-cyan-200 hover:underline transition-colors">
            Back to sign in
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}


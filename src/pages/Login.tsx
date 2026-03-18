import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { FloatingInput } from "@/components/auth/FloatingInput";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill all fields"); return; }
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your energy dashboard">
      {error && <div className="mb-4 p-3 rounded-xl bg-rose-500/10 text-rose-200 text-sm border border-rose-500/20">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FloatingInput id="email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
        <FloatingInput id="password" label="Password" type="password" value={password} onChange={setPassword} autoComplete="current-password" />

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-400 via-sky-400 to-cyan-300 text-slate-950 font-bold text-sm hover:opacity-90 transition-all duration-300 ease-in-out disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign In
        </button>
      </form>

      <div className="mt-4 flex items-center justify-between text-sm">
        <Link to="/forgot-password" className="text-cyan-300 hover:text-cyan-200 hover:underline transition-colors">
          Forgot password?
        </Link>
        <Link to="/register" className="text-slate-300 hover:text-white hover:underline transition-colors">
          Create account
        </Link>
      </div>
    </AuthShell>
  );
};

export default Login;

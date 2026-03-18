import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { FloatingInput } from "@/components/auth/FloatingInput";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password) { setError("Please fill all fields"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/dashboard");
    } catch {
      setError("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create account" subtitle="Start monitoring your energy today">
      {error && <div className="mb-4 p-3 rounded-xl bg-rose-500/10 text-rose-200 text-sm border border-rose-500/20">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FloatingInput id="name" label="Name" value={name} onChange={setName} autoComplete="name" />
        <FloatingInput id="email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
        <FloatingInput id="password" label="Password" type="password" value={password} onChange={setPassword} autoComplete="new-password" />

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-400 via-sky-400 to-cyan-300 text-slate-950 font-bold text-sm hover:opacity-90 transition-all duration-300 ease-in-out disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Create Account
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-400">
        Already have an account?{" "}
        <Link to="/login" className="text-cyan-300 hover:text-cyan-200 hover:underline transition-colors">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
};

export default Register;

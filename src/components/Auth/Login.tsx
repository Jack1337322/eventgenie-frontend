import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { useAuth } from "../../contexts/AuthContext";
import { Loader2, LogIn } from "lucide-react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      // Navigation will be handled by App.tsx based on auth state
      // Trigger route change to ensure navigation happens
      window.history.pushState({}, "", "/");
      window.dispatchEvent(new PopStateEvent("popstate"));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка входа. Проверьте email и пароль.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Вход в EventGenie</CardTitle>
          <CardDescription className="text-center">
            Введите email и пароль для входа
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Вход...
                </>
              ) : (
                <>
                  <LogIn className="size-4 mr-2" />
                  Войти
                </>
              )}
            </Button>

            <div className="text-center text-sm text-slate-600">
              Нет аккаунта?{" "}
              <button
                type="button"
                onClick={() => {
                  window.history.pushState({}, "", "/register");
                  window.dispatchEvent(new PopStateEvent("popstate"));
                }}
                className="text-indigo-600 hover:underline"
              >
                Зарегистрироваться
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

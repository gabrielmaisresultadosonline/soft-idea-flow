import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock, Mail } from "lucide-react";
import logo from "@/assets/unidoc-official-logo.png";

export const Route = createFileRoute("/login")({
  validateSearch: (search) => ({
    redirect: typeof search.redirect === "string" && search.redirect.startsWith("/admin")
      ? search.redirect
      : "/admin",
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.session) {
        console.error("Login error:", error);
        toast.error(error?.message || "Credenciais inválidas.");
        setIsLoading(false);
        return;
      }

      toast.success("Bem-vindo de volta!");
      await supabase.auth.getSession();
      await navigate({ to: search.redirect as "/admin", replace: true });
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login.");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-hero min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-md w-full glass border-white/10 shadow-glow">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="UniDoc" className="w-16 h-16 rounded-2xl object-contain" />
          </div>
          <CardTitle className="text-2xl font-bold">Acesso Administrativo</CardTitle>
          <CardDescription>
            Entre com suas credenciais para gerenciar agendamentos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6" autoComplete="off">
            {/* Campos fantasmas para impedir o autofill do navegador */}
            <input type="text" name="fakeusernameremembered" autoComplete="username" style={{ display: "none" }} tabIndex={-1} aria-hidden="true" />
            <input type="password" name="fakepasswordremembered" autoComplete="new-password" style={{ display: "none" }} tabIndex={-1} aria-hidden="true" />
            <div className="space-y-2">
              <Label htmlFor="email">E-mail / Usuário</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-muted-foreground" size={18} />
                <Input 
                  id="email" 
                  name="login-email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-mail"
                  className="pl-10 bg-white/5 border-white/10"
                  required
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-form-type="other"
                  data-lpignore="true"
                  data-1p-ignore="true"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-muted-foreground" size={18} />
                <Input 
                  id="password" 
                  name="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 bg-white/5 border-white/10"
                  required
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-form-type="other"
                  data-lpignore="true"
                  data-1p-ignore="true"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary-gradient text-primary-foreground font-bold h-12 rounded-full"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

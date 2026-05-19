import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { setupAdmin } from "@/lib/bookings.functions";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock, Mail, Loader2 } from "lucide-react";
import logo from "@/assets/unidoc-official-logo.png";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const runSetup = useServerFn(setupAdmin);
  
  const [email, setEmail] = useState("ededwindacruz@gmail.com");
  const [password, setPassword] = useState("maisresultadosonline");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Ensure admin user exists on first load
    const init = async () => {
      try {
        await runSetup();
      } catch (err) {
        console.error("Setup failed", err);
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.session) {
        toast.error("Credenciais inválidas.");
        setIsLoading(false);
        return;
      }

      toast.success("Bem-vindo de volta!");
      // Força um recarregamento completo para garantir que a sessão esteja ativa
      // antes do beforeLoad do /admin verificar a autenticação
      window.location.href = "/admin";
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login.");
      setIsLoading(false);
    }
  };


  if (isInitializing) {
    return (
      <div className="bg-hero min-h-screen flex items-center justify-center p-6">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

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
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail / Usuário</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-muted-foreground" size={18} />
                <Input 
                  id="email" 
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-mail"
                  className="pl-10 bg-white/5 border-white/10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-muted-foreground" size={18} />
                <Input 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 bg-white/5 border-white/10"
                  required
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

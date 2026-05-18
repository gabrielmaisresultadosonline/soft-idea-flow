import { createFileRoute, Outlet, useNavigate, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Calendar, Users, Settings } from "lucide-react";
import logo from "@/assets/new-logo.png";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-[#080b15] text-foreground flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 glass border-r border-white/5 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <img src={logo} alt="UniDoc" width={40} height={40} className="rounded-xl" />
          <span className="font-bold text-xl tracking-tight">Admin UniDoc</span>
        </div>

        <nav className="flex-1 space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl bg-white/5" onClick={() => navigate({ to: "/admin" })}>
            <LayoutDashboard size={20} className="text-primary" />
            Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl text-muted-foreground hover:bg-white/5" disabled>
            <Calendar size={20} />
            Calendário
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl text-muted-foreground hover:bg-white/5" disabled>
            <Users size={20} />
            Pacientes
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl text-muted-foreground hover:bg-white/5" disabled>
            <Settings size={20} />
            Configurações
          </Button>
        </nav>

        <div className="pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <p className="text-xs text-muted-foreground">Administrador</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            Sair do Painel
          </Button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

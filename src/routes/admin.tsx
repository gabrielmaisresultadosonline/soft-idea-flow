import { createFileRoute, Outlet, useNavigate, redirect, useLocation } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Calendar, Users, Settings } from "lucide-react";
import logo from "@/assets/unidoc-official-logo.png";

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
  const location = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row font-sans admin-light">
      {/* Sidebar */}
      <aside className="w-full lg:w-72 bg-card border-r border-border p-6 flex flex-col gap-10 z-20 shadow-sm">
        <div className="flex items-center gap-3 px-2">
          <div className="bg-primary/5 p-2 rounded-2xl border border-primary/10">
            <img src={logo} alt="UniDoc" width={42} height={42} className="rounded-xl" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-2xl tracking-tighter text-primary uppercase">UniDoc</span>
            <span className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase opacity-80 leading-none">Painel Administrativo</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <Button 
            variant="ghost" 
            className={`w-full justify-start gap-4 h-12 rounded-xl transition-all ${location.pathname === '/admin' || location.pathname === '/admin/' ? 'bg-primary/10 text-primary font-bold border border-primary/10' : 'text-muted-foreground hover:bg-accent'}`}
            onClick={() => navigate({ to: "/admin" })}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </Button>
          <Button 
            variant="ghost" 
            className={`w-full justify-start gap-4 h-12 rounded-xl transition-all group ${location.pathname === '/admin/doctors' ? 'bg-primary/10 text-primary font-bold border border-primary/10' : 'text-muted-foreground hover:bg-accent'}`}
            onClick={() => navigate({ to: "/admin/doctors" })}
          >
            <Users size={20} className={location.pathname === '/admin/doctors' ? 'text-primary' : 'group-hover:text-primary transition-colors'} />
            <span className="font-semibold">Médicos</span>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-4 h-12 rounded-xl text-muted-foreground hover:bg-accent transition-all group opacity-50" disabled>
            <Settings size={20} />
            <span className="font-semibold">Configurações</span>
          </Button>
        </nav>

        <div className="pt-6 border-t border-border">
          <div className="flex items-center gap-4 mb-6 px-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-lg border border-primary/20 shadow-sm">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-foreground leading-tight">Administrador</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Online</p>
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-4 h-12 rounded-xl text-muted-foreground font-semibold hover:bg-destructive/10 hover:text-destructive transition-all"
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

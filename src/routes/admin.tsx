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
    <div className="min-h-screen bg-hero text-foreground flex flex-col lg:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full lg:w-72 glass border-r border-white/10 p-6 flex flex-col gap-10 shadow-glow-blue/5 z-20">
        <div className="flex items-center gap-3 px-2">
          <div className="bg-primary/10 p-2 rounded-2xl border border-primary/20 shadow-glow-blue/10">
            <img src={logo} alt="UniDoc" width={42} height={42} className="rounded-xl" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-2xl tracking-tighter bg-primary-gradient bg-clip-text text-transparent uppercase">UniDoc</span>
            <span className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase opacity-80 leading-none">Painel Administrativo</span>
          </div>
        </div>

        <nav className="flex-1 space-y-3">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-4 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-bold shadow-glow-blue/5 transition-all hover:bg-primary/20" 
            onClick={() => navigate({ to: "/admin" })}
          >
            <LayoutDashboard size={24} />
            Dashboard
          </Button>
          <Button 
            variant="ghost" 
            className={`w-full justify-start gap-4 h-14 rounded-2xl transition-all group ${location.pathname === '/admin/doctors' ? 'bg-primary/10 border border-primary/20 text-primary font-bold' : 'text-muted-foreground hover:bg-white/5'}`}
            onClick={() => navigate({ to: "/admin/doctors" })}
          >
            <Users size={22} className={location.pathname === '/admin/doctors' ? 'text-primary' : 'group-hover:text-primary transition-colors'} />
            <span className="font-semibold">Médicos</span>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-4 h-14 rounded-2xl text-muted-foreground hover:bg-white/5 transition-all group" disabled>
            <Settings size={22} className="group-hover:text-primary transition-colors" />
            <span className="font-semibold">Configurações</span>
          </Button>
        </nav>

        <div className="pt-6 border-t border-white/10">
          <div className="flex items-center gap-4 mb-6 px-2">
            <div className="w-12 h-12 rounded-2xl bg-primary-gradient flex items-center justify-center text-primary-foreground font-black text-xl shadow-glow-blue/20 border border-white/20">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-foreground leading-tight">{user?.email}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Online</p>
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-4 h-14 rounded-2xl text-destructive font-bold hover:bg-destructive/10 hover:text-destructive transition-all border border-transparent hover:border-destructive/20"
            onClick={handleLogout}
          >
            <LogOut size={22} />
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

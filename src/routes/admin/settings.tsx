import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getAppSettings, updateAppSettings } from "@/lib/settings.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Mail, Save, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const fetchSettings = useServerFn(getAppSettings);
  const updateSettingsFn = useServerFn(updateAppSettings);
  
  const { data: settings, isLoading, refetch } = useQuery({
    queryKey: ["appSettings"],
    queryFn: () => fetchSettings(),
  });

  const [notificationEmail, setNotificationEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setNotificationEmail(settings.notification_email);
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettingsFn({ data: { notificationEmail } });
      toast.success("Configurações atualizadas com sucesso!");
      refetch();
    } catch (error: any) {
      console.error("Save settings error:", error);
      toast.error(error?.message || "Erro ao atualizar configurações.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-4xl font-black tracking-tighter text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">Gerencie as preferências globais do sistema.</p>
      </div>

      <div className="max-w-2xl">
        <Card className="bg-card/30 backdrop-blur-xl border-white/5 shadow-2xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/10">
                <Mail size={20} />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Notificações por E-mail</CardTitle>
            </div>
            <CardDescription className="text-base">
              Defina para qual e-mail serão enviados os avisos de novos agendamentos.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSave} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  E-mail do Proprietário
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={notificationEmail}
                    onChange={(e) => setNotificationEmail(e.target.value)}
                    placeholder="exemplo@unidoctelemedicina.com.br"
                    required
                    className="h-14 bg-white/5 border-white/10 rounded-xl focus:ring-primary/20 focus:border-primary/30 transition-all text-lg pl-4 pr-4"
                  />
                </div>
                <p className="text-xs text-muted-foreground ml-1 italic">
                  Este e-mail receberá um alerta toda vez que um novo cliente realizar um agendamento.
                </p>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="w-full h-14 rounded-xl text-lg font-bold transition-all shadow-glow hover:translate-y-[-2px] active:translate-y-[0px]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Salvar Configurações
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
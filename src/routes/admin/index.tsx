import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBookings, updateBookingStatus } from "@/lib/bookings.functions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  MoreHorizontal, 
  CheckCircle, 
  XCircle, 
  Clock4,
  ExternalLink,
  MessageCircle,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/admin/")({
  component: DashboardPage,
});

function DashboardPage() {
  const queryClient = useQueryClient();
  const fetchBookings = useServerFn(getBookings);
  const updateFn = useServerFn(updateBookingStatus);

  const { data: bookings, isLoading, error } = useQuery({
    queryKey: ["bookings"],
    queryFn: () => fetchBookings(),
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { id: string; status: "pending" | "confirmed" | "cancelled" }) => 
      updateFn({ data: vars }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Status atualizado!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Erro ao atualizar.");
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center glass rounded-3xl border-destructive/20 text-destructive">
        <h2 className="text-xl font-bold mb-2">Erro ao carregar agendamentos</h2>
        <p>{(error as any).message}</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/20">Confirmado</Badge>;
      case "cancelled":
        return <Badge className="bg-destructive/20 text-destructive border-destructive/20">Cancelado</Badge>;
      default:
        return <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/20">Pendente</Badge>;
    }
  };

  const stats = [
    { label: "Total de Agendamentos", value: bookings?.length || 0, icon: Calendar, color: "text-primary" },
    { label: "Pendentes", value: bookings?.filter(b => b.status === "pending").length || 0, icon: Clock4, color: "text-amber-500" },
    { label: "Confirmados", value: bookings?.filter(b => b.status === "confirmed").length || 0, icon: CheckCircle, color: "text-emerald-500" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Visão Geral</h1>
        <p className="text-muted-foreground text-lg">Gerencie todas as consultas e solicitações de pacientes.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s) => (
          <Card key={s.label} className="glass border-white/5 shadow-card hover:border-primary/20 transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{s.label}</p>
                  <p className="text-3xl font-bold">{s.value}</p>
                </div>
                <div className={`p-3 rounded-2xl bg-white/5 ${s.color}`}>
                  <s.icon size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bookings Table */}
      <Card className="glass border-white/5 shadow-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <div>
            <CardTitle className="text-xl">Agendamentos Recentes</CardTitle>
            <CardDescription>Lista cronológica de todas as consultas marcadas.</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="rounded-xl bg-white/5 border-white/10" onClick={() => queryClient.invalidateQueries({ queryKey: ["bookings"] })}>
            Atualizar Lista
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-white/5 overflow-hidden">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="hover:bg-transparent border-white/5">
                  <TableHead className="font-bold">Paciente</TableHead>
                  <TableHead className="font-bold">Data e Hora</TableHead>
                  <TableHead className="font-bold">WhatsApp</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="text-right font-bold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      Nenhum agendamento encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings?.map((b) => (
                    <TableRow key={b.id} className="hover:bg-white/5 border-white/5 transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold">{b.full_name}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail size={12} /> {b.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Calendar size={14} className="text-primary" />
                            {format(new Date(b.appointment_time), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1.5 pl-5">
                            <Clock size={12} />
                            {format(new Date(b.appointment_time), "HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <a 
                          href={`https://wa.me/${b.whatsapp.replace(/\D/g, '')}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-2 text-emerald-500 hover:underline font-medium"
                        >
                          <MessageCircle size={16} />
                          {b.whatsapp}
                        </a>
                      </TableCell>
                      <TableCell>{getStatusBadge(b.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                              <MoreHorizontal size={20} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass border-white/10 text-foreground w-48">
                            <DropdownMenuItem 
                              className="gap-2 focus:bg-emerald-500/10 focus:text-emerald-500"
                              onClick={() => updateMutation.mutate({ id: b.id, status: "confirmed" })}
                            >
                              <CheckCircle size={16} /> Confirmar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2 focus:bg-destructive/10 focus:text-destructive"
                              onClick={() => updateMutation.mutate({ id: b.id, status: "cancelled" })}
                            >
                              <XCircle size={16} /> Cancelar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2" onClick={() => window.open(`mailto:${b.email}`)}>
                              <Mail size={16} /> Enviar E-mail
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

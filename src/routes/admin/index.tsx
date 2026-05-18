import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBookings, updateBookingStatus } from "@/lib/bookings.functions";
import { getDoctors } from "@/lib/doctors.functions";
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
  Loader2,
  Stethoscope
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
  const fetchDoctors = useServerFn(getDoctors);
  const updateFn = useServerFn(updateBookingStatus);

  const { data: bookings, isLoading: isBookingsLoading } = useQuery({
    queryKey: ["bookings"],
    queryFn: () => fetchBookings(),
    refetchInterval: 10000,
  });

  const { data: doctors } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => fetchDoctors(),
  });

  const isLoading = isBookingsLoading;

  const updateMutation = useMutation({
    mutationFn: (vars: { 
      id: string; 
      status?: "pending" | "confirmed" | "cancelled";
      paymentStatus?: "pending" | "paid";
      attendanceStatus?: "waiting" | "completed" | "missed";
      doctorId?: string;
    }) => updateFn({ data: vars }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Atualizado com sucesso!");
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

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/20">Pago</Badge>;
      default:
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/20">Pendente</Badge>;
    }
  };

  const getAttendanceBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/20">Concluído</Badge>;
      case "missed":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/20">Faltou</Badge>;
      default:
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/20">Aguardando</Badge>;
    }
  };

  const stats = [
    { 
      label: "Aguardando Contato", 
      value: bookings?.filter(b => b.status === "pending").length || 0, 
      icon: Clock4, 
      color: "text-amber-500",
      description: "Novos leads"
    },
    { 
      label: "Pagos (Aguardando Atendimento)", 
      value: bookings?.filter(b => b.payment_status === "paid" && b.attendance_status === "waiting").length || 0, 
      icon: CheckCircle, 
      color: "text-blue-500",
      description: "Prontos para consulta"
    },
    { 
      label: "Total Concluídos", 
      value: bookings?.filter(b => b.attendance_status === "completed").length || 0, 
      icon: CheckCircle, 
      color: "text-purple-500",
      description: "Consultas realizadas"
    },
    { 
      label: "Pagos e Não Concluídos", 
      value: bookings?.filter(b => b.payment_status === "paid" && b.attendance_status !== "completed").length || 0, 
      icon: MessageCircle, 
      color: "text-emerald-500",
      description: "Em andamento"
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 uppercase italic bg-primary-gradient bg-clip-text text-transparent">Centro de Operações</h1>
          <p className="text-muted-foreground text-lg font-medium">Gestão inteligente e monitoramento em tempo real.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end mr-2">
             <span className="text-[10px] font-bold text-primary uppercase tracking-widest opacity-60">Status do Servidor</span>
             <span className="text-xs font-black text-emerald-500">CONECTADO</span>
          </div>
          <Button 
            variant="outline" 
            size="lg" 
            className="rounded-2xl bg-white/5 border-white/10 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all px-8 h-14 font-bold shadow-glow-blue/5"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["bookings"] })}
          >
            <Loader2 className={`mr-2 h-5 w-5 ${isLoading || updateMutation.isPending ? 'animate-spin' : ''}`} />
            Sincronizar
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => (
          <Card key={s.label} className="glass border-white/10 shadow-card hover:border-primary/40 transition-all group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors`}></div>
            <CardContent className="pt-8 pb-6 relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 ${s.color} shadow-glow-blue/5 group-hover:scale-110 transition-transform`}>
                  <s.icon size={28} />
                </div>
                <div className="text-right">
                  <p className="text-4xl font-black tracking-tighter italic">{s.value}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-black text-foreground mb-1 uppercase tracking-tight">{s.label}</p>
                <p className="text-xs text-muted-foreground font-medium">{s.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bookings Table */}
      <Card className="glass border-white/5 shadow-card overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Fila de Atendimento</CardTitle>
          <CardDescription>Gerencie o status de cada agendamento abaixo.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="hover:bg-transparent border-white/5">
                  <TableHead className="font-bold min-w-[200px]">Paciente</TableHead>
                  <TableHead className="font-bold">Agendado</TableHead>
                  <TableHead className="font-bold">Contato</TableHead>
                  <TableHead className="font-bold">Pagamento</TableHead>
                  <TableHead className="font-bold">Atendimento</TableHead>
                  <TableHead className="text-right font-bold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      Nenhum agendamento encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings?.map((b) => (
                    <TableRow key={b.id} className="hover:bg-white/5 border-white/5 transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-base">{b.full_name}</span>
                            {b.doctor_id && (
                              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] h-5 uppercase font-black tracking-widest italic px-2">
                                Atribuído
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail size={12} /> {b.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span className="font-medium">
                            {format(new Date(b.appointment_time), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(b.appointment_time), "HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <a 
                          href={`https://wa.me/${(b.whatsapp || '').replace(/\D/g, '')}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-2 text-emerald-500 hover:text-emerald-400 font-bold text-sm"
                        >
                          <MessageCircle size={16} />
                          WhatsApp
                        </a>
                      </TableCell>
                      <TableCell>{getPaymentBadge(b.payment_status || "pending")}</TableCell>
                      <TableCell>{getAttendanceBadge(b.attendance_status || "waiting")}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                              <MoreHorizontal size={20} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass border-white/10 text-foreground w-56">
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ações de Status</div>
                            <DropdownMenuItem 
                              className="gap-2 focus:bg-emerald-500/10 focus:text-emerald-500"
                              onClick={() => updateMutation.mutate({ id: b.id, status: "confirmed" })}
                            >
                              <CheckCircle size={16} /> Confirmar Contato
                            </DropdownMenuItem>
                            
                            <div className="h-px bg-white/10 my-1" />
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Atribuir Médico</div>
                            {doctors?.map((doc) => (
                              <DropdownMenuItem 
                                key={doc.id}
                                className={`gap-2 ${b.doctor_id === doc.id ? 'bg-primary/20 text-primary' : ''}`}
                                onClick={() => updateMutation.mutate({ id: b.id, doctorId: doc.id })}
                              >
                                <Stethoscope size={14} /> {doc.name}
                              </DropdownMenuItem>
                            ))}
                            {(!doctors || doctors.length === 0) && (
                              <div className="px-2 py-1.5 text-[10px] text-muted-foreground italic">Nenhum médico cadastrado</div>
                            )}

                            <div className="h-px bg-white/10 my-1" />
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pagamento</div>
                            <DropdownMenuItem 
                              className="gap-2 focus:bg-blue-500/10 focus:text-blue-400"
                              onClick={() => updateMutation.mutate({ id: b.id, paymentStatus: "paid" })}
                            >
                              <CheckCircle size={16} /> Marcar como PAGO
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2"
                              onClick={() => updateMutation.mutate({ id: b.id, paymentStatus: "pending" })}
                            >
                              <Clock size={16} /> Voltar para Pendente
                            </DropdownMenuItem>

                            <div className="h-px bg-white/10 my-1" />
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Atendimento</div>
                            <DropdownMenuItem 
                              className="gap-2 focus:bg-purple-500/10 focus:text-purple-400"
                              onClick={() => updateMutation.mutate({ id: b.id, attendanceStatus: "completed" })}
                            >
                              <CheckCircle size={16} /> Marcar CONCLUÍDO
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2 focus:bg-red-500/10 focus:text-red-400"
                              onClick={() => updateMutation.mutate({ id: b.id, attendanceStatus: "missed" })}
                            >
                              <XCircle size={16} /> Marcar como FALTOU
                            </DropdownMenuItem>

                            <div className="h-px bg-white/10 my-1" />
                            <DropdownMenuItem 
                              className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                              onClick={() => updateMutation.mutate({ id: b.id, status: "cancelled" })}
                            >
                              <XCircle size={16} /> Cancelar Tudo
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

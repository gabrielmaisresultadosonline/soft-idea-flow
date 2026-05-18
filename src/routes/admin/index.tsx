import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBookings, updateBookingStatus, clearBookings } from "@/lib/bookings.functions";
import { getDoctors } from "@/lib/doctors.functions";
import { getAnalytics } from "@/lib/analytics.functions";
import { useEffect, useState, useMemo } from "react";
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
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
  Stethoscope,
  Copy,
  ShieldCheck,
  TrendingUp,
  Users,
  Eye,
  Activity,
  BarChart as BarChartIcon
} from "lucide-react";
import { format, startOfDay, subDays, eachHourOfInterval, isSameHour, isSameDay } from "date-fns";
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
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const queryClient = useQueryClient();
  const fetchBookings = useServerFn(getBookings);
  const fetchDoctors = useServerFn(getDoctors);
  const fetchAnalytics = useServerFn(getAnalytics);
  const updateFn = useServerFn(updateBookingStatus);
  const clearFn = useServerFn(clearBookings);

  const [showAnalytics, setShowAnalytics] = useState(false);

  const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => fetchAnalytics(),
    refetchInterval: 60000, // Refresh every minute
  });

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

  const clearMutation = useMutation({
    mutationFn: () => clearFn(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Fila zerada com sucesso!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Erro ao zerar fila.");
    }
  });

  const analyticsData = useMemo(() => {
    if (!analytics) return { hourly: [], daily: [], todayTotal: 0, total: 0 };

    const now = new Date();
    const today = startOfDay(now);
    
    const todayVisits = analytics.filter(v => isSameDay(new Date(v.created_at), today));
    
    // Hourly data for today
    const hourlyData = eachHourOfInterval({
      start: today,
      end: now
    }).map(hour => {
      const count = todayVisits.filter(v => isSameHour(new Date(v.created_at), hour)).length;
      return {
        hour: format(hour, "HH:00"),
        visits: count
      };
    });

    // Simple daily data for last 7 days
    const dailyData = Array.from({ length: 7 }).map((_, i) => {
      const day = subDays(today, 6 - i);
      const count = analytics.filter(v => isSameDay(new Date(v.created_at), day)).length;
      return {
        day: format(day, "dd/MM"),
        visits: count
      };
    });

    return {
      hourly: hourlyData,
      daily: dailyData,
      todayTotal: todayVisits.length,
      total: analytics.length
    };
  }, [analytics]);

  if (!isClient || isLoading || isAnalyticsLoading) {
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
    { 
      label: "Visitas Hoje", 
      value: analyticsData.todayTotal, 
      icon: Eye, 
      color: "text-primary",
      description: "Tráfego em tempo real"
    },
    { 
      label: "Total de Visitas", 
      value: analyticsData.total, 
      icon: Activity, 
      color: "text-blue-400",
      description: "Desde o início"
    },
  ];

  const copyToClipboard = (text: string | null | undefined, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const copyAllData = (b: any) => {
    const text = `Nome: ${b.full_name}\nE-mail: ${b.email}\nWhatsApp: ${b.whatsapp || 'N/A'}\nCPF: ${b.cpf || 'N/A'}`;
    navigator.clipboard.writeText(text);
    toast.success("Todos os dados copiados!");
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 uppercase italic text-primary">Operações em Tempo Real</h1>
          <p className="text-muted-foreground text-lg font-medium">Gestão inteligente e monitoramento de performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end mr-2">
             <span className="text-[10px] font-bold text-primary uppercase tracking-widest opacity-60">Status do Servidor</span>
             <span className="text-xs font-black text-emerald-500">CONECTADO</span>
          </div>
          <Button 
            variant="outline" 
            size="lg" 
            className="rounded-2xl bg-white border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all px-8 h-14 font-bold shadow-sm"
            onClick={() => setShowAnalytics(!showAnalytics)}
          >
            <Activity className={`mr-2 h-5 w-5 ${showAnalytics ? 'text-primary' : ''}`} />
            {showAnalytics ? "Ocultar Analytics" : "Ver Analytics"}
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="rounded-2xl bg-white border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all px-8 h-14 font-bold shadow-sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["bookings"] })}
          >
            <Loader2 className={`mr-2 h-5 w-5 ${isLoading || updateMutation.isPending ? 'animate-spin' : ''}`} />
            Sincronizar
          </Button>
        </div>
      </div>

      {/* Analytics Chart */}
      {showAnalytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <Card className="bg-card border-border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-primary uppercase font-black italic">
                <TrendingUp size={20} />
                Visitas por Hora (Hoje)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] pb-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData.hourly}>
                  <defs>
                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0066FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0066FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#00000010" vertical={false} />
                  <XAxis 
                    dataKey="hour" 
                    stroke="#00000060" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#00000060" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #00000010',
                      borderRadius: '12px',
                      color: '#000000'
                    }}
                    itemStyle={{ color: '#0066FF' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="visits" 
                    stroke="#0066FF" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorVisits)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-primary uppercase font-black italic">
                <BarChartIcon size={20} />
                Visitas nos Últimos 7 Dias
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] pb-8">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={analyticsData.daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#00000010" vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    stroke="#00000060" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#00000060" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <Tooltip 
                    cursor={{fill: '#00000005'}}
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #00000010',
                      borderRadius: '12px',
                      color: '#000000'
                    }}
                    itemStyle={{ color: '#0066FF' }}
                  />
                  <Bar 
                    dataKey="visits" 
                    fill="#0066FF" 
                    radius={[4, 4, 0, 0]} 
                    barSize={30}
                  />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {stats.map((s) => (
          <Card key={s.label} className="bg-card border-border shadow-sm hover:border-primary/40 transition-all group relative overflow-hidden">
            <CardContent className="pt-8 pb-6 relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-4 rounded-2xl bg-muted border border-border ${s.color} group-hover:scale-105 transition-transform`}>
                  <s.icon size={24} />
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
      <Card className="bg-card border-border shadow-sm overflow-hidden">
        <CardHeader className="pb-2 border-b border-border flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl uppercase font-black italic">Fila de Atendimento</CardTitle>
            <CardDescription>Gerencie o status de cada agendamento abaixo.</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10 font-bold uppercase tracking-widest text-[10px] h-8 px-4 rounded-xl border border-destructive/20"
            onClick={() => {
              if (confirm("Tem certeza que deseja zerar TODA a fila de atendimento? Esta ação não pode ser desfeita.")) {
                clearMutation.mutate();
              }
            }}
            disabled={clearMutation.isPending || !bookings || bookings.length === 0}
          >
            {clearMutation.isPending ? "Limpando..." : "Zerar Fila"}
          </Button>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="font-bold text-xs uppercase tracking-wider py-4">Paciente</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider py-4">CPF</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider py-4">Agendado</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider py-4">Contato</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider py-4">Pagamento</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider py-4">Atendimento</TableHead>
                  <TableHead className="text-right font-bold text-xs uppercase tracking-wider py-4">Ações</TableHead>
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
                    <TableRow key={b.id} className="hover:bg-muted/50 border-border transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-base group/name relative">
                              {b.full_name}
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-4 w-4 ml-1 opacity-0 group-hover/name:opacity-100 transition-opacity" 
                                onClick={() => copyToClipboard(b.full_name, "Nome")}
                              >
                                <Copy size={10} />
                              </Button>
                            </span>
                            {b.doctor_id && (
                              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] h-5 uppercase font-black tracking-widest italic px-2">
                                Atribuído
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground flex items-center gap-1 group relative">
                            <Mail size={12} /> {b.email}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" 
                              onClick={() => copyToClipboard(b.email, "E-mail")}
                            >
                              <Copy size={10} />
                            </Button>
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 group">
                          <span className="text-sm font-medium">{b.cpf || '---'}</span>
                          {b.cpf && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" 
                              onClick={() => copyToClipboard(b.cpf, "CPF")}
                            >
                              <Copy size={10} />
                            </Button>
                          )}
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
                        <div className="flex items-center gap-3">
                          <a 
                            href={`https://wa.me/${(b.whatsapp || '').replace(/\D/g, '')}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center gap-2 text-emerald-500 hover:text-emerald-400 font-bold text-sm"
                          >
                            <MessageCircle size={16} />
                            WhatsApp
                          </a>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-muted-foreground hover:text-primary" 
                            onClick={() => copyToClipboard(b.whatsapp, "WhatsApp")}
                          >
                            <Copy size={14} />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{getPaymentBadge(b.payment_status || "pending")}</TableCell>
                      <TableCell>{getAttendanceBadge(b.attendance_status || "waiting")}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                              <MoreHorizontal size={20} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border text-foreground w-56 shadow-xl">
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ações de Status</div>
                            <DropdownMenuItem 
                              className="gap-2 font-bold text-primary focus:bg-primary/10 focus:text-primary"
                              onClick={() => copyAllData(b)}
                            >
                              <Copy size={16} /> Copiar Todos os Dados
                            </DropdownMenuItem>
                             <div className="h-px bg-border my-1" />
                            <DropdownMenuItem 
                              className="gap-2 focus:bg-emerald-500/10 focus:text-emerald-500"
                              onClick={() => updateMutation.mutate({ id: b.id, status: "confirmed" })}
                            >
                              <CheckCircle size={16} /> Confirmar Contato
                            </DropdownMenuItem>
                            
                             <div className="h-px bg-border my-1" />
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

                             <div className="h-px bg-border my-1" />
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

                             <div className="h-px bg-border my-1" />
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

                            <div className="h-px bg-border my-1" />
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

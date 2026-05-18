import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { createBooking } from "@/lib/bookings.functions";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  User,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  Clock,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Copy,
} from "lucide-react";
import logo from "@/assets/unidoc-official-logo.png";
import { format, startOfToday, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/booking")({
  component: BookingPage,
});

const timeSlots = [
  "08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
];

function BookingPage() {
  const navigate = useNavigate();
  const bookFn = useServerFn(createBooking);
  
  const [isClient, setIsClient] = useState(false);
  const [step, setStep] = useState(1);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    whatsapp: "",
    cpf: "",
    lgpdAccepted: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const nextStep = () => {
    if (step === 1) {
      if (!formData.fullName || !formData.email || !formData.whatsapp || !formData.cpf) {
        toast.error("Por favor, preencha todos os dados.");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("Por favor, insira um e-mail válido.");
        return;
      }
      if (!formData.lgpdAccepted) {
        toast.error("Você precisa aceitar os termos da LGPD para continuar.");
        return;
      }
    }
    if (step === 2) {
      if (!date) {
        toast.error("Por favor, selecione uma data.");
        return;
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
    else navigate({ to: "/" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) {
      toast.error("Por favor, selecione data e horário.");
      return;
    }

    setIsSubmitting(true);
    try {
      const [hours, minutes] = time.split(":").map(Number);
      const appointmentDate = new Date(date);
      appointmentDate.setHours(hours, minutes, 0, 0);

      await bookFn({
        data: {
          ...formData,
          appointmentTime: appointmentDate.toISOString(),
        },
      });

      setIsSuccess(true);
      toast.success("Consulta agendada com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao agendar consulta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [id]: type === 'checkbox' ? checked : value 
    }));
  };

  if (isSuccess) {
    return (
      <div className="bg-hero min-h-screen flex items-center justify-center p-6 text-foreground">
        <Card className="max-w-md w-full glass border-white/10 text-center p-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <CheckCircle2 size={48} />
            </div>
          </div>
          <CardTitle className="text-3xl mb-4">Agendamento Realizado!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground mb-8">
            Sua consulta foi agendada para o dia{" "}
            <span className="text-primary font-bold">
              {date && format(date, "dd 'de' MMMM", { locale: ptBR })}
            </span>{" "}
            às <span className="text-primary font-bold">{time}</span>.
            <br /><br />
            Você receberá as orientações em breve no seu e-mail e WhatsApp.
          </CardDescription>
          <Button 
            className="w-full bg-primary-gradient text-primary-foreground font-bold h-12 rounded-full"
            onClick={() => navigate({ to: "/" })}
          >
            Voltar para o Início
          </Button>
        </Card>
      </div>
    );
  }

  if (!isClient) return <div className="bg-hero min-h-screen" />;

  return (
    <div className="bg-hero min-h-screen py-6 lg:py-10 px-2 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={prevStep}
              className="rounded-full text-muted-foreground hover:text-foreground hover:bg-white/5 w-10 h-10"
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="flex items-center gap-2">
              <img src={logo} alt="UniDoc" width={32} height={32} className="rounded-lg" />
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">Agendamento</h1>
            </div>
          </div>
          <div className="text-xs sm:text-sm font-medium text-muted-foreground bg-white/5 px-3 py-1 rounded-full border border-white/10">
            Passo <span className="text-primary font-bold">{step}</span> de 3
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/5 rounded-full mb-8 overflow-hidden">
          <div 
            className="h-full bg-primary-gradient transition-all duration-500 shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="space-y-6">
          {step === 1 && (
            <Card className="glass border-white/10 shadow-card animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <User className="text-primary" size={22} />
                  Seus Dados
                </CardTitle>
                <CardDescription>
                  Preencha as informações para iniciarmos o agendamento.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="fullName" className="text-sm font-semibold tracking-wide uppercase opacity-70">Nome Completo</Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                    <Input 
                      id="fullName" 
                      placeholder="Ex: João Silva" 
                      className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl focus:bg-white/10 transition-all text-lg" 
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-semibold tracking-wide uppercase opacity-70">E-mail</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="seu@email.com" 
                      className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl focus:bg-white/10 transition-all text-lg" 
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="whatsapp" className="text-sm font-semibold tracking-wide uppercase opacity-70">WhatsApp</Label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                    <Input 
                      id="whatsapp" 
                      placeholder="(00) 00000-0000" 
                      className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl focus:bg-white/10 transition-all text-lg" 
                      value={formData.whatsapp}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="cpf" className="text-sm font-semibold tracking-wide uppercase opacity-70">CPF</Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                    <Input 
                      id="cpf" 
                      placeholder="000.000.000-00" 
                      className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl focus:bg-white/10 transition-all text-lg" 
                      value={formData.cpf}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 mt-2">
                  <div className="flex items-center h-6">
                    <input
                      id="lgpdAccepted"
                      type="checkbox"
                      className="w-5 h-5 rounded border-white/10 bg-white/5 text-primary focus:ring-primary focus:ring-offset-0"
                      checked={formData.lgpdAccepted}
                      onChange={handleInputChange}
                    />
                  </div>
                  <Label htmlFor="lgpdAccepted" className="text-xs sm:text-sm text-muted-foreground leading-relaxed cursor-pointer select-none">
                    Estou de acordo com a <span className="text-primary font-bold">LGPD</span> (Lei Geral de Proteção de Dados) e autorizo o uso das minhas informações para fins de agendamento e contato.
                  </Label>
                </div>

                <Button 
                  onClick={nextStep}
                  className="w-full bg-primary-gradient text-primary-foreground font-bold h-16 rounded-3xl text-xl shadow-glow hover:scale-[1.02] transition-transform mt-4 flex items-center justify-center gap-2"
                >
                  Continuar <ChevronRight size={24} />
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card className="glass border-white/10 shadow-card animate-in fade-in slide-in-from-right-4 duration-500 overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CalendarIcon className="text-primary" size={22} />
                  Escolha a Data
                </CardTitle>
                <CardDescription>
                  Selecione o melhor dia para sua consulta online.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 sm:p-4 lg:p-6">
                <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-5">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => isBefore(date, startOfToday())}
                    className="w-full max-w-none p-0 pointer-events-auto [&_.rdp-months]:!w-full [&_.rdp-month]:!w-full [&_.rdp-month_grid]:!w-full [&_.rdp-weekdays]:!grid [&_.rdp-weekdays]:!grid-cols-7 [&_.rdp-weekdays]:!w-full [&_.rdp-week]:!grid [&_.rdp-week]:!grid-cols-7 [&_.rdp-week]:!w-full [&_.rdp-day]:!w-full [&_.rdp-day_button]:!w-full"
                    locale={ptBR}
                    classNames={{
                      root: "!w-full max-w-none",
                      months: "w-full max-w-none",
                      month: "w-full max-w-none gap-4",
                      month_caption: "flex h-12 w-full items-center justify-center px-12 sm:h-14",
                      caption_label: "text-lg sm:text-xl lg:text-2xl font-bold text-primary uppercase tracking-wider",
                      nav: "absolute inset-x-0 top-0 flex w-full items-center justify-between",
                      button_previous: "h-11 w-11 rounded-xl border border-white/10 bg-white/5 p-0 hover:bg-primary hover:text-primary-foreground sm:h-12 sm:w-12",
                      button_next: "h-11 w-11 rounded-xl border border-white/10 bg-white/5 p-0 hover:bg-primary hover:text-primary-foreground sm:h-12 sm:w-12",
                      month_grid: "w-full border-separate border-spacing-x-1 border-spacing-y-2 sm:border-spacing-x-2 sm:border-spacing-y-3",
                      weekdays: "grid w-full grid-cols-7 gap-1 sm:gap-2",
                      weekday: "flex h-8 items-center justify-center text-[10px] font-bold uppercase text-muted-foreground opacity-60 sm:text-xs",
                      week: "grid w-full grid-cols-7 gap-1 sm:gap-2 mt-2",
                      day: "aspect-square w-full p-0 text-center",
                      day_button: "h-full min-h-0 w-full min-w-0 rounded-lg border border-white/10 bg-white/5 text-sm font-bold text-foreground transition-all hover:bg-primary/20 hover:text-primary sm:rounded-xl sm:text-lg lg:text-xl data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[selected-single=true]:shadow-glow data-[selected-single=true]:scale-[1.03]",
                      today: "[&_button]:border-primary/50 [&_button]:text-primary [&_button]:bg-primary/5",
                      outside: "opacity-25",
                      disabled: "opacity-15 cursor-not-allowed",
                      hidden: "invisible",
                    }}
                  />
                </div>
                <div className="mt-8">
                  <Button 
                    onClick={nextStep}
                    disabled={!date}
                    className="w-full bg-primary-gradient text-primary-foreground font-bold h-14 sm:h-16 rounded-2xl text-lg sm:text-xl shadow-glow hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    Próximo Passo <ChevronRight size={24} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card className="glass border-white/10 shadow-card animate-in fade-in slide-in-from-right-4 duration-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Clock className="text-primary" size={22} />
                  Escolha o Horário
                </CardTitle>
                <CardDescription>
                  Para o dia {date && format(date, "dd 'de' MMMM", { locale: ptBR })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {timeSlots.map((t) => (
                    <Button
                      key={t}
                      type="button"
                      variant={time === t ? "default" : "outline"}
                      onClick={() => setTime(t)}
                      className={`rounded-2xl h-16 font-bold text-lg transition-all ${
                        time === t 
                          ? "bg-primary text-primary-foreground border-primary shadow-glow scale-105" 
                          : "bg-white/5 border-white/10 hover:bg-primary/20"
                      }`}
                    >
                      {t}
                    </Button>
                  ))}
                </div>
                
                <div className="pt-4 border-t border-white/5 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Resumo:</span>
                    <span className="font-bold text-primary">Consulta Online R$50</span>
                  </div>
                  <Button 
                    onClick={handleSubmit}
                    disabled={!time || isSubmitting}
                    className="w-full bg-primary-gradient text-primary-foreground font-bold h-16 rounded-3xl text-xl shadow-glow hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? "Agendando..." : "Finalizar Agendamento"}
                    {!isSubmitting && <CheckCircle2 size={24} />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

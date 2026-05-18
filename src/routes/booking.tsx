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
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const nextStep = () => {
    if (step === 1) {
      if (!formData.fullName || !formData.email || !formData.whatsapp) {
        toast.error("Por favor, preencha todos os dados.");
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
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
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
    <div className="bg-hero min-h-screen py-8 lg:py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={prevStep}
              className="rounded-full text-muted-foreground hover:text-foreground hover:bg-white/5"
            >
              <ArrowLeft size={24} />
            </Button>
            <div className="flex items-center gap-2">
              <img src={logo} alt="UniDoc" width={40} height={40} className="rounded-xl" />
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Agendamento</h1>
            </div>
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            Passo <span className="text-primary font-bold">{step}</span> de 3
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-white/5 rounded-full mb-10 overflow-hidden">
          <div 
            className="h-full bg-primary-gradient transition-all duration-500" 
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
            <Card className="glass border-white/10 shadow-card animate-in fade-in slide-in-from-right-4 duration-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CalendarIcon className="text-primary" size={22} />
                  Escolha a Data
                </CardTitle>
                <CardDescription>
                  Selecione o melhor dia para sua consulta online.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center p-2 sm:p-4 bg-white/5 rounded-2xl border border-white/5">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => isBefore(date, startOfToday())}
                    className="rounded-md border-none w-full"
                    locale={ptBR}
                    classNames={{
                      months: "w-full",
                      month: "space-y-4 w-full",
                      caption: "flex justify-center pt-1 relative items-center mb-6",
                      caption_label: "text-lg font-bold",
                      nav: "space-x-1 flex items-center",
                      nav_button: "h-10 w-10 bg-white/10 p-0 opacity-100 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors",
                      nav_button_previous: "absolute left-1",
                      nav_button_next: "absolute right-1",
                      table: "w-full border-collapse",
                      head_row: "flex w-full mb-3",
                      head_cell: "text-muted-foreground flex-1 font-medium text-[0.7rem] sm:text-[0.85rem] text-center uppercase tracking-wider",
                      row: "flex w-full mt-2 gap-1",
                      cell: "relative flex-1 p-0 text-center focus-within:relative focus-within:z-20",
                      day: "h-10 sm:h-14 w-full p-0 font-medium hover:bg-white/10 rounded-xl transition-all flex items-center justify-center text-sm sm:text-lg",
                      day_selected: "bg-primary! text-primary-foreground! hover:bg-primary! hover:text-primary-foreground! focus:bg-primary! focus:text-primary-foreground! shadow-glow opacity-100!",
                      day_today: "border-2 border-primary/20 text-primary font-bold",
                      day_outside: "text-muted-foreground opacity-20",
                      day_disabled: "text-muted-foreground opacity-10 cursor-not-allowed",
                      day_hidden: "invisible",
                    }}
                  />
                </div>
                <Button 
                  onClick={nextStep}
                  disabled={!date}
                  className="w-full bg-primary-gradient text-primary-foreground font-bold h-16 rounded-3xl text-xl shadow-glow hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  Próximo Passo <ChevronRight size={24} />
                </Button>
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

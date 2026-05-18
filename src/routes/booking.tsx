import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Suspense, lazy } from "react";
import { useState } from "react";
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
} from "lucide-react";
import logo from "@/assets/unidoc-official-logo.png";
import { format, addHours, startOfToday, isBefore, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/booking")({
  component: () => (
    <Suspense fallback={<div className="bg-hero min-h-screen" />}>
      <BookingPage />
    </Suspense>
  ),
});

const timeSlots = [
  "08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
];

function BookingPage() {
  const navigate = useNavigate();
  const bookFn = useServerFn(createBooking);
  
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    whatsapp: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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

  return (
    <div className="bg-hero min-h-screen py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate({ to: "/" })}
            className="rounded-full text-muted-foreground hover:text-foreground hover:bg-white/5"
          >
            <ArrowLeft size={24} />
          </Button>
          <div className="flex items-center gap-2">
            <img src={logo} alt="UniDoc" width={40} height={40} className="rounded-xl" />
            <h1 className="text-2xl font-bold tracking-tight">Novo Agendamento</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Dados Pessoais */}
            <div className="space-y-6">
              <Card className="glass border-white/10 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <User className="text-primary" size={20} />
                    Seus Dados
                  </CardTitle>
                  <CardDescription>
                    Preencha suas informações para contato.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 text-muted-foreground" size={18} />
                      <Input 
                        id="fullName" 
                        placeholder="Seu nome" 
                        className="pl-10 bg-white/5 border-white/10" 
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 text-muted-foreground" size={18} />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="seu@email.com" 
                        className="pl-10 bg-white/5 border-white/10" 
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 text-muted-foreground" size={18} />
                      <Input 
                        id="whatsapp" 
                        placeholder="(00) 00000-0000" 
                        className="pl-10 bg-white/5 border-white/10" 
                        value={formData.whatsapp}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="hidden lg:block">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-primary-gradient text-primary-foreground font-bold h-14 rounded-full text-lg shadow-glow hover:scale-[1.02] transition-transform disabled:opacity-50"
                >
                  {isSubmitting ? "Agendando..." : "Confirmar Agendamento"}
                </Button>
              </div>
            </div>

            {/* Calendário e Horários */}
            <div className="space-y-6">
              <Card className="glass border-white/10 shadow-card overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <CalendarIcon className="text-primary" size={20} />
                    Escolha a Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center p-0 pb-6">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => isBefore(date, startOfToday())}
                    className="rounded-md border-none w-full max-w-sm sm:max-w-md"
                    locale={ptBR}
                    classNames={{
                      months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
                      month: "space-y-4 w-full",
                      caption: "flex justify-center pt-1 relative items-center",
                      caption_label: "text-sm font-medium",
                      nav: "space-x-1 flex items-center",
                      nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                      nav_button_previous: "absolute left-1",
                      nav_button_next: "absolute right-1",
                      table: "w-full border-collapse space-y-1",
                      head_row: "flex w-full",
                      head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.8rem]",
                      row: "flex w-full mt-2",
                      cell: "h-9 w-full text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                      day: "h-9 w-full p-0 font-normal aria-selected:opacity-100 hover:bg-white/10 rounded-md",
                      day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                      day_today: "bg-accent text-accent-foreground",
                      day_outside: "text-muted-foreground opacity-50",
                      day_disabled: "text-muted-foreground opacity-50",
                      day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                      day_hidden: "invisible",
                    }}
                  />
                </CardContent>
              </Card>

              <Card className="glass border-white/10 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Clock className="text-primary" size={20} />
                    Horários Disponíveis
                  </CardTitle>
                  <CardDescription>
                    {date ? format(date, "EEEE, dd 'de' MMMM", { locale: ptBR }) : "Selecione uma data"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {timeSlots.map((t) => (
                      <Button
                        key={t}
                        type="button"
                        variant={time === t ? "default" : "outline"}
                        onClick={() => setTime(t)}
                        className={`rounded-xl h-12 font-semibold transition-all ${
                          time === t 
                            ? "bg-primary text-primary-foreground border-primary" 
                            : "bg-white/5 border-white/10 hover:bg-primary/20"
                        }`}
                      >
                        {t}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="lg:hidden">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-primary-gradient text-primary-foreground font-bold h-14 rounded-full text-lg shadow-glow hover:scale-[1.02] transition-transform disabled:opacity-50"
            >
              {isSubmitting ? "Agendando..." : "Confirmar Agendamento"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

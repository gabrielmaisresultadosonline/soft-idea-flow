import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { trackMetaEvent } from "@/lib/meta-pixel.functions";
import {
  Calendar,
  MessageCircle,
  ShieldCheck,
  Clock,
  Wallet,
  GraduationCap,
  Wifi,
  Stethoscope,
  Lock,
  ChevronDown,
  CreditCard,
  Video,
  FileCheck,
  Menu,
  X,
} from "lucide-react";
import logo from "@/assets/unidoc-official-logo.png";
import imgLate from "@/assets/student-late.jpg";
import imgSport from "@/assets/student-sport.jpg";
import imgWork from "@/assets/student-work.jpg";
import imgFar from "@/assets/student-far.jpg";
import imgHealth from "@/assets/student-health.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

const WHATSAPP_URL =
  "https://wa.me/556781226312?text=Sou%20Acad%C3%AAmico%20e%20gostaria%20de%20Agendar";

const navLinks = [
  { href: "#como-funciona", label: "Como Funciona" },
  { href: "#beneficios", label: "Benefícios" },
  { href: "#para-quem", label: "Para Quem É" },
  { href: "#faq", label: "Dúvidas" },
];

const steps = [
  {
    n: "01",
    icon: Calendar,
    title: "Agende",
    desc: "Escolha o horário que funciona pra você. Sem fila, sem espera.",
  },
  {
    n: "02",
    icon: CreditCard,
    title: "Agende",
    desc: "Escolha o horário que funciona pra você. Sem fila, sem espera.",
  },
  {
    n: "03",
    icon: Video,
    title: "Consulte",
    desc: "Atendimento por vídeo com médico de CRM ativo, do conforto da sua casa.",
  },
  {
    n: "04",
    icon: FileCheck,
    title: "Pronto",
    desc: "Receita, atestado e orientações direto no seu e-mail ou WhatsApp.",
  },
];

const benefits = [
  { icon: Clock, title: "Sem fila de espera", desc: "Agende e seja atendido no horário marcado. Respeito ao seu tempo." },
  { icon: Wallet, title: "Sem custos fixos", desc: "Sem mensalidade, sem taxas de adesão. Tudo de forma simples." },
  { icon: GraduationCap, title: "Feito para universitários", desc: "Horários flexíveis que encaixam na sua rotina de aulas e estágio." },
  { icon: Wifi, title: "100% online", desc: "Consulte de qualquer lugar: república, campus, transporte." },
  { icon: Stethoscope, title: "Médicos com CRM ativo", desc: "Profissionais verificados e habilitados para telemedicina." },
  { icon: Lock, title: "Seguro e LGPD", desc: "Seus dados de saúde protegidos com criptografia de ponta a ponta." },
];

const personas = [
  { img: imgLate, title: "Quem estuda até tarde", desc: "E não consegue ir ao médico no horário comercial." },
  { img: imgSport, title: "Quem concilia esporte e estudo", desc: "E precisa de acompanhamento sem complicar a agenda." },
  { img: imgWork, title: "Quem trabalha e estuda", desc: "E não tem como faltar pra ir a uma consulta." },
  { img: imgFar, title: "Quem mora longe de casa", desc: "E não tem o médico de confiança por perto." },
  { img: imgHealth, title: "Quem quer cuidar da saúde", desc: "De forma simples, rápida e sem burocracia." },
];

const faqs = [
  {
    q: "A teleconsulta é legal no Brasil?",
    a: "Sim. A telemedicina é regulamentada pelo CFM através da Resolução 2.314/2022 e é totalmente legal no Brasil.",
  },
  {
    q: "O médico pode emitir receitas e atestados online?",
    a: "Sim. Receitas, atestados e pedidos de exames são emitidos digitalmente com assinatura digital válida em todo o país.",
  },
  {
    q: "Como funciona o agendamento?",
    a: "Você escolhe o melhor horário para você e realiza o agendamento de forma 100% online.",
  },
  {
    q: "Posso cancelar ou reagendar minha consulta?",
    a: "Sim, com até 2 horas de antecedência. Basta entrar em contato pelo WhatsApp.",
  },
  {
    q: "Preciso ser universitário para usar a UniDoc?",
    a: "Não é obrigatório, mas nossa estrutura, preços e horários foram pensados para atender a rotina universitária.",
  },
  {
    q: "Meus dados de saúde estão seguros?",
    a: "Sim. Utilizamos criptografia de ponta a ponta e seguimos rigorosamente a LGPD para proteger todas as suas informações.",
  },
];

function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const trackEventFn = useServerFn(trackMetaEvent);

  useEffect(() => {
    if (typeof window !== "undefined") {
      trackEventFn({
        data: {
          eventName: "PageView",
          userData: {
            clientUserAgent: window.navigator.userAgent,
          },
          eventSourceUrl: window.location.href,
        },
      }).catch(err => console.error("Meta Tracking Error:", err));
    }
  }, []);

  return (
    <div className="bg-hero min-h-screen text-foreground">
      {/* NAV */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/40 border-b border-white/5">
        <nav className="mx-auto max-w-7xl px-5 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <img src={logo} alt="UniDoc" className="w-10 h-10 lg:w-14 lg:h-14 rounded-xl transition-transform group-hover:scale-105 object-contain" />
            <span className="sr-only">UniDoc</span>
          </Link>
          <ul className="hidden lg:flex items-center gap-9 text-sm font-medium text-muted-foreground">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="hover:text-foreground transition-colors">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <Link
            to="/booking"
            className="hidden lg:inline-flex bg-primary-gradient text-primary-foreground font-semibold px-6 py-3 rounded-full shadow-glow hover:scale-[1.03] transition-transform"
          >
            Agendar consulta
          </Link>
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setMenuOpen((s) => !s)}
            aria-label="Menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
        {menuOpen && (
          <div className="lg:hidden border-t border-white/5 bg-background/95 px-5 py-4 space-y-3">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="block text-muted-foreground hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
            <Link
              to="/booking"
              onClick={() => setMenuOpen(false)}
              className="inline-flex bg-primary-gradient text-primary-foreground font-semibold px-5 py-2.5 rounded-full"
            >
              Agendar consulta
            </Link>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-5 lg:px-8 py-20 lg:py-28 text-center">
          <div className="flex flex-col items-center gap-6 mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs sm:text-sm font-medium">
              <ShieldCheck size={16} /> Em conformidade com o CFM • Resolução 2.314/2022
            </span>
            <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs sm:text-sm animate-pulse">
              CONSULTA RÁPIDA E ACESSÍVEL
            </span>
          </div>
          <h1 className="mt-8 text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05]">
            Médico online para
            <br className="hidden sm:block" /> quem não tem tempo de
            <br className="hidden sm:block" /> ficar <span className="text-gradient-primary">doente.</span>
          </h1>
          <p className="mt-7 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Consultas médicas online de forma simples. Sem fila, sem deslocamento, sem burocracia. Feito para a rotina universitária.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/booking"
              className="inline-flex items-center gap-2 bg-background text-foreground font-semibold px-7 py-4 rounded-full shadow-card hover:scale-[1.03] transition-transform w-full sm:w-auto justify-center"
            >
              <Calendar size={20} className="text-primary" />
              Agendar minha consulta agora
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-whatsapp text-whatsapp-foreground font-semibold px-7 py-4 rounded-full hover:scale-[1.03] transition-transform w-full sm:w-auto justify-center"
            >
              <MessageCircle size={20} />
              Falar pelo WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="py-24 lg:py-32 relative">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-primary font-semibold tracking-wider uppercase text-sm">Como funciona</p>
            <h2 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-bold">Simples assim.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div
                key={s.n}
                className="group bg-card/60 backdrop-blur-sm border border-white/10 rounded-3xl p-7 shadow-card hover:border-primary/40 transition-all hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-5xl font-extrabold text-primary/30 font-display">{s.n}</span>
                  <div className="w-12 h-12 rounded-2xl bg-primary-gradient flex items-center justify-center text-primary-foreground">
                    <s.icon size={22} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-2">{s.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section id="beneficios" className="py-24 lg:py-32 bg-background/40">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-primary font-semibold tracking-wider uppercase text-sm">Por que UniDoc</p>
            <h2 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-bold">Feito pra sua rotina.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="bg-card/60 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:border-primary/40 transition-all hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mb-5">
                  <b.icon size={26} />
                </div>
                <h3 className="text-xl font-bold mb-2">{b.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARA QUEM */}
      <section id="para-quem" className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-primary font-semibold tracking-wider uppercase text-sm">Para quem é</p>
            <h2 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-bold">Você se reconhece aqui?</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {personas.map((p) => (
              <article
                key={p.title}
                className="group relative rounded-3xl overflow-hidden shadow-card border border-white/10 aspect-[4/5]"
              >
                <img
                  src={p.img}
                  alt={p.title}
                  loading="lazy"
                  width={768}
                  height={768}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7">
                  <h3 className="text-2xl font-bold mb-2">{p.title}</h3>
                  <p className="text-muted-foreground">{p.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <div className="relative rounded-[2.5rem] overflow-hidden bg-primary-gradient text-primary-foreground p-10 sm:p-16 text-center shadow-glow">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Sua saúde não pode<br />esperar.
            </h2>
            <p className="mt-5 text-lg sm:text-xl opacity-90 max-w-2xl mx-auto">
              Agende agora e fale com um médico em minutos. Sem burocracia, de onde você estiver.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/booking"
                className="inline-flex items-center gap-2 bg-background text-foreground font-semibold px-7 py-4 rounded-full hover:scale-[1.03] transition-transform justify-center"
              >
                <Calendar size={20} className="text-primary" />
                Agendar minha consulta
              </Link>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-whatsapp text-whatsapp-foreground font-semibold px-7 py-4 rounded-full hover:scale-[1.03] transition-transform justify-center"
              >
                <MessageCircle size={20} />
                Falar pelo WhatsApp
              </a>
            </div>
            <p className="mt-10 text-sm opacity-80">
              Mais de 1.000 universitários já cuidaram da saúde com a UniDoc
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 lg:py-32 bg-background/40">
        <div className="mx-auto max-w-3xl px-5 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold tracking-wider uppercase text-sm">Dúvidas frequentes</p>
            <h2 className="mt-3 text-4xl sm:text-5xl font-bold">Perguntas frequentes</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div
                key={f.q}
                className="bg-card/60 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-6 text-left"
                >
                  <span className="font-semibold text-lg">{f.q}</span>
                  <ChevronDown
                    size={22}
                    className={`text-primary flex-shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-muted-foreground leading-relaxed">{f.a}</div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">Ainda tem dúvidas? Fale com a gente!</p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-whatsapp text-whatsapp-foreground font-semibold px-7 py-4 rounded-full hover:scale-[1.03] transition-transform"
            >
              <MessageCircle size={20} />
              Tire suas dúvidas pelo WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <img src={logo} alt="UniDoc" className="w-8 h-8 rounded-lg object-contain" />
            <span>© {new Date().getFullYear()} UniDoc. Todos os direitos reservados.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-primary transition-colors">Painel Admin</Link>
            <p>CFM • Resolução 2.314/2022 • LGPD</p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="Fale conosco pelo WhatsApp"
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-whatsapp text-whatsapp-foreground flex items-center justify-center shadow-glow hover:scale-110 transition-transform"
      >
        <MessageCircle size={26} />
      </a>
    </div>
  );
}

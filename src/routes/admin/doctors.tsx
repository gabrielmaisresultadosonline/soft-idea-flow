import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDoctors, createDoctor, deleteDoctor } from "@/lib/doctors.functions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  UserPlus, 
  Mail, 
  Stethoscope, 
  Trash2,
  Loader2,
  Plus
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/doctors")({
  component: DoctorsPage,
});

function DoctorsPage() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const queryClient = useQueryClient();
  const fetchDoctors = useServerFn(getDoctors);
  const createFn = useServerFn(createDoctor);
  const deleteFn = useServerFn(deleteDoctor);

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", specialty: "" });

  const { data: doctors, isLoading } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => fetchDoctors(),
  });

  const createMutation = useMutation({
    mutationFn: (vars: typeof formData) => createFn({ data: vars }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      toast.success("Médico cadastrado!");
      setIsOpen(false);
      setFormData({ name: "", email: "", specialty: "" });
    },
    onError: (err: any) => toast.error(err.message)
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      toast.success("Médico removido.");
    },
    onError: (err: any) => toast.error(err.message)
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  if (!isClient || isLoading) return <div className="flex items-center justify-center h-96"><Loader2 className="animate-spin text-primary" size={48} /></div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 uppercase italic bg-primary-gradient bg-clip-text text-transparent">Gestão de Médicos</h1>
          <p className="text-muted-foreground text-lg font-medium">Cadastre e gerencie a equipe médica da UniDoc.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="rounded-2xl bg-primary-gradient text-primary-foreground font-bold shadow-glow-blue/20 hover:scale-105 transition-all px-8 h-14 uppercase tracking-wider italic">
              <Plus className="mr-2 h-6 w-6" /> Novo Médico
            </Button>
          </DialogTrigger>
          <DialogContent className="glass border-white/10 text-foreground">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase italic italic text-primary">Cadastrar Médico</DialogTitle>
                <DialogDescription className="text-muted-foreground">Adicione um novo profissional ao sistema.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-bold uppercase tracking-widest text-[10px] opacity-70">Nome Completo</Label>
                  <Input 
                    id="name" 
                    className="bg-white/5 border-white/10 rounded-xl h-12" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-bold uppercase tracking-widest text-[10px] opacity-70">E-mail Profissional</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    className="bg-white/5 border-white/10 rounded-xl h-12" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty" className="font-bold uppercase tracking-widest text-[10px] opacity-70">Especialidade</Label>
                  <Input 
                    id="specialty" 
                    className="bg-white/5 border-white/10 rounded-xl h-12" 
                    value={formData.specialty}
                    onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending} className="w-full bg-primary-gradient font-bold h-12 rounded-xl uppercase italic">
                  {createMutation.isPending ? "Salvando..." : "Confirmar Cadastro"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass border-white/10 shadow-card overflow-hidden">
        <CardContent className="p-0 sm:p-6">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/10">
                <TableHead className="font-black uppercase tracking-widest text-xs">Médico</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-xs">Especialidade</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-xs">E-mail</TableHead>
                <TableHead className="text-right font-black uppercase tracking-widest text-xs">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors?.map((doc) => (
                <TableRow key={doc.id} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell className="font-bold text-lg">{doc.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-primary font-bold">
                      <Stethoscope size={16} /> {doc.specialty || "Geral"}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-medium">{doc.email}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:bg-destructive/10 rounded-full"
                      onClick={() => deleteMutation.mutate(doc.id)}
                    >
                      <Trash2 size={20} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {doctors?.length === 0 && (
                <TableRow><TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic">Nenhum médico cadastrado.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

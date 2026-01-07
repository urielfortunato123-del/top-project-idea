import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ChevronLeft, 
  Plus, 
  FileText, 
  Calendar, 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudLightning,
  Users,
  Truck,
  AlertTriangle,
  Download,
  Loader2,
  Trash2,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface RDORecord {
  id: string;
  date: string;
  status: string;
  is_work_day: boolean;
  weather_morning: string | null;
  weather_afternoon: string | null;
  weather_night: string | null;
  condition_morning: string | null;
  condition_afternoon: string | null;
  condition_night: string | null;
  work_start_time: string | null;
  work_end_time: string | null;
  contract_number: string | null;
  observations: string | null;
  project_id: string;
  company_id: string;
  projects?: { name: string };
  companies?: { name: string };
}

const weatherOptions = [
  { value: 'sol', label: 'Sol', icon: Sun },
  { value: 'nublado', label: 'Nublado', icon: Cloud },
  { value: 'chuva', label: 'Chuva', icon: CloudRain },
  { value: 'tempestade', label: 'Tempestade', icon: CloudLightning },
];

const conditionOptions = [
  { value: 'trabalhavel', label: 'Trabalhável' },
  { value: 'improdutivo', label: 'Improdutivo' },
  { value: 'paralisado', label: 'Paralisado' },
];

export default function RDOPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: projects = [] } = useProjects();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRDO, setSelectedRDO] = useState<RDORecord | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    project_id: '',
    contract_number: '',
    is_work_day: true,
    work_start_time: '07:00',
    work_end_time: '17:00',
    weather_morning: 'sol',
    weather_afternoon: 'sol',
    weather_night: 'sol',
    condition_morning: 'trabalhavel',
    condition_afternoon: 'trabalhavel',
    condition_night: 'trabalhavel',
    observations: '',
  });

  // Fetch RDOs
  const { data: rdos = [], isLoading } = useQuery({
    queryKey: ['rdo_records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rdo_records')
        .select(`
          *,
          projects(name),
          companies(name)
        `)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as RDORecord[];
    },
    enabled: !!user,
  });

  // Create RDO mutation
  const createRDO = useMutation({
    mutationFn: async () => {
      const project = projects.find(p => p.id === formData.project_id);
      if (!project || !user) throw new Error('Projeto não encontrado');

      const { data, error } = await supabase
        .from('rdo_records')
        .insert({
          user_id: user.id,
          company_id: project.company_id,
          project_id: formData.project_id,
          date: formData.date,
          contract_number: formData.contract_number || null,
          is_work_day: formData.is_work_day,
          work_start_time: formData.work_start_time,
          work_end_time: formData.work_end_time,
          weather_morning: formData.weather_morning,
          weather_afternoon: formData.weather_afternoon,
          weather_night: formData.weather_night,
          condition_morning: formData.condition_morning,
          condition_afternoon: formData.condition_afternoon,
          condition_night: formData.condition_night,
          observations: formData.observations || null,
          status: 'rascunho',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rdo_records'] });
      toast.success('RDO criado com sucesso!');
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Erro ao criar RDO: ' + error.message);
    },
  });

  // Delete RDO mutation
  const deleteRDO = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('rdo_records')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rdo_records'] });
      toast.success('RDO excluído!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir RDO: ' + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      project_id: '',
      contract_number: '',
      is_work_day: true,
      work_start_time: '07:00',
      work_end_time: '17:00',
      weather_morning: 'sol',
      weather_afternoon: 'sol',
      weather_night: 'sol',
      condition_morning: 'trabalhavel',
      condition_afternoon: 'trabalhavel',
      condition_night: 'trabalhavel',
      observations: '',
    });
  };

  const handleGenerateReport = async (rdo: RDORecord) => {
    try {
      setIsGenerating(true);
      toast.info('Gerando relatório...', { duration: 2000 });

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Você precisa estar logado');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-rdo-report`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ rdoId: rdo.id, format: 'download' }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao gerar relatório');
      }

      const html = await response.text();
      const blob = new Blob([html], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RDO_${rdo.date}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Relatório gerado!');
    } catch (error) {
      console.error('Generate report error:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao gerar relatório');
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'rascunho':
        return <Badge variant="secondary">Rascunho</Badge>;
      case 'enviado':
        return <Badge className="bg-blue-500">Enviado</Badge>;
      case 'aprovado':
        return <Badge className="bg-green-500">Aprovado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="glass-header">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-xl hover:bg-secondary/50"
              onClick={() => navigate('/dashboard')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="animate-fade-in flex-1">
              <h1 className="text-lg font-display font-bold">Relatórios RDO</h1>
              <p className="text-xs text-muted-foreground">Relatório Diário de Obra</p>
            </div>
            
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="rounded-xl">
                  <Plus className="h-4 w-4 mr-1" />
                  Novo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Novo RDO</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 mt-4">
                  {/* Date & Project */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Data</Label>
                      <Input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Projeto</Label>
                      <Select
                        value={formData.project_id}
                        onValueChange={(v) => setFormData({ ...formData, project_id: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Work Hours */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Contrato</Label>
                      <Input
                        placeholder="Nº Contrato"
                        value={formData.contract_number}
                        onChange={(e) => setFormData({ ...formData, contract_number: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Início</Label>
                      <Input
                        type="time"
                        value={formData.work_start_time}
                        onChange={(e) => setFormData({ ...formData, work_start_time: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fim</Label>
                      <Input
                        type="time"
                        value={formData.work_end_time}
                        onChange={(e) => setFormData({ ...formData, work_end_time: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Weather */}
                  <div className="space-y-2">
                    <Label>Condições Climáticas</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {['morning', 'afternoon', 'night'].map((period) => (
                        <div key={period} className="space-y-1">
                          <p className="text-xs text-muted-foreground text-center">
                            {period === 'morning' ? 'Manhã' : period === 'afternoon' ? 'Tarde' : 'Noite'}
                          </p>
                          <Select
                            value={formData[`weather_${period}` as keyof typeof formData] as string}
                            onValueChange={(v) => setFormData({ ...formData, [`weather_${period}`]: v })}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {weatherOptions.map((w) => (
                                <SelectItem key={w.value} value={w.value}>
                                  <div className="flex items-center gap-2">
                                    <w.icon className="h-4 w-4" />
                                    {w.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Work Conditions */}
                  <div className="space-y-2">
                    <Label>Condição de Trabalho</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {['morning', 'afternoon', 'night'].map((period) => (
                        <Select
                          key={period}
                          value={formData[`condition_${period}` as keyof typeof formData] as string}
                          onValueChange={(v) => setFormData({ ...formData, [`condition_${period}`]: v })}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {conditionOptions.map((c) => (
                              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ))}
                    </div>
                  </div>

                  {/* Observations */}
                  <div className="space-y-2">
                    <Label>Observações</Label>
                    <Textarea
                      placeholder="Observações gerais..."
                      value={formData.observations}
                      onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => createRDO.mutate()}
                    disabled={!formData.project_id || createRDO.isPending}
                  >
                    {createRDO.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Criar RDO
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="px-4 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground mt-4">Carregando...</p>
          </div>
        ) : rdos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-5 rounded-2xl glass-card mb-5">
              <FileText className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">Nenhum RDO ainda</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-[250px]">
              Crie seu primeiro Relatório Diário de Obra.
            </p>
            <Button onClick={() => setIsCreateOpen(true)} className="rounded-xl">
              <Plus className="mr-2 h-4 w-4" />
              Criar RDO
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {rdos.map((rdo) => (
              <Card key={rdo.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="font-semibold">
                          {format(new Date(rdo.date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                        </span>
                        {getStatusBadge(rdo.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {(rdo.projects as any)?.name || 'Projeto'}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          {weatherOptions.find(w => w.value === rdo.weather_morning)?.icon && 
                            (() => {
                              const Icon = weatherOptions.find(w => w.value === rdo.weather_morning)!.icon;
                              return <Icon className="h-3 w-3" />;
                            })()
                          }
                          {rdo.work_start_time} - {rdo.work_end_time}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleGenerateReport(rdo)}
                        disabled={isGenerating}
                        title="Baixar relatório"
                      >
                        {isGenerating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => deleteRDO.mutate(rdo.id)}
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

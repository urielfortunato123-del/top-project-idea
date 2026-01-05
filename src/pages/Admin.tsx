import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCompanies, useProjects, useTemplates } from '@/hooks/useProjects';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, Building2, FolderOpen, FileText, Plus, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export default function Admin() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: companies = [] } = useCompanies();
  const { data: projects = [] } = useProjects();
  const { data: templates = [] } = useTemplates();

  const [isLoading, setIsLoading] = useState(false);

  // Company form
  const [companyName, setCompanyName] = useState('');
  const [companySlug, setCompanySlug] = useState('');

  // Project form
  const [projectName, setProjectName] = useState('');
  const [projectCompanyId, setProjectCompanyId] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  // Template form
  const [templateName, setTemplateName] = useState('');
  const [templateIcon, setTemplateIcon] = useState('🏗️');
  const [templateDescription, setTemplateDescription] = useState('');

  if (!isAdmin) {
    navigate('/dashboard');
    return null;
  }

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('companies')
        .insert({ name: companyName, slug: companySlug.toLowerCase().replace(/\s+/g, '-') });

      if (error) throw error;

      toast({ title: 'Empresa criada com sucesso!' });
      setCompanyName('');
      setCompanySlug('');
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    } catch (error) {
      toast({
        title: 'Erro ao criar empresa',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('projects')
        .insert({
          name: projectName,
          company_id: projectCompanyId,
          description: projectDescription || null,
        });

      if (error) throw error;

      toast({ title: 'Projeto criado com sucesso!' });
      setProjectName('');
      setProjectCompanyId('');
      setProjectDescription('');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    } catch (error) {
      toast({
        title: 'Erro ao criar projeto',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('templates')
        .insert({
          name: templateName,
          icon: templateIcon,
          description: templateDescription || null,
        });

      if (error) throw error;

      toast({ title: 'Template criado com sucesso!' });
      setTemplateName('');
      setTemplateIcon('🏗️');
      setTemplateDescription('');
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    } catch (error) {
      toast({
        title: 'Erro ao criar template',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold">Administração</h1>
            <p className="text-xs text-muted-foreground">Gerenciar empresas, projetos e templates</p>
          </div>
        </div>
      </header>

      <main className="px-4 py-6">
        <Tabs defaultValue="companies">
          <TabsList className="w-full grid grid-cols-3 mb-6">
            <TabsTrigger value="companies" className="text-xs">
              <Building2 className="h-4 w-4 mr-1" />
              Empresas
            </TabsTrigger>
            <TabsTrigger value="projects" className="text-xs">
              <FolderOpen className="h-4 w-4 mr-1" />
              Projetos
            </TabsTrigger>
            <TabsTrigger value="templates" className="text-xs">
              <FileText className="h-4 w-4 mr-1" />
              Templates
            </TabsTrigger>
          </TabsList>

          {/* Companies Tab */}
          <TabsContent value="companies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Nova Empresa</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddCompany} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Nome da empresa"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug (identificador)</Label>
                    <Input
                      value={companySlug}
                      onChange={(e) => setCompanySlug(e.target.value)}
                      placeholder="minha-empresa"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                    Adicionar
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Empresas Cadastradas ({companies.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {companies.map(c => (
                  <div key={c.id} className="p-3 rounded-lg bg-muted/50 flex justify-between items-center">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-xs text-muted-foreground">{c.slug}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Novo Projeto</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddProject} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Empresa</Label>
                    <Select value={projectCompanyId} onValueChange={setProjectCompanyId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a empresa" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Nome do Projeto</Label>
                    <Input
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="Nome do projeto"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição (opcional)</Label>
                    <Input
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      placeholder="Descrição"
                    />
                  </div>
                  <Button type="submit" disabled={isLoading || !projectCompanyId}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                    Adicionar
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Projetos Cadastrados ({projects.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {projects.map(p => (
                  <div key={p.id} className="p-3 rounded-lg bg-muted/50">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.companies?.name}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Novo Template</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddTemplate} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="Nome do template"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ícone (emoji)</Label>
                    <Input
                      value={templateIcon}
                      onChange={(e) => setTemplateIcon(e.target.value)}
                      placeholder="🏗️"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Input
                      value={templateDescription}
                      onChange={(e) => setTemplateDescription(e.target.value)}
                      placeholder="Descrição do template"
                    />
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                    Adicionar
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Templates Cadastrados ({templates.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {templates.map(t => (
                  <div key={t.id} className="p-3 rounded-lg bg-muted/50 flex items-center gap-3">
                    <span className="text-2xl">{t.icon}</span>
                    <div>
                      <p className="font-medium">{t.name}</p>
                      {t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
}
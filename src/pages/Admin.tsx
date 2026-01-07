import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
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
import { ChevronLeft, Building2, FolderOpen, FileText, Plus, Loader2, Users, Trash2 } from 'lucide-react';
import { useQueryClient, useQuery } from '@tanstack/react-query';

interface UserWithRole {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'colaborador';
  created_at: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAdmin, isLoading: authLoading, user } = useAuth();

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

  // User form
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');

  // Fetch users with roles
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['admin_users'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, created_at');
      
      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (rolesError) throw rolesError;

      const usersWithRoles: UserWithRole[] = profiles.map(profile => {
        const userRole = roles.find(r => r.user_id === profile.id);
        return {
          id: profile.id,
          email: '',
          full_name: profile.full_name,
          role: (userRole?.role as 'admin' | 'colaborador') || 'colaborador',
          created_at: profile.created_at,
        };
      });

      return usersWithRoles;
    },
  });

  // Conditional renders AFTER all hooks
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-muted-foreground text-center">Acesso restrito a administradores</p>
        <Button onClick={() => navigate('/dashboard')}>Voltar ao Dashboard</Button>
      </div>
    );
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

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Creating user with:', { email: newUserEmail, full_name: newUserName });
      
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          email: newUserEmail,
          password: newUserPassword,
          full_name: newUserName,
        },
      });

      console.log('Response:', { data, error });

      if (error) {
        console.error('Function error:', error);
        throw new Error(error.message || 'Erro na chamada da função');
      }
      
      if (!data?.ok) {
        console.error('Data error:', data);
        throw new Error(data?.error || 'Não foi possível criar o colaborador');
      }

      toast({
        title: 'Colaborador criado com sucesso!',
        description: `Login: ${newUserEmail}`,
      });
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserName('');
      queryClient.invalidateQueries({ queryKey: ['admin_users'] });
    } catch (error) {
      console.error('Caught error:', error);
      toast({
        title: 'Erro ao criar colaborador',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRole = async (userId: string, currentRole: 'admin' | 'colaborador') => {
    const newRole = currentRole === 'admin' ? 'colaborador' : 'admin';
    
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      toast({ title: `Usuário alterado para ${newRole}` });
      queryClient.invalidateQueries({ queryKey: ['admin_users'] });
    } catch (error) {
      toast({
        title: 'Erro ao alterar role',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
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
        <Tabs defaultValue="users">
          <TabsList className="w-full grid grid-cols-4 mb-6">
            <TabsTrigger value="users" className="text-xs">
              <Users className="h-4 w-4 mr-1" />
              Usuários
            </TabsTrigger>
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

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Novo Colaborador</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome Completo</Label>
                    <Input
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="Nome do colaborador"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>E-mail (login)</Label>
                    <Input
                      type="email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="email@exemplo.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Senha</Label>
                    <Input
                      type="password"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      minLength={6}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                    Criar Colaborador
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Usuários Cadastrados ({users.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {isLoadingUsers ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  users.map(u => (
                    <div key={u.id} className="p-3 rounded-lg bg-muted/50 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{u.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {u.role === 'admin' ? '👑 Administrador' : '👷 Colaborador'}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleToggleRole(u.id, u.role)}
                      >
                        {u.role === 'admin' ? 'Tornar Colaborador' : 'Tornar Admin'}
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

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
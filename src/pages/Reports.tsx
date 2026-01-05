import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePhotoRecords } from '@/hooks/usePhotos';
import { useCompanies, useProjects, useTemplates } from '@/hooks/useProjects';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ConfidenceSummary } from '@/components/ConfidenceBadge';
import { 
  ChevronLeft, 
  FileText, 
  Download, 
  Calendar,
  Loader2,
  Building2,
  FolderOpen,
  FileSpreadsheet,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

interface ReportFilters {
  companyId: string;
  projectId: string;
  templateId: string;
  startDate: string;
  endDate: string;
}

export default function Reports() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const { data: companies = [] } = useCompanies();
  const { data: projects = [] } = useProjects();
  const { data: templates = [] } = useTemplates();
  const { data: allPhotos = [] } = usePhotoRecords();
  
  const [filters, setFilters] = useState<ReportFilters>({
    companyId: '',
    projectId: '',
    templateId: '',
    startDate: format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  
  const filteredProjects = filters.companyId
    ? projects.filter(p => p.company_id === filters.companyId)
    : projects;
  
  // Filter photos based on criteria
  const filteredPhotos = useMemo(() => {
    return allPhotos.filter(photo => {
      const photoDate = new Date(photo.device_timestamp).toISOString().split('T')[0];
      
      if (filters.companyId && photo.company_id !== filters.companyId) return false;
      if (filters.projectId && photo.project_id !== filters.projectId) return false;
      if (filters.templateId && photo.template_id !== filters.templateId) return false;
      if (photoDate < filters.startDate) return false;
      if (photoDate > filters.endDate) return false;
      
      return true;
    });
  }, [allPhotos, filters]);
  
  // Calculate confidence stats
  const confidenceStats = useMemo(() => {
    const photosWithOcr = filteredPhotos.filter(p => (p as any).ocr_status === 'completed');
    let green = 0, yellow = 0, red = 0;
    
    // Fetch entities for confidence calculation
    photosWithOcr.forEach(photo => {
      const conf = (photo as any).ocr_confidence || 0;
      if (conf >= 80) green++;
      else if (conf >= 60) yellow++;
      else red++;
    });
    
    const overall = photosWithOcr.length > 0
      ? Math.round(photosWithOcr.reduce((sum, p) => sum + ((p as any).ocr_confidence || 0), 0) / photosWithOcr.length)
      : 0;
    
    return { green, yellow, red, overall };
  }, [filteredPhotos]);
  
  const generateReport = async (format: 'html' | 'json') => {
    setIsGenerating(true);
    
    try {
      // Fetch entities for each photo
      const photoIds = filteredPhotos.map(p => p.id);
      const { data: entities } = await supabase
        .from('extracted_entities')
        .select('*')
        .in('photo_record_id', photoIds);
      
      // Group entities by photo
      const entitiesByPhoto = new Map<string, any[]>();
      entities?.forEach(e => {
        if (!entitiesByPhoto.has(e.photo_record_id)) {
          entitiesByPhoto.set(e.photo_record_id, []);
        }
        entitiesByPhoto.get(e.photo_record_id)!.push(e);
      });
      
      const selectedCompany = companies.find(c => c.id === filters.companyId);
      const selectedProject = projects.find(p => p.id === filters.projectId);
      
      const reportData = {
        meta: {
          generatedAt: new Date().toISOString(),
          period: { start: filters.startDate, end: filters.endDate },
          company: selectedCompany?.name || 'Todas',
          project: selectedProject?.name || 'Todos',
          template: templates.find(t => t.id === filters.templateId)?.name || 'Todos',
          totalPhotos: filteredPhotos.length,
          confidence: confidenceStats,
        },
        photos: filteredPhotos.map(photo => ({
          id: photo.id,
          timestamp: photo.device_timestamp,
          company: photo.companies?.name,
          project: photo.projects?.name,
          template: photo.templates?.name,
          templateIcon: photo.templates?.icon,
          activity: photo.activity_text,
          location: photo.latitude && photo.longitude 
            ? { lat: photo.latitude, lng: photo.longitude }
            : null,
          fileUrl: photo.file_url,
          ocrStatus: photo.status,
          ocrConfidence: (photo as any).ocr_confidence,
          entities: entitiesByPhoto.get(photo.id) || [],
        })),
      };
      
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio_${filters.startDate}_${filters.endDate}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const html = generateHtmlReport(reportData);
        setPreviewHtml(html);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const generateHtmlReport = (data: any) => {
    const getConfidenceColor = (score: number) => {
      if (score >= 80) return '#22c55e';
      if (score >= 60) return '#eab308';
      return '#ef4444';
    };
    
    const getConfidenceLabel = (score: number) => {
      if (score >= 80) return '🟢 Alta';
      if (score >= 60) return '🟡 Média';
      return '🔴 Baixa';
    };
    
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório ObraPhoto - ${data.meta.period.start} a ${data.meta.period.end}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; background: #f5f5f5; color: #1a1a1a; line-height: 1.6; }
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f97316, #fb923c); color: white; padding: 40px; border-radius: 12px; margin-bottom: 24px; }
    .header h1 { font-size: 28px; margin-bottom: 8px; }
    .header p { opacity: 0.9; }
    .meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .meta-card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .meta-card h3 { font-size: 14px; color: #666; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
    .meta-card .value { font-size: 24px; font-weight: 700; }
    .confidence-bar { display: flex; height: 8px; border-radius: 4px; overflow: hidden; margin-top: 12px; }
    .confidence-bar .green { background: #22c55e; }
    .confidence-bar .yellow { background: #eab308; }
    .confidence-bar .red { background: #ef4444; }
    .section { background: white; padding: 24px; border-radius: 12px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .section h2 { font-size: 18px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #f97316; }
    .photo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    .photo-card { border: 1px solid #e5e5e5; border-radius: 12px; overflow: hidden; }
    .photo-card img { width: 100%; height: 180px; object-fit: cover; }
    .photo-card .info { padding: 16px; }
    .photo-card .info h4 { font-size: 14px; margin-bottom: 8px; }
    .photo-card .info p { font-size: 12px; color: #666; margin-bottom: 4px; }
    .photo-card .info .confidence { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 8px; }
    .entity-list { margin-top: 12px; }
    .entity { display: flex; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px solid #f0f0f0; }
    .entity:last-child { border-bottom: none; }
    .entity .type { font-size: 11px; text-transform: uppercase; color: #888; min-width: 80px; }
    .entity .value { font-size: 13px; font-weight: 500; }
    .entity .dot { width: 8px; height: 8px; border-radius: 50%; }
    .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
    @media print { body { background: white; } .container { padding: 0; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📷 Relatório ObraPhoto</h1>
      <p>Período: ${data.meta.period.start} a ${data.meta.period.end}</p>
    </div>
    
    <div class="meta-grid">
      <div class="meta-card">
        <h3>Total de Fotos</h3>
        <div class="value">${data.meta.totalPhotos}</div>
      </div>
      <div class="meta-card">
        <h3>Empresa</h3>
        <div class="value" style="font-size: 18px;">${data.meta.company}</div>
      </div>
      <div class="meta-card">
        <h3>Projeto</h3>
        <div class="value" style="font-size: 18px;">${data.meta.project}</div>
      </div>
      <div class="meta-card">
        <h3>Confiança Geral</h3>
        <div class="value" style="color: ${getConfidenceColor(data.meta.confidence.overall)}">${data.meta.confidence.overall}%</div>
        <div class="confidence-bar">
          <div class="green" style="width: ${(data.meta.confidence.green / data.meta.totalPhotos) * 100}%"></div>
          <div class="yellow" style="width: ${(data.meta.confidence.yellow / data.meta.totalPhotos) * 100}%"></div>
          <div class="red" style="width: ${(data.meta.confidence.red / data.meta.totalPhotos) * 100}%"></div>
        </div>
      </div>
    </div>
    
    <div class="section">
      <h2>Fotos do Período</h2>
      <div class="photo-grid">
        ${data.photos.map((photo: any) => `
          <div class="photo-card">
            <img src="${photo.fileUrl}" alt="Foto" />
            <div class="info">
              <h4>${photo.templateIcon || '📷'} ${photo.template || 'Geral'}</h4>
              <p><strong>Data:</strong> ${new Date(photo.timestamp).toLocaleString('pt-BR')}</p>
              <p><strong>Projeto:</strong> ${photo.project}</p>
              ${photo.activity ? `<p><strong>Atividade:</strong> ${photo.activity}</p>` : ''}
              ${photo.location ? `<p><strong>GPS:</strong> ${photo.location.lat.toFixed(6)}, ${photo.location.lng.toFixed(6)}</p>` : ''}
              ${photo.ocrConfidence !== null ? `
                <div class="confidence" style="background: ${getConfidenceColor(photo.ocrConfidence)}20; color: ${getConfidenceColor(photo.ocrConfidence)}">
                  ${getConfidenceLabel(photo.ocrConfidence)} (${photo.ocrConfidence}%)
                </div>
              ` : ''}
              ${photo.entities.length > 0 ? `
                <div class="entity-list">
                  ${photo.entities.slice(0, 5).map((e: any) => `
                    <div class="entity">
                      <div class="dot" style="background: ${e.confidence_level === 'green' ? '#22c55e' : e.confidence_level === 'yellow' ? '#eab308' : '#ef4444'}"></div>
                      <span class="type">${e.entity_type}</span>
                      <span class="value">${e.entity_value}</span>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    
    <div class="footer">
      Gerado por ObraPhoto AI em ${new Date().toLocaleString('pt-BR')}
    </div>
  </div>
</body>
</html>`;
  };
  
  const downloadHtml = () => {
    if (!previewHtml) return;
    const blob = new Blob([previewHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_${filters.startDate}_${filters.endDate}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Acesso restrito a administradores</p>
            <Button className="mt-4" onClick={() => navigate('/dashboard')}>Voltar</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin-dashboard')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Relatórios
            </h1>
            <p className="text-xs text-muted-foreground">
              Gerar relatórios técnicos com semáforo
            </p>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {previewHtml ? (
          <>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPreviewHtml(null)}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <Button onClick={downloadHtml}>
                <Download className="h-4 w-4 mr-2" />
                Baixar HTML
              </Button>
            </div>
            <Card className="overflow-hidden">
              <iframe
                srcDoc={previewHtml}
                className="w-full h-[600px] border-0"
                title="Preview do Relatório"
              />
            </Card>
          </>
        ) : (
          <>
            {/* Filters */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Filtros</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Data Início
                    </Label>
                    <Input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => setFilters(f => ({ ...f, startDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Data Fim
                    </Label>
                    <Input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => setFilters(f => ({ ...f, endDate: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Empresa
                  </Label>
                  <Select
                    value={filters.companyId}
                    onValueChange={(v) => setFilters(f => ({ 
                      ...f, 
                      companyId: v === 'all' ? '' : v, 
                      projectId: '' 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as empresas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as empresas</SelectItem>
                      {companies.filter(c => c.id).map(company => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    Projeto
                  </Label>
                  <Select
                    value={filters.projectId}
                    onValueChange={(v) => setFilters(f => ({ ...f, projectId: v === 'all' ? '' : v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os projetos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os projetos</SelectItem>
                      {filteredProjects.filter(p => p.id).map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Template</Label>
                  <Select
                    value={filters.templateId}
                    onValueChange={(v) => setFilters(f => ({ ...f, templateId: v === 'all' ? '' : v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os templates" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os templates</SelectItem>
                      {templates.filter(t => t.id).map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.icon} {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            {/* Preview */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Prévia do Relatório</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{filteredPhotos.length}</span>
                  <span className="text-muted-foreground">fotos selecionadas</span>
                </div>
                
                {filteredPhotos.length > 0 && (
                  <ConfidenceSummary
                    green={confidenceStats.green}
                    yellow={confidenceStats.yellow}
                    red={confidenceStats.red}
                    overall={confidenceStats.overall}
                  />
                )}
              </CardContent>
            </Card>
            
            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
                onClick={() => generateReport('html')}
                disabled={isGenerating || filteredPhotos.length === 0}
              >
                {isGenerating ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Eye className="h-6 w-6" />
                )}
                <span className="text-sm">Visualizar HTML</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
                onClick={() => generateReport('json')}
                disabled={isGenerating || filteredPhotos.length === 0}
              >
                {isGenerating ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-6 w-6" />
                )}
                <span className="text-sm">Exportar JSON</span>
              </Button>
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

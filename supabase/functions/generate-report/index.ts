import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { photoRecordId, format = "json" } = await req.json();
    
    if (!photoRecordId) {
      throw new Error("photoRecordId é obrigatório");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase não configurado");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get photo record with related data
    const { data: photoRecord, error: photoError } = await supabase
      .from("photo_records")
      .select(`
        *,
        companies(name, slug),
        projects(name, description),
        templates(name, icon, description),
        profiles:user_id(full_name)
      `)
      .eq("id", photoRecordId)
      .single();

    if (photoError || !photoRecord) {
      throw new Error("Registro de foto não encontrado");
    }

    // Get extracted entities
    const { data: entities } = await supabase
      .from("extracted_entities")
      .select("*")
      .eq("photo_record_id", photoRecordId)
      .order("confidence_score", { ascending: false });

    // Get OCR report
    const { data: ocrReport } = await supabase
      .from("ocr_reports")
      .select("*")
      .eq("photo_record_id", photoRecordId)
      .single();

    // Build structured report
    const report = {
      metadata: {
        generated_at: new Date().toISOString(),
        photo_id: photoRecordId,
        format: format
      },
      photo: {
        file_url: photoRecord.file_url,
        device_timestamp: photoRecord.device_timestamp,
        server_timestamp: photoRecord.server_timestamp,
        location: {
          latitude: photoRecord.latitude,
          longitude: photoRecord.longitude,
          accuracy: photoRecord.accuracy
        }
      },
      context: {
        company: photoRecord.companies?.name || "N/A",
        project: photoRecord.projects?.name || "N/A",
        template: photoRecord.templates?.name || "Civil Geral",
        collaborator: photoRecord.profiles?.full_name || "N/A"
      },
      ocr: {
        status: photoRecord.ocr_status,
        confidence: photoRecord.ocr_confidence,
        raw_text: photoRecord.ocr_raw_text,
        processed_text: photoRecord.ocr_processed_text
      },
      entities: (entities || []).map(entity => ({
        type: entity.entity_type,
        value: entity.is_validated ? entity.validated_value : entity.entity_value,
        confidence: {
          score: entity.confidence_score,
          level: entity.confidence_level
        },
        ai_suggestion: entity.ai_suggestion,
        validated: entity.is_validated
      })),
      summary: {
        total_entities: entities?.length || 0,
        confidence_breakdown: {
          green: entities?.filter(e => e.confidence_level === "green").length || 0,
          yellow: entities?.filter(e => e.confidence_level === "yellow").length || 0,
          red: entities?.filter(e => e.confidence_level === "red").length || 0
        },
        overall_status: ocrReport?.status || "pending",
        overall_confidence: ocrReport?.overall_confidence || photoRecord.ocr_confidence || 0
      }
    };

    // Generate formatted output based on format type
    let output: string;
    let contentType: string;

    switch (format) {
      case "html":
        output = generateHTMLReport(report);
        contentType = "text/html";
        break;
      case "markdown":
        output = generateMarkdownReport(report);
        contentType = "text/markdown";
        break;
      default:
        output = JSON.stringify(report, null, 2);
        contentType = "application/json";
    }

    return new Response(output, {
      headers: { ...corsHeaders, "Content-Type": contentType }
    });

  } catch (error) {
    console.error("Generate report error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erro ao gerar relatório" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateHTMLReport(report: any): string {
  const getConfidenceColor = (level: string) => {
    switch (level) {
      case "green": return "#22c55e";
      case "yellow": return "#eab308";
      case "red": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const entitiesHTML = report.entities.map((e: any) => `
    <tr>
      <td style="padding: 8px; border: 1px solid #374151;">${e.type}</td>
      <td style="padding: 8px; border: 1px solid #374151;">${e.value}</td>
      <td style="padding: 8px; border: 1px solid #374151; text-align: center;">
        <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: ${getConfidenceColor(e.confidence.level)};"></span>
        ${e.confidence.score}%
      </td>
      <td style="padding: 8px; border: 1px solid #374151;">${e.ai_suggestion || "-"}</td>
    </tr>
  `).join("");

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório OCR - ObraPhoto</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #111827; color: #f3f4f6; padding: 20px; }
    .container { max-width: 900px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #374151; }
    .section { background: #1f2937; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
    .section-title { color: #f97316; font-weight: 600; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #374151; padding: 12px 8px; text-align: left; border: 1px solid #374151; }
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .stat-card { background: #374151; padding: 12px; border-radius: 6px; text-align: center; }
    .stat-value { font-size: 24px; font-weight: bold; }
    .stat-label { font-size: 12px; color: #9ca3af; }
    .confidence-dot { display: inline-block; width: 16px; height: 16px; border-radius: 50%; margin-right: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h1 style="margin: 0; color: #f97316;">📸 ObraPhoto - Relatório OCR</h1>
        <p style="margin: 4px 0 0; color: #9ca3af;">Gerado em: ${new Date(report.metadata.generated_at).toLocaleString("pt-BR")}</p>
      </div>
      <div style="text-align: right;">
        <p style="margin: 0;"><strong>Empresa:</strong> ${report.context.company}</p>
        <p style="margin: 4px 0 0;"><strong>Projeto:</strong> ${report.context.project}</p>
      </div>
    </div>

    <div class="section">
      <h3 class="section-title">📊 Resumo</h3>
      <div class="summary-grid">
        <div class="stat-card">
          <div class="stat-value" style="color: #f97316;">${report.summary.overall_confidence}%</div>
          <div class="stat-label">Confiança Geral</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: #22c55e;">${report.summary.confidence_breakdown.green}</div>
          <div class="stat-label">Alta Confiança</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: #eab308;">${report.summary.confidence_breakdown.yellow}</div>
          <div class="stat-label">Média Confiança</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: #ef4444;">${report.summary.confidence_breakdown.red}</div>
          <div class="stat-label">Baixa Confiança</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h3 class="section-title">📷 Informações da Foto</h3>
      <p><strong>Template:</strong> ${report.context.template}</p>
      <p><strong>Colaborador:</strong> ${report.context.collaborator}</p>
      <p><strong>Data/Hora:</strong> ${new Date(report.photo.device_timestamp).toLocaleString("pt-BR")}</p>
      ${report.photo.location.latitude ? `<p><strong>Localização:</strong> ${report.photo.location.latitude}, ${report.photo.location.longitude} (±${Math.round(report.photo.location.accuracy)}m)</p>` : ""}
    </div>

    <div class="section">
      <h3 class="section-title">🔤 Entidades Extraídas</h3>
      <table>
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Valor</th>
            <th>Confiança</th>
            <th>Sugestão IA</th>
          </tr>
        </thead>
        <tbody>
          ${entitiesHTML || "<tr><td colspan='4' style='text-align: center; padding: 16px;'>Nenhuma entidade extraída</td></tr>"}
        </tbody>
      </table>
    </div>

    ${report.ocr.processed_text ? `
    <div class="section">
      <h3 class="section-title">📝 Texto Processado</h3>
      <pre style="background: #111827; padding: 12px; border-radius: 4px; white-space: pre-wrap; font-size: 12px;">${report.ocr.processed_text}</pre>
    </div>
    ` : ""}
  </div>
</body>
</html>`;
}

function generateMarkdownReport(report: any): string {
  const getConfidenceEmoji = (level: string) => {
    switch (level) {
      case "green": return "🟢";
      case "yellow": return "🟡";
      case "red": return "🔴";
      default: return "⚪";
    }
  };

  let md = `# 📸 ObraPhoto - Relatório OCR

**Gerado em:** ${new Date(report.metadata.generated_at).toLocaleString("pt-BR")}

---

## 📊 Resumo

| Métrica | Valor |
|---------|-------|
| Confiança Geral | ${report.summary.overall_confidence}% |
| Alta Confiança 🟢 | ${report.summary.confidence_breakdown.green} |
| Média Confiança 🟡 | ${report.summary.confidence_breakdown.yellow} |
| Baixa Confiança 🔴 | ${report.summary.confidence_breakdown.red} |
| Total de Entidades | ${report.summary.total_entities} |

---

## 📷 Informações da Foto

- **Empresa:** ${report.context.company}
- **Projeto:** ${report.context.project}
- **Template:** ${report.context.template}
- **Colaborador:** ${report.context.collaborator}
- **Data/Hora:** ${new Date(report.photo.device_timestamp).toLocaleString("pt-BR")}
${report.photo.location.latitude ? `- **Localização:** ${report.photo.location.latitude}, ${report.photo.location.longitude} (±${Math.round(report.photo.location.accuracy)}m)` : ""}

---

## 🔤 Entidades Extraídas

| Tipo | Valor | Confiança | Sugestão IA |
|------|-------|-----------|-------------|
`;

  for (const entity of report.entities) {
    md += `| ${entity.type} | ${entity.value} | ${getConfidenceEmoji(entity.confidence.level)} ${entity.confidence.score}% | ${entity.ai_suggestion || "-"} |\n`;
  }

  if (report.ocr.processed_text) {
    md += `
---

## 📝 Texto Processado

\`\`\`
${report.ocr.processed_text}
\`\`\`
`;
  }

  return md;
}

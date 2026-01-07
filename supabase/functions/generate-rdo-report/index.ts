import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Template HTML para RDO
function generateRDOHTML(rdo: any, workers: any[], equipment: any[], occurrences: any[], photos: any[]): string {
  const formatDate = (date: string) => new Date(date).toLocaleDateString("pt-BR");
  const formatTime = (time: string | null) => time || "-";

  const weatherEmojis: Record<string, string> = {
    sol: "☀️",
    nublado: "⛅",
    chuva: "🌧️",
    tempestade: "⛈️",
  };

  const conditionLabels: Record<string, string> = {
    trabalhavel: "Trabalhável",
    improdutivo: "Improdutivo",
    paralisado: "Paralisado",
  };

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RDO - ${formatDate(rdo.date)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; line-height: 1.4; color: #333; }
    .container { max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; border-bottom: 2px solid #1a365d; padding-bottom: 15px; margin-bottom: 20px; }
    .header h1 { color: #1a365d; font-size: 18px; margin-bottom: 5px; }
    .header h2 { color: #2d3748; font-size: 14px; font-weight: normal; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px; }
    .info-box { background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px; }
    .info-box label { font-size: 10px; color: #718096; text-transform: uppercase; display: block; margin-bottom: 3px; }
    .info-box span { font-weight: 600; color: #2d3748; }
    .section { margin-bottom: 20px; }
    .section-title { background: #1a365d; color: white; padding: 8px 12px; font-size: 12px; font-weight: 600; border-radius: 4px 4px 0 0; }
    .section-content { border: 1px solid #e2e8f0; border-top: none; padding: 12px; border-radius: 0 0 4px 4px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #edf2f7; font-size: 10px; text-transform: uppercase; color: #4a5568; }
    .weather-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .weather-box { text-align: center; padding: 10px; background: #f7fafc; border-radius: 4px; }
    .weather-box .period { font-size: 10px; color: #718096; margin-bottom: 5px; }
    .weather-box .icon { font-size: 24px; }
    .weather-box .condition { font-size: 11px; font-weight: 600; margin-top: 5px; }
    .photo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .photo-item img { width: 100%; height: 120px; object-fit: cover; border-radius: 4px; }
    .photo-item p { font-size: 10px; color: #718096; margin-top: 4px; text-align: center; }
    .observations { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px; margin-top: 10px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
    .signatures { display: grid; grid-template-columns: repeat(2, 1fr); gap: 40px; margin-top: 60px; }
    .signature-line { border-top: 1px solid #333; padding-top: 5px; text-align: center; font-size: 11px; }
    @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>RELATÓRIO DIÁRIO DE OBRA - RDO</h1>
      <h2>${rdo.project_name || "Projeto"} - ${rdo.company_name || "Empresa"}</h2>
    </div>

    <div class="info-grid">
      <div class="info-box">
        <label>Data</label>
        <span>${formatDate(rdo.date)}</span>
      </div>
      <div class="info-box">
        <label>Contrato</label>
        <span>${rdo.contract_number || "-"}</span>
      </div>
      <div class="info-box">
        <label>Horário de Trabalho</label>
        <span>${formatTime(rdo.work_start_time)} às ${formatTime(rdo.work_end_time)}</span>
      </div>
      <div class="info-box">
        <label>Dia de Trabalho</label>
        <span>${rdo.is_work_day ? "Sim" : "Não"}</span>
      </div>
    </div>

    <div class="section">
      <div class="section-title">🌤️ Condições Climáticas</div>
      <div class="section-content">
        <div class="weather-grid">
          <div class="weather-box">
            <div class="period">Manhã</div>
            <div class="icon">${weatherEmojis[rdo.weather_morning] || "❓"}</div>
            <div class="condition">${conditionLabels[rdo.condition_morning] || "-"}</div>
          </div>
          <div class="weather-box">
            <div class="period">Tarde</div>
            <div class="icon">${weatherEmojis[rdo.weather_afternoon] || "❓"}</div>
            <div class="condition">${conditionLabels[rdo.condition_afternoon] || "-"}</div>
          </div>
          <div class="weather-box">
            <div class="period">Noite</div>
            <div class="icon">${weatherEmojis[rdo.weather_night] || "❓"}</div>
            <div class="condition">${conditionLabels[rdo.condition_night] || "-"}</div>
          </div>
        </div>
      </div>
    </div>

    ${workers.length > 0 ? `
    <div class="section">
      <div class="section-title">👷 Mão de Obra</div>
      <div class="section-content">
        <table>
          <thead>
            <tr>
              <th>Função</th>
              <th>Quantidade</th>
            </tr>
          </thead>
          <tbody>
            ${workers.map(w => `
              <tr>
                <td>${w.role_name}</td>
                <td>${w.quantity}</td>
              </tr>
            `).join("")}
            <tr style="font-weight: bold; background: #edf2f7;">
              <td>Total</td>
              <td>${workers.reduce((sum, w) => sum + w.quantity, 0)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    ` : ""}

    ${equipment.length > 0 ? `
    <div class="section">
      <div class="section-title">🚧 Equipamentos</div>
      <div class="section-content">
        <table>
          <thead>
            <tr>
              <th>Equipamento</th>
              <th>Quantidade</th>
              <th>Tipo</th>
            </tr>
          </thead>
          <tbody>
            ${equipment.map(e => `
              <tr>
                <td>${e.equipment_name}</td>
                <td>${e.quantity}</td>
                <td>${e.is_contracted ? "Contratado" : "Próprio"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
    ` : ""}

    ${occurrences.length > 0 ? `
    <div class="section">
      <div class="section-title">⚠️ Ocorrências</div>
      <div class="section-content">
        <table>
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Horário</th>
              <th>Impacto (h)</th>
            </tr>
          </thead>
          <tbody>
            ${occurrences.map(o => `
              <tr>
                <td>
                  ${o.description}
                  ${o.complement ? `<br><small style="color: #718096;">${o.complement}</small>` : ""}
                </td>
                <td>${formatTime(o.start_time)} - ${formatTime(o.end_time)}</td>
                <td>${o.impact_hours || "-"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
    ` : ""}

    ${photos.length > 0 ? `
    <div class="section">
      <div class="section-title">📷 Registro Fotográfico</div>
      <div class="section-content">
        <div class="photo-grid">
          ${photos.slice(0, 6).map(p => `
            <div class="photo-item">
              <img src="${p.file_url}" alt="Foto" />
              <p>${p.activity_text || p.frente_servico || new Date(p.device_timestamp).toLocaleTimeString("pt-BR")}</p>
            </div>
          `).join("")}
        </div>
        ${photos.length > 6 ? `<p style="text-align: center; margin-top: 10px; color: #718096;">+ ${photos.length - 6} fotos adicionais</p>` : ""}
      </div>
    </div>
    ` : ""}

    ${rdo.observations ? `
    <div class="observations">
      <strong>Observações:</strong><br>
      ${rdo.observations}
    </div>
    ` : ""}

    <div class="footer">
      <div class="signatures">
        <div class="signature-line">
          Responsável Técnico
        </div>
        <div class="signature-line">
          Fiscal da Obra
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { rdoId, format = "html" } = await req.json();

    if (!rdoId) {
      return new Response(JSON.stringify({ error: "rdoId é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[RDO Report] Generating for RDO: ${rdoId}, format: ${format}`);

    // Fetch RDO with company and project names
    const { data: rdo, error: rdoError } = await supabase
      .from("rdo_records")
      .select(`
        *,
        companies(name),
        projects(name)
      `)
      .eq("id", rdoId)
      .eq("user_id", user.id)
      .single();

    if (rdoError || !rdo) {
      console.error("[RDO Report] RDO not found:", rdoError);
      return new Response(JSON.stringify({ error: "RDO não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Enhance RDO with names
    rdo.company_name = (rdo.companies as any)?.name;
    rdo.project_name = (rdo.projects as any)?.name;

    // Fetch related data in parallel
    const [workersRes, equipmentRes, occurrencesRes, photosRes] = await Promise.all([
      supabase.from("rdo_workers").select("*").eq("rdo_id", rdoId),
      supabase.from("rdo_equipment").select("*").eq("rdo_id", rdoId),
      supabase.from("rdo_occurrences").select("*").eq("rdo_id", rdoId),
      supabase.from("photo_records")
        .select("id, file_url, activity_text, frente_servico, device_timestamp")
        .eq("user_id", user.id)
        .eq("project_id", rdo.project_id)
        .gte("device_timestamp", `${rdo.date}T00:00:00`)
        .lte("device_timestamp", `${rdo.date}T23:59:59`)
        .limit(12),
    ]);

    const workers = workersRes.data || [];
    const equipment = equipmentRes.data || [];
    const occurrences = occurrencesRes.data || [];
    const photos = photosRes.data || [];

    console.log(`[RDO Report] Data loaded: ${workers.length} workers, ${equipment.length} equipment, ${occurrences.length} occurrences, ${photos.length} photos`);

    // Generate HTML
    const html = generateRDOHTML(rdo, workers, equipment, occurrences, photos);

    if (format === "html") {
      return new Response(html, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    }

    // Return as downloadable HTML file
    return new Response(html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="RDO_${rdo.date}.html"`,
      },
    });
  } catch (error) {
    console.error("[RDO Report] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

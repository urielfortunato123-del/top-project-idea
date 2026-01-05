import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Template Engine - Entity patterns for different construction types
const TEMPLATE_PATTERNS: Record<string, { entities: string[]; keywords: Record<string, string[]> }> = {
  "civil_geral": {
    entities: ["obra", "rodovia", "km", "frente", "atividade", "empresa", "fiscal", "equipamentos", "data", "local"],
    keywords: {
      pt: ["obra", "construção", "serviço", "execução", "canteiro", "engenheiro", "fiscal", "encarregado"],
      en: ["construction", "work", "service", "execution", "site", "engineer", "supervisor", "foreman"]
    }
  },
  "pavimentacao": {
    entities: ["rodovia", "km_inicio", "km_fim", "faixa", "espessura", "cbuq", "temperatura", "compactacao", "data", "fiscal"],
    keywords: {
      pt: ["pavimento", "asfalto", "cbuq", "imprimação", "tsd", "lama", "rolagem", "compactação", "camada", "base"],
      en: ["pavement", "asphalt", "tack", "prime", "overlay", "rolling", "compaction", "layer", "base"]
    }
  },
  "drenagem": {
    entities: ["tipo_drenagem", "diametro", "extensao", "cota", "boca_lobo", "poco_visita", "data", "local", "fiscal"],
    keywords: {
      pt: ["drenagem", "tubo", "bueiro", "caixa", "poço", "sarjeta", "meio-fio", "canaleta", "galeria"],
      en: ["drainage", "pipe", "culvert", "box", "manhole", "gutter", "curb", "channel", "gallery"]
    }
  },
  "terraplenagem": {
    entities: ["volume", "cota", "tipo_material", "dmf", "umidade", "compactacao", "area", "camada", "data", "fiscal"],
    keywords: {
      pt: ["terraplenagem", "aterro", "corte", "bota-fora", "empréstimo", "compactação", "escavação", "material"],
      en: ["earthwork", "fill", "cut", "waste", "borrow", "compaction", "excavation", "material"]
    }
  },
  "concreto": {
    entities: ["fck", "slump", "volume", "elemento", "armadura", "forma", "cura", "data", "nota_fiscal", "fornecedor"],
    keywords: {
      pt: ["concreto", "armadura", "forma", "desforma", "cura", "adensamento", "vibração", "estrutura", "pilar", "viga"],
      en: ["concrete", "rebar", "formwork", "stripping", "curing", "consolidation", "vibration", "structure", "column", "beam"]
    }
  },
  "eletrica": {
    entities: ["poste", "luminaria", "cabo", "transformador", "disjuntor", "circuito", "tensao", "potencia", "data", "fiscal"],
    keywords: {
      pt: ["elétrica", "iluminação", "poste", "cabo", "luz", "transformador", "subestação", "rede", "baixa", "média"],
      en: ["electrical", "lighting", "pole", "cable", "light", "transformer", "substation", "network", "low", "medium"]
    }
  },
  "sinalizacao": {
    entities: ["tipo_placa", "dimensao", "km", "lado", "altura", "tachas", "defensas", "pintura", "data", "fiscal"],
    keywords: {
      pt: ["sinalização", "placa", "pintura", "faixa", "tacha", "defensa", "olho-de-gato", "horizontal", "vertical"],
      en: ["signage", "sign", "paint", "stripe", "stud", "guardrail", "cat-eye", "horizontal", "vertical"]
    }
  }
};

// OCR Post-processing utilities
function normalizeDate(text: string): string {
  // Common date patterns in PT-BR
  const patterns = [
    /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/g,
    /(\d{1,2})\s*de\s*(\w+)\s*de\s*(\d{2,4})/gi
  ];
  
  const months: Record<string, string> = {
    janeiro: "01", fevereiro: "02", março: "03", marco: "03", abril: "04",
    maio: "05", junho: "06", julho: "07", agosto: "08", setembro: "09",
    outubro: "10", novembro: "11", dezembro: "12"
  };
  
  let normalized = text;
  
  // Replace month names with numbers
  for (const [name, num] of Object.entries(months)) {
    normalized = normalized.replace(new RegExp(name, "gi"), num);
  }
  
  return normalized;
}

function normalizeKm(text: string): string {
  // Normalize KM patterns: km 123+450, KM123,450, etc.
  return text.replace(/km\s*(\d+)[\+\,\.]?(\d{0,3})/gi, (_, km, m) => {
    return `KM ${km}+${m.padStart(3, "0")}`;
  });
}

function normalizePlate(text: string): string {
  // Brazilian plate patterns: ABC-1234, ABC1D23
  return text.replace(/([A-Z]{3})\s*[-]?\s*(\d{1}[A-Z\d]{1}\d{2})/gi, (_, letters, numbers) => {
    return `${letters.toUpperCase()}-${numbers.toUpperCase()}`;
  });
}

function normalizeCNPJ(text: string): string {
  // CNPJ: XX.XXX.XXX/XXXX-XX
  return text.replace(/(\d{2})[\.\s]?(\d{3})[\.\s]?(\d{3})[\/\s]?(\d{4})[-\s]?(\d{2})/g, 
    (_, a, b, c, d, e) => `${a}.${b}.${c}/${d}-${e}`);
}

function normalizeCPF(text: string): string {
  // CPF: XXX.XXX.XXX-XX
  return text.replace(/(\d{3})[\.\s]?(\d{3})[\.\s]?(\d{3})[-\s]?(\d{2})/g,
    (_, a, b, c, d) => `${a}.${b}.${c}-${d}`);
}

function applyOCRCorrections(text: string): string {
  const corrections: Record<string, string> = {
    "0": "O", "O": "0", // Context-dependent
    "1": "I", "I": "1",
    "5": "S", "S": "5",
    "8": "B", "B": "8",
    "6": "G", "G": "6",
    "2": "Z", "Z": "2",
  };
  
  // Apply corrections based on context
  let corrected = text;
  
  // In numeric contexts (KM, dates, measurements), replace letters with numbers
  corrected = corrected.replace(/(\d+[OISZGB]\d*|\d*[OISZGB]\d+)/g, (match) => {
    return match
      .replace(/O/g, "0")
      .replace(/I/g, "1")
      .replace(/S/g, "5")
      .replace(/Z/g, "2")
      .replace(/G/g, "6")
      .replace(/B/g, "8");
  });
  
  return corrected;
}

function calculateConfidence(value: string, entityType: string): { score: number; level: string } {
  let score = 0.5; // Base score
  
  // Increase confidence based on format matching
  switch (entityType) {
    case "data":
    case "date":
      if (/\d{2}\/\d{2}\/\d{4}/.test(value)) score = 0.95;
      else if (/\d{1,2}\/\d{1,2}\/\d{2,4}/.test(value)) score = 0.75;
      break;
    case "km":
    case "km_inicio":
    case "km_fim":
      if (/KM\s*\d+\+\d{3}/.test(value)) score = 0.95;
      else if (/\d+[\+\.]\d+/.test(value)) score = 0.70;
      break;
    case "cnpj":
      if (/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/.test(value)) score = 0.95;
      break;
    case "cpf":
      if (/\d{3}\.\d{3}\.\d{3}-\d{2}/.test(value)) score = 0.95;
      break;
    case "placa":
      if (/[A-Z]{3}-\d[A-Z\d]\d{2}/.test(value)) score = 0.90;
      break;
    default:
      // For text entities, check length and common patterns
      if (value.length > 3 && value.length < 100) score = 0.70;
      if (value.length > 10 && value.length < 50) score = 0.80;
  }
  
  const level = score >= 0.80 ? "green" : score >= 0.60 ? "yellow" : "red";
  return { score: Math.round(score * 100), level };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { photoRecordId, imageUrl, templateType = "civil_geral" } = await req.json();
    
    if (!photoRecordId || !imageUrl) {
      throw new Error("photoRecordId e imageUrl são obrigatórios");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase não configurado");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Update status to processing
    await supabase
      .from("photo_records")
      .update({ 
        ocr_status: "processing",
        processing_started_at: new Date().toISOString()
      })
      .eq("id", photoRecordId);

    // Get template configuration
    const templateConfig = TEMPLATE_PATTERNS[templateType] || TEMPLATE_PATTERNS.civil_geral;
    
    // Build the prompt for Gemini Vision OCR
    const systemPrompt = `Você é um sistema especializado em OCR para documentos de obras civis em português e inglês.

TAREFA: Extraia TODO o texto visível na imagem com máxima precisão.

ENTIDADES A IDENTIFICAR (template: ${templateType}):
${templateConfig.entities.map(e => `- ${e}`).join("\n")}

PALAVRAS-CHAVE DO TEMPLATE:
PT: ${templateConfig.keywords.pt.join(", ")}
EN: ${templateConfig.keywords.en.join(", ")}

FORMATO DE RESPOSTA (JSON estrito):
{
  "raw_text": "texto completo extraído da imagem",
  "entities": [
    {
      "type": "tipo_entidade",
      "value": "valor extraído",
      "confidence": 0.85
    }
  ],
  "detected_language": "pt|en|mixed",
  "template_match_score": 0.75
}

REGRAS:
1. Extraia EXATAMENTE o que está na imagem, sem inventar
2. Normalize datas para DD/MM/YYYY
3. Normalize KM para formato KM XXX+YYY
4. Identifique placas de veículos (ABC-1234 ou ABC1D23)
5. Identifique CNPJ (XX.XXX.XXX/XXXX-XX) e CPF (XXX.XXX.XXX-XX)
6. Use confidence 0.0-1.0 baseado na clareza da leitura
7. Se não conseguir ler algo, retorne confidence baixa`;

    // Call Gemini Vision for OCR
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: [
              { 
                type: "text", 
                text: "Extraia o texto e entidades desta foto de obra. Retorne APENAS o JSON, sem markdown." 
              },
              { 
                type: "image_url", 
                image_url: { url: imageUrl } 
              }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        throw new Error("Rate limit excedido. Tente novamente em alguns minutos.");
      }
      if (response.status === 402) {
        throw new Error("Créditos insuficientes. Adicione créditos ao workspace.");
      }
      throw new Error(`Erro no processamento OCR: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || "";
    
    // Parse the JSON response
    let ocrResult;
    try {
      // Clean markdown if present
      const jsonStr = content.replace(/```json\n?|\n?```/g, "").trim();
      ocrResult = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse OCR result:", content);
      ocrResult = {
        raw_text: content,
        entities: [],
        detected_language: "unknown",
        template_match_score: 0
      };
    }

    // Post-process the OCR text
    let processedText = ocrResult.raw_text || "";
    processedText = applyOCRCorrections(processedText);
    processedText = normalizeDate(processedText);
    processedText = normalizeKm(processedText);
    processedText = normalizePlate(processedText);
    processedText = normalizeCNPJ(processedText);
    processedText = normalizeCPF(processedText);

    // Calculate overall confidence
    const overallConfidence = ocrResult.entities?.length > 0
      ? ocrResult.entities.reduce((sum: number, e: any) => sum + (e.confidence || 0), 0) / ocrResult.entities.length
      : 0.5;

    // Update photo record with OCR results
    await supabase
      .from("photo_records")
      .update({
        ocr_status: "completed",
        ocr_raw_text: ocrResult.raw_text,
        ocr_processed_text: processedText,
        ocr_confidence: Math.round(overallConfidence * 100),
        processing_completed_at: new Date().toISOString()
      })
      .eq("id", photoRecordId);

    // Insert extracted entities
    if (ocrResult.entities && ocrResult.entities.length > 0) {
      const entitiesData = ocrResult.entities.map((entity: any) => {
        const conf = calculateConfidence(entity.value, entity.type);
        return {
          photo_record_id: photoRecordId,
          entity_type: entity.type,
          entity_value: entity.value,
          confidence_score: entity.confidence ? Math.round(entity.confidence * 100) : conf.score,
          confidence_level: conf.level
        };
      });

      await supabase.from("extracted_entities").insert(entitiesData);
    }

    // AI Validation Pass - Check for inconsistencies and suggest corrections
    const validationPrompt = `Analise os dados extraídos de uma foto de obra civil e:

1. VALIDE: Verifique se há inconsistências nos dados
2. SUGIRA: Proponha correções para valores suspeitos
3. PREENCHA: Sugira valores faltantes com base no contexto

DADOS EXTRAÍDOS:
${JSON.stringify(ocrResult.entities, null, 2)}

TEXTO PROCESSADO:
${processedText}

TEMPLATE: ${templateType}
ENTIDADES ESPERADAS: ${templateConfig.entities.join(", ")}

RETORNE JSON:
{
  "validations": [
    {
      "entity_type": "tipo",
      "original_value": "valor original",
      "issue": "descrição do problema",
      "suggestion": "valor sugerido",
      "confidence": 0.75
    }
  ],
  "missing_entities": [
    {
      "entity_type": "tipo",
      "suggested_value": "valor sugerido",
      "confidence": 0.60,
      "reasoning": "motivo da sugestão"
    }
  ],
  "overall_quality": "good|medium|poor",
  "summary": "resumo da análise"
}`;

    const validationResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Você é um especialista em validação de dados de obras civis." },
          { role: "user", content: validationPrompt }
        ],
        temperature: 0.2,
        max_tokens: 2000
      }),
    });

    let validationResult = null;
    if (validationResponse.ok) {
      const valResponse = await validationResponse.json();
      const valContent = valResponse.choices?.[0]?.message?.content || "";
      try {
        const jsonStr = valContent.replace(/```json\n?|\n?```/g, "").trim();
        validationResult = JSON.parse(jsonStr);
      } catch (e) {
        console.error("Failed to parse validation result:", valContent);
      }
    }

    // Update entities with AI suggestions if available
    if (validationResult?.validations) {
      for (const validation of validationResult.validations) {
        await supabase
          .from("extracted_entities")
          .update({
            ai_suggestion: validation.suggestion,
            confidence_level: validation.confidence >= 0.8 ? "green" : validation.confidence >= 0.6 ? "yellow" : "red"
          })
          .eq("photo_record_id", photoRecordId)
          .eq("entity_type", validation.entity_type);
      }
    }

    // Insert missing entities suggested by AI
    if (validationResult?.missing_entities) {
      const missingData = validationResult.missing_entities.map((entity: any) => ({
        photo_record_id: photoRecordId,
        entity_type: entity.entity_type,
        entity_value: entity.suggested_value,
        confidence_score: Math.round(entity.confidence * 100),
        confidence_level: entity.confidence >= 0.8 ? "green" : entity.confidence >= 0.6 ? "yellow" : "red",
        ai_suggestion: entity.reasoning
      }));

      if (missingData.length > 0) {
        await supabase.from("extracted_entities").insert(missingData);
      }
    }

    // Create OCR report
    const reportData = {
      ocr_result: ocrResult,
      processed_text: processedText,
      validation: validationResult,
      template_type: templateType,
      template_entities: templateConfig.entities
    };

    await supabase.from("ocr_reports").insert({
      photo_record_id: photoRecordId,
      report_type: "structured",
      report_data: reportData,
      overall_confidence: Math.round(overallConfidence * 100),
      status: validationResult?.overall_quality === "good" ? "approved" : "review"
    });

    return new Response(
      JSON.stringify({
        success: true,
        photoRecordId,
        ocrConfidence: Math.round(overallConfidence * 100),
        entitiesCount: ocrResult.entities?.length || 0,
        validation: validationResult?.overall_quality || "unknown"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Process photo error:", error);
    
    // Try to update the photo record with error status
    try {
      const { photoRecordId } = await req.json().catch(() => ({}));
      if (photoRecordId) {
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
          const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
          await supabase
            .from("photo_records")
            .update({
              ocr_status: "error",
              processing_error: error instanceof Error ? error.message : "Erro desconhecido"
            })
            .eq("id", photoRecordId);
        }
      }
    } catch (e) {
      console.error("Failed to update error status:", e);
    }

    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erro ao processar foto" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

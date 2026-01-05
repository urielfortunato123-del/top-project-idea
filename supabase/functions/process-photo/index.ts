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
  const months: Record<string, string> = {
    janeiro: "01", fevereiro: "02", março: "03", marco: "03", abril: "04",
    maio: "05", junho: "06", julho: "07", agosto: "08", setembro: "09",
    outubro: "10", novembro: "11", dezembro: "12"
  };
  
  let normalized = text;
  for (const [name, num] of Object.entries(months)) {
    normalized = normalized.replace(new RegExp(name, "gi"), num);
  }
  return normalized;
}

function normalizeKm(text: string): string {
  return text.replace(/km\s*(\d+)[\+\,\.]?(\d{0,3})/gi, (_, km, m) => {
    return `KM ${km}+${(m || "000").padStart(3, "0")}`;
  });
}

function normalizePlate(text: string): string {
  return text.replace(/([A-Z]{3})\s*[-]?\s*(\d{1}[A-Z\d]{1}\d{2})/gi, (_, letters, numbers) => {
    return `${letters.toUpperCase()}-${numbers.toUpperCase()}`;
  });
}

function normalizeCNPJ(text: string): string {
  return text.replace(/(\d{2})[\.\s]?(\d{3})[\.\s]?(\d{3})[\/\s]?(\d{4})[-\s]?(\d{2})/g, 
    (_, a, b, c, d, e) => `${a}.${b}.${c}/${d}-${e}`);
}

function normalizeCPF(text: string): string {
  return text.replace(/(\d{3})[\.\s]?(\d{3})[\.\s]?(\d{3})[-\s]?(\d{2})/g,
    (_, a, b, c, d) => `${a}.${b}.${c}-${d}`);
}

function applyOCRCorrections(text: string): string {
  let corrected = text;
  // In numeric contexts, replace letters with numbers
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

// Technical dictionary for OCR correction
const TECH_DICTIONARY = {
  // Common OCR mistakes -> correct
  "pavlmento": "pavimento",
  "asfalto": "asfalto",
  "drenagern": "drenagem",
  "concret0": "concreto",
  "eletrica": "elétrica",
  "sinalizaçao": "sinalização",
  "terrap1enagem": "terraplenagem",
  "rodov1a": "rodovia",
  "compactaçao": "compactação",
};

function applyDictionary(text: string): string {
  let result = text;
  for (const [wrong, correct] of Object.entries(TECH_DICTIONARY)) {
    result = result.replace(new RegExp(wrong, "gi"), correct);
  }
  return result;
}

// Extract entities using regex patterns
function extractEntitiesFromText(text: string, templateType: string): Array<{type: string; value: string; confidence: number}> {
  const entities: Array<{type: string; value: string; confidence: number}> = [];
  
  // Date patterns
  const datePatterns = [
    /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/g,
    /(\d{1,2})\s*de\s*(\w+)\s*de\s*(\d{2,4})/gi
  ];
  for (const pattern of datePatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      entities.push({ type: "data", value: match[0], confidence: 0.85 });
    }
  }
  
  // KM patterns
  const kmPattern = /km\s*(\d+[\+\,\.\s]?\d{0,3})/gi;
  const kmMatches = text.matchAll(kmPattern);
  for (const match of kmMatches) {
    entities.push({ type: "km", value: match[0], confidence: 0.80 });
  }
  
  // Plate patterns (Brazilian)
  const platePattern = /([A-Z]{3})\s*[-]?\s*(\d[A-Z\d]\d{2})/gi;
  const plateMatches = text.matchAll(platePattern);
  for (const match of plateMatches) {
    entities.push({ type: "placa", value: match[0], confidence: 0.90 });
  }
  
  // CNPJ pattern
  const cnpjPattern = /\d{2}[\.\s]?\d{3}[\.\s]?\d{3}[\/\s]?\d{4}[-\s]?\d{2}/g;
  const cnpjMatches = text.matchAll(cnpjPattern);
  for (const match of cnpjMatches) {
    entities.push({ type: "cnpj", value: match[0], confidence: 0.85 });
  }
  
  // CPF pattern
  const cpfPattern = /\d{3}[\.\s]?\d{3}[\.\s]?\d{3}[-\s]?\d{2}/g;
  const cpfMatches = text.matchAll(cpfPattern);
  for (const match of cpfMatches) {
    entities.push({ type: "cpf", value: match[0], confidence: 0.85 });
  }
  
  // Temperature (for pavimento)
  const tempPattern = /(\d{2,3})\s*[°ºo]?\s*[cC]/g;
  const tempMatches = text.matchAll(tempPattern);
  for (const match of tempMatches) {
    entities.push({ type: "temperatura", value: match[0], confidence: 0.75 });
  }
  
  // Volume/quantity patterns
  const volumePattern = /(\d+[\.,]?\d*)\s*(m³|m3|litros?|ton|kg)/gi;
  const volumeMatches = text.matchAll(volumePattern);
  for (const match of volumeMatches) {
    entities.push({ type: "volume", value: match[0], confidence: 0.70 });
  }
  
  // FCK (concrete)
  const fckPattern = /fck\s*[:=]?\s*(\d{2,3})\s*(mpa)?/gi;
  const fckMatches = text.matchAll(fckPattern);
  for (const match of fckMatches) {
    entities.push({ type: "fck", value: match[0], confidence: 0.85 });
  }
  
  // Slump (concrete)
  const slumpPattern = /slump\s*[:=]?\s*(\d{1,3})\s*(cm|mm)?/gi;
  const slumpMatches = text.matchAll(slumpPattern);
  for (const match of slumpMatches) {
    entities.push({ type: "slump", value: match[0], confidence: 0.85 });
  }
  
  return entities;
}

function calculateConfidence(value: string, entityType: string): { score: number; level: string } {
  let score = 0.5;
  
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
      if (value.length > 3 && value.length < 100) score = 0.70;
      if (value.length > 10 && value.length < 50) score = 0.80;
  }
  
  const level = score >= 0.80 ? "green" : score >= 0.60 ? "yellow" : "red";
  return { score: Math.round(score * 100), level };
}

// ============ OCR SERVICES ============

// OCR.space API (Free tier: 25000 requests/month)
async function callOcrSpace(imageUrl: string): Promise<{ text: string; confidence: number }> {
  const apiKey = Deno.env.get("OCR_SPACE_API_KEY");
  if (!apiKey) {
    throw new Error("OCR_SPACE_API_KEY não configurada");
  }
  
  console.log("[OCR.space] Iniciando OCR para:", imageUrl.substring(0, 50) + "...");
  
  const formData = new FormData();
  formData.append("url", imageUrl);
  formData.append("language", "por"); // Portuguese
  formData.append("isOverlayRequired", "false");
  formData.append("detectOrientation", "true");
  formData.append("scale", "true");
  formData.append("OCREngine", "2"); // Engine 2 is better for many cases
  
  const response = await fetch("https://api.ocr.space/parse/image", {
    method: "POST",
    headers: {
      "apikey": apiKey,
    },
    body: formData,
  });
  
  if (!response.ok) {
    console.error("[OCR.space] Erro HTTP:", response.status);
    throw new Error(`OCR.space error: ${response.status}`);
  }
  
  const result = await response.json();
  console.log("[OCR.space] Resposta recebida:", JSON.stringify(result).substring(0, 200));
  
  if (result.IsErroredOnProcessing) {
    throw new Error(result.ErrorMessage?.[0] || "OCR.space processing error");
  }
  
  const parsedResults = result.ParsedResults?.[0];
  if (!parsedResults) {
    return { text: "", confidence: 0 };
  }
  
  // OCR.space returns confidence as a percentage string like "95.00"
  const confidenceStr = parsedResults.TextOverlay?.Lines?.[0]?.Words?.[0]?.WordConfidence || "70";
  const confidence = parseFloat(confidenceStr) / 100;
  
  return {
    text: parsedResults.ParsedText || "",
    confidence: isNaN(confidence) ? 0.7 : confidence
  };
}

// Inconsistency detection rules (runs locally, free!)
function detectInconsistencies(entities: Array<{type: string; value: string; confidence: number}>): Array<{
  entity_type: string;
  issue: string;
  severity: 'error' | 'warning' | 'info';
}> {
  const issues: Array<{entity_type: string; issue: string; severity: 'error' | 'warning' | 'info'}> = [];
  
  // Find KM pairs
  const kmInicio = entities.find(e => e.type === 'km_inicio' || (e.type === 'km' && e.value.toLowerCase().includes('inicio')));
  const kmFim = entities.find(e => e.type === 'km_fim' || (e.type === 'km' && e.value.toLowerCase().includes('fim')));
  
  if (kmInicio && kmFim) {
    const parseKm = (val: string): number => {
      const match = val.match(/(\d+)[\+\,\.]?(\d{0,3})/);
      if (match) return parseFloat(`${match[1]}.${match[2] || '0'}`);
      return 0;
    };
    const inicio = parseKm(kmInicio.value);
    const fim = parseKm(kmFim.value);
    
    if (fim < inicio) {
      issues.push({
        entity_type: 'km',
        issue: `KM final (${fim}) menor que KM inicial (${inicio})`,
        severity: 'error'
      });
    } else if (fim - inicio > 10) {
      issues.push({
        entity_type: 'km',
        issue: `Extensão muito grande (${(fim - inicio).toFixed(1)} km) - verificar`,
        severity: 'warning'
      });
    }
  }
  
  // Check dates
  const dateEntities = entities.filter(e => e.type === 'data' || e.type === 'date');
  for (const dateEntity of dateEntities) {
    const match = dateEntity.value.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/);
    if (match) {
      const day = parseInt(match[1]);
      const month = parseInt(match[2]);
      const year = parseInt(match[3]);
      
      if (day > 31 || day < 1) {
        issues.push({ entity_type: 'data', issue: `Dia inválido: ${day}`, severity: 'error' });
      }
      if (month > 12 || month < 1) {
        issues.push({ entity_type: 'data', issue: `Mês inválido: ${month}`, severity: 'error' });
      }
      if (year < 2000 || year > 2100) {
        issues.push({ entity_type: 'data', issue: `Ano suspeito: ${year}`, severity: 'warning' });
      }
      
      // Check if date is in the future
      const fullYear = year < 100 ? 2000 + year : year;
      const dateObj = new Date(fullYear, month - 1, day);
      if (dateObj > new Date()) {
        issues.push({ entity_type: 'data', issue: `Data no futuro: ${dateEntity.value}`, severity: 'warning' });
      }
    }
  }
  
  // Check temperatures (for paving)
  const tempEntities = entities.filter(e => e.type === 'temperatura');
  for (const temp of tempEntities) {
    const match = temp.value.match(/(\d{2,3})/);
    if (match) {
      const tempValue = parseInt(match[1]);
      if (tempValue < 100 || tempValue > 180) {
        issues.push({
          entity_type: 'temperatura',
          issue: `Temperatura de asfalto fora do padrão (${tempValue}°C)`,
          severity: tempValue < 80 || tempValue > 200 ? 'error' : 'warning'
        });
      }
    }
  }
  
  // Check FCK values (concrete)
  const fckEntities = entities.filter(e => e.type === 'fck');
  for (const fck of fckEntities) {
    const match = fck.value.match(/(\d{2,3})/);
    if (match) {
      const fckValue = parseInt(match[1]);
      const validFck = [20, 25, 30, 35, 40, 45, 50];
      if (!validFck.includes(fckValue)) {
        issues.push({
          entity_type: 'fck',
          issue: `FCK não padrão: ${fckValue} (valores comuns: 20, 25, 30, 35, 40)`,
          severity: 'warning'
        });
      }
    }
  }
  
  // Check slump values (concrete)
  const slumpEntities = entities.filter(e => e.type === 'slump');
  for (const slump of slumpEntities) {
    const match = slump.value.match(/(\d{1,3})/);
    if (match) {
      const slumpValue = parseInt(match[1]);
      if (slumpValue < 5 || slumpValue > 22) {
        issues.push({
          entity_type: 'slump',
          issue: `Slump fora do padrão (${slumpValue}cm) - normal: 10±2cm`,
          severity: slumpValue < 2 || slumpValue > 25 ? 'error' : 'warning'
        });
      }
    }
  }
  
  // Check CNPJ checksum (basic validation)
  const cnpjEntities = entities.filter(e => e.type === 'cnpj');
  for (const cnpj of cnpjEntities) {
    const digits = cnpj.value.replace(/\D/g, '');
    if (digits.length !== 14) {
      issues.push({ entity_type: 'cnpj', issue: `CNPJ com tamanho incorreto: ${digits.length} dígitos`, severity: 'error' });
    }
  }
  
  // Check CPF length
  const cpfEntities = entities.filter(e => e.type === 'cpf');
  for (const cpf of cpfEntities) {
    const digits = cpf.value.replace(/\D/g, '');
    if (digits.length !== 11) {
      issues.push({ entity_type: 'cpf', issue: `CPF com tamanho incorreto: ${digits.length} dígitos`, severity: 'error' });
    }
  }
  
  return issues;
}

// AI Validation only for low confidence results (saves costs!)
async function callAIValidation(
  rawText: string, 
  entities: Array<{type: string; value: string; confidence: number}>,
  templateType: string,
  inconsistencies: Array<{entity_type: string; issue: string; severity: string}>
): Promise<{
  validations: Array<{entity_type: string; original_value: string; issue: string; suggestion: string; confidence: number}>;
  missing_entities: Array<{entity_type: string; suggested_value: string; confidence: number; reasoning: string}>;
  inconsistencies: Array<{entity_type: string; issue: string; severity: string; suggestion: string}>;
  overall_quality: string;
  summary: string;
} | null> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    console.log("[AI] LOVABLE_API_KEY não configurada, pulando validação IA");
    return null;
  }
  
  const templateConfig = TEMPLATE_PATTERNS[templateType] || TEMPLATE_PATTERNS.civil_geral;
  
  // Only call AI if we have low confidence entities OR inconsistencies
  const lowConfidenceEntities = entities.filter(e => e.confidence < 0.7);
  const hasIssues = inconsistencies.length > 0;
  
  if (lowConfidenceEntities.length === 0 && entities.length > 0 && !hasIssues) {
    console.log("[AI] Todas entidades com alta confiança, pulando validação IA");
    return {
      validations: [],
      missing_entities: [],
      inconsistencies: [],
      overall_quality: "good",
      summary: "Texto OCR com alta confiança, sem necessidade de correção."
    };
  }
  
  console.log("[AI] Chamando Gemini para validação de", lowConfidenceEntities.length, "entidades e", inconsistencies.length, "inconsistências");
  
  const validationPrompt = `Analise os dados extraídos de uma foto de obra civil e:

1. VALIDE: Verifique se há inconsistências nos dados
2. SUGIRA: Proponha correções para valores suspeitos
3. PREENCHA: Sugira valores faltantes com base no contexto
4. CORRIJA INCOERÊNCIAS: Analise as inconsistências detectadas e sugira correções

DADOS EXTRAÍDOS (${entities.length} entidades, ${lowConfidenceEntities.length} com baixa confiança):
${JSON.stringify(entities, null, 2)}

INCONSISTÊNCIAS DETECTADAS (${inconsistencies.length}):
${JSON.stringify(inconsistencies, null, 2)}

TEXTO OCR:
${rawText.substring(0, 1000)}

TEMPLATE: ${templateType}
ENTIDADES ESPERADAS: ${templateConfig.entities.join(", ")}

RETORNE APENAS JSON (sem markdown):
{
  "validations": [
    {"entity_type": "tipo", "original_value": "valor", "issue": "problema", "suggestion": "sugestão", "confidence": 0.75}
  ],
  "missing_entities": [
    {"entity_type": "tipo", "suggested_value": "valor", "confidence": 0.60, "reasoning": "motivo"}
  ],
  "inconsistencies": [
    {"entity_type": "tipo", "issue": "problema", "severity": "error|warning|info", "suggestion": "como corrigir"}
  ],
  "overall_quality": "good|medium|poor",
  "summary": "resumo curto"
}`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite", // Usando modelo mais barato!
        messages: [
          { role: "system", content: "Você é um validador de dados OCR de obras civis. Responda apenas com JSON válido." },
          { role: "user", content: validationPrompt }
        ],
        temperature: 0.1,
        max_tokens: 1500
      }),
    });

    if (!response.ok) {
      console.error("[AI] Erro na chamada:", response.status);
      return null;
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || "";
    
    const jsonStr = content.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("[AI] Erro ao processar resposta:", error);
    return null;
  }
}

// Generate image hash from URL (for cache lookup)
async function generateImageHash(imageUrl: string): Promise<string> {
  try {
    // Fetch image data
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error("Failed to fetch image");
    
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Use Web Crypto API to generate SHA-256 hash
    const hashBuffer = await crypto.subtle.digest("SHA-256", uint8Array);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    
    return hashHex;
  } catch (error) {
    console.error("[CACHE] Erro ao gerar hash:", error);
    // Fallback: use URL as hash (not ideal but functional)
    const encoder = new TextEncoder();
    const data = encoder.encode(imageUrl);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }
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

    console.log("[PROCESS] Iniciando processamento:", { photoRecordId, templateType });

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase não configurado");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ============ STEP 0: Check cache ============
    console.log("[CACHE] Gerando hash da imagem...");
    const imageHash = await generateImageHash(imageUrl);
    console.log("[CACHE] Hash gerado:", imageHash.substring(0, 16) + "...");
    
    // Check if we have cached result for this image+template
    const { data: cachedResult } = await supabase
      .from("ocr_cache")
      .select("*")
      .eq("image_hash", imageHash)
      .eq("template_type", templateType)
      .gt("expires_at", new Date().toISOString())
      .single();
    
    if (cachedResult) {
      console.log("[CACHE] ✅ Cache hit! Usando resultado em cache.");
      
      // Apply cached results to this photo record
      await supabase
        .from("photo_records")
        .update({
          ocr_status: "completed",
          ocr_raw_text: cachedResult.ocr_raw_text,
          ocr_processed_text: cachedResult.ocr_processed_text,
          ocr_confidence: cachedResult.ocr_confidence,
          processing_started_at: new Date().toISOString(),
          processing_completed_at: new Date().toISOString()
        })
        .eq("id", photoRecordId);
      
      // Insert cached entities
      if (cachedResult.extracted_entities && Array.isArray(cachedResult.extracted_entities)) {
        const entitiesData = cachedResult.extracted_entities.map((entity: any) => ({
          ...entity,
          id: undefined, // Let Supabase generate new IDs
          photo_record_id: photoRecordId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        if (entitiesData.length > 0) {
          await supabase.from("extracted_entities").insert(entitiesData);
        }
      }
      
      // Create OCR report from cache
      await supabase.from("ocr_reports").insert({
        photo_record_id: photoRecordId,
        report_type: "structured",
        report_data: {
          ...cachedResult.extracted_entities,
          from_cache: true,
          cache_id: cachedResult.id
        },
        overall_confidence: cachedResult.ocr_confidence,
        status: cachedResult.ocr_confidence >= 80 ? "approved" : "review"
      });
      
      return new Response(
        JSON.stringify({
          success: true,
          photoRecordId,
          fromCache: true,
          cacheId: cachedResult.id,
          ocrConfidence: cachedResult.ocr_confidence,
          overallConfidence: cachedResult.ocr_confidence,
          entitiesCount: cachedResult.extracted_entities?.length || 0
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("[CACHE] ❌ Cache miss. Processando imagem...");

    // Update status to processing
    await supabase
      .from("photo_records")
      .update({ 
        ocr_status: "processing",
        processing_started_at: new Date().toISOString()
      })
      .eq("id", photoRecordId);

    // ============ STEP 1: OCR with OCR.space (FREE) ============
    let rawText = "";
    let ocrConfidence = 0;
    let ocrSource = "ocr.space";
    
    try {
      const ocrResult = await callOcrSpace(imageUrl);
      rawText = ocrResult.text;
      ocrConfidence = ocrResult.confidence;
      console.log("[OCR] OCR.space sucesso, confiança:", ocrConfidence);
    } catch (ocrError) {
      console.error("[OCR] OCR.space falhou:", ocrError);
      // If OCR.space fails, we still continue but with empty text
      rawText = "";
      ocrConfidence = 0;
    }

    // ============ STEP 2: Post-processing (FREE - runs locally) ============
    let processedText = rawText;
    processedText = applyOCRCorrections(processedText);
    processedText = applyDictionary(processedText);
    processedText = normalizeDate(processedText);
    processedText = normalizeKm(processedText);
    processedText = normalizePlate(processedText);
    processedText = normalizeCNPJ(processedText);
    processedText = normalizeCPF(processedText);
    
    console.log("[POST] Texto processado:", processedText.substring(0, 200) + "...");

    // ============ STEP 3: Extract entities with regex (FREE) ============
    const extractedEntities = extractEntitiesFromText(processedText, templateType);
    console.log("[EXTRACT] Entidades extraídas:", extractedEntities.length);

    // ============ STEP 3.5: Detect inconsistencies (FREE) ============
    const inconsistencies = detectInconsistencies(extractedEntities);
    console.log("[INCONSISTENCIES] Detectadas:", inconsistencies.length);

    // Calculate overall confidence
    const overallConfidence = extractedEntities.length > 0
      ? extractedEntities.reduce((sum, e) => sum + e.confidence, 0) / extractedEntities.length
      : ocrConfidence;

    // ============ STEP 4: AI Validation ONLY if needed (saves $$$) ============
    let validationResult = null;
    const hasLowConfidence = extractedEntities.some(e => e.confidence < 0.7) || ocrConfidence < 0.7;
    const hasInconsistencies = inconsistencies.length > 0;
    
    if (hasLowConfidence || hasInconsistencies) {
      console.log("[AI] Baixa confiança ou inconsistências detectadas, chamando IA para validação...");
      validationResult = await callAIValidation(processedText, extractedEntities, templateType, inconsistencies);
    } else {
      console.log("[AI] Alta confiança, pulando chamada de IA (economia!)");
      validationResult = {
        validations: [],
        missing_entities: [],
        inconsistencies: [],
        overall_quality: "good",
        summary: "OCR com alta confiança, sem necessidade de validação IA."
      };
    }

    // ============ STEP 5: Save results ============
    
    // Update photo record
    await supabase
      .from("photo_records")
      .update({
        ocr_status: "completed",
        ocr_raw_text: rawText,
        ocr_processed_text: processedText,
        ocr_confidence: Math.round(overallConfidence * 100),
        processing_completed_at: new Date().toISOString()
      })
      .eq("id", photoRecordId);

    // Insert extracted entities
    if (extractedEntities.length > 0) {
      const entitiesData = extractedEntities.map((entity) => {
        const conf = calculateConfidence(entity.value, entity.type);
        return {
          photo_record_id: photoRecordId,
          entity_type: entity.type,
          entity_value: entity.value,
          confidence_score: Math.round(entity.confidence * 100),
          confidence_level: conf.level
        };
      });

      await supabase.from("extracted_entities").insert(entitiesData);
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
    if (validationResult?.missing_entities && validationResult.missing_entities.length > 0) {
      const missingData = validationResult.missing_entities.map((entity) => ({
        photo_record_id: photoRecordId,
        entity_type: entity.entity_type,
        entity_value: entity.suggested_value,
        confidence_score: Math.round(entity.confidence * 100),
        confidence_level: entity.confidence >= 0.8 ? "green" : entity.confidence >= 0.6 ? "yellow" : "red",
        ai_suggestion: entity.reasoning
      }));

      await supabase.from("extracted_entities").insert(missingData);
    }

    // Create OCR report
    const reportData = {
      ocr_source: ocrSource,
      ocr_confidence: ocrConfidence,
      processed_text: processedText,
      validation: validationResult,
      inconsistencies: inconsistencies,
      template_type: templateType,
      entities_count: extractedEntities.length,
      ai_called: hasLowConfidence || hasInconsistencies
    };

    await supabase.from("ocr_reports").insert({
      photo_record_id: photoRecordId,
      report_type: "structured",
      report_data: reportData,
      overall_confidence: Math.round(overallConfidence * 100),
      status: validationResult?.overall_quality === "good" ? "approved" : "review"
    });

    // ============ STEP 6: Save to cache ============
    const entitiesToCache = extractedEntities.map((entity) => {
      const conf = calculateConfidence(entity.value, entity.type);
      return {
        entity_type: entity.type,
        entity_value: entity.value,
        confidence_score: Math.round(entity.confidence * 100),
        confidence_level: conf.level
      };
    });
    
    // Add AI-suggested entities to cache
    if (validationResult?.missing_entities) {
      for (const entity of validationResult.missing_entities) {
        entitiesToCache.push({
          entity_type: entity.entity_type,
          entity_value: entity.suggested_value,
          confidence_score: Math.round(entity.confidence * 100),
          confidence_level: entity.confidence >= 0.8 ? "green" : entity.confidence >= 0.6 ? "yellow" : "red"
        });
      }
    }
    
    await supabase.from("ocr_cache").upsert({
      image_hash: imageHash,
      ocr_raw_text: rawText,
      ocr_processed_text: processedText,
      ocr_confidence: Math.round(overallConfidence * 100),
      extracted_entities: entitiesToCache,
      template_type: templateType,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    }, { onConflict: 'image_hash' });
    
    console.log("[CACHE] ✅ Resultado salvo no cache");
    console.log("[PROCESS] Concluído com sucesso!");

    return new Response(
      JSON.stringify({
        success: true,
        photoRecordId,
        fromCache: false,
        ocrSource,
        ocrConfidence: Math.round(ocrConfidence * 100),
        overallConfidence: Math.round(overallConfidence * 100),
        entitiesCount: extractedEntities.length,
        aiCalled: hasLowConfidence,
        validation: validationResult?.overall_quality || "unknown"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[ERROR] Erro no processamento:", error);
    
    // Try to update the photo record with error status
    try {
      const body = await req.clone().json().catch(() => ({}));
      const photoRecordId = body.photoRecordId;
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
      console.error("[ERROR] Falha ao atualizar status de erro:", e);
    }

    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erro ao processar foto" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

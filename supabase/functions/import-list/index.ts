import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin
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

    // Check if admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleData?.role !== "admin") {
      return new Response(JSON.stringify({ error: "Acesso negado" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get form data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // 'companies' or 'services'

    if (!file || !type) {
      return new Response(JSON.stringify({ error: "Arquivo e tipo são obrigatórios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[Import] Processing ${type} from file: ${file.name}`);

    // Read file content
    const arrayBuffer = await file.arrayBuffer();
    let items: string[] = [];

    const fileName = file.name.toLowerCase();

    if (fileName.endsWith(".csv") || fileName.endsWith(".txt")) {
      // Parse CSV/TXT
      const text = new TextDecoder("utf-8").decode(arrayBuffer);
      items = text
        .split(/[\r\n]+/)
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.startsWith("#"));
    } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      // Parse Excel
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as string[][];
      
      // Get first column values (skip header if it looks like a header)
      items = data
        .map(row => String(row[0] || "").trim())
        .filter((val, idx) => {
          if (idx === 0) {
            // Skip common header names
            const headerWords = ["nome", "empresa", "serviço", "servico", "name", "company", "service"];
            return !headerWords.some(h => val.toLowerCase().includes(h));
          }
          return val.length > 0;
        });
    } else {
      return new Response(JSON.stringify({ error: "Formato não suportado. Use CSV, TXT ou Excel." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[Import] Found ${items.length} items to import`);

    const result: ImportResult = {
      success: true,
      imported: 0,
      skipped: 0,
      errors: [],
    };

    if (type === "companies") {
      // Import companies
      for (const name of items) {
        try {
          const slug = name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

          // Check if exists (by normalized name)
          const { data: existing } = await supabase
            .from("companies")
            .select("id")
            .ilike("name", name)
            .maybeSingle();

          if (existing) {
            result.skipped++;
            continue;
          }

          const { error } = await supabase
            .from("companies")
            .insert({ name, slug });

          if (error) {
            result.errors.push(`${name}: ${error.message}`);
          } else {
            result.imported++;
          }
        } catch (err) {
          result.errors.push(`${name}: ${err}`);
        }
      }
    } else if (type === "services") {
      // Import services as templates
      for (const name of items) {
        try {
          // Check if exists
          const { data: existing } = await supabase
            .from("templates")
            .select("id")
            .ilike("name", name)
            .maybeSingle();

          if (existing) {
            result.skipped++;
            continue;
          }

          const { error } = await supabase
            .from("templates")
            .insert({ name, icon: "🔧", description: `Serviço: ${name}` });

          if (error) {
            result.errors.push(`${name}: ${error.message}`);
          } else {
            result.imported++;
          }
        } catch (err) {
          result.errors.push(`${name}: ${err}`);
        }
      }
    } else {
      return new Response(JSON.stringify({ error: "Tipo inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[Import] Complete: ${result.imported} imported, ${result.skipped} skipped`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[Import] Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

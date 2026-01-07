import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import JSZip from "https://esm.sh/jszip@3.10.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error("[ZIP] Auth error:", authError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[ZIP] User authenticated:", user.id);

    // Get user profile name
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const userName = profile?.full_name || "Usuario";
    const sanitize = (str: string) => str.replace(/[^a-zA-Z0-9_\-\s]/g, "_").substring(0, 50);

    // Fetch user's photos
    const { data: photos, error: photosError } = await supabase
      .from("photo_records")
      .select(`
        id,
        file_url,
        file_path,
        company_name,
        project_name,
        activity_text,
        frente_servico,
        device_timestamp,
        templates(name)
      `)
      .eq("user_id", user.id)
      .order("device_timestamp", { ascending: false });

    if (photosError) {
      console.error("[ZIP] Error fetching photos:", photosError);
      throw photosError;
    }

    if (!photos || photos.length === 0) {
      return new Response(JSON.stringify({ error: "Nenhuma foto encontrada" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[ZIP] Found ${photos.length} photos to download`);

    // Create ZIP
    const zip = new JSZip();
    let successCount = 0;
    let errorCount = 0;

    for (const photo of photos) {
      try {
        // Build folder structure: Usuario/Empresa/Atividade/Template/Mes/Dia/foto.jpg
        const date = new Date(photo.device_timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const time = `${String(date.getHours()).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}${String(date.getSeconds()).padStart(2, "0")}`;

        const company = sanitize(photo.company_name || "Sem_Empresa");
        const activity = sanitize(photo.activity_text || photo.frente_servico || "Atividade_Geral");
        const template = sanitize((photo.templates as any)?.name || "Geral");
        const monthFolder = `${year}-${month}`;
        const dayFolder = `${day}`;

        const folderPath = `${sanitize(userName)}/${company}/${activity}/${template}/${monthFolder}/${dayFolder}`;
        const fileName = `IMG_${year}${month}${day}_${time}.jpg`;
        const fullPath = `${folderPath}/${fileName}`;

        // Download image from URL
        const response = await fetch(photo.file_url);
        if (!response.ok) {
          console.error(`[ZIP] Failed to fetch image: ${photo.file_url}`);
          errorCount++;
          continue;
        }

        const imageBlob = await response.arrayBuffer();
        zip.file(fullPath, imageBlob);
        successCount++;
        
        console.log(`[ZIP] Added: ${fullPath}`);
      } catch (err) {
        console.error(`[ZIP] Error processing photo ${photo.id}:`, err);
        errorCount++;
      }
    }

    console.log(`[ZIP] Processed ${successCount} photos successfully, ${errorCount} errors`);

    if (successCount === 0) {
      return new Response(JSON.stringify({ error: "Nenhuma foto pôde ser processada" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate ZIP file
    const zipBlob = await zip.generateAsync({ type: "arraybuffer" });
    const timestamp = new Date().toISOString().split("T")[0];
    const zipFileName = `fotos_${sanitize(userName)}_${timestamp}.zip`;

    console.log(`[ZIP] Generated ZIP file: ${zipFileName}, size: ${zipBlob.byteLength} bytes`);

    return new Response(zipBlob, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${zipFileName}"`,
      },
    });
  } catch (error) {
    console.error("[ZIP] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

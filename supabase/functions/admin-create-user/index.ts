// supabase/functions/admin-create-user/index.ts
// Creates a collaborator account without switching the current session.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

type CreateUserBody = {
  email: string;
  password: string;
  full_name: string;
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !serviceKey) return json(500, { error: "Server not configured" });

  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return json(401, { error: "Missing auth token" });

  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // Identify the caller
  const { data: userData, error: userErr } = await adminClient.auth.getUser(token);
  if (userErr || !userData?.user) return json(401, { error: "Invalid auth" });

  // Authorization: must be admin
  const { data: roleRow, error: roleErr } = await adminClient
    .from("user_roles")
    .select("role")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (roleErr) return json(500, { error: roleErr.message });
  if (roleRow?.role !== "admin") return json(403, { error: "Not allowed" });

  let body: CreateUserBody;
  try {
    body = (await req.json()) as CreateUserBody;
  } catch {
    return json(400, { error: "Invalid JSON" });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  const fullName = (body.full_name ?? "").trim();

  if (!email || !password || password.length < 6 || !fullName) {
    return json(400, { error: "Missing/invalid fields" });
  }

  // Create user without changing the current session
  const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (createErr || !created.user) {
    return json(400, { error: createErr?.message ?? "Failed to create user" });
  }

  // Ensure profile + role exist (no trigger dependency)
  const newUserId = created.user.id;

  const { error: profileErr } = await adminClient
    .from("profiles")
    .upsert({ id: newUserId, full_name: fullName, avatar_url: null }, { onConflict: "id" });
  if (profileErr) return json(500, { error: profileErr.message });

  const { error: roleInsErr } = await adminClient
    .from("user_roles")
    .insert({ user_id: newUserId, role: "colaborador" });

  // If role already exists, ignore
  if (roleInsErr && !roleInsErr.message.toLowerCase().includes("duplicate")) {
    return json(500, { error: roleInsErr.message });
  }

  return json(200, { ok: true, user_id: newUserId });
});

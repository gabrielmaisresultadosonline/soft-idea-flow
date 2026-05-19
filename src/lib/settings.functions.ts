import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAnon } from "./supabase-anon.server";


export const getAppSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { data, error } = await supabaseAnon
      .from("app_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("[Settings] Error fetching:", error);
      throw new Error("Falha ao buscar configurações.");
    }
    return data ?? { id: null, notification_email: "suporte@unidoctelemedicina.com.br", updated_at: null };
  });

export const updateAppSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({
      notificationEmail: z.string().email(),
    }).parse(data)
  )
  .handler(async ({ data, context }) => {
    // Usa o cliente autenticado (RLS: admin can manage) em vez do service role
    // para não depender da SERVICE_ROLE_KEY na VPS.
    const { supabase, userId } = context;
    console.log(`[Settings] Update requested by user ${userId} -> ${data.notificationEmail}`);

    // Busca a linha existente
    const { data: existing, error: fetchErr } = await supabase
      .from("app_settings")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (fetchErr) {
      console.error("[Settings] Fetch existing failed:", fetchErr);
      throw new Error(`Falha ao localizar configurações: ${fetchErr.message}`);
    }

    if (existing?.id) {
      const { error, count } = await supabase
        .from("app_settings")
        .update({ notification_email: data.notificationEmail, updated_at: new Date().toISOString() }, { count: "exact" })
        .eq("id", existing.id);

      if (error) {
        console.error("[Settings] Update failed:", error);
        throw new Error(`Falha ao atualizar configurações: ${error.message}`);
      }
      console.log(`[Settings] Rows updated: ${count}`);
      if (!count) {
        throw new Error("Nenhuma linha atualizada. Verifique se você tem permissão de admin.");
      }
    } else {
      const { error } = await supabase
        .from("app_settings")
        .insert({ notification_email: data.notificationEmail });

      if (error) {
        console.error("[Settings] Insert failed:", error);
        throw new Error(`Falha ao criar configurações: ${error.message}`);
      }
      console.log("[Settings] Row inserted");
    }

    return { success: true };
  });

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getAppSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("app_settings")
      .select("*")
      .single();

    if (error) {
      console.error("Error fetching settings:", error);
      throw new Error("Falha ao buscar configurações.");
    }
    return data;
  });

export const updateAppSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({
      notificationEmail: z.string().email(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("app_settings")
      .update({ notification_email: data.notificationEmail })
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Update any existing row

    if (error) {
      console.error("Error updating settings:", error);
      throw new Error("Falha ao atualizar configurações.");
    }
    return { success: true };
  });

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAnon } from "./supabase-anon.server";

export const trackVisit = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({
      path: z.string(),
      userAgent: z.string().optional(),
      referrer: z.string().optional(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAnon.from("site_visits").insert({
      path: data.path,
      user_agent: data.userAgent,
      referrer: data.referrer,
    });

    if (error) {
      console.error("Error tracking visit:", error);
      return { success: false };
    }

    return { success: true };
  });

export const getAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (!isAdmin) {
      throw new Error("Acesso negado.");
    }

    const { data: visits, error } = await supabase
      .from("site_visits")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching analytics:", error);
      throw new Error("Erro ao buscar analytics.");
    }

    return visits;
  });

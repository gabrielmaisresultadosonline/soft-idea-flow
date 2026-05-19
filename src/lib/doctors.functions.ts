import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAnon } from "./supabase-anon.server";

export const getDoctors = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabaseAnon
      .from("doctors")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Supabase error fetching doctors:", error);
      throw new Error(`Erro ao buscar médicos: ${error.message}`);
    }
    return data;
  });

export const createDoctor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({
      name: z.string().min(2),
      email: z.string().email(),
      specialty: z.string().optional(),
    }).parse(data)
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("doctors").insert(data);
    if (error) {
      console.error("Supabase error creating doctor:", error);
      throw new Error(`Erro ao cadastrar médico: ${error.message}`);
    }
    return { success: true };
  });

export const deleteDoctor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("doctors").delete().eq("id", data.id);
    if (error) {
      console.error("Supabase error deleting doctor:", error);
      throw new Error(`Erro ao excluir médico: ${error.message}`);
    }
    return { success: true };
  });

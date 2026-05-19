import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAnon } from "./supabase-anon.server";

/**
 * Creates a new booking in the database. Public.
 */
export const createBooking = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        fullName: z.string().min(2),
        email: z.string().email("E-mail inválido"),
        whatsapp: z.string().min(8),
        cpf: z.string().min(11),
        lgpdAccepted: z.boolean(),
        appointmentTime: z.string(),
      })
      .parse(data)
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAnon.from("bookings").insert({
      full_name: data.fullName,
      email: data.email,
      whatsapp: data.whatsapp,
      cpf: data.cpf,
      lgpd_accepted: data.lgpdAccepted,
      appointment_time: data.appointmentTime,
    });

    if (error) {
      console.error("Error creating booking:", error);
      throw new Error("Falha ao agendar consulta. Tente novamente.");
    }

    return { success: true };
  });

/**
 * Fetches all bookings. Admins only (enforced by RLS).
 */
export const getBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (roleError || !isAdmin) {
      throw new Error("Acesso negado. Apenas administradores.");
    }

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("appointment_time", { ascending: true });

    if (error) {
      console.error("Error fetching bookings:", error);
      throw new Error("Falha ao buscar agendamentos.");
    }

    return data;
  });

export const updateBookingStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["pending", "confirmed", "cancelled"]).optional(),
        paymentStatus: z.enum(["pending", "paid"]).optional(),
        attendanceStatus: z.enum(["waiting", "completed", "missed"]).optional(),
        doctorId: z.string().uuid().optional(),
      })
      .parse(data)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (!isAdmin) {
      throw new Error("Acesso negado.");
    }

    const updateData: any = {};
    if (data.status) updateData.status = data.status;
    if (data.paymentStatus) updateData.payment_status = data.paymentStatus;
    if (data.attendanceStatus) updateData.attendance_status = data.attendanceStatus;
    if (data.doctorId) updateData.doctor_id = data.doctorId;

    const { error } = await supabase
      .from("bookings")
      .update(updateData)
      .eq("id", data.id);

    if (error) {
      throw new Error("Falha ao atualizar status.");
    }

    return { success: true };
  });

export const clearBookings = createServerFn({ method: "POST" })
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

    const { error } = await supabase
      .from("bookings")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (error) {
      console.error("Error clearing bookings:", error);
      throw new Error("Falha ao zerar fila.");
    }

    return { success: true };
  });

/**
 * Setup admin function — DEPRECATED. Required SUPABASE_SERVICE_ROLE_KEY.
 * Now disabled. Create the initial admin manually via the database.
 */
export const setupAdmin = createServerFn({ method: "POST" })
  .handler(async () => {
    return { error: "setupAdmin desativado. Crie o admin manualmente." };
  });

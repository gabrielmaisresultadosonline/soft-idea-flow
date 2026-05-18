import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Creates a new booking in the database.
 * This is a public function.
 */
export const createBooking = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        fullName: z.string().min(2),
        email: z.string().email("E-mail inválido"),
        whatsapp: z.string().min(8),
        appointmentTime: z.string(), // ISO string
      })
      .parse(data)
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("bookings").insert({
      full_name: data.fullName,
      email: data.email,
      whatsapp: data.whatsapp,
      appointment_time: data.appointmentTime,
    });

    if (error) {
      console.error("Error creating booking:", error);
      throw new Error("Falha ao agendar consulta. Tente novamente.");
    }

    return { success: true };
  });

/**
 * Fetches all bookings.
 * Only for admins.
 */
export const getBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // First, verify the user is actually an admin using the has_role function
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

/**
 * Updates a booking status.
 * Only for admins.
 */
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

/**
 * Internal setup function to create the initial admin user.
 * This should only be called once or in development.
 */
export const setupAdmin = createServerFn({ method: "POST" })
  .handler(async () => {
    const email = "unidoc@unidoc.com.br"; // Using a placeholder for the login
    const password = "unidoc";

    // Check if user exists
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    let user = users.users.find((u) => u.email === email);

    if (!user) {
      const { data: newUser, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });

      if (createError) {
        console.error("Error creating admin user:", createError);
        return { error: createError.message };
      }
      user = newUser.user;
    }

    if (user) {
      // Ensure the user has the admin role
      const { error: roleError } = await supabaseAdmin
        .from("user_roles")
        .upsert({
          user_id: user.id,
          role: "admin",
        }, { onConflict: "user_id,role" });

      if (roleError) {
        console.error("Error assigning admin role:", roleError);
        return { error: roleError.message };
      }
    }

    return { success: true, email };
  });

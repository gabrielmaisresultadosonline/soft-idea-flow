import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import crypto from "crypto";

const PIXEL_ID = process.env.META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

function hashData(data: string | undefined): string | null {
  if (!data) return null;
  return crypto.createHash("sha256").update(data.trim().toLowerCase()).digest("hex");
}

export const trackMetaEvent = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({
      eventName: z.string(),
      userData: z.object({
        em: z.string().optional(),
        ph: z.string().optional(),
        fn: z.string().optional(),
        externalId: z.string().optional(),
        clientIpAddress: z.string().optional(),
        clientUserAgent: z.string().optional(),
      }),
      customData: z.record(z.any()).optional(),
      eventSourceUrl: z.string().optional(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    if (!PIXEL_ID || !ACCESS_TOKEN) {
      console.warn("Meta Pixel ID or Access Token not configured.");
      return { success: false, error: "Missing configuration" };
    }

    const payload = {
      data: [
        {
          event_name: data.eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: "website",
          event_source_url: data.eventSourceUrl,
          user_data: {
            em: data.userData.em ? [hashData(data.userData.em)] : [],
            ph: data.userData.ph ? [hashData(data.userData.ph)] : [],
            fn: data.userData.fn ? [hashData(data.userData.fn)] : [],
            external_id: data.userData.externalId ? [hashData(data.userData.externalId)] : [],
            client_ip_address: data.userData.clientIpAddress,
            client_user_agent: data.userData.clientUserAgent,
          },
          custom_data: data.customData,
        },
      ],
    };

    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        console.error("Meta Conversions API Error:", result);
        return { success: false, error: result };
      }

      return { success: true, result };
    } catch (error) {
      console.error("Failed to send event to Meta:", error);
      return { success: false, error };
    }
  });

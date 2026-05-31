import Resend from "@auth/core/providers/resend";
import { Resend as ResendAPI } from "resend";

/**
 * Email one-time-passcode provider.
 *
 * Registered under the id "email" so the frontend can call
 * `signIn("email", { email })` to request a code and
 * `signIn("email", { email, code })` to verify it.
 *
 * Requires the Resend API key to be set in the Convex deployment
 * environment as AUTH_RESEND_KEY (RESEND_API_KEY is also accepted).
 * Optionally set AUTH_EMAIL to override the "from" address (it must
 * use a domain you've verified in Resend; the default works for
 * Resend test sends).
 */
export const ResendOTP = Resend({
  id: "email",
  apiKey: process.env.AUTH_RESEND_KEY ?? process.env.RESEND_API_KEY,
  // 6-digit numeric code, matching the login UI.
  async generateVerificationToken() {
    const random = crypto.getRandomValues(new Uint8Array(6));
    return Array.from(random, (byte) => (byte % 10).toString()).join("");
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const resend = new ResendAPI(provider.apiKey);
    const { error } = await resend.emails.send({
      from: process.env.AUTH_EMAIL ?? "Respawn Room <onboarding@resend.dev>",
      to: [email],
      subject: "Your Respawn Room access code",
      text: `Your access code is ${token}\n\nEnter it in the app to sync into your setup vault.`,
    });
    if (error) {
      throw new Error(JSON.stringify(error));
    }
  },
});

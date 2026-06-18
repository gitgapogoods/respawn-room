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
    if (!provider.apiKey) {
      throw new Error(
        "Resend API key is missing. Set AUTH_RESEND_KEY (or RESEND_API_KEY) " +
          "in your Convex deployment environment variables.",
      );
    }

    // `onboarding@resend.dev` is Resend's shared test sender. Resend only
    // delivers mail from it to your own account email and rejects all other
    // recipients — verifying a domain has no effect until the `from` address
    // actually uses that domain. So require AUTH_EMAIL for real sends.
    const from = process.env.AUTH_EMAIL ?? "Respawn Room <onboarding@resend.dev>";
    if (!process.env.AUTH_EMAIL) {
      console.warn(
        "AUTH_EMAIL is not set, so verification emails are sent from the " +
          "Resend test sender (onboarding@resend.dev). Resend will reject " +
          "delivery to anyone other than your own Resend account email. Set " +
          "AUTH_EMAIL to an address on your verified domain (e.g. " +
          '"Respawn Room <noreply@yourdomain.com>").',
      );
    }

    const resend = new ResendAPI(provider.apiKey);
    const { error } = await resend.emails.send({
      from,
      to: [email],
      subject: "Your Respawn Room access code",
      text: `Your access code is ${token}\n\nEnter it in the app to sync into your setup vault.`,
    });
    if (error) {
      // Resend returns a 403 for test-sender sends to non-account emails.
      // Surface an actionable message instead of the raw JSON payload.
      const detail =
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: unknown }).message)
          : JSON.stringify(error);
      const usingTestSender = from.includes("onboarding@resend.dev");
      if (usingTestSender) {
        throw new Error(
          `${detail} — verification email is being sent from the Resend ` +
            "test sender. Set AUTH_EMAIL in your Convex deployment to an " +
            "address on a domain you've verified in Resend to send to any " +
            "recipient.",
        );
      }
      throw new Error(detail);
    }
  },
});

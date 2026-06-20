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
    } else if (!/@.+\..+/.test(from)) {
      // AUTH_EMAIL is set but doesn't contain a real email address. Resend
      // would otherwise reject this with an opaque error, so be explicit.
      throw new Error(
        `AUTH_EMAIL is set to "${from}", which is not a valid sender ` +
          'address. Use a bare email ("noreply@yourdomain.com") or the ' +
          '"Name <email@yourdomain.com>" form, on a domain verified in Resend.',
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
      // Resend's error is `{ name, message, statusCode }`. Surface all of it
      // (instead of just the raw payload) so the cause is unambiguous.
      const name =
        typeof error === "object" && error !== null && "name" in error
          ? String((error as { name: unknown }).name)
          : "";
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: unknown }).message)
          : JSON.stringify(error);
      const detail = name ? `${name}: ${message}` : message;

      const usingTestSender = from.includes("onboarding@resend.dev");
      // The most common post-setup failure: AUTH_EMAIL points at a domain that
      // is not actually verified in *this* Resend account (e.g. it was added
      // but not verified, or the env var was set on Netlify instead of in the
      // Convex deployment where this code runs). Resend reports this with a
      // `validation_error` / 403 mentioning the domain.
      const domainNotVerified =
        /not.*(verified|allowed)|verify a domain|domain is not/i.test(message);

      if (usingTestSender) {
        throw new Error(
          `${detail} — verification email is being sent from the Resend ` +
            "test sender (onboarding@resend.dev), which means AUTH_EMAIL is " +
            "not visible to this Convex function. Set AUTH_EMAIL in the " +
            "Convex deployment (npx convex env set AUTH_EMAIL ...), not in " +
            "Netlify, to an address on a domain you've verified in Resend.",
        );
      }
      if (domainNotVerified) {
        throw new Error(
          `${detail} — the "from" address (${from}) uses a domain that is ` +
            "not verified in this Resend account. Verify that exact domain in " +
            "Resend, and make sure AUTH_EMAIL in the Convex deployment uses it.",
        );
      }
      throw new Error(detail);
    }
  },
});

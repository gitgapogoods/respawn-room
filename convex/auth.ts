import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { ResendOTP } from "./ResendOTP";

// Convex Auth requires `SITE_URL` to be set in the *Convex deployment*
// environment (not Netlify): before sending an email it builds the magic-link /
// redirect destination from `SITE_URL`, and throws "Missing environment
// variable `SITE_URL`" if it is absent — which aborts sign-in *before* the
// access-code email is ever sent. This app verifies sign-in with the 6-digit
// code (the magic-link URL itself is never used), so the destination only needs
// to be a valid site URL.
//
// The correct production fix is to set it in the Convex deployment:
//   npx convex env set SITE_URL https://respawnroom.space
// Until that is done, fall back to the public site URL so sign-in still works.
// A real `SITE_URL` env var always takes precedence.
if (!process.env.SITE_URL) {
  process.env.SITE_URL = "https://respawnroom.space";
}

// Convex Auth ALSO requires a signing key pair to be present in the *Convex
// deployment* environment: `JWT_PRIVATE_KEY` (used to sign session tokens) and
// `JWKS` (the matching public key, served at `/.well-known/jwks.json`). These
// are NOT set by the Netlify build and have no safe in-code fallback — a hard
// coded private key in the repo would let anyone forge sessions. When they are
// missing, entering a *correct* access code still fails: the code verifies, but
// the final "generate session token" step throws
// `Missing environment variable JWT_PRIVATE_KEY`, surfaced in the UI as
// "Invalid Access Code".
//
// Generate and upload both keys to the deployment with the official one-time
// setup command (run once against the production deployment):
//   npx @convex-dev/auth
// It creates the RSA key pair and sets `JWT_PRIVATE_KEY` and `JWKS` for you.
// Keep the private key secret — never commit it.

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password, ResendOTP],
});

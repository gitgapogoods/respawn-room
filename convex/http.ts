import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();

// Registers the Convex Auth HTTP endpoints, including
// `/.well-known/jwks.json`, `/.well-known/openid-configuration`,
// and the `/api/auth/*` sign-in and callback routes.
auth.addHttpRoutes(http);

export default http;

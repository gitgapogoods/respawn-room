export default {
  providers: [
    {
      // CONVEX_SITE_URL is set automatically by Convex for every deployment.
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};

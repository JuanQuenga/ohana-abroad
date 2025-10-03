// Configure Convex to accept JWTs issued by WorkOS
export default {
  providers: [
    {
      domain: "https://api.workos.com",
      applicationID: process.env.WORKOS_CLIENT_ID,
    },
  ],
};

import { authkitMiddleware } from "@workos-inc/authkit-nextjs";

export default authkitMiddleware({
  debug: process.env.NODE_ENV !== "production",
  // Paths that should trigger a sign-up hint
  signUpPaths: ["/sign-up", "/dashboard/:path*"],
});

export const config = {
  matcher: ["/", "/dashboard/:path*", "/account/:path*"],
};

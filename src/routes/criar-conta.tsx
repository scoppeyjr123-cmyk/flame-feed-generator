import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/criar-conta")({
  beforeLoad: () => {
    // No traditional registration with password. Seamless login via checkout or email OTP.
    throw redirect({ to: "/login" });
  },
  component: () => null,
});

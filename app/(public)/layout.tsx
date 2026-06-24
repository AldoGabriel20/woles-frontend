import type { ReactNode } from "react";
import { LandingNavbar } from "@/components/landing/navbar";
import { LandingFooter } from "@/components/landing/footer";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <LandingNavbar />
      <main>{children}</main>
      <LandingFooter />
    </>
  );
}

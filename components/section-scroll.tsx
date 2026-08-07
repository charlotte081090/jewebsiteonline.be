"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { scrollToSection } from "@/components/section-link";

export function SectionScroll({ sectionId }: { sectionId: string }) {
  const pathname = usePathname();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      scrollToSection(sectionId);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [sectionId, pathname]);

  return null;
}

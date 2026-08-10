"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const MOBILE_NAV_KEYS = [
  "examples",
  "howItWorks",
  "pricing",
  "faq",
] as const;

export type MobileNavKey = (typeof MOBILE_NAV_KEYS)[number];

type MobileNavContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: (opts?: { scrollHomeFirst?: boolean }) => void;
  activeKey: MobileNavKey | null;
  setActiveKey: (key: MobileNavKey | null) => void;
};

const MobileNavContext = createContext<MobileNavContextValue | null>(null);

export function MobileNavProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [activeKey, setActiveKey] = useState<MobileNavKey | null>(null);

  const toggle = useCallback((opts?: { scrollHomeFirst?: boolean }) => {
    setOpen((wasOpen) => {
      if (wasOpen) return false;

      if (opts?.scrollHomeFirst && typeof window !== "undefined") {
        if (window.scrollY > 24) {
          window.scrollTo({ top: 0, behavior: "smooth" });
          window.setTimeout(() => setOpen(true), 420);
          return false;
        }
      }

      return true;
    });
  }, []);

  const value = useMemo(
    () => ({ open, setOpen, toggle, activeKey, setActiveKey }),
    [open, toggle, activeKey],
  );

  return (
    <MobileNavContext.Provider value={value}>
      {children}
    </MobileNavContext.Provider>
  );
}

export function useMobileNav(): MobileNavContextValue {
  const value = useContext(MobileNavContext);
  if (!value) {
    throw new Error("useMobileNav must be used within MobileNavProvider");
  }
  return value;
}

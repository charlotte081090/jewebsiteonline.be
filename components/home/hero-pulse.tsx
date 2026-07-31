"use client";

import { useEffect, useState } from "react";
import { useLocaleContext } from "@/components/locale-provider";

const PULSE_KEY = "jwo-pulse-clicks";
const MIN = 8;
const MAX = 26;
const RANGE = MAX - MIN + 1;

function countFromSeed(seed: number) {
  return MIN + (((seed % RANGE) + RANGE) % RANGE);
}

export function HeroPulse() {
  const { dict } = useLocaleContext();
  const [count, setCount] = useState(15);
  const [labelBefore, labelAfter] = dict.hero.pulseLabel.split("{count}");

  useEffect(() => {
    const daySeed = Math.floor(Date.now() / (1000 * 60 * 60 * 48));
    let clicks = 0;
    try {
      clicks = Number(localStorage.getItem(PULSE_KEY) || 0);
    } catch {
      /* ignore */
    }
    setCount(countFromSeed(daySeed + Math.floor(clicks / 2)));
  }, []);

  function bumpCount() {
    let clicks = 0;
    try {
      clicks = Number(localStorage.getItem(PULSE_KEY) || 0) + 1;
      localStorage.setItem(PULSE_KEY, String(clicks));
    } catch {
      clicks += 1;
    }
    const daySeed = Math.floor(Date.now() / (1000 * 60 * 60 * 48));
    setCount(countFromSeed(daySeed + Math.floor(clicks / 2)));
  }

  return (
    <button
      type="button"
      onClick={bumpCount}
      className="inline-flex items-center gap-3 self-center rounded-md border border-terracotta/25 bg-terracotta/[0.08] px-3.5 py-2.5 text-left transition-colors hover:border-terracotta/40 lg:self-end"
    >
      <span
        className="relative flex h-3.5 w-3.5 shrink-0 items-center justify-center"
        aria-hidden
      >
        <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-terracotta/45" />
        <span className="absolute inline-flex h-full w-full animate-pulse-ring-delayed rounded-full bg-terracotta/30" />
        <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-terracotta shadow-[0_0_0_3px_rgba(192,127,99,0.2)]" />
      </span>
      <p className="text-sm font-medium text-forest">
        {labelBefore ? (
          <span className="text-forest-muted">{labelBefore}</span>
        ) : null}
        <span className="font-semibold">{count}</span>
        <span className="text-forest-muted">{labelAfter ?? ""}</span>
      </p>
    </button>
  );
}

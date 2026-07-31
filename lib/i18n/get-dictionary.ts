import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/types";
import { nl } from "./dictionaries/nl";
import { en } from "./dictionaries/en";

const maps: Record<Locale, Dictionary> = { nl, en };

export function getDictionary(locale: Locale): Dictionary {
  return maps[locale];
}

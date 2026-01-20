import type { Fin } from "@openfin/core";

declare global {
  const fin: Fin<"window" | "view"> | undefined;
}

export {};

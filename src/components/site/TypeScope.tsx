import type { ReactNode } from "react";
import { typeRules, type TypeScale } from "@/lib/type-style";

/** Applies a page or section type override without touching text that was left on “Same as above”. */
export default function TypeScope({ scale, scope, children }: { scale?: TypeScale; scope: string; children: ReactNode }) {
  const css = typeRules(scale, `.${scope}`);
  return (
    <div className={scope} style={{ display: "contents" }}>
      {css ? <style>{css}</style> : null}
      {children}
    </div>
  );
}

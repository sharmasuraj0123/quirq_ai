"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";

/**
 * Single reduced-motion policy for every motion component.
 *
 * Never branch `initial`/`animate` on useReducedMotion(): it returns null on
 * the server, so the served HTML carries the full-motion inline styles while a
 * reduced-motion client hydrates with different props. React does not patch
 * style-attribute mismatches, which left reduced-motion visitors staring at a
 * permanently blurred wordmark and headlines stuck inside their reveal masks.
 * With reducedMotion="user", motion snaps transforms for those visitors at
 * animation time instead, and server and client markup stay identical.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

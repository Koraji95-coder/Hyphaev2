import type { ReactNode } from "react";
import classNames from "classnames";

const variants: Record<"default" | "secondary" | "outline", string> = {
  default: "bg-purple-600 text-white",
  secondary: "bg-gray-200 text-black",
  outline: "border border-gray-400 text-gray-700",
};

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "secondary" | "outline";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={classNames(
        "px-2 py-1 text-xs rounded",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

import React from "react";
import type { ReactNode } from "react";
import classNames from "classnames";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={classNames(
        // Glassmorphism styling:
        "bg-dark-200/80 backdrop-blur-sm border border-dark-100/40 rounded-xl shadow-lg",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }: CardProps) {
  return (
    <div className={classNames("p-4", className)}>
      {children}
    </div>
  );
}

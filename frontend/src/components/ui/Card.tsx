// src/components/ui/Card.tsx
import React from "react";
import type { ReactNode } from "react";
import classNames from "classnames";

interface CardProps {
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * A solid dark card with optional header
 */
export function Card({ title, children, className = "" }: CardProps) {
  return (
    <div
      className={classNames(
        "bg-dark-700 border border-dark-600 rounded-xl shadow-lg overflow-hidden",
        className
      )}
    >
      {title != null && (
        <div className="px-4 py-3 border-b border-dark-600">
          <h2 className="text-white font-semibold text-lg">{title}</h2>
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

/**
 * Use this inside Card if you need an extra padded section
 */
export function CardContent({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={classNames("p-4", className)}>{children}</div>;
}

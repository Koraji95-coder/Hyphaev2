import type { ReactNode } from "react";
import classNames from "classnames";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={classNames("bg-white dark:bg-dark-200 rounded-lg", className)}>
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

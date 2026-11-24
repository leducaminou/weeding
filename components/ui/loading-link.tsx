"use client";

import React from "react";
import Link from "next/link";
import { useLoading } from "@/app/context/LoadingContext";
import { cn } from "@/lib/utils";

export interface LoadingLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: boolean;
  replace?: boolean;
  title?: string;
  "aria-label"?: string;
  onClick?: () => void;
}

export default function LoadingLink({
  href,
  children,
  className,
  prefetch,
  replace,
  title,
  "aria-label": ariaLabel,
  onClick,
}: LoadingLinkProps) {
  const { startLoading } = useLoading();

  const handleClick = () => {
    startLoading();
    onClick?.();
  };

  return (
    <Link
      href={href}
      prefetch={prefetch}
      replace={replace}
      title={title}
      aria-label={ariaLabel}
      className={cn(className)}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}

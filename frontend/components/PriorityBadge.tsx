"use client";

import { getPriorityColor, cn } from "@/lib/utils";

interface PriorityBadgeProps {
  priority: string;
  className?: string;
}

export default function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <span
      className={cn(
        "px-2.5 py-1 text-[11px] font-extrabold tracking-wider uppercase rounded-md border inline-flex items-center gap-1",
        getPriorityColor(priority),
        className
      )}
    >
      <span className="w-1.2 h-1.2 rounded-full bg-current" />
      {priority}
    </span>
  );
}

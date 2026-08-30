"use client";

import { cn } from "@/lib/utils";

interface ProbabilityBadgeProps {
  probability: number; // 0.0 to 1.0
  size?: "sm" | "md" | "lg";
  showRing?: boolean;
}

export default function ProbabilityBadge({
  probability,
  size = "md",
  showRing = false,
}: ProbabilityBadgeProps) {
  const percentage = Math.round(probability * 100);

  let colorClass = "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
  let strokeColor = "#10b981";

  if (percentage < 45) {
    colorClass = "text-rose-400 border-rose-500/30 bg-rose-500/10";
    strokeColor = "#ef4444";
  } else if (percentage < 70) {
    colorClass = "text-amber-400 border-amber-500/30 bg-amber-500/10";
    strokeColor = "#f59e0b";
  }

  if (showRing) {
    const radius = size === "lg" ? 36 : 28;
    const strokeWidth = size === "lg" ? 6 : 4;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    const boxSize = (radius + strokeWidth) * 2;

    return (
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center">
          <svg width={boxSize} height={boxSize} className="transform -rotate-90">
            {/* Background ring */}
            <circle
              cx={boxSize / 2}
              cy={boxSize / 2}
              r={radius}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Progress ring */}
            <circle
              cx={boxSize / 2}
              cy={boxSize / 2}
              r={radius}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <span className="absolute font-extrabold text-white text-xs lg:text-sm">
            {percentage}%
          </span>
        </div>
        <div>
          <p className="text-xs text-slate-400 font-medium">Recovery Score</p>
          <p className={cn("text-xs font-bold capitalize", colorClass.split(" ")[0])}>
            {percentage >= 70 ? "High Likelihood" : percentage >= 45 ? "Moderate Likelihood" : "Low Likelihood"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <span
      className={cn(
        "font-bold rounded-lg border inline-flex items-center justify-center gap-1",
        colorClass,
        size === "sm" ? "px-2 py-0.5 text-[11px]" : size === "lg" ? "px-3.5 py-1.5 text-sm" : "px-2.5 py-1 text-xs"
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {percentage}%
    </span>
  );
}

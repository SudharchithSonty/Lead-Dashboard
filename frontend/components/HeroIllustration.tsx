"use client";

export default function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto max-w-md mx-auto"
      aria-hidden="true"
    >
      {/* Background circle */}
      <circle cx="250" cy="250" r="220" fill="#EFF6FF" />
      <circle cx="250" cy="250" r="180" fill="#DBEAFE" opacity="0.6" />

      {/* Central hub node */}
      <circle cx="250" cy="220" r="50" fill="#3B82F6" />
      <path
        d="M230 210 L245 225 L270 200"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Connection lines */}
      <line x1="250" y1="270" x2="150" y2="370" stroke="#93C5FD" strokeWidth="2" strokeDasharray="6 4" />
      <line x1="250" y1="270" x2="250" y2="380" stroke="#93C5FD" strokeWidth="2" strokeDasharray="6 4" />
      <line x1="250" y1="270" x2="350" y2="370" stroke="#93C5FD" strokeWidth="2" strokeDasharray="6 4" />
      <line x1="200" y1="220" x2="100" y2="160" stroke="#93C5FD" strokeWidth="2" strokeDasharray="6 4" />
      <line x1="300" y1="220" x2="400" y2="160" stroke="#93C5FD" strokeWidth="2" strokeDasharray="6 4" />

      {/* Satellite nodes - leads */}
      <circle cx="150" cy="370" r="24" fill="#white" stroke="#3B82F6" strokeWidth="2" />
      <circle cx="150" cy="370" r="24" fill="white" />
      <circle cx="150" cy="365" r="8" fill="#93C5FD" />
      <path d="M138 378 Q150 388 162 378" stroke="#93C5FD" strokeWidth="2" fill="none" />

      <circle cx="250" cy="380" r="24" fill="white" stroke="#3B82F6" strokeWidth="2" />
      <circle cx="250" cy="375" r="8" fill="#93C5FD" />
      <path d="M238 388 Q250 398 262 388" stroke="#93C5FD" strokeWidth="2" fill="none" />

      <circle cx="350" cy="370" r="24" fill="white" stroke="#3B82F6" strokeWidth="2" />
      <circle cx="350" cy="365" r="8" fill="#93C5FD" />
      <path d="M338 378 Q350 388 362 378" stroke="#93C5FD" strokeWidth="2" fill="none" />

      {/* Top nodes - data sources */}
      <rect x="72" y="135" width="56" height="50" rx="8" fill="white" stroke="#3B82F6" strokeWidth="2" />
      <rect x="82" y="148" width="36" height="3" rx="1.5" fill="#93C5FD" />
      <rect x="82" y="155" width="28" height="3" rx="1.5" fill="#BFDBFE" />
      <rect x="82" y="162" width="32" height="3" rx="1.5" fill="#BFDBFE" />
      <rect x="82" y="169" width="20" height="3" rx="1.5" fill="#DBEAFE" />

      <rect x="372" y="135" width="56" height="50" rx="8" fill="white" stroke="#3B82F6" strokeWidth="2" />
      <rect x="382" y="148" width="36" height="3" rx="1.5" fill="#93C5FD" />
      <rect x="382" y="155" width="28" height="3" rx="1.5" fill="#BFDBFE" />
      <rect x="382" y="162" width="32" height="3" rx="1.5" fill="#BFDBFE" />
      <rect x="382" y="169" width="20" height="3" rx="1.5" fill="#DBEAFE" />

      {/* Animated pulse rings */}
      <circle cx="250" cy="220" r="60" stroke="#3B82F6" strokeWidth="1" opacity="0.3">
        <animate attributeName="r" from="55" to="80" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="250" cy="220" r="60" stroke="#3B82F6" strokeWidth="1" opacity="0.3">
        <animate attributeName="r" from="55" to="80" dur="2s" begin="1s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.3" to="0" dur="2s" begin="1s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

import { clsx } from "@/lib/clsx";

export interface HeroBookIllustrationProps {
  className?: string;
}

/**
 * Stylised stack-of-books illustration with a bookmark — used on the Hero
 * banner right side. Decorative; replaced with a real product mockup PNG
 * once art assets are ready.
 */
export function HeroBookIllustration({ className }: HeroBookIllustrationProps) {
  return (
    <svg
      viewBox="0 0 320 360"
      className={clsx("w-full max-w-[300px] h-auto", className)}
      role="img"
      aria-label="Stack of books"
    >
      {/* Back book — slightly tilted, faded */}
      <g transform="rotate(-3 160 200)">
        <rect x="50" y="100" width="180" height="220" rx="4" fill="white" opacity="0.18" />
        <rect x="50" y="100" width="14" height="220" rx="2" fill="white" opacity="0.3" />
      </g>

      {/* Middle book — semi visible */}
      <g transform="rotate(2 160 200)">
        <rect x="70" y="80" width="180" height="230" rx="4" fill="white" opacity="0.32" />
        <rect x="70" y="80" width="14" height="230" rx="2" fill="white" opacity="0.5" />
      </g>

      {/* Front book — primary, fully visible */}
      <g>
        <rect x="90" y="50" width="180" height="280" rx="6" fill="#ffffff" />
        {/* Spine accent */}
        <rect x="90" y="50" width="18" height="280" rx="3" fill="#0e6973" />
        {/* Header band */}
        <rect x="108" y="50" width="162" height="60" fill="#1d7a8c" opacity="0.18" />
        {/* HSC text */}
        <text x="189" y="90" fill="#0e6973" fontSize="22" fontWeight="800" textAnchor="middle" fontFamily="system-ui">
          HSC
        </text>
        <text x="189" y="108" fill="#0e6973" fontSize="9" fontWeight="600" textAnchor="middle" letterSpacing="0.15em" fontFamily="system-ui">
          PARALLEL TEXT
        </text>

        {/* Decorative leaf motif */}
        <circle cx="189" cy="195" r="50" fill="#fef3c7" />
        <path d="M159 195 Q189 145 219 195 Q189 245 159 195" fill="#0e6973" opacity="0.85" />
        <path d="M170 195 Q189 165 208 195 Q189 225 170 195" fill="#ffcc28" opacity="0.6" />
        <circle cx="189" cy="195" r="8" fill="#8b4083" />

        {/* Bottom label band */}
        <rect x="108" y="280" width="162" height="50" fill="#0e6973" opacity="0.18" />
        <text x="189" y="310" fill="#0e6973" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="system-ui">
          উদ্ভাস-উন্মেষ
        </text>
      </g>

      {/* Bookmark ribbon */}
      <g>
        <path d="M236 50 L236 158 L246 148 L256 158 L256 50 Z" fill="#e02d15" />
        <path d="M236 50 L256 50 L256 56 L236 56 Z" fill="#a01a0a" />
      </g>
    </svg>
  );
}

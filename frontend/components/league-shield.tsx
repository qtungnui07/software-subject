import React from "react";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export type LeagueId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export const LEAGUES = [
  { id: 1 as LeagueId, name: "Đồng", nameEn: "Bronze", color: "from-[#d97706] to-[#b45309]", border: "border-[#b45309]" },
  { id: 2 as LeagueId, name: "Bạc", nameEn: "Silver", color: "from-[#94a3b8] to-[#64748b]", border: "border-[#64748b]" },
  { id: 3 as LeagueId, name: "Vàng", nameEn: "Gold", color: "from-[#f59e0b] to-[#d97706]", border: "border-[#d97706]" },
  { id: 4 as LeagueId, name: "Sapphire", nameEn: "Sapphire", color: "from-[#3b82f6] to-[#1d4ed8]", border: "border-[#1d4ed8]" },
  { id: 5 as LeagueId, name: "Ruby", nameEn: "Ruby", color: "from-[#ef4444] to-[#b91c1c]", border: "border-[#b91c1c]" },
  { id: 6 as LeagueId, name: "Emerald", nameEn: "Emerald", color: "from-[#10b981] to-[#047857]", border: "border-[#047857]" },
  { id: 7 as LeagueId, name: "Amethyst", nameEn: "Amethyst", color: "from-[#8b5cf6] to-[#6d28d9]", border: "border-[#6d28d9]" },
  { id: 8 as LeagueId, name: "Pearl", nameEn: "Pearl", color: "from-[#ec4899] to-[#be185d]", border: "border-[#be185d]" },
  { id: 9 as LeagueId, name: "Obsidian", nameEn: "Obsidian", color: "from-[#4b5563] to-[#1f2937]", border: "border-[#1f2937]" },
  { id: 10 as LeagueId, name: "Diamond", nameEn: "Diamond", color: "from-[#06b6d4] to-[#0891b2]", border: "border-[#0891b2]" },
];

interface LeagueShieldProps {
  leagueId: LeagueId;
  size?: number;
  locked?: boolean;
  className?: string;
  onClick?: () => void;
}

export const LeagueShield: React.FC<LeagueShieldProps> = ({
  leagueId,
  size = 64,
  locked = false,
  className,
  onClick,
}) => {
  const league = LEAGUES.find((l) => l.id === leagueId) || LEAGUES[0];

  const renderShieldContent = () => {
    if (locked) {
      return (
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-slate-400 drop-shadow-md"
        >
          {/* Locked Shield Base */}
          <path
            d="M50 5C25 5 15 25 15 50C15 75 35 90 50 95C65 90 85 75 85 50C85 25 75 5 50 5Z"
            fill="#cbd5e1"
            stroke="#94a3b8"
            strokeWidth="6"
            strokeLinejoin="round"
          />
          {/* Inner Silhouette */}
          <path
            d="M50 12C30 12 22 28 22 50C22 70 38 83 50 87C62 83 78 70 78 50C78 28 70 12 50 12Z"
            fill="#e2e8f0"
          />
          {/* Lock icon cutout */}
          <circle cx="50" cy="50" r="16" fill="#94a3b8" />
          <path
            d="M45 50H55V62C55 63.1 54.1 64 53 64H47C45.9 64 45 63.1 45 62V50Z"
            fill="#ffffff"
          />
          <path
            d="M47 50V46C47 44.3 48.3 43 50 43C51.7 43 53 44.3 53 46V50"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      );
    }

    // Colors and SVG templates for each league
    switch (leagueId) {
      case 1: // Bronze / Đồng (Copper Shield with Feather)
        return (
          <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bronzeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="50%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
              <linearGradient id="bronzeInner" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fed7aa" />
                <stop offset="100%" stopColor="#ffedd5" />
              </linearGradient>
            </defs>
            <path
              d="M50 5C25 5 15 25 15 50C15 75 35 90 50 95C65 90 85 75 85 50C85 25 75 5 50 5Z"
              fill="url(#bronzeGrad)"
              stroke="#78350f"
              strokeWidth="6"
            />
            <path
              d="M50 12C30 12 22 28 22 50C22 70 38 83 50 87C62 83 78 70 78 50C78 28 70 12 50 12Z"
              fill="url(#bronzeInner)"
            />
            {/* Feather details */}
            <path
              d="M38 68C38 68 40 45 62 32C62 32 48 45 42 62"
              stroke="#b45309"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M48 55C48 55 58 45 66 40C64 45 56 50 52 53"
              stroke="#b45309"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M42 60C42 60 52 52 58 48C56 52 48 56 46 58"
              stroke="#b45309"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M38 65C38 65 44 60 48 58"
              stroke="#b45309"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        );
      case 2: // Silver / Bạc (Silver Shield with Stripe)
        return (
          <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#cbd5e1" />
                <stop offset="50%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>
              <linearGradient id="silverInner" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f1f5f9" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </linearGradient>
            </defs>
            <path
              d="M50 5C25 5 15 25 15 50C15 75 35 90 50 95C65 90 85 75 85 50C85 25 75 5 50 5Z"
              fill="url(#silverGrad)"
              stroke="#334155"
              strokeWidth="6"
            />
            <path
              d="M50 12C30 12 22 28 22 50C22 70 38 83 50 87C62 83 78 70 78 50C78 28 70 12 50 12Z"
              fill="url(#silverInner)"
            />
            <path
              d="M50 20V80"
              stroke="#64748b"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="M32 40L50 55L68 40"
              stroke="#475569"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 3: // Gold / Vàng (Gold Shield with Star and wings)
        return (
          <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="55%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#a16207" />
              </linearGradient>
              <linearGradient id="goldInner" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fef9c3" />
                <stop offset="100%" stopColor="#fef08a" />
              </linearGradient>
            </defs>
            <path
              d="M50 5C25 5 15 25 15 50C15 75 35 90 50 95C65 90 85 75 85 50C85 25 75 5 50 5Z"
              fill="url(#goldGrad)"
              stroke="#713f12"
              strokeWidth="6"
            />
            <path
              d="M50 12C30 12 22 28 22 50C22 70 38 83 50 87C62 83 78 70 78 50C78 28 70 12 50 12Z"
              fill="url(#goldInner)"
            />
            {/* Star */}
            <path
              d="M50 28L54.5 42H69L57.5 50.5L62 65L50 56.5L38 65L42.5 50.5L31 42H45.5L50 28Z"
              fill="#d97706"
              stroke="#713f12"
              strokeWidth="2"
            />
          </svg>
        );
      case 4: // Sapphire (Blue crystal shield)
        return (
          <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="sapphireGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="50%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#1e3a8a" />
              </linearGradient>
            </defs>
            <path
              d="M50 5C25 5 15 25 15 50C15 75 35 90 50 95C65 90 85 75 85 50C85 25 75 5 50 5Z"
              fill="url(#sapphireGrad)"
              stroke="#1e293b"
              strokeWidth="6"
            />
            {/* Sapphire Gem cuts */}
            <polygon points="50,15 73,35 60,70 40,70 27,35" fill="#3b82f6" />
            <polygon points="50,15 50,45 27,35" fill="#93c5fd" opacity="0.6" />
            <polygon points="50,15 73,35 50,45" fill="#1d4ed8" opacity="0.4" />
            <polygon points="73,35 60,70 50,45" fill="#1e3a8a" opacity="0.5" />
            <polygon points="60,70 40,70 50,45" fill="#2563eb" opacity="0.8" />
            <polygon points="40,70 27,35 50,45" fill="#3b82f6" opacity="0.9" />
          </svg>
        );
      case 5: // Ruby (Red crystal shield)
        return (
          <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="rubyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f87171" />
                <stop offset="50%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#7f1d1d" />
              </linearGradient>
            </defs>
            <path
              d="M50 5C25 5 15 25 15 50C15 75 35 90 50 95C65 90 85 75 85 50C85 25 75 5 50 5Z"
              fill="url(#rubyGrad)"
              stroke="#450a0a"
              strokeWidth="6"
            />
            {/* Ruby Gem cuts */}
            <polygon points="50,15 75,40 50,80 25,40" fill="#ef4444" />
            <polygon points="50,15 50,48 25,40" fill="#fca5a5" opacity="0.7" />
            <polygon points="50,15 75,40 50,48" fill="#b91c1c" opacity="0.4" />
            <polygon points="75,40 50,80 50,48" fill="#7f1d1d" opacity="0.6" />
            <polygon points="50,80 25,40 50,48" fill="#ef4444" opacity="0.9" />
          </svg>
        );
      case 6: // Emerald (Green shield with gem)
        return (
          <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="50%" stopColor="#059669" />
                <stop offset="100%" stopColor="#064e3b" />
              </linearGradient>
            </defs>
            <path
              d="M50 5C25 5 15 25 15 50C15 75 35 90 50 95C65 90 85 75 85 50C85 25 75 5 50 5Z"
              fill="url(#emeraldGrad)"
              stroke="#022c22"
              strokeWidth="6"
            />
            {/* Emerald Octagonal Gem */}
            <polygon points="38,20 62,20 75,35 75,65 62,78 38,78 25,65 25,35" fill="#10b981" />
            <polygon points="38,20 62,20 50,49" fill="#a7f3d0" opacity="0.6" />
            <polygon points="62,20 75,35 75,49 50,49" fill="#047857" opacity="0.5" />
            <polygon points="75,49 75,65 62,78 50,49" fill="#064e3b" opacity="0.6" />
            <polygon points="62,78 38,78 50,49" fill="#059669" opacity="0.8" />
            <polygon points="38,78 25,65 25,49 50,49" fill="#10b981" opacity="0.9" />
            <polygon points="25,49 25,35 38,20 50,49" fill="#6ee7b7" opacity="0.8" />
          </svg>
        );
      case 7: // Amethyst (Purple shield with crystal cluster)
        return (
          <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="amethystGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="50%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#4c1d95" />
              </linearGradient>
            </defs>
            <path
              d="M50 5C25 5 15 25 15 50C15 75 35 90 50 95C65 90 85 75 85 50C85 25 75 5 50 5Z"
              fill="url(#amethystGrad)"
              stroke="#2e1065"
              strokeWidth="6"
            />
            {/* Crystal Shards */}
            {/* Center shard */}
            <polygon points="50,22 62,45 50,75 38,45" fill="#a78bfa" />
            <polygon points="50,22 50,75 38,45" fill="#ddd6fe" opacity="0.7" />
            {/* Left shard */}
            <polygon points="36,36 44,52 35,70 27,50" fill="#8b5cf6" opacity="0.9" />
            <polygon points="36,36 36,60 27,50" fill="#c4b5fd" opacity="0.6" />
            {/* Right shard */}
            <polygon points="64,36 73,50 65,70 56,52" fill="#6d28d9" opacity="0.9" />
            <polygon points="64,36 64,60 73,50" fill="#7c3aed" opacity="0.6" />
          </svg>
        );
      case 8: // Pearl (Pink gradient with center sphere)
        return (
          <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="pearlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f472b6" />
                <stop offset="50%" stopColor="#db2777" />
                <stop offset="100%" stopColor="#831843" />
              </linearGradient>
              <radialGradient id="pearlSphere" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="30%" stopColor="#fce7f3" />
                <stop offset="70%" stopColor="#f472b6" />
                <stop offset="100%" stopColor="#db2777" />
              </radialGradient>
            </defs>
            <path
              d="M50 5C25 5 15 25 15 50C15 75 35 90 50 95C65 90 85 75 85 50C85 25 75 5 50 5Z"
              fill="url(#pearlGrad)"
              stroke="#500724"
              strokeWidth="6"
            />
            {/* Inner frame */}
            <path
              d="M50 12C30 12 22 28 22 50C22 70 38 83 50 87C62 83 78 70 78 50C78 28 70 12 50 12Z"
              fill="#fdf2f8"
              opacity="0.25"
            />
            {/* Pearl Sphere */}
            <circle cx="50" cy="50" r="22" fill="url(#pearlSphere)" stroke="#db2777" strokeWidth="2.5" />
            <circle cx="43" cy="43" r="4" fill="#ffffff" opacity="0.8" />
          </svg>
        );
      case 9: // Obsidian (Dark obsidian shield with magma cracks)
        return (
          <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="obsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#374151" />
                <stop offset="50%" stopColor="#1f2937" />
                <stop offset="100%" stopColor="#111827" />
              </linearGradient>
            </defs>
            <path
              d="M50 5C25 5 15 25 15 50C15 75 35 90 50 95C65 90 85 75 85 50C85 25 75 5 50 5Z"
              fill="url(#obsGrad)"
              stroke="#030712"
              strokeWidth="6"
            />
            {/* Magma cracks */}
            <path
              d="M26 38L42 46L46 32L62 30L60 48L74 44M50 90L48 64L62 58L54 48"
              stroke="#f97316"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
            />
            <path
              d="M42 46L54 48L60 48"
              stroke="#facc15"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Obsidian Core Gem */}
            <polygon points="50,26 65,40 60,65 40,65 35,40" fill="#111827" stroke="#1f2937" strokeWidth="2" />
          </svg>
        );
      case 10: // Diamond (Kim cương - Sparkling cyan shield)
        return (
          <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="diaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a5f3fc" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#083344" />
              </linearGradient>
            </defs>
            <path
              d="M50 5C25 5 15 25 15 50C15 75 35 90 50 95C65 90 85 75 85 50C85 25 75 5 50 5Z"
              fill="url(#diaGrad)"
              stroke="#0f172a"
              strokeWidth="6"
            />
            {/* Diamond Gem */}
            <polygon points="50,15 78,40 50,85 22,40" fill="#06b6d4" />
            <polygon points="50,15 50,50 22,40" fill="#cffafe" opacity="0.75" />
            <polygon points="50,15 78,40 50,50" fill="#0891b2" opacity="0.45" />
            <polygon points="78,40 50,85 50,50" fill="#0e7490" opacity="0.6" />
            <polygon points="50,85 22,40 50,50" fill="#22d3ee" opacity="0.85" />
            {/* Sparkle sparkles */}
            <path d="M28 26L30 32L36 34L30 36L28 42L26 36L20 34L26 32L28 26Z" fill="#ffffff" />
            <path d="M72 64L73 68L77 69L73 70L72 74L71 70L67 69L71 68L72 64Z" fill="#ffffff" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div
      onClick={!locked && onClick ? onClick : undefined}
      className={cn(
        "relative select-none",
        !locked && onClick && "cursor-pointer transition-transform hover:scale-105 active:scale-95",
        className
      )}
      style={{ width: size, height: size }}
      title={league.name}
    >
      {renderShieldContent()}
    </div>
  );
};

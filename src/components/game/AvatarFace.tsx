import { cn } from "@/lib/utils";

export interface VipHairInfo {
  name: string;
  image_url?: string | null;
}

export interface AvatarFaceProps {
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  skinTone: string;
  faceStyle: string;
  accessory?: string | null;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  rank?: number; // 1, 2, 3 for special frames
  vipHair?: VipHairInfo | null;
}

const sizeConfig = {
  xs: 28,
  sm: 36,
  md: 48,
  lg: 64,
};

const getRankFrame = (rank: number | undefined, size: number) => {
  if (!rank || rank > 3) return null;
  
  const colors = {
    1: { outer: "#ffd700", inner: "#ffec8b", glow: "0 0 12px #ffd700, 0 0 20px #ffd70066" }, // Gold
    2: { outer: "#c0c0c0", inner: "#e8e8e8", glow: "0 0 10px #c0c0c0, 0 0 16px #c0c0c066" }, // Silver
    3: { outer: "#cd7f32", inner: "#daa06d", glow: "0 0 8px #cd7f32, 0 0 14px #cd7f3266" },  // Bronze
  };
  
  const color = colors[rank as 1 | 2 | 3];
  const strokeWidth = size > 40 ? 3 : 2;
  
  return { color, strokeWidth };
};

// Hair style paths - anime style
const hairStyles: Record<string, (color: string) => JSX.Element> = {
  short: (color) => (
    <g>
      <ellipse cx="50" cy="22" rx="38" ry="22" fill={color} />
      <path d="M12 42 Q18 18, 50 8 Q82 18, 88 42" fill={color} />
      <ellipse cx="38" cy="18" rx="10" ry="5" fill="white" opacity="0.15" />
    </g>
  ),
  long: (color) => (
    <g>
      <ellipse cx="50" cy="18" rx="40" ry="22" fill={color} />
      <path d="M10 42 Q16 14, 50 6 Q84 14, 90 42 L92 85 Q86 95, 80 85 L80 50 L20 50 L20 85 Q14 95, 8 85 Z" fill={color} />
      <ellipse cx="36" cy="16" rx="12" ry="6" fill="white" opacity="0.15" />
    </g>
  ),
  spiky: (color) => (
    <g>
      <path d="M16 48 L2 -8 L28 30 L35 -20 L44 26 L50 -28 L56 26 L65 -20 L72 30 L98 -8 L84 48" fill={color} />
      <ellipse cx="50" cy="28" rx="36" ry="20" fill={color} />
      <path d="M35 15 Q42 8, 52 12" stroke="white" strokeWidth="4" opacity="0.2" fill="none" />
    </g>
  ),
  curly: (color) => (
    <g>
      <circle cx="22" cy="24" r="14" fill={color} />
      <circle cx="40" cy="14" r="16" fill={color} />
      <circle cx="64" cy="14" r="16" fill={color} />
      <circle cx="82" cy="24" r="14" fill={color} />
      <circle cx="14" cy="44" r="12" fill={color} />
      <circle cx="90" cy="44" r="12" fill={color} />
      <ellipse cx="50" cy="28" rx="32" ry="18" fill={color} />
      <circle cx="42" cy="10" r="5" fill="white" opacity="0.15" />
    </g>
  ),
  mohawk: (color) => (
    <g>
      <path d="M36 48 L28 -15 L40 18 L46 -28 L54 -28 L60 18 L72 -15 L64 48" fill={color} />
      <path d="M24 42 Q38 34, 50 32 Q62 34, 76 42" fill={color} />
      <path d="M44 0 L50 -20 L56 0" stroke="white" strokeWidth="3" opacity="0.2" fill="none" />
    </g>
  ),
  ponytail: (color) => (
    <g>
      <ellipse cx="50" cy="22" rx="38" ry="22" fill={color} />
      <path d="M12 42 Q18 18, 50 8 Q82 18, 88 42" fill={color} />
      <ellipse cx="92" cy="50" rx="10" ry="8" fill="#dc2626" />
      <ellipse cx="38" cy="18" rx="10" ry="5" fill="white" opacity="0.15" />
    </g>
  ),
  bald: () => <g></g>,
};

// VIP Hair Styles with special effects
const vipHairStyles: Record<string, (baseHairColor: string) => JSX.Element> = {
  supersaiyajin: () => (
    <g>
      <defs>
        <linearGradient id="ssjGradientFace" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#fef08a" />
        </linearGradient>
        <filter id="ssjGlowFace" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path d="M12 48 L0 -12 L24 28 L32 -24 L42 24 L50 -32 L58 24 L68 -24 L76 28 L100 -12 L88 48" 
        fill="url(#ssjGradientFace)" filter="url(#ssjGlowFace)" />
      <ellipse cx="50" cy="26" rx="36" ry="20" fill="url(#ssjGradientFace)" />
      <path d="M34 12 Q42 4, 52 8" stroke="#fff" strokeWidth="3" opacity="0.4" fill="none" />
    </g>
  ),
  akatsuki: () => (
    <g>
      <ellipse cx="50" cy="18" rx="40" ry="22" fill="#1a1a1a" />
      <path d="M10 42 Q16 14, 50 6 Q84 14, 90 42 L92 85 Q86 95, 80 85 L80 50 L20 50 L20 85 Q14 95, 8 85 Z" fill="#1a1a1a" />
      <path d="M28 36 L24 58 L34 52 Z" fill="#1a1a1a" />
      <path d="M72 36 L76 58 L66 52 Z" fill="#1a1a1a" />
      <path d="M36 14 Q42 8, 50 10" stroke="#444" strokeWidth="2" opacity="0.3" fill="none" />
    </g>
  ),
};

// Detect VIP hair style from name
function getVipHairStyle(hairName: string): string | null {
  const name = hairName.toLowerCase();
  if (name.includes("saiyajin") || name.includes("saiyan") || name.includes("dragon")) return "supersaiyajin";
  if (name.includes("akatsuki") || name.includes("itachi")) return "akatsuki";
  return null;
}

// Face shape paths - anime style
const faceShapes: Record<string, string> = {
  round: "M50 24 C78 24, 90 52, 88 76 C84 98, 68 108, 50 108 C32 108, 16 98, 12 76 C10 52, 22 24, 50 24",
  oval: "M50 20 C76 20, 88 50, 86 74 C82 102, 68 114, 50 114 C32 114, 18 102, 14 74 C12 50, 24 20, 50 20",
  square: "M22 28 L78 28 C84 28, 88 34, 88 42 L88 82 C88 100, 74 108, 50 108 C26 108, 12 100, 12 82 L12 42 C12 34, 16 28, 22 28",
  heart: "M50 22 C78 22, 90 50, 88 72 C84 98, 66 112, 50 112 C34 112, 16 98, 12 72 C10 50, 22 22, 50 22",
};

// Anime-style eyes
const renderEyes = (eyeColor: string) => (
  <g>
    {/* Left eye */}
    <ellipse cx="34" cy="62" rx="14" ry="16" fill="white" />
    <ellipse cx="35" cy="63" rx="10" ry="13" fill={eyeColor} />
    <ellipse cx="35" cy="67" rx="8" ry="9" fill={eyeColor} opacity="0.7" />
    <circle cx="30" cy="57" r="4" fill="white" opacity="0.95" />
    <circle cx="38" cy="67" r="2.5" fill="white" opacity="0.7" />
    <ellipse cx="35" cy="63" rx="4" ry="5" fill="black" />
    
    {/* Right eye */}
    <ellipse cx="66" cy="62" rx="14" ry="16" fill="white" />
    <ellipse cx="65" cy="63" rx="10" ry="13" fill={eyeColor} />
    <ellipse cx="65" cy="67" rx="8" ry="9" fill={eyeColor} opacity="0.7" />
    <circle cx="70" cy="57" r="4" fill="white" opacity="0.95" />
    <circle cx="62" cy="67" r="2.5" fill="white" opacity="0.7" />
    <ellipse cx="65" cy="63" rx="4" ry="5" fill="black" />
    
    {/* Eyelashes */}
    <path d="M20 52 Q28 46, 36 50 Q44 46, 48 52" stroke="#2d2d2d" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M52 52 Q56 46, 64 50 Q72 46, 80 52" stroke="#2d2d2d" strokeWidth="3" fill="none" strokeLinecap="round" />
    
    {/* Eyebrows */}
    <path d="M22 42 Q34 34, 46 42" stroke="#3d3d3d" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M54 42 Q66 34, 78 42" stroke="#3d3d3d" strokeWidth="3" fill="none" strokeLinecap="round" />
  </g>
);

// Face features
const renderFaceFeatures = () => (
  <g>
    {/* Nose */}
    <path d="M48 76 L50 82 L52 76" stroke="#c9a07a" strokeWidth="1.5" fill="none" opacity="0.5" />
    
    {/* Blush */}
    <ellipse cx="24" cy="80" rx="8" ry="4" fill="#ffb7b7" opacity="0.4" />
    <ellipse cx="76" cy="80" rx="8" ry="4" fill="#ffb7b7" opacity="0.4" />
    
    {/* Mouth */}
    <path d="M42 92 Q50 100, 58 92" stroke="#e57373" strokeWidth="3" fill="none" strokeLinecap="round" />
  </g>
);

// Accessories
const accessories: Record<string, JSX.Element> = {
  glasses: (
    <g>
      <circle cx="34" cy="62" r="16" fill="none" stroke="#333" strokeWidth="2.5" />
      <circle cx="66" cy="62" r="16" fill="none" stroke="#333" strokeWidth="2.5" />
      <path d="M50 62 L50 62" stroke="#333" strokeWidth="2.5" />
      <path d="M18 60 L12 54" stroke="#333" strokeWidth="2.5" />
      <path d="M82 60 L88 54" stroke="#333" strokeWidth="2.5" />
    </g>
  ),
  earring: (
    <g>
      <circle cx="10" cy="70" r="4" fill="#ffd700" />
      <circle cx="90" cy="70" r="4" fill="#ffd700" />
    </g>
  ),
  scar: (
    <path d="M66 48 L78 66" stroke="#a86b5c" strokeWidth="2.5" opacity="0.7" />
  ),
  eyepatch: (
    <g>
      <ellipse cx="66" cy="62" rx="14" ry="12" fill="#222" />
      <path d="M12 52 L78 52" stroke="#222" strokeWidth="2.5" />
    </g>
  ),
  headband: (
    <rect x="12" y="34" width="76" height="8" rx="3" fill="#dc2626" />
  ),
  crown: (
    <g>
      <path d="M20 30 L24 12 L38 24 L48 4 L52 4 L62 24 L76 12 L80 30 L76 38 L24 38 Z" fill="#ffd700" />
      <circle cx="38" cy="24" r="3" fill="#dc2626" />
      <circle cx="50" cy="16" r="4" fill="#3b82f6" />
      <circle cx="62" cy="24" r="3" fill="#22c55e" />
    </g>
  ),
};

export function AvatarFace({ 
  hairStyle, 
  hairColor, 
  eyeColor, 
  skinTone, 
  faceStyle, 
  accessory,
  size = "md",
  className,
  rank,
  vipHair
}: AvatarFaceProps) {
  const dimension = sizeConfig[size];
  
  // Check for VIP hair
  const vipHairStyleKey = vipHair?.name ? getVipHairStyle(vipHair.name) : null;
  const HairComponent = vipHairStyleKey && vipHairStyles[vipHairStyleKey]
    ? vipHairStyles[vipHairStyleKey]
    : hairStyles[hairStyle] || hairStyles.short;
  
  const facePath = faceShapes[faceStyle] || faceShapes.round;
  const frameConfig = getRankFrame(rank, dimension);

  return (
    <div 
      className={cn("relative rounded-full", frameConfig ? "animate-pulse-glow-rank" : "", className)}
      style={frameConfig ? { 
        boxShadow: frameConfig.color.glow,
        animation: "pulse-glow-rank 2s ease-in-out infinite",
      } : undefined}
    >
      <svg 
        width={dimension} 
        height={dimension} 
        viewBox="0 0 100 120"
        className="rounded-full overflow-hidden"
        style={{ 
          background: "linear-gradient(180deg, hsl(var(--secondary)) 0%, hsl(var(--card)) 100%)",
          border: frameConfig 
            ? `${frameConfig.strokeWidth}px solid ${frameConfig.color.outer}` 
            : undefined,
        }}
      >
        {/* Face base */}
        <path d={facePath} fill={skinTone} />
        
        {/* Ears */}
        <ellipse cx="10" cy="66" rx="6" ry="10" fill={skinTone} />
        <ellipse cx="90" cy="66" rx="6" ry="10" fill={skinTone} />
        
        {/* Eyes */}
        {renderEyes(eyeColor)}
        
        {/* Face features */}
        {renderFaceFeatures()}
        
        {/* Hair - VIP or regular */}
        {HairComponent(hairColor)}
        
        {/* Accessory */}
        {accessory && accessories[accessory]}
        
        {/* VIP indicator */}
        {vipHair && (
          <g>
            <circle cx="88" cy="12" r="8" fill="#ffd700" />
            <text x="88" y="16" textAnchor="middle" fontSize="10" fill="#1a1a1a" fontWeight="bold">V</text>
          </g>
        )}
      </svg>
      
      {/* Rank badge */}
      {rank && rank <= 3 && (
        <div 
          className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
          style={{ 
            background: frameConfig?.color.outer,
            color: rank === 1 ? "#1a1a1a" : "#fff",
            boxShadow: `0 1px 3px rgba(0,0,0,0.3)`
          }}
        >
          {rank}
        </div>
      )}
    </div>
  );
}

import { cn } from "@/lib/utils";

export interface AvatarCustomization {
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  skinTone: string;
  faceStyle: string;
  accessory?: string | null;
  shirtColor: string;
  pantsColor: string;
  shoesColor: string;
}

interface VisualAvatarProps {
  customization: AvatarCustomization;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showLevel?: boolean;
  level?: number;
}

const sizeConfig = {
  sm: { width: 48, height: 64 },
  md: { width: 80, height: 110 },
  lg: { width: 120, height: 165 },
  xl: { width: 180, height: 250 },
};

// Hair style paths - anime style (more volume and dynamic)
const hairStyles: Record<string, (color: string) => JSX.Element> = {
  short: (color) => (
    <g>
      <ellipse cx="50" cy="16" rx="32" ry="18" fill={color} />
      <path d="M18 30 Q22 12, 50 6 Q78 12, 82 30" fill={color} />
      {/* Anime hair strands */}
      <path d="M30 28 Q28 20, 32 15" stroke={color} strokeWidth="4" fill="none" />
      <path d="M70 28 Q72 20, 68 15" stroke={color} strokeWidth="4" fill="none" />
      {/* Highlight */}
      <ellipse cx="38" cy="14" rx="8" ry="4" fill="white" opacity="0.15" />
    </g>
  ),
  long: (color) => (
    <g>
      <ellipse cx="50" cy="14" rx="34" ry="18" fill={color} />
      <path d="M16 30 Q20 10, 50 4 Q80 10, 84 30 L86 70 Q82 80, 76 70 L76 38 L24 38 L24 70 Q18 80, 14 70 Z" fill={color} />
      {/* Side hair flowing */}
      <path d="M18 40 Q12 60, 16 85 Q20 95, 26 85 L24 40" fill={color} />
      <path d="M82 40 Q88 60, 84 85 Q80 95, 74 85 L76 40" fill={color} />
      {/* Highlight */}
      <ellipse cx="36" cy="12" rx="10" ry="5" fill="white" opacity="0.15" />
    </g>
  ),
  spiky: (color) => (
    <g>
      {/* Dramatic anime spikes */}
      <path d="M20 35 L8 -5 L30 22 L35 -15 L42 18 L50 -20 L58 18 L65 -15 L70 22 L92 -5 L80 35" fill={color} />
      <ellipse cx="50" cy="20" rx="30" ry="16" fill={color} />
      {/* Highlight */}
      <path d="M35 10 Q40 5, 50 8" stroke="white" strokeWidth="3" opacity="0.2" fill="none" />
    </g>
  ),
  curly: (color) => (
    <g>
      {/* Fluffy anime curls */}
      <circle cx="26" cy="16" r="12" fill={color} />
      <circle cx="42" cy="8" r="14" fill={color} />
      <circle cx="62" cy="8" r="14" fill={color} />
      <circle cx="78" cy="16" r="12" fill={color} />
      <circle cx="18" cy="32" r="10" fill={color} />
      <circle cx="86" cy="32" r="10" fill={color} />
      <ellipse cx="50" cy="20" rx="28" ry="14" fill={color} />
      {/* Highlight */}
      <circle cx="42" cy="6" r="4" fill="white" opacity="0.15" />
    </g>
  ),
  mohawk: (color) => (
    <g>
      {/* Dramatic mohawk */}
      <path d="M38 35 L32 -10 L42 12 L48 -20 L52 -20 L58 12 L68 -10 L62 35" fill={color} />
      <path d="M28 32 Q38 26, 50 24 Q62 26, 72 32" fill={color} />
      {/* Highlight */}
      <path d="M46 0 L50 -15 L54 0" stroke="white" strokeWidth="2" opacity="0.2" fill="none" />
    </g>
  ),
  ponytail: (color) => (
    <g>
      <ellipse cx="50" cy="16" rx="32" ry="18" fill={color} />
      <path d="M18 30 Q22 12, 50 6 Q78 12, 82 30" fill={color} />
      {/* Ponytail with ribbon */}
      <ellipse cx="82" cy="35" rx="8" ry="6" fill="#dc2626" />
      <path d="M82 41 Q90 50, 88 75 Q86 90, 80 85 Q84 70, 82 50" fill={color} />
      <path d="M82 41 Q74 50, 76 75 Q78 90, 84 85 Q80 70, 82 50" fill={color} />
      {/* Highlight */}
      <ellipse cx="38" cy="14" rx="8" ry="4" fill="white" opacity="0.15" />
    </g>
  ),
  bald: () => <g></g>,
};

// Face shape paths - anime style (softer, rounder)
const faceShapes: Record<string, string> = {
  round: "M50 18 C72 18, 82 42, 80 62 C76 85, 62 92, 50 92 C38 92, 24 85, 20 62 C18 42, 28 18, 50 18",
  oval: "M50 15 C70 15, 80 40, 78 60 C74 88, 62 96, 50 96 C38 96, 26 88, 22 60 C20 40, 30 15, 50 15",
  square: "M28 20 L72 20 C78 20, 82 26, 82 32 L82 68 C82 84, 70 92, 50 92 C30 92, 18 84, 18 68 L18 32 C18 26, 22 20, 28 20",
  heart: "M50 16 C72 16, 82 40, 80 58 C76 82, 60 94, 50 94 C40 94, 24 82, 20 58 C18 40, 28 16, 50 16",
};

// Anime-style eyes with large irises and highlights
const renderEyes = (eyeColor: string, skinTone: string) => (
  <g>
    {/* Left eye - anime style */}
    <ellipse cx="36" cy="50" rx="12" ry="14" fill="white" />
    <ellipse cx="36" cy="50" rx="12" ry="14" fill="none" stroke={skinTone} strokeWidth="0.5" opacity="0.3" />
    <ellipse cx="37" cy="51" rx="9" ry="11" fill={eyeColor} />
    <ellipse cx="37" cy="54" rx="7" ry="8" fill={eyeColor} filter="brightness(0.7)" />
    <circle cx="33" cy="46" r="3.5" fill="white" opacity="0.95" />
    <circle cx="40" cy="54" r="2" fill="white" opacity="0.7" />
    <ellipse cx="37" cy="51" rx="3" ry="4" fill="black" />
    
    {/* Right eye - anime style */}
    <ellipse cx="64" cy="50" rx="12" ry="14" fill="white" />
    <ellipse cx="64" cy="50" rx="12" ry="14" fill="none" stroke={skinTone} strokeWidth="0.5" opacity="0.3" />
    <ellipse cx="63" cy="51" rx="9" ry="11" fill={eyeColor} />
    <ellipse cx="63" cy="54" rx="7" ry="8" fill={eyeColor} filter="brightness(0.7)" />
    <circle cx="67" cy="46" r="3.5" fill="white" opacity="0.95" />
    <circle cx="60" cy="54" r="2" fill="white" opacity="0.7" />
    <ellipse cx="63" cy="51" rx="3" ry="4" fill="black" />
    
    {/* Eyelashes - top */}
    <path d="M24 42 Q30 38, 36 40 Q42 38, 48 42" stroke="#2d2d2d" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <path d="M52 42 Q58 38, 64 40 Q70 38, 76 42" stroke="#2d2d2d" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    
    {/* Eyebrows - expressive anime style */}
    <path d="M26 34 Q36 28, 46 34" stroke="#3d3d3d" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <path d="M54 34 Q64 28, 74 34" stroke="#3d3d3d" strokeWidth="2.5" fill="none" strokeLinecap="round" />
  </g>
);

// Anime-style mouth and nose (minimal)
const renderFaceFeatures = (skinTone: string) => (
  <g>
    {/* Nose - very minimal anime style */}
    <path d="M49 62 L50 66 L51 62" stroke="#c9a07a" strokeWidth="1" fill="none" opacity="0.6" />
    
    {/* Blush marks */}
    <ellipse cx="28" cy="64" rx="6" ry="3" fill="#ffb7b7" opacity="0.4" />
    <ellipse cx="72" cy="64" rx="6" ry="3" fill="#ffb7b7" opacity="0.4" />
    
    {/* Mouth - cute anime style */}
    <path d="M44 74 Q50 80, 56 74" stroke="#e57373" strokeWidth="2.5" fill="none" strokeLinecap="round" />
  </g>
);

// Body (torso with shirt)
const renderBody = (shirtColor: string, skinTone: string) => (
  <g>
    {/* Neck */}
    <rect x="42" y="92" width="16" height="15" fill={skinTone} />
    
    {/* Torso/Shirt */}
    <path d="M25 107 L42 100 L42 107 L58 107 L58 100 L75 107 L80 180 L20 180 Z" fill={shirtColor} />
    
    {/* Shirt collar */}
    <path d="M42 107 L50 115 L58 107" stroke={shirtColor} strokeWidth="2" fill="none" />
    <path d="M42 107 L50 118 L58 107" fill={skinTone} />
    
    {/* Arms */}
    <path d="M25 107 L15 160 L22 162 L30 115" fill={skinTone} />
    <path d="M75 107 L85 160 L78 162 L70 115" fill={skinTone} />
    
    {/* Shirt sleeves */}
    <path d="M25 107 L18 135 L28 138 L32 112" fill={shirtColor} />
    <path d="M75 107 L82 135 L72 138 L68 112" fill={shirtColor} />
  </g>
);

// Pants
const renderPants = (pantsColor: string) => (
  <g>
    {/* Pants */}
    <path d="M20 180 L25 250 L40 250 L50 200 L60 250 L75 250 L80 180 Z" fill={pantsColor} />
    
    {/* Belt */}
    <rect x="20" y="178" width="60" height="6" fill="#4a3728" />
    <rect x="46" y="177" width="8" height="8" rx="1" fill="#ffd700" />
  </g>
);

// Shoes
const renderShoes = (shoesColor: string) => (
  <g>
    {/* Left shoe */}
    <path d="M25 248 L25 260 L10 262 L8 255 L22 252 L40 252 L40 248" fill={shoesColor} />
    
    {/* Right shoe */}
    <path d="M60 248 L60 260 L90 262 L92 255 L78 252 L75 252 L75 248" fill={shoesColor} />
  </g>
);

// Accessories
const accessories: Record<string, JSX.Element> = {
  glasses: (
    <g>
      <circle cx="38" cy="48" r="11" fill="none" stroke="#333" strokeWidth="2" />
      <circle cx="62" cy="48" r="11" fill="none" stroke="#333" strokeWidth="2" />
      <path d="M49 48 L51 48" stroke="#333" strokeWidth="2" />
      <path d="M27 48 L22 44" stroke="#333" strokeWidth="2" />
      <path d="M73 48 L78 44" stroke="#333" strokeWidth="2" />
    </g>
  ),
  earring: (
    <g>
      <circle cx="18" cy="55" r="3" fill="#ffd700" />
      <circle cx="82" cy="55" r="3" fill="#ffd700" />
    </g>
  ),
  scar: (
    <path d="M62 38 L70 52" stroke="#a86b5c" strokeWidth="2" opacity="0.7" />
  ),
  eyepatch: (
    <g>
      <ellipse cx="62" cy="48" rx="10" ry="8" fill="#222" />
      <path d="M20 40 L72 40" stroke="#222" strokeWidth="2" />
    </g>
  ),
  headband: (
    <rect x="20" y="26" width="60" height="6" rx="2" fill="#dc2626" />
  ),
  crown: (
    <g>
      <path d="M25 22 L28 8 L38 18 L48 2 L52 2 L62 18 L72 8 L75 22 L72 28 L28 28 Z" fill="#ffd700" />
      <circle cx="38" cy="18" r="2.5" fill="#dc2626" />
      <circle cx="50" cy="12" r="3" fill="#3b82f6" />
      <circle cx="62" cy="18" r="2.5" fill="#22c55e" />
    </g>
  ),
};

export function VisualAvatar({ 
  customization, 
  size = "md", 
  className,
  showLevel = false,
  level = 1
}: VisualAvatarProps) {
  const { width, height } = sizeConfig[size];
  const { 
    hairStyle, 
    hairColor, 
    eyeColor, 
    skinTone, 
    faceStyle, 
    accessory,
    shirtColor,
    pantsColor,
    shoesColor
  } = customization;

  const HairComponent = hairStyles[hairStyle] || hairStyles.short;
  const facePath = faceShapes[faceStyle] || faceShapes.round;

  return (
    <div className={cn("relative", className)}>
      <svg 
        width={width} 
        height={height} 
        viewBox="0 0 100 270"
        className="rounded-xl border-2 border-primary shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
        style={{ background: "linear-gradient(180deg, hsl(var(--secondary)) 0%, hsl(var(--card)) 100%)" }}
      >
        {/* Shoes */}
        {renderShoes(shoesColor)}
        
        {/* Pants */}
        {renderPants(pantsColor)}
        
        {/* Body */}
        {renderBody(shirtColor, skinTone)}
        
        {/* Face base */}
        <path d={facePath} fill={skinTone} />
        
        {/* Ears */}
        <ellipse cx="18" cy="52" rx="5" ry="8" fill={skinTone} />
        <ellipse cx="82" cy="52" rx="5" ry="8" fill={skinTone} />
        
        {/* Eyes */}
        {renderEyes(eyeColor, skinTone)}
        
        {/* Face features */}
        {renderFaceFeatures(skinTone)}
        
        {/* Hair */}
        {HairComponent(hairColor)}
        
        {/* Accessory */}
        {accessory && accessories[accessory]}
      </svg>
      
      {showLevel && (
        <div className="absolute -bottom-1 -right-1 bg-secondary rounded-full p-1 border border-border">
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-card rounded-full">
            <span className="text-xs font-bold text-gold">{level}</span>
          </div>
        </div>
      )}
    </div>
  );
}

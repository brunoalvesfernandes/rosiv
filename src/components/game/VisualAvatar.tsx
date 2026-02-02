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

// Hair style paths
const hairStyles: Record<string, (color: string) => JSX.Element> = {
  short: (color) => (
    <g>
      <ellipse cx="50" cy="18" rx="28" ry="14" fill={color} />
      <path d="M22 28 Q25 15, 50 10 Q75 15, 78 28" fill={color} />
    </g>
  ),
  long: (color) => (
    <g>
      <ellipse cx="50" cy="18" rx="30" ry="16" fill={color} />
      <path d="M20 28 Q23 14, 50 8 Q77 14, 80 28 L80 55 Q75 60, 70 55 L70 35 L30 35 L30 55 Q25 60, 20 55 Z" fill={color} />
    </g>
  ),
  spiky: (color) => (
    <g>
      <path d="M25 30 L18 5 L35 22 L40 -2 L48 20 L50 -5 L52 20 L60 -2 L65 22 L82 5 L75 30" fill={color} />
      <ellipse cx="50" cy="22" rx="26" ry="12" fill={color} />
    </g>
  ),
  curly: (color) => (
    <g>
      <circle cx="30" cy="18" r="10" fill={color} />
      <circle cx="45" cy="12" r="12" fill={color} />
      <circle cx="65" cy="12" r="12" fill={color} />
      <circle cx="75" cy="18" r="10" fill={color} />
      <circle cx="25" cy="32" r="8" fill={color} />
      <circle cx="80" cy="32" r="8" fill={color} />
      <ellipse cx="50" cy="22" rx="24" ry="12" fill={color} />
    </g>
  ),
  mohawk: (color) => (
    <g>
      <path d="M42 30 L38 0 L46 12 L50 -5 L54 12 L62 0 L58 30" fill={color} />
      <path d="M30 28 Q35 24, 50 22 Q65 24, 70 28" fill={color} />
    </g>
  ),
  ponytail: (color) => (
    <g>
      <ellipse cx="50" cy="18" rx="28" ry="14" fill={color} />
      <path d="M22 28 Q25 15, 50 10 Q75 15, 78 28" fill={color} />
      <ellipse cx="78" cy="40" rx="6" ry="20" fill={color} />
    </g>
  ),
  bald: () => <g></g>,
};

// Face shape paths  
const faceShapes: Record<string, string> = {
  round: "M50 15 C75 15, 85 40, 82 60 C78 80, 65 90, 50 90 C35 90, 22 80, 18 60 C15 40, 25 15, 50 15",
  oval: "M50 12 C72 12, 82 38, 80 58 C76 82, 65 95, 50 95 C35 95, 24 82, 20 58 C18 38, 28 12, 50 12",
  square: "M25 18 L75 18 C80 18, 82 22, 82 28 L82 70 C82 85, 72 90, 50 90 C28 90, 18 85, 18 70 L18 28 C18 22, 20 18, 25 18",
  heart: "M50 12 C75 12, 85 38, 82 55 C78 78, 62 95, 50 95 C38 95, 22 78, 18 55 C15 38, 25 12, 50 12",
};

// Eye styles
const renderEyes = (eyeColor: string, skinTone: string) => (
  <g>
    {/* Left eye */}
    <ellipse cx="38" cy="48" rx="8" ry="6" fill="white" />
    <circle cx="40" cy="48" r="4" fill={eyeColor} />
    <circle cx="41" cy="47" r="1.5" fill="white" opacity="0.8" />
    
    {/* Right eye */}
    <ellipse cx="62" cy="48" rx="8" ry="6" fill="white" />
    <circle cx="60" cy="48" r="4" fill={eyeColor} />
    <circle cx="61" cy="47" r="1.5" fill="white" opacity="0.8" />
    
    {/* Eyebrows */}
    <path d="M30 40 Q38 36, 46 40" stroke="#3d3d3d" strokeWidth="2" fill="none" />
    <path d="M54 40 Q62 36, 70 40" stroke="#3d3d3d" strokeWidth="2" fill="none" />
  </g>
);

// Mouth and nose
const renderFaceFeatures = () => (
  <g>
    {/* Nose */}
    <path d="M48 55 Q50 62, 52 55" stroke="#c9a07a" strokeWidth="1.5" fill="none" />
    
    {/* Mouth */}
    <path d="M42 72 Q50 78, 58 72" stroke="#c97878" strokeWidth="2" fill="none" />
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
        {renderFaceFeatures()}
        
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

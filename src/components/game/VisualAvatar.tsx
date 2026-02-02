import { cn } from "@/lib/utils";

export interface AvatarCustomization {
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  skinTone: string;
  faceStyle: string;
  accessory?: string | null;
}

interface VisualAvatarProps {
  customization: AvatarCustomization;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showLevel?: boolean;
  level?: number;
}

const sizeConfig = {
  sm: { width: 48, height: 48, scale: 0.4 },
  md: { width: 80, height: 80, scale: 0.67 },
  lg: { width: 128, height: 128, scale: 1.07 },
  xl: { width: 200, height: 200, scale: 1.67 },
};

// Hair style paths
const hairStyles: Record<string, (color: string) => JSX.Element> = {
  short: (color) => (
    <g>
      <ellipse cx="60" cy="35" rx="32" ry="20" fill={color} />
      <path d="M28 45 Q30 30, 60 25 Q90 30, 92 45" fill={color} />
    </g>
  ),
  long: (color) => (
    <g>
      <ellipse cx="60" cy="35" rx="35" ry="22" fill={color} />
      <path d="M25 45 Q28 30, 60 22 Q92 30, 95 45 L95 85 Q90 95, 80 90 L80 55 L40 55 L40 90 Q30 95, 25 85 Z" fill={color} />
    </g>
  ),
  spiky: (color) => (
    <g>
      <path d="M30 50 L25 20 L40 40 L45 10 L55 38 L60 5 L65 38 L75 10 L80 40 L95 20 L90 50" fill={color} />
      <ellipse cx="60" cy="42" rx="30" ry="15" fill={color} />
    </g>
  ),
  curly: (color) => (
    <g>
      <circle cx="35" cy="35" r="12" fill={color} />
      <circle cx="50" cy="28" r="14" fill={color} />
      <circle cx="70" cy="28" r="14" fill={color} />
      <circle cx="85" cy="35" r="12" fill={color} />
      <circle cx="30" cy="50" r="10" fill={color} />
      <circle cx="90" cy="50" r="10" fill={color} />
      <ellipse cx="60" cy="40" rx="28" ry="15" fill={color} />
    </g>
  ),
  mohawk: (color) => (
    <g>
      <path d="M50 50 L45 5 L55 20 L60 0 L65 20 L75 5 L70 50" fill={color} />
      <path d="M35 48 Q40 42, 60 40 Q80 42, 85 48" fill={color} />
    </g>
  ),
  ponytail: (color) => (
    <g>
      <ellipse cx="60" cy="35" rx="32" ry="20" fill={color} />
      <path d="M28 45 Q30 30, 60 25 Q90 30, 92 45" fill={color} />
      <ellipse cx="90" cy="60" rx="8" ry="25" fill={color} />
    </g>
  ),
  bald: () => <g></g>,
};

// Face shape paths
const faceShapes: Record<string, string> = {
  round: "M60 30 C90 30, 100 60, 95 85 C90 105, 75 115, 60 115 C45 115, 30 105, 25 85 C20 60, 30 30, 60 30",
  oval: "M60 25 C85 25, 95 55, 92 80 C88 105, 75 120, 60 120 C45 120, 32 105, 28 80 C25 55, 35 25, 60 25",
  square: "M30 35 L90 35 C95 35, 95 40, 95 45 L95 95 C95 110, 85 115, 60 115 C35 115, 25 110, 25 95 L25 45 C25 40, 25 35, 30 35",
  heart: "M60 25 C90 25, 100 55, 95 75 C90 100, 70 120, 60 120 C50 120, 30 100, 25 75 C20 55, 30 25, 60 25",
};

// Eye styles
const renderEyes = (eyeColor: string) => (
  <g>
    {/* Left eye */}
    <ellipse cx="45" cy="65" rx="10" ry="7" fill="white" />
    <circle cx="47" cy="65" r="5" fill={eyeColor} />
    <circle cx="48" cy="64" r="2" fill="white" opacity="0.8" />
    
    {/* Right eye */}
    <ellipse cx="75" cy="65" rx="10" ry="7" fill="white" />
    <circle cx="73" cy="65" r="5" fill={eyeColor} />
    <circle cx="74" cy="64" r="2" fill="white" opacity="0.8" />
    
    {/* Eyebrows */}
    <path d="M35 55 Q45 50, 55 55" stroke="#3d3d3d" strokeWidth="2" fill="none" />
    <path d="M65 55 Q75 50, 85 55" stroke="#3d3d3d" strokeWidth="2" fill="none" />
  </g>
);

// Mouth and nose
const renderFaceFeatures = () => (
  <g>
    {/* Nose */}
    <path d="M58 70 Q60 78, 62 70" stroke="#c9a07a" strokeWidth="2" fill="none" />
    
    {/* Mouth */}
    <path d="M50 90 Q60 98, 70 90" stroke="#c97878" strokeWidth="2.5" fill="none" />
  </g>
);

// Accessories
const accessories: Record<string, JSX.Element> = {
  glasses: (
    <g>
      <circle cx="45" cy="65" r="14" fill="none" stroke="#333" strokeWidth="2" />
      <circle cx="75" cy="65" r="14" fill="none" stroke="#333" strokeWidth="2" />
      <path d="M59 65 L61 65" stroke="#333" strokeWidth="2" />
      <path d="M31 65 L25 60" stroke="#333" strokeWidth="2" />
      <path d="M89 65 L95 60" stroke="#333" strokeWidth="2" />
    </g>
  ),
  earring: (
    <g>
      <circle cx="22" cy="75" r="4" fill="#ffd700" />
      <circle cx="98" cy="75" r="4" fill="#ffd700" />
    </g>
  ),
  scar: (
    <path d="M75 50 L85 70" stroke="#a86b5c" strokeWidth="2" opacity="0.7" />
  ),
  eyepatch: (
    <g>
      <ellipse cx="75" cy="65" rx="12" ry="9" fill="#222" />
      <path d="M25 55 L87 55" stroke="#222" strokeWidth="2" />
    </g>
  ),
  headband: (
    <rect x="25" y="42" width="70" height="8" rx="2" fill="#dc2626" />
  ),
  crown: (
    <g>
      <path d="M30 38 L35 25 L45 35 L55 18 L65 35 L75 25 L90 38 L85 45 L35 45 Z" fill="#ffd700" />
      <circle cx="45" cy="35" r="3" fill="#dc2626" />
      <circle cx="60" cy="28" r="4" fill="#3b82f6" />
      <circle cx="75" cy="35" r="3" fill="#22c55e" />
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
  const { width, height, scale } = sizeConfig[size];
  const { hairStyle, hairColor, eyeColor, skinTone, faceStyle, accessory } = customization;

  const HairComponent = hairStyles[hairStyle] || hairStyles.short;
  const facePath = faceShapes[faceStyle] || faceShapes.round;

  return (
    <div className={cn("relative", className)}>
      <svg 
        width={width} 
        height={height} 
        viewBox="0 0 120 120"
        className="rounded-full border-2 border-primary shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
        style={{ background: "linear-gradient(135deg, hsl(var(--secondary)) 0%, hsl(var(--card)) 100%)" }}
      >
        <g transform={`scale(${scale * 0.9}) translate(${(1/scale) * 6}, ${(1/scale) * 2})`}>
          {/* Face base */}
          <path d={facePath} fill={skinTone} />
          
          {/* Ears */}
          <ellipse cx="22" cy="70" rx="6" ry="10" fill={skinTone} />
          <ellipse cx="98" cy="70" rx="6" ry="10" fill={skinTone} />
          
          {/* Hair (back layer for some styles) */}
          {hairStyle === "long" && (
            <path d="M25 45 L25 90 Q30 100, 40 95 L40 55 L80 55 L80 95 Q90 100, 95 90 L95 45" fill={hairColor} opacity="0.3" />
          )}
          
          {/* Eyes */}
          {renderEyes(eyeColor)}
          
          {/* Face features */}
          {renderFaceFeatures()}
          
          {/* Hair (front layer) */}
          {HairComponent(hairColor)}
          
          {/* Accessory */}
          {accessory && accessories[accessory]}
        </g>
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

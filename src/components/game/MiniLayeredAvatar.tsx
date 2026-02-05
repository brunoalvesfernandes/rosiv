 import { cn } from "@/lib/utils";
 import { 
   AvatarCustomization, 
   getColorPalette,
   defaultCustomization,
   deserializeCustomization,
   LayerType
 } from "@/data/avatarLayers";
 
 interface MiniLayeredAvatarProps {
   customization?: AvatarCustomization | string | null;
   size?: "xs" | "sm" | "md" | "lg";
   className?: string;
   rank?: number; // 1, 2, 3 for special frames
   vipHairStyle?: string | null;
   vipShirtStyle?: string | null;
 }
 
 const sizeConfig = {
   xs: 28,
   sm: 36,
   md: 48,
   lg: 64,
 };
 
 const getRankFrame = (rank: number | undefined) => {
   if (!rank || rank > 3) return null;
   
   const colors = {
     1: { border: "#ffd700", glow: "0 0 12px #ffd700, 0 0 20px #ffd70066" },
     2: { border: "#c0c0c0", glow: "0 0 10px #c0c0c0, 0 0 16px #c0c0c066" },
     3: { border: "#cd7f32", glow: "0 0 8px #cd7f32, 0 0 14px #cd7f3266" },
   };
   
   return colors[rank as 1 | 2 | 3];
 };
 
 // Simplified pixel art for mini display
 const renderMiniLayer = (
   type: LayerType, 
   optionId: string, 
   color: string
 ) => {
   // Body
   if (type === "body") {
     return (
       <>
         <rect x="20" y="8" width="24" height="24" fill={color} />
         <rect x="26" y="32" width="12" height="4" fill={color} />
         <rect x="18" y="36" width="28" height="16" fill={color} />
         <rect x="10" y="36" width="8" height="14" fill={color} />
         <rect x="46" y="36" width="8" height="14" fill={color} />
       </>
     );
   }
   
   // Eyes - simplified
   if (type === "eyes") {
     const eyeVariants: Record<string, JSX.Element> = {
       "eyes-round": (
         <>
           <rect x="24" y="16" width="6" height="6" fill="white" />
           <rect x="34" y="16" width="6" height="6" fill="white" />
           <rect x="26" y="18" width="3" height="3" fill={color} />
           <rect x="36" y="18" width="3" height="3" fill={color} />
         </>
       ),
       "eyes-sharp": (
         <>
           <polygon points="24,16 30,16 30,22 24,19" fill="white" />
           <polygon points="34,16 40,16 40,19 34,22" fill="white" />
           <rect x="26" y="17" width="3" height="3" fill={color} />
           <rect x="35" y="17" width="3" height="3" fill={color} />
         </>
       ),
       "eyes-cute": (
         <>
           <circle cx="26" cy="18" r="5" fill="white" />
           <circle cx="38" cy="18" r="5" fill="white" />
           <circle cx="26" cy="18" r="3" fill={color} />
           <circle cx="38" cy="18" r="3" fill={color} />
           <circle cx="27" cy="17" r="1" fill="white" />
           <circle cx="39" cy="17" r="1" fill="white" />
         </>
       ),
     };
     return eyeVariants[optionId] || eyeVariants["eyes-round"];
   }
   
   // Hair - simplified
   if (type === "hair") {
     if (optionId === "hair-bald") return null;
     
     // VIP Hair styles
     if (optionId.startsWith("vip-") || optionId.includes("goku") || optionId.includes("ssj") || optionId.includes("sasuke")) {
       // Super Saiyajin - Golden spiky
       if (optionId.includes("goku") || optionId.includes("ssj") || optionId === "vip-goku-ssj") {
         return (
           <>
             <polygon points="10,14 18,-8 26,10" fill="#FFD700" />
             <polygon points="22,10 28,-12 34,8" fill="#FFE44D" />
             <polygon points="30,8 36,-14 42,8" fill="#FFD700" />
             <polygon points="38,10 44,-8 52,14" fill="#FFE44D" />
             <polygon points="18,8 24,-16 30,6" fill="#FFEB3B" />
             <polygon points="34,6 40,-14 46,8" fill="#FFEB3B" />
             <rect x="16" y="6" width="32" height="10" fill="#FFD700" />
             <polygon points="26,4 32,-18 38,4" fill="#FFF176" opacity="0.7" />
           </>
         );
       }
       // Sasuke Shippuden - Dark spiky
       if (optionId.includes("sasuke") || optionId.includes("shippuden") || optionId === "vip-sasuke") {
         return (
           <>
             <polygon points="8,16 14,-2 20,12" fill="#1a1a2e" />
             <polygon points="44,12 50,-2 56,16" fill="#1a1a2e" />
             <rect x="16" y="6" width="32" height="14" fill="#1a1a2e" />
             <polygon points="18,10 24,-8 30,8" fill="#2d2d44" />
             <polygon points="26,6 32,-12 38,6" fill="#1a1a2e" />
             <polygon points="34,8 40,-8 46,10" fill="#2d2d44" />
             <polygon points="12,12 18,2 20,24 14,30" fill="#1a1a2e" />
             <polygon points="52,12 46,2 44,24 50,30" fill="#1a1a2e" />
           </>
         );
       }
       // Akatsuki long hair
       if (optionId.includes("akatsuki")) {
         return (
           <>
             <rect x="12" y="4" width="40" height="10" fill="#1A1A1A" />
             <rect x="8" y="10" width="8" height="28" fill="#1A1A1A" />
             <rect x="48" y="10" width="8" height="28" fill="#1A1A1A" />
             <polygon points="18,10 24,24 22,10" fill="#2D2D2D" />
             <polygon points="26,8 30,26 28,8" fill="#1A1A1A" />
             <polygon points="38,8 42,26 40,8" fill="#1A1A1A" />
           </>
         );
       }
       // Default VIP spiky
       return (
         <>
           <polygon points="20,12 24,0 28,12" fill={color} />
           <polygon points="28,10 32,-4 36,10" fill={color} />
           <polygon points="36,12 40,0 44,12" fill={color} />
           <rect x="18" y="8" width="28" height="8" fill={color} />
         </>
       );
     }
 
     const hairVariants: Record<string, JSX.Element> = {
       "hair-short": (
         <>
           <rect x="18" y="6" width="28" height="8" fill={color} />
           <rect x="18" y="8" width="4" height="12" fill={color} />
           <rect x="42" y="8" width="4" height="12" fill={color} />
         </>
       ),
       "hair-spiky": (
         <>
           <polygon points="20,12 24,0 28,12" fill={color} />
           <polygon points="28,10 32,-2 36,10" fill={color} />
           <polygon points="36,12 40,0 44,12" fill={color} />
           <rect x="18" y="8" width="28" height="6" fill={color} />
         </>
       ),
       "hair-long": (
         <>
           <rect x="16" y="4" width="32" height="10" fill={color} />
           <rect x="14" y="8" width="6" height="30" fill={color} />
           <rect x="44" y="8" width="6" height="30" fill={color} />
         </>
       ),
       "hair-curly": (
         <>
           <circle cx="22" cy="10" r="6" fill={color} />
           <circle cx="32" cy="6" r="6" fill={color} />
           <circle cx="42" cy="10" r="6" fill={color} />
           <rect x="18" y="8" width="28" height="8" fill={color} />
         </>
       ),
       "hair-mohawk": (
         <>
           <rect x="28" y="0" width="8" height="14" fill={color} />
           <polygon points="28,0 32,-6 36,0" fill={color} />
         </>
       ),
       "hair-anime": (
         <>
           <polygon points="16,14 22,-4 28,10" fill={color} />
           <polygon points="26,10 32,-8 38,10" fill={color} />
           <polygon points="36,14 42,-4 48,14" fill={color} />
           <rect x="16" y="8" width="32" height="8" fill={color} />
         </>
       ),
     };
     return hairVariants[optionId] || hairVariants["hair-short"];
   }
   
   // Top - simplified
   if (type === "top") {
     const topVariants: Record<string, JSX.Element> = {
       "top-tshirt": (
         <>
           <rect x="18" y="36" width="28" height="16" fill={color} />
           <rect x="10" y="36" width="8" height="12" fill={color} />
           <rect x="46" y="36" width="8" height="12" fill={color} />
         </>
       ),
       "top-armor": (
         <>
           <rect x="16" y="34" width="32" height="18" fill={color} />
           <rect x="8" y="36" width="10" height="14" fill={color} />
           <rect x="46" y="36" width="10" height="14" fill={color} />
           <rect x="20" y="40" width="24" height="2" fill="#FFD700" />
         </>
       ),
       "top-robe": (
         <>
           <rect x="14" y="34" width="36" height="20" fill={color} />
           <rect x="8" y="36" width="8" height="16" fill={color} />
           <rect x="48" y="36" width="8" height="16" fill={color} />
         </>
       ),
     };
     return topVariants[optionId] || topVariants["top-tshirt"];
   }
   
   // Bottom
   if (type === "bottom") {
     return (
       <>
         <rect x="20" y="52" width="10" height="12" fill={color} />
         <rect x="34" y="52" width="10" height="12" fill={color} />
         <rect x="18" y="52" width="28" height="4" fill={color} />
       </>
     );
   }
   
   // Accessory - simplified
   if (type === "accessory") {
     if (optionId === "acc-none") return null;
     
     const accVariants: Record<string, JSX.Element> = {
       "acc-glasses": (
         <>
           <rect x="21" y="15" width="10" height="6" fill="none" stroke="#333" strokeWidth="1.5" />
           <rect x="33" y="15" width="10" height="6" fill="none" stroke="#333" strokeWidth="1.5" />
           <line x1="31" y1="18" x2="33" y2="18" stroke="#333" strokeWidth="1.5" />
         </>
       ),
       "acc-crown": (
         <>
           <rect x="20" y="4" width="24" height="6" fill="#ffd700" />
           <polygon points="20,4 24,0 28,4" fill="#ffd700" />
           <polygon points="28,4 32,-2 36,4" fill="#ffd700" />
           <polygon points="36,4 40,0 44,4" fill="#ffd700" />
         </>
       ),
       "acc-bandana": (
         <>
           <rect x="18" y="6" width="28" height="4" fill={color} />
           <polygon points="46,6 52,10 46,14" fill={color} />
         </>
       ),
       "acc-eyepatch": (
         <>
           <ellipse cx="37" cy="18" rx="5" ry="4" fill="#1A1A1A" />
           <line x1="32" y1="16" x2="18" y2="10" stroke="#1A1A1A" strokeWidth="1.5" />
         </>
       ),
     };
     return accVariants[optionId] || null;
   }
   
   return null;
 };
 
 export function MiniLayeredAvatar({ 
   customization,
   size = "sm",
   className,
   rank,
   vipHairStyle,
   vipShirtStyle
 }: MiniLayeredAvatarProps) {
   // Parse customization
   let config: AvatarCustomization = typeof customization === "string" 
     ? deserializeCustomization(customization)
     : customization || defaultCustomization;
   
   // Override with VIP styles if provided
   if (vipHairStyle) {
     config = {
       ...config,
       hair: { ...config.hair, optionId: vipHairStyle }
     };
   }
 
   const dimension = sizeConfig[size];
   const frameConfig = getRankFrame(rank);
   
   // Get color for each layer
   const getLayerColor = (type: LayerType): string => {
     const layerConfig = config[type];
     const palette = getColorPalette(type, layerConfig.paletteId);
     return palette?.colors[0] || "#888888";
   };
   
   // Layer order
   const layerOrder: LayerType[] = ["body", "bottom", "top", "eyes", "hair", "accessory"];
   
   return (
     <div 
       className={cn("relative rounded-full overflow-hidden", className)}
       style={{ 
         width: dimension, 
         height: dimension,
         boxShadow: frameConfig?.glow,
         border: frameConfig ? `2px solid ${frameConfig.border}` : undefined,
       }}
     >
       <svg 
         viewBox="0 0 64 64" 
         className="w-full h-full bg-gradient-to-br from-secondary to-card"
         style={{ imageRendering: "pixelated" }}
       >
         {layerOrder.map((type) => {
           const layerConfig = config[type];
           const color = getLayerColor(type);
           return (
             <g key={type}>
               {renderMiniLayer(type, layerConfig.optionId, color)}
             </g>
           );
         })}
       </svg>
       
       {/* Rank badge */}
       {rank && rank <= 3 && (
         <div 
           className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
           style={{ 
             background: frameConfig?.border,
             color: rank === 1 ? "#1a1a1a" : "#fff",
             boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
           }}
         >
           {rank}
         </div>
       )}
     </div>
   );
 }
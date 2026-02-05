 import { cn } from "@/lib/utils";
 import { 
   AvatarCustomization, 
   getLayerOption, 
   getColorPalette,
   defaultCustomization,
   deserializeCustomization,
   LayerType
 } from "@/data/avatarLayers";
 
 interface LayeredPixelAvatarProps {
   customization?: AvatarCustomization | string | null;
   size?: "sm" | "md" | "lg" | "xl";
   className?: string;
   showLevel?: boolean;
   level?: number;
 }
 
 const sizeConfig = {
   sm: 48,
   md: 80,
   lg: 128,
   xl: 180,
 };
 
 // Pixel art style shapes for each layer type and option
 const renderLayer = (
   type: LayerType, 
   optionId: string, 
   color: string, 
   size: number
 ) => {
   const scale = size / 180; // Base size is 180px
   
   // Body layer - the base character silhouette
   if (type === "body") {
     return (
       <svg viewBox="0 0 64 64" className="absolute inset-0 w-full h-full" style={{ imageRendering: "pixelated" }}>
         {/* Head */}
         <rect x="20" y="8" width="24" height="24" fill={color} />
         {/* Neck */}
         <rect x="26" y="32" width="12" height="4" fill={color} />
         {/* Torso */}
         <rect x="18" y="36" width="28" height="16" fill={color} />
         {/* Arms */}
         <rect x="10" y="36" width="8" height="14" fill={color} />
         <rect x="46" y="36" width="8" height="14" fill={color} />
         {/* Hands */}
         <rect x="10" y="50" width="8" height="4" fill={color} />
         <rect x="46" y="50" width="8" height="4" fill={color} />
       </svg>
     );
   }
   
   // Eyes layer
   if (type === "eyes") {
     const eyeShapes: Record<string, JSX.Element> = {
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
       "eyes-soft": (
         <>
           <ellipse cx="27" cy="18" rx="4" ry="3" fill="white" />
           <ellipse cx="37" cy="18" rx="4" ry="3" fill="white" />
           <circle cx="27" cy="18" r="2" fill={color} />
           <circle cx="37" cy="18" r="2" fill={color} />
         </>
       ),
       "eyes-fierce": (
         <>
           <polygon points="23,15 31,17 31,21 23,21" fill="white" />
           <polygon points="41,15 33,17 33,21 41,21" fill="white" />
           <rect x="26" y="17" width="4" height="3" fill={color} />
           <rect x="34" y="17" width="4" height="3" fill={color} />
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
       "eyes-tired": (
         <>
           <rect x="23" y="17" width="8" height="4" fill="white" />
           <rect x="33" y="17" width="8" height="4" fill="white" />
           <rect x="26" y="18" width="3" height="2" fill={color} />
           <rect x="36" y="18" width="3" height="2" fill={color} />
           <rect x="23" y="21" width="8" height="1" fill="#9E9E9E" opacity="0.5" />
           <rect x="33" y="21" width="8" height="1" fill="#9E9E9E" opacity="0.5" />
         </>
       ),
       "eyes-happy": (
         <>
           <path d="M23,19 Q27,15 31,19" stroke="black" strokeWidth="2" fill="none" />
           <path d="M33,19 Q37,15 41,19" stroke="black" strokeWidth="2" fill="none" />
         </>
       ),
       "eyes-angry": (
         <>
           <polygon points="23,14 31,17 31,21 23,21" fill="white" />
           <polygon points="41,14 33,17 33,21 41,21" fill="white" />
           <rect x="25" y="17" width="4" height="3" fill={color} />
           <rect x="35" y="17" width="4" height="3" fill={color} />
           <line x1="22" y1="13" x2="30" y2="15" stroke="#333" strokeWidth="2" />
           <line x1="42" y1="13" x2="34" y2="15" stroke="#333" strokeWidth="2" />
         </>
       ),
     };
     return (
       <svg viewBox="0 0 64 64" className="absolute inset-0 w-full h-full" style={{ imageRendering: "pixelated" }}>
         {eyeShapes[optionId] || eyeShapes["eyes-round"]}
       </svg>
     );
   }
   
   // Hair layer
   if (type === "hair") {
     if (optionId === "hair-bald") return null;
     
     const hairShapes: Record<string, JSX.Element> = {
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
           <rect x="16" y="10" width="4" height="14" fill={color} />
           <rect x="44" y="10" width="4" height="14" fill={color} />
         </>
       ),
       "hair-long": (
         <>
           <rect x="16" y="4" width="32" height="10" fill={color} />
           <rect x="14" y="8" width="6" height="30" fill={color} />
           <rect x="44" y="8" width="6" height="30" fill={color} />
           <rect x="16" y="34" width="6" height="8" fill={color} />
           <rect x="42" y="34" width="6" height="8" fill={color} />
         </>
       ),
       "hair-ponytail": (
         <>
           <rect x="18" y="4" width="28" height="8" fill={color} />
           <rect x="16" y="8" width="4" height="14" fill={color} />
           <rect x="44" y="8" width="4" height="14" fill={color} />
           <rect x="44" y="6" width="8" height="4" fill={color} />
           <rect x="50" y="8" width="6" height="24" fill={color} />
           <rect x="48" y="30" width="4" height="8" fill={color} />
         </>
       ),
       "hair-mohawk": (
         <>
           <rect x="28" y="0" width="8" height="14" fill={color} />
           <polygon points="28,0 32,-6 36,0" fill={color} />
           <rect x="20" y="10" width="8" height="4" fill={color} />
           <rect x="36" y="10" width="8" height="4" fill={color} />
         </>
       ),
       "hair-curly": (
         <>
           <circle cx="22" cy="10" r="6" fill={color} />
           <circle cx="32" cy="6" r="6" fill={color} />
           <circle cx="42" cy="10" r="6" fill={color} />
           <circle cx="18" cy="18" r="5" fill={color} />
           <circle cx="46" cy="18" r="5" fill={color} />
           <rect x="18" y="8" width="28" height="8" fill={color} />
         </>
       ),
       "hair-samurai": (
         <>
           <rect x="18" y="4" width="28" height="6" fill={color} />
           <rect x="26" y="0" width="12" height="8" fill={color} />
           <rect x="30" y="-2" width="4" height="8" fill={color} />
           <rect x="16" y="8" width="4" height="10" fill={color} />
           <rect x="44" y="8" width="4" height="10" fill={color} />
         </>
       ),
       "hair-wizard": (
         <>
           <rect x="14" y="4" width="36" height="10" fill={color} />
           <rect x="12" y="10" width="6" height="34" fill={color} />
           <rect x="46" y="10" width="6" height="34" fill={color} />
           <rect x="14" y="40" width="8" height="10" fill={color} />
           <rect x="42" y="40" width="8" height="10" fill={color} />
         </>
       ),
       "hair-anime": (
         <>
           <polygon points="16,14 22,-4 28,10" fill={color} />
           <polygon points="26,10 32,-8 38,10" fill={color} />
           <polygon points="36,14 42,-4 48,14" fill={color} />
           <rect x="16" y="8" width="32" height="8" fill={color} />
           <polygon points="12,24 18,8 20,24" fill={color} />
           <polygon points="52,24 46,8 44,24" fill={color} />
         </>
       ),
     };
     return (
       <svg viewBox="0 0 64 64" className="absolute inset-0 w-full h-full" style={{ imageRendering: "pixelated" }}>
         {hairShapes[optionId] || hairShapes["hair-short"]}
       </svg>
     );
   }
   
   // Top/Shirt layer
   if (type === "top") {
     const topShapes: Record<string, JSX.Element> = {
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
           <rect x="24" y="36" width="16" height="4" fill={`${color}99`} />
           <rect x="20" y="40" width="24" height="2" fill="#FFD700" />
         </>
       ),
       "top-robe": (
         <>
           <rect x="14" y="34" width="36" height="20" fill={color} />
           <rect x="8" y="36" width="8" height="16" fill={color} />
           <rect x="48" y="36" width="8" height="16" fill={color} />
           <polygon points="28,36 32,44 36,36" fill={`${color}CC`} />
         </>
       ),
       "top-jacket": (
         <>
           <rect x="16" y="34" width="32" height="18" fill={color} />
           <rect x="8" y="36" width="10" height="14" fill={color} />
           <rect x="46" y="36" width="10" height="14" fill={color} />
           <rect x="30" y="36" width="4" height="16" fill="#444" />
           <circle cx="28" cy="42" r="1.5" fill="#FFD700" />
           <circle cx="28" cy="48" r="1.5" fill="#FFD700" />
         </>
       ),
       "top-vest": (
         <>
           <rect x="18" y="36" width="28" height="16" fill={color} />
           <rect x="22" y="36" width="8" height="14" fill={`${color}88`} />
           <rect x="34" y="36" width="8" height="14" fill={`${color}88`} />
         </>
       ),
       "top-hoodie": (
         <>
           <rect x="16" y="34" width="32" height="18" fill={color} />
           <rect x="8" y="36" width="10" height="14" fill={color} />
           <rect x="46" y="36" width="10" height="14" fill={color} />
           <ellipse cx="32" cy="32" rx="10" ry="6" fill={color} />
           <rect x="26" y="42" width="12" height="8" fill={`${color}CC`} />
         </>
       ),
       "top-knight": (
         <>
           <rect x="14" y="34" width="36" height="18" fill={color} />
           <rect x="6" y="36" width="10" height="14" fill={color} />
           <rect x="48" y="36" width="10" height="14" fill={color} />
           <rect x="8" y="38" width="6" height="4" fill="#C0C0C0" />
           <rect x="50" y="38" width="6" height="4" fill="#C0C0C0" />
           <polygon points="32,36 28,48 36,48" fill="#C0C0C0" />
         </>
       ),
       "top-ninja": (
         <>
           <rect x="18" y="36" width="28" height="16" fill={color} />
           <rect x="10" y="36" width="8" height="12" fill={color} />
           <rect x="46" y="36" width="8" height="12" fill={color} />
           <rect x="26" y="38" width="12" height="8" fill="#333" />
           <line x1="20" y1="40" x2="44" y2="48" stroke="#8B0000" strokeWidth="2" />
         </>
       ),
       "top-royal": (
         <>
           <rect x="14" y="34" width="36" height="20" fill={color} />
           <rect x="8" y="36" width="8" height="16" fill={color} />
           <rect x="48" y="36" width="8" height="16" fill={color} />
           <rect x="14" y="34" width="36" height="3" fill="#FFD700" />
           <rect x="28" y="38" width="8" height="12" fill="#FFD700" opacity="0.6" />
         </>
       ),
       "top-pirate": (
         <>
           <rect x="16" y="34" width="32" height="18" fill={color} />
           <rect x="8" y="36" width="10" height="14" fill={color} />
           <rect x="46" y="36" width="10" height="14" fill={color} />
           <polygon points="24,36 32,34 40,36 40,40 24,40" fill="white" />
           <line x1="18" y1="44" x2="46" y2="44" stroke="#FFD700" strokeWidth="2" />
         </>
       ),
     };
     return (
       <svg viewBox="0 0 64 64" className="absolute inset-0 w-full h-full" style={{ imageRendering: "pixelated" }}>
         {topShapes[optionId] || topShapes["top-tshirt"]}
       </svg>
     );
   }
   
   // Bottom/Pants layer
   if (type === "bottom") {
     const bottomShapes: Record<string, JSX.Element> = {
       "bottom-pants": (
         <>
           <rect x="20" y="52" width="10" height="12" fill={color} />
           <rect x="34" y="52" width="10" height="12" fill={color} />
           <rect x="18" y="52" width="28" height="4" fill={color} />
         </>
       ),
       "bottom-shorts": (
         <>
           <rect x="18" y="52" width="28" height="6" fill={color} />
           <rect x="20" y="56" width="10" height="4" fill={color} />
           <rect x="34" y="56" width="10" height="4" fill={color} />
         </>
       ),
       "bottom-armor": (
         <>
           <rect x="18" y="52" width="28" height="4" fill={color} />
           <rect x="18" y="52" width="12" height="12" fill={color} />
           <rect x="34" y="52" width="12" height="12" fill={color} />
           <rect x="20" y="56" width="8" height="2" fill="#C0C0C0" />
           <rect x="36" y="56" width="8" height="2" fill="#C0C0C0" />
         </>
       ),
       "bottom-robe": (
         <>
           <rect x="16" y="52" width="32" height="12" fill={color} />
           <polygon points="16,64 24,52 24,64" fill={`${color}CC`} />
           <polygon points="48,64 40,52 40,64" fill={`${color}CC`} />
         </>
       ),
       "bottom-skirt": (
         <>
           <rect x="16" y="52" width="32" height="4" fill={color} />
           <polygon points="16,56 32,56 48,56 52,64 12,64" fill={color} />
         </>
       ),
       "bottom-baggy": (
         <>
           <rect x="16" y="52" width="32" height="4" fill={color} />
           <rect x="16" y="54" width="14" height="10" fill={color} />
           <rect x="34" y="54" width="14" height="10" fill={color} />
         </>
       ),
       "bottom-knight": (
         <>
           <rect x="18" y="52" width="28" height="4" fill={color} />
           <rect x="18" y="52" width="12" height="12" fill={color} />
           <rect x="34" y="52" width="12" height="12" fill={color} />
           <rect x="20" y="58" width="8" height="4" fill="#C0C0C0" />
           <rect x="36" y="58" width="8" height="4" fill="#C0C0C0" />
         </>
       ),
       "bottom-ninja": (
         <>
           <rect x="18" y="52" width="28" height="4" fill={color} />
           <rect x="20" y="52" width="10" height="12" fill={color} />
           <rect x="34" y="52" width="10" height="12" fill={color} />
           <rect x="22" y="60" width="6" height="2" fill="#333" />
           <rect x="36" y="60" width="6" height="2" fill="#333" />
         </>
       ),
     };
     return (
       <svg viewBox="0 0 64 64" className="absolute inset-0 w-full h-full" style={{ imageRendering: "pixelated" }}>
         {bottomShapes[optionId] || bottomShapes["bottom-pants"]}
       </svg>
     );
   }
   
   // Accessory layer
   if (type === "accessory") {
     if (optionId === "acc-none") return null;
     
     const accShapes: Record<string, JSX.Element> = {
       "acc-glasses": (
         <>
           <rect x="21" y="15" width="10" height="6" fill="none" stroke={color} strokeWidth="1.5" />
           <rect x="33" y="15" width="10" height="6" fill="none" stroke={color} strokeWidth="1.5" />
           <line x1="31" y1="18" x2="33" y2="18" stroke={color} strokeWidth="1.5" />
         </>
       ),
       "acc-earring": (
         <>
           <circle cx="18" cy="22" r="2" fill={color} />
           <circle cx="46" cy="22" r="2" fill={color} />
         </>
       ),
       "acc-scar": (
         <>
           <line x1="38" y1="14" x2="42" y2="24" stroke="#8D6E63" strokeWidth="2" />
           <line x1="36" y1="16" x2="40" y2="22" stroke="#A1887F" strokeWidth="1" />
         </>
       ),
       "acc-bandana": (
         <>
           <rect x="18" y="6" width="28" height="4" fill={color} />
           <polygon points="46,6 52,10 46,14" fill={color} />
           <polygon points="48,8 56,14 48,18" fill={color} />
         </>
       ),
       "acc-eyepatch": (
         <>
           <ellipse cx="37" cy="18" rx="5" ry="4" fill="#1A1A1A" />
           <line x1="32" y1="16" x2="18" y2="10" stroke="#1A1A1A" strokeWidth="1.5" />
           <line x1="42" y1="16" x2="46" y2="10" stroke="#1A1A1A" strokeWidth="1.5" />
         </>
       ),
       "acc-crown": (
         <>
           <rect x="20" y="4" width="24" height="6" fill={color} />
           <polygon points="20,4 24,0 28,4" fill={color} />
           <polygon points="28,4 32,-2 36,4" fill={color} />
           <polygon points="36,4 40,0 44,4" fill={color} />
           <circle cx="24" cy="6" r="2" fill="#E91E63" />
           <circle cx="32" cy="5" r="2" fill="#2196F3" />
           <circle cx="40" cy="6" r="2" fill="#4CAF50" />
         </>
       ),
       "acc-headband": (
         <>
           <rect x="18" y="8" width="28" height="3" fill={color} />
           <rect x="30" y="6" width="4" height="6" fill={color} />
         </>
       ),
       "acc-mask": (
         <>
           <rect x="20" y="22" width="24" height="10" fill={color} rx="2" />
           <line x1="28" y1="26" x2="28" y2="30" stroke="#333" strokeWidth="1" />
           <line x1="32" y1="25" x2="32" y2="31" stroke="#333" strokeWidth="1" />
           <line x1="36" y1="26" x2="36" y2="30" stroke="#333" strokeWidth="1" />
         </>
       ),
       "acc-horns": (
         <>
           <polygon points="18,12 14,0 22,8" fill="#8D6E63" />
           <polygon points="46,12 50,0 42,8" fill="#8D6E63" />
           <polygon points="16,10 14,2 20,8" fill="#A1887F" />
           <polygon points="48,10 50,2 44,8" fill="#A1887F" />
         </>
       ),
     };
     return (
       <svg viewBox="0 0 64 64" className="absolute inset-0 w-full h-full" style={{ imageRendering: "pixelated" }}>
         {accShapes[optionId] || null}
       </svg>
     );
   }
   
   return null;
 };
 
 export function LayeredPixelAvatar({ 
   customization,
   size = "md",
   className,
   showLevel = false,
   level = 1
 }: LayeredPixelAvatarProps) {
   // Parse customization if it's a string
   const config: AvatarCustomization = typeof customization === "string" 
     ? deserializeCustomization(customization)
     : customization || defaultCustomization;
   
   const pixelSize = sizeConfig[size];
   
   // Get colors for each layer
   const getLayerColor = (type: LayerType): string => {
     const layerConfig = config[type];
     const palette = getColorPalette(type, layerConfig.paletteId);
     return palette?.colors[0] || "#888888";
   };
   
   // Order of layers (bottom to top)
   const layerOrder: LayerType[] = ["body", "bottom", "top", "eyes", "hair", "accessory"];
   
   return (
     <div className={cn("relative", className)}>
       <div 
         style={{ width: pixelSize, height: pixelSize }}
         className="relative rounded-xl overflow-hidden border-2 border-primary shadow-[0_0_20px_hsl(var(--primary)/0.4)] bg-gradient-to-br from-secondary to-card"
       >
         {layerOrder.map((type) => {
           const layerConfig = config[type];
           const color = getLayerColor(type);
           return (
             <div key={type} className="absolute inset-0">
               {renderLayer(type, layerConfig.optionId, color, pixelSize)}
             </div>
           );
         })}
       </div>
       
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
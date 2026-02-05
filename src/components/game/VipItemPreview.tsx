 import { cn } from "@/lib/utils";
 
 interface VipItemPreviewProps {
   type: "shirt" | "pants" | "hair" | "accessory";
   itemId: string;
   itemName: string;
   rarity: string;
   size?: "sm" | "md" | "lg";
   imageUrl?: string | null;
 }
 
 const sizeConfig = {
   sm: 48,
   md: 80,
   lg: 120,
 };
 
 const rarityGradients: Record<string, string> = {
   vip: "from-primary/30 to-primary/10",
   legendary: "from-amber-500/30 to-amber-500/10",
   mythic: "from-fuchsia-500/30 to-fuchsia-500/10",
 };
 
 // VIP Hair previews
 const renderVipHair = (itemId: string, itemName: string, imageUrl?: string | null): JSX.Element => {
   const nameLower = itemName.toLowerCase();
   const urlLower = (imageUrl || "").toLowerCase();
   
   // Super Saiyajin
   if (nameLower.includes("goku") || nameLower.includes("saiyajin") || nameLower.includes("ssj") || urlLower.includes("goku") || urlLower.includes("ssj")) {
     return (
       <>
         <polygon points="10,28 18,-4 26,22" fill="#FFD700" />
         <polygon points="22,22 28,-8 34,18" fill="#FFE44D" />
         <polygon points="30,18 36,-10 42,18" fill="#FFD700" />
         <polygon points="38,22 44,-4 52,28" fill="#FFE44D" />
         <polygon points="18,16 24,-14 30,14" fill="#FFEB3B" />
         <polygon points="34,14 40,-12 46,16" fill="#FFEB3B" />
         <polygon points="26,12 32,-20 38,12" fill="#FFF176" />
         <rect x="14" y="18" width="6" height="18" fill="#FFD700" />
         <rect x="44" y="18" width="6" height="18" fill="#FFD700" />
         <polygon points="28,10 32,-22 36,10" fill="#FFF9C4" opacity="0.7" />
       </>
     );
   }
   // Sasuke Shippuden
   if (nameLower.includes("sasuke") || nameLower.includes("shippuden") || urlLower.includes("sasuke")) {
     return (
       <>
         {/* Back spikes */}
         <polygon points="8,24 14,2 20,20" fill="#1a1a2e" />
         <polygon points="44,20 50,2 56,24" fill="#1a1a2e" />
         {/* Main hair */}
         <rect x="16" y="12" width="32" height="20" fill="#1a1a2e" />
         {/* Top spikes */}
         <polygon points="18,16 24,-6 30,14" fill="#2d2d44" />
         <polygon points="26,12 32,-10 38,12" fill="#1a1a2e" />
         <polygon points="34,14 40,-6 46,16" fill="#2d2d44" />
         {/* Side bangs */}
         <polygon points="12,18 18,8 20,30 14,38" fill="#1a1a2e" />
         <polygon points="52,18 46,8 44,30 50,38" fill="#1a1a2e" />
         {/* Highlights */}
         <polygon points="28,8 32,-8 36,8" fill="#3d3d5c" opacity="0.5" />
       </>
     );
   }
   // Akatsuki long hair
   if (nameLower.includes("akatsuki") || urlLower.includes("akatsuki")) {
     return (
       <>
         <rect x="12" y="10" width="40" height="12" fill="#1A1A1A" />
         <rect x="8" y="18" width="8" height="36" fill="#1A1A1A" />
         <rect x="48" y="18" width="8" height="36" fill="#1A1A1A" />
         <polygon points="8,54 16,40 16,58 6,58" fill="#1A1A1A" />
         <polygon points="56,54 48,40 48,58 58,58" fill="#1A1A1A" />
         <polygon points="18,18 24,34 22,18" fill="#2D2D2D" />
         <polygon points="26,16 30,36 28,16" fill="#1A1A1A" />
         <polygon points="34,16 38,36 36,16" fill="#2D2D2D" />
         <polygon points="40,18 46,34 42,18" fill="#1A1A1A" />
         <rect x="10" y="42" width="4" height="3" fill="#8B0000" />
         <rect x="50" y="42" width="4" height="3" fill="#8B0000" />
       </>
     );
   }
   // Default spiky hair
   return (
     <>
       <polygon points="20,20 24,0 28,20" fill="#6366F1" />
       <polygon points="28,18 32,-4 36,18" fill="#818CF8" />
       <polygon points="36,20 40,0 44,20" fill="#6366F1" />
       <rect x="18" y="16" width="28" height="8" fill="#6366F1" />
     </>
   );
 };
 
 // VIP Shirt previews
 const renderVipShirt = (itemId: string): JSX.Element => {
   // Naruto
   if (itemId.includes("a1e61025")) {
     return (
       <>
         <rect x="14" y="20" width="36" height="28" fill="#FF6B00" />
         <rect x="8" y="22" width="8" height="24" fill="#FF6B00" />
         <rect x="48" y="22" width="8" height="24" fill="#FF6B00" />
         <rect x="24" y="20" width="16" height="6" fill="#1A1A1A" />
         <circle cx="32" cy="36" r="8" fill="#FFFFFF" />
         <circle cx="32" cy="36" r="5" fill="#FF6B00" />
         <path d="M32,30 Q38,36 32,42" stroke="#8B0000" strokeWidth="2" fill="none" />
       </>
     );
   }
   // One Piece
   if (itemId.includes("045632dc")) {
     return (
       <>
         <rect x="14" y="20" width="36" height="28" fill="#DC143C" />
         <rect x="8" y="22" width="10" height="24" fill="#DC143C" />
         <rect x="46" y="22" width="10" height="24" fill="#DC143C" />
         <rect x="28" y="22" width="8" height="24" fill="#FFDCB5" />
         <circle cx="24" cy="30" r="2" fill="#FFD700" />
         <circle cx="24" cy="40" r="2" fill="#FFD700" />
         <circle cx="40" cy="30" r="2" fill="#FFD700" />
         <circle cx="40" cy="40" r="2" fill="#FFD700" />
       </>
     );
   }
   // Dragon Ball
   if (itemId.includes("a75981ed")) {
     return (
       <>
         <rect x="14" y="20" width="36" height="28" fill="#FF7F00" />
         <rect x="8" y="22" width="8" height="24" fill="#FF7F00" />
         <rect x="48" y="22" width="8" height="24" fill="#FF7F00" />
         <rect x="24" y="20" width="16" height="8" fill="#1E90FF" />
         <rect x="26" y="32" width="12" height="12" fill="#1E90FF" />
         <text x="32" y="42" fontSize="8" fill="#FFF" textAnchor="middle" fontWeight="bold">亀</text>
       </>
     );
   }
   // Default
   return (
     <>
       <rect x="14" y="20" width="36" height="28" fill="#6366F1" />
       <rect x="8" y="22" width="8" height="24" fill="#6366F1" />
       <rect x="48" y="22" width="8" height="24" fill="#6366F1" />
     </>
   );
 };
 
 // VIP Pants previews
 const renderVipPants = (itemId: string): JSX.Element => {
   // Ninja pants
   if (itemId.includes("3228c79e")) {
     return (
       <>
         <rect x="18" y="20" width="28" height="6" fill="#1A1A1A" />
         <rect x="18" y="20" width="12" height="28" fill="#1A1A1A" />
         <rect x="34" y="20" width="12" height="28" fill="#1A1A1A" />
         <rect x="20" y="34" width="8" height="3" fill="#E0E0E0" />
         <rect x="36" y="34" width="8" height="3" fill="#E0E0E0" />
         <rect x="22" y="42" width="4" height="3" fill="#E0E0E0" />
         <rect x="38" y="42" width="4" height="3" fill="#E0E0E0" />
       </>
     );
   }
   // Royal pants
   if (itemId.includes("44f94a52")) {
     return (
       <>
         <rect x="18" y="20" width="28" height="6" fill="#FFD700" />
         <rect x="18" y="20" width="12" height="28" fill="#FFD700" />
         <rect x="34" y="20" width="12" height="28" fill="#FFD700" />
         <rect x="18" y="20" width="12" height="3" fill="#FFA500" />
         <rect x="34" y="20" width="12" height="3" fill="#FFA500" />
         <circle cx="24" cy="34" r="3" fill="#E91E63" />
         <circle cx="40" cy="34" r="3" fill="#E91E63" />
       </>
     );
   }
   // Default
   return (
     <>
       <rect x="18" y="20" width="28" height="6" fill="#6366F1" />
       <rect x="18" y="20" width="12" height="28" fill="#6366F1" />
       <rect x="34" y="20" width="12" height="28" fill="#6366F1" />
     </>
   );
 };
 
 // VIP Accessory previews
 const renderVipAccessory = (itemId: string): JSX.Element => {
   // Akatsuki cape
   if (itemId.includes("da7fa987")) {
     return (
       <>
         {/* Cape flowing */}
         <rect x="8" y="16" width="48" height="40" fill="#1A1A1A" rx="4" />
         {/* Red cloud patterns */}
         <ellipse cx="20" cy="28" rx="6" ry="4" fill="#8B0000" />
         <ellipse cx="44" cy="28" rx="6" ry="4" fill="#8B0000" />
         <ellipse cx="32" cy="40" rx="8" ry="5" fill="#8B0000" />
         {/* White outlines */}
         <ellipse cx="20" cy="28" rx="6" ry="4" fill="none" stroke="white" strokeWidth="1" />
         <ellipse cx="44" cy="28" rx="6" ry="4" fill="none" stroke="white" strokeWidth="1" />
         <ellipse cx="32" cy="40" rx="8" ry="5" fill="none" stroke="white" strokeWidth="1" />
         {/* Collar */}
         <rect x="22" y="12" width="20" height="8" fill="#1A1A1A" />
       </>
     );
   }
   // Default accessory
   return (
     <>
       <circle cx="32" cy="32" r="16" fill="#FFD700" />
       <circle cx="32" cy="32" r="10" fill="#FFA500" />
       <text x="32" y="37" fontSize="12" fill="#FFF" textAnchor="middle" fontWeight="bold">★</text>
     </>
   );
 };
 
 export function VipItemPreview({ type, itemId, itemName, rarity, size = "md", imageUrl }: VipItemPreviewProps) {
   const pixelSize = sizeConfig[size];
   
   const renderContent = () => {
     switch (type) {
       case "hair":
         return renderVipHair(itemId, itemName, imageUrl);
       case "shirt":
         return renderVipShirt(itemId);
       case "pants":
         return renderVipPants(itemId);
       case "accessory":
         return renderVipAccessory(itemId);
       default:
         return null;
     }
   };
 
   return (
     <div 
       className={cn(
         "relative rounded-lg overflow-hidden bg-gradient-to-br",
         rarityGradients[rarity] || rarityGradients.vip
       )}
       style={{ width: pixelSize, height: pixelSize }}
       title={itemName}
     >
       <svg 
         viewBox="0 0 64 64" 
         className="absolute inset-0 w-full h-full" 
         style={{ imageRendering: "pixelated" }}
       >
         {renderContent()}
       </svg>
     </div>
   );
 }
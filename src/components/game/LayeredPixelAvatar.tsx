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
  variant?: "default" | "minimal";
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
     
      // VIP Hair styles (special anime-inspired designs)
      if (optionId.startsWith("vip-")) {
        const vipHairShapes: Record<string, JSX.Element> = {
          // Super Saiyajin - Golden flaming spiky hair
          "vip-ssj": (
            <>
              {/* Base spikes */}
              <polygon points="10,20 18,-12 26,14" fill="#FFD700" />
              <polygon points="22,14 28,-16 34,10" fill="#FFE44D" />
              <polygon points="30,10 36,-18 42,10" fill="#FFD700" />
              <polygon points="38,14 44,-12 52,20" fill="#FFE44D" />
              {/* Extra height spikes */}
              <polygon points="18,8 24,-22 30,6" fill="#FFEB3B" />
              <polygon points="34,6 40,-20 46,8" fill="#FFEB3B" />
              {/* Central spike */}
              <polygon points="26,4 32,-28 38,4" fill="#FFF176" />
              {/* Side hair */}
              <rect x="14" y="10" width="6" height="18" fill="#FFD700" />
              <rect x="44" y="10" width="6" height="18" fill="#FFD700" />
              {/* Glow effect layer */}
              <polygon points="28,2 32,-30 36,2" fill="#FFF9C4" opacity="0.7" />
            </>
          ),
          // Akatsuki style - Long dark with bangs
          "vip-akatsuki": (
            <>
              {/* Long flowing back hair */}
              <rect x="12" y="2" width="40" height="12" fill="#1A1A1A" />
              <rect x="8" y="10" width="8" height="44" fill="#1A1A1A" />
              <rect x="48" y="10" width="8" height="44" fill="#1A1A1A" />
              {/* Lower flowing parts */}
              <polygon points="8,54 16,40 16,58 6,58" fill="#1A1A1A" />
              <polygon points="56,54 48,40 48,58 58,58" fill="#1A1A1A" />
              {/* Front bangs */}
              <polygon points="18,10 24,26 22,10" fill="#2D2D2D" />
              <polygon points="26,8 30,28 28,8" fill="#1A1A1A" />
              <polygon points="34,8 38,28 36,8" fill="#2D2D2D" />
              <polygon points="40,10 46,26 42,10" fill="#1A1A1A" />
              {/* Hair ties marks */}
              <rect x="10" y="38" width="4" height="3" fill="#8B0000" />
              <rect x="50" y="38" width="4" height="3" fill="#8B0000" />
            </>
          ),
           // Goku Super Saiyajin - Enhanced golden spikes
           "vip-goku-ssj": (
             <>
               {/* Main dramatic spikes */}
               <polygon points="6,22 16,-18 24,16" fill="#FFD700" />
               <polygon points="18,14 26,-24 34,8" fill="#FFE44D" />
               <polygon points="30,8 38,-28 46,8" fill="#FFD700" />
               <polygon points="40,14 48,-18 58,22" fill="#FFE44D" />
               {/* Central super spike */}
               <polygon points="24,2 32,-36 40,2" fill="#FFF176" />
               {/* Secondary spikes */}
               <polygon points="14,12 22,-20 28,10" fill="#FFEB3B" />
               <polygon points="36,10 42,-20 50,12" fill="#FFEB3B" />
               {/* Side bangs */}
               <polygon points="12,26 18,8 22,28" fill="#FFD700" />
               <polygon points="52,26 46,8 42,28" fill="#FFD700" />
               {/* Base hair volume */}
               <rect x="16" y="10" width="32" height="10" fill="#FFD700" />
               {/* Glow highlights */}
               <polygon points="28,0 32,-38 36,0" fill="#FFFDE7" opacity="0.8" />
             </>
           ),
           // Sasuke Shippuden - Sleek dark with bangs
           "vip-sasuke": (
             <>
               {/* Back hair - styled up */}
               <rect x="16" y="2" width="32" height="10" fill="#1A1A1A" />
               <polygon points="16,2 20,-6 24,4" fill="#1A1A1A" />
               <polygon points="24,2 28,-8 32,2" fill="#2D2D2D" />
               <polygon points="32,2 36,-8 40,2" fill="#1A1A1A" />
               <polygon points="40,4 44,-6 48,2" fill="#2D2D2D" />
               {/* Side hair - covers ears */}
               <rect x="12" y="8" width="6" height="20" fill="#1A1A1A" />
               <rect x="46" y="8" width="6" height="20" fill="#1A1A1A" />
               <polygon points="12,28 18,20 18,32 12,32" fill="#1A1A1A" />
               <polygon points="52,28 46,20 46,32 52,32" fill="#1A1A1A" />
               {/* Front bangs - parted */}
               <polygon points="20,8 26,22 24,8" fill="#2D2D2D" />
               <polygon points="26,6 30,24 28,6" fill="#1A1A1A" />
               <polygon points="34,6 38,24 36,6" fill="#2D2D2D" />
               <polygon points="38,8 44,22 40,8" fill="#1A1A1A" />
               {/* Headband area visible */}
               <rect x="18" y="6" width="28" height="2" fill="#3B5998" opacity="0.3" />
             </>
           ),
        };
        
        // Identify VIP hair by ID suffix or name pattern
        let selectedShape = vipHairShapes["vip-ssj"]; // default to SSJ
        
        // Check for akatsuki pattern in ID
        if (optionId.toLowerCase().includes("c0ebe936") || optionId.toLowerCase().includes("akatsuki")) {
          selectedShape = vipHairShapes["vip-akatsuki"];
         } else if (optionId.toLowerCase().includes("goku") || optionId.toLowerCase().includes("saiyajin")) {
           selectedShape = vipHairShapes["vip-goku-ssj"];
         } else if (optionId.toLowerCase().includes("sasuke") || optionId.toLowerCase().includes("shippuden")) {
           selectedShape = vipHairShapes["vip-sasuke"];
        }
        
        return (
          <svg viewBox="0 0 64 64" className="absolute inset-0 w-full h-full" style={{ imageRendering: "pixelated" }}>
            {selectedShape}
          </svg>
        );
      }
      
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
      // VIP Shirt styles
      if (optionId.startsWith("vip-")) {
        const vipTopShapes: Record<string, JSX.Element> = {
          // Naruto orange jacket
          "vip-naruto": (
            <>
              <rect x="14" y="34" width="36" height="20" fill="#FF6B00" />
              <rect x="8" y="36" width="8" height="16" fill="#FF6B00" />
              <rect x="48" y="36" width="8" height="16" fill="#FF6B00" />
              {/* Collar black */}
              <rect x="24" y="34" width="16" height="4" fill="#1A1A1A" />
              {/* Spiral symbol */}
              <circle cx="32" cy="44" r="6" fill="#FFFFFF" />
              <circle cx="32" cy="44" r="4" fill="#FF6B00" />
              <path d="M32,40 Q36,44 32,48" stroke="#8B0000" strokeWidth="2" fill="none" />
            </>
          ),
          // One Piece vest
          "vip-onepiece": (
            <>
              <rect x="16" y="34" width="32" height="20" fill="#DC143C" />
              <rect x="8" y="36" width="10" height="16" fill="#DC143C" />
              <rect x="46" y="36" width="10" height="16" fill="#DC143C" />
              {/* Open vest look */}
              <rect x="28" y="36" width="8" height="16" fill="#FFDCB5" />
              {/* Buttons */}
              <circle cx="26" cy="40" r="1.5" fill="#FFD700" />
              <circle cx="26" cy="46" r="1.5" fill="#FFD700" />
              <circle cx="38" cy="40" r="1.5" fill="#FFD700" />
              <circle cx="38" cy="46" r="1.5" fill="#FFD700" />
            </>
          ),
          // Dragon Ball gi
          "vip-dragonball": (
            <>
              <rect x="14" y="34" width="36" height="20" fill="#FF7F00" />
              <rect x="8" y="36" width="8" height="16" fill="#FF7F00" />
              <rect x="48" y="36" width="8" height="16" fill="#FF7F00" />
              {/* Blue undershirt */}
              <rect x="24" y="34" width="16" height="6" fill="#1E90FF" />
              {/* Kanji symbol */}
              <rect x="28" y="42" width="8" height="8" fill="#1E90FF" />
              <text x="32" y="49" fontSize="6" fill="#FFF" textAnchor="middle">亀</text>
            </>
          ),
        };
        
        let selectedShape = vipTopShapes["vip-naruto"]; // default
        
        if (optionId.toLowerCase().includes("045632dc") || optionId.toLowerCase().includes("onepiece")) {
          selectedShape = vipTopShapes["vip-onepiece"];
        } else if (optionId.toLowerCase().includes("a75981ed") || optionId.toLowerCase().includes("dragonball") || optionId.toLowerCase().includes("dragon")) {
          selectedShape = vipTopShapes["vip-dragonball"];
        }
        
        return (
          <svg viewBox="0 0 64 64" className="absolute inset-0 w-full h-full" style={{ imageRendering: "pixelated" }}>
            {selectedShape}
          </svg>
        );
      }
      
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
      // VIP Pants styles
      if (optionId.startsWith("vip-")) {
        const vipBottomShapes: Record<string, JSX.Element> = {
          // Ninja pants
          "vip-ninja": (
            <>
              <rect x="18" y="52" width="28" height="4" fill="#1A1A1A" />
              <rect x="18" y="52" width="12" height="12" fill="#1A1A1A" />
              <rect x="34" y="52" width="12" height="12" fill="#1A1A1A" />
              {/* Bandages */}
              <rect x="20" y="58" width="8" height="2" fill="#E0E0E0" />
              <rect x="36" y="58" width="8" height="2" fill="#E0E0E0" />
              <rect x="22" y="62" width="4" height="2" fill="#E0E0E0" />
              <rect x="38" y="62" width="4" height="2" fill="#E0E0E0" />
            </>
          ),
          // Royal golden pants
          "vip-royal": (
            <>
              <rect x="18" y="52" width="28" height="4" fill="#FFD700" />
              <rect x="18" y="52" width="12" height="12" fill="#FFD700" />
              <rect x="34" y="52" width="12" height="12" fill="#FFD700" />
              {/* Golden trim */}
              <rect x="18" y="52" width="12" height="2" fill="#FFA500" />
              <rect x="34" y="52" width="12" height="2" fill="#FFA500" />
              {/* Gem accents */}
              <circle cx="24" cy="58" r="2" fill="#E91E63" />
              <circle cx="40" cy="58" r="2" fill="#E91E63" />
            </>
          ),
        };
        
        let selectedShape = vipBottomShapes["vip-ninja"]; // default
        
        if (optionId.toLowerCase().includes("44f94a52") || optionId.toLowerCase().includes("royal") || optionId.toLowerCase().includes("real")) {
          selectedShape = vipBottomShapes["vip-royal"];
        }
        
        return (
          <svg viewBox="0 0 64 64" className="absolute inset-0 w-full h-full" style={{ imageRendering: "pixelated" }}>
            {selectedShape}
          </svg>
        );
      }
      
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
     
     // VIP Accessory styles
     if (optionId.startsWith("vip-")) {
       const vipAccShapes: Record<string, JSX.Element> = {
         // Akatsuki Cloak
         "vip-akatsuki": (
           <>
             {/* Main cloak body - covers torso */}
             <rect x="8" y="32" width="48" height="34" fill="#1A1A1A" />
             {/* High collar */}
             <rect x="18" y="28" width="28" height="8" fill="#1A1A1A" />
             <polygon points="18,28 24,22 24,36 18,36" fill="#1A1A1A" />
             <polygon points="46,28 40,22 40,36 46,36" fill="#1A1A1A" />
             {/* Red clouds pattern */}
             <ellipse cx="20" cy="42" rx="6" ry="4" fill="#8B0000" />
             <ellipse cx="20" cy="42" rx="4" ry="2.5" fill="#DC143C" />
             <ellipse cx="44" cy="44" rx="6" ry="4" fill="#8B0000" />
             <ellipse cx="44" cy="44" rx="4" ry="2.5" fill="#DC143C" />
             <ellipse cx="32" cy="56" rx="7" ry="5" fill="#8B0000" />
             <ellipse cx="32" cy="56" rx="5" ry="3" fill="#DC143C" />
             {/* Cloak bottom edge */}
             <polygon points="8,66 16,56 16,66" fill="#1A1A1A" />
             <polygon points="56,66 48,56 48,66" fill="#1A1A1A" />
           </>
         ),
         // Straw Hat (One Piece)
         "vip-strawhat": (
           <>
             <ellipse cx="32" cy="8" rx="20" ry="4" fill="#DAA520" />
             <ellipse cx="32" cy="4" rx="14" ry="6" fill="#F4A460" />
             <rect x="26" y="6" width="12" height="2" fill="#8B0000" />
           </>
         ),
         // Headband Konoha
         "vip-konoha": (
           <>
             <rect x="16" y="6" width="32" height="5" fill="#3B5998" />
             <rect x="26" y="4" width="12" height="8" fill="#C0C0C0" />
             <path d="M28,8 L32,5 L36,8 M30,8 L32,6 L34,8" stroke="#1A1A1A" strokeWidth="1" fill="none" />
             <polygon points="48,8 56,12 48,18" fill="#3B5998" />
             <polygon points="52,10 60,16 52,22" fill="#3B5998" />
           </>
         ),
       };
       
       let selectedShape = vipAccShapes["vip-akatsuki"]; // default
       
       // Match by ID pattern
       if (optionId.toLowerCase().includes("strawhat") || optionId.toLowerCase().includes("chapeu")) {
         selectedShape = vipAccShapes["vip-strawhat"];
       } else if (optionId.toLowerCase().includes("konoha") || optionId.toLowerCase().includes("headband")) {
         selectedShape = vipAccShapes["vip-konoha"];
       }
       
       return (
         <svg viewBox="0 0 64 64" className="absolute inset-0 w-full h-full" style={{ imageRendering: "pixelated" }}>
           {selectedShape}
         </svg>
       );
     }
     
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
  level = 1,
  variant = "default"
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
        className={cn(
          "relative overflow-hidden",
          variant === "minimal" 
            ? "rounded-lg bg-transparent" 
            : "rounded-xl border-2 border-primary shadow-[0_0_20px_hsl(var(--primary)/0.4)] bg-gradient-to-br from-secondary to-card"
        )}
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
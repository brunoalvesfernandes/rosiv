import { useEffect, useRef, useCallback } from "react";

interface WaterBackgroundProps {
  width: number;
  height: number;
  onLocationClick?: (location: string) => void;
}

export interface LocationHitbox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

// Define building positions as percentages for responsive layout
const BUILDING_CONFIGS = [
  { id: "shop", label: "Loja", xPct: 0.12, yPct: 0.35, wPct: 0.12, hPct: 0.25 },
  { id: "crafting", label: "Forja", xPct: 0.12, yPct: 0.65, wPct: 0.10, hPct: 0.20 },
  { id: "mining", label: "Mina", xPct: 0.42, yPct: 0.12, wPct: 0.16, hPct: 0.18 },
  { id: "dungeon", label: "Masmorra", xPct: 0.78, yPct: 0.28, wPct: 0.14, hPct: 0.22 },
  { id: "arena", label: "Arena", xPct: 0.80, yPct: 0.60, wPct: 0.12, hPct: 0.20 },
  { id: "guild", label: "Guilda", xPct: 0.55, yPct: 0.65, wPct: 0.10, hPct: 0.18 },
];

export function WaterBackground({ width, height, onLocationClick }: WaterBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hitboxesRef = useRef<LocationHitbox[]>([]);

  // Calculate hitboxes based on current dimensions
  const updateHitboxes = useCallback(() => {
    hitboxesRef.current = BUILDING_CONFIGS.map(cfg => ({
      id: cfg.id,
      label: cfg.label,
      x: cfg.xPct * width,
      y: cfg.yPct * height,
      width: cfg.wPct * width,
      height: cfg.hPct * height,
    }));
  }, [width, height]);

  // Handle click on canvas
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onLocationClick) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check each hitbox
    for (const hb of hitboxesRef.current) {
      if (x >= hb.x && x <= hb.x + hb.width && y >= hb.y && y <= hb.y + hb.height) {
        e.stopPropagation();
        onLocationClick(hb.id);
        return;
      }
    }
  }, [onLocationClick]);

  useEffect(() => {
    updateHitboxes();
  }, [updateHitboxes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    // Helper to draw a pixel-style building
    const drawBuilding = (
      x: number, y: number, w: number, h: number,
      baseColor: string, roofColor: string, 
      icon: string, glowColor: string,
      isHovered: boolean
    ) => {
      const brickH = h * 0.7;
      const roofH = h * 0.35;
      
      // Glow effect
      if (isHovered || true) {
        const glow = ctx.createRadialGradient(x + w/2, y + h/2, 0, x + w/2, y + h/2, w * 0.8);
        glow.addColorStop(0, `${glowColor}33`);
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.fillRect(x - w*0.3, y - h*0.3, w * 1.6, h * 1.6);
      }
      
      // Building base (pixelated look)
      ctx.fillStyle = baseColor;
      ctx.fillRect(x, y + roofH - 5, w, brickH);
      
      // Building darker edge
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(x, y + roofH - 5, w * 0.1, brickH);
      ctx.fillRect(x + w * 0.9, y + roofH - 5, w * 0.1, brickH);
      
      // Roof (triangular)
      ctx.fillStyle = roofColor;
      ctx.beginPath();
      ctx.moveTo(x - 5, y + roofH);
      ctx.lineTo(x + w/2, y);
      ctx.lineTo(x + w + 5, y + roofH);
      ctx.closePath();
      ctx.fill();
      
      // Door
      ctx.fillStyle = "hsla(30, 40%, 20%, 1)";
      const doorW = w * 0.25;
      const doorH = brickH * 0.5;
      ctx.fillRect(x + w/2 - doorW/2, y + h - doorH, doorW, doorH);
      
      // Window glow
      ctx.fillStyle = `hsla(45, 80%, 60%, ${0.6 + Math.sin(time * 2) * 0.2})`;
      const winW = w * 0.15;
      const winH = brickH * 0.2;
      ctx.fillRect(x + w * 0.2, y + roofH + brickH * 0.15, winW, winH);
      ctx.fillRect(x + w * 0.65, y + roofH + brickH * 0.15, winW, winH);
      
      // Icon/sign above door
      ctx.font = `${Math.max(14, w * 0.3)}px Arial`;
      ctx.textAlign = "center";
      ctx.fillText(icon, x + w/2, y + roofH + brickH * 0.45);
      
      // Label
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = `bold ${Math.max(10, w * 0.15)}px sans-serif`;
      ctx.fillText(BUILDING_CONFIGS.find(b => b.id === "")?.label || "", x + w/2, y + h + 12);
    };

    // Draw mine entrance (cave style)
    const drawMineEntrance = (x: number, y: number, w: number, h: number) => {
      // Glow
      const glow = ctx.createRadialGradient(x + w/2, y + h/2, 0, x + w/2, y + h/2, w * 0.7);
      glow.addColorStop(0, "hsla(35, 70%, 40%, 0.3)");
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.fillRect(x - w*0.2, y - h*0.2, w * 1.4, h * 1.4);
      
      // Rock arch
      ctx.fillStyle = "hsla(30, 20%, 25%, 1)";
      ctx.beginPath();
      ctx.moveTo(x, y + h);
      ctx.lineTo(x, y + h * 0.3);
      ctx.quadraticCurveTo(x + w/2, y - h * 0.1, x + w, y + h * 0.3);
      ctx.lineTo(x + w, y + h);
      ctx.closePath();
      ctx.fill();
      
      // Dark inside
      ctx.fillStyle = "hsla(0, 0%, 5%, 1)";
      ctx.beginPath();
      ctx.moveTo(x + w * 0.15, y + h);
      ctx.lineTo(x + w * 0.15, y + h * 0.4);
      ctx.quadraticCurveTo(x + w/2, y + h * 0.1, x + w * 0.85, y + h * 0.4);
      ctx.lineTo(x + w * 0.85, y + h);
      ctx.closePath();
      ctx.fill();
      
      // Mining cart tracks
      ctx.strokeStyle = "hsla(30, 30%, 40%, 0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + w * 0.3, y + h);
      ctx.lineTo(x + w * 0.35, y + h * 0.7);
      ctx.moveTo(x + w * 0.7, y + h);
      ctx.lineTo(x + w * 0.65, y + h * 0.7);
      ctx.stroke();
      
      // Pickaxe icon
      ctx.font = `${Math.max(16, w * 0.25)}px Arial`;
      ctx.textAlign = "center";
      ctx.fillText("⛏️", x + w/2, y + h * 0.65);
      
      // Lanterns
      ctx.fillStyle = `hsla(35, 100%, 50%, ${0.7 + Math.sin(time * 3) * 0.3})`;
      ctx.beginPath();
      ctx.arc(x + w * 0.2, y + h * 0.45, 4, 0, Math.PI * 2);
      ctx.arc(x + w * 0.8, y + h * 0.45, 4, 0, Math.PI * 2);
      ctx.fill();
    };

    // Draw dungeon portal
    const drawDungeonPortal = (x: number, y: number, w: number, h: number) => {
      // Purple glow
      const glow = ctx.createRadialGradient(x + w/2, y + h/2, 0, x + w/2, y + h/2, w * 0.8);
      glow.addColorStop(0, `hsla(280, 80%, 50%, ${0.4 + Math.sin(time * 2) * 0.1})`);
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.fillRect(x - w*0.3, y - h*0.3, w * 1.6, h * 1.6);
      
      // Stone arch
      ctx.fillStyle = "hsla(260, 15%, 20%, 1)";
      ctx.beginPath();
      ctx.moveTo(x, y + h);
      ctx.lineTo(x, y + h * 0.2);
      ctx.quadraticCurveTo(x + w/2, y - h * 0.15, x + w, y + h * 0.2);
      ctx.lineTo(x + w, y + h);
      ctx.closePath();
      ctx.fill();
      
      // Portal swirl inside
      const portalGrad = ctx.createRadialGradient(x + w/2, y + h * 0.55, 0, x + w/2, y + h * 0.55, w * 0.35);
      portalGrad.addColorStop(0, "hsla(280, 90%, 60%, 0.9)");
      portalGrad.addColorStop(0.5, "hsla(260, 80%, 40%, 0.7)");
      portalGrad.addColorStop(1, "hsla(240, 70%, 20%, 0.5)");
      ctx.fillStyle = portalGrad;
      ctx.beginPath();
      ctx.ellipse(x + w/2, y + h * 0.55, w * 0.35, h * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Skull icon
      ctx.font = `${Math.max(16, w * 0.3)}px Arial`;
      ctx.textAlign = "center";
      ctx.fillText("💀", x + w/2, y + h * 0.6);
      
      // Runes
      ctx.fillStyle = `hsla(280, 100%, 70%, ${0.5 + Math.sin(time * 2.5) * 0.3})`;
      ctx.font = `${Math.max(8, w * 0.1)}px Arial`;
      ctx.fillText("ᚱ", x + w * 0.1, y + h * 0.5);
      ctx.fillText("ᚦ", x + w * 0.9, y + h * 0.5);
    };

    // Draw arena
    const drawArena = (x: number, y: number, w: number, h: number) => {
      // Red glow
      const glow = ctx.createRadialGradient(x + w/2, y + h/2, 0, x + w/2, y + h/2, w * 0.7);
      glow.addColorStop(0, "hsla(0, 80%, 50%, 0.3)");
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.fillRect(x - w*0.2, y - h*0.2, w * 1.4, h * 1.4);
      
      // Colosseum-style curved walls
      ctx.fillStyle = "hsla(30, 20%, 30%, 1)";
      ctx.beginPath();
      ctx.ellipse(x + w/2, y + h * 0.7, w * 0.55, h * 0.5, 0, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      
      // Arena floor
      ctx.fillStyle = "hsla(35, 30%, 25%, 1)";
      ctx.beginPath();
      ctx.ellipse(x + w/2, y + h * 0.7, w * 0.4, h * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Pillars
      ctx.fillStyle = "hsla(30, 15%, 40%, 1)";
      ctx.fillRect(x + w * 0.1, y + h * 0.3, w * 0.08, h * 0.5);
      ctx.fillRect(x + w * 0.82, y + h * 0.3, w * 0.08, h * 0.5);
      
      // Swords icon
      ctx.font = `${Math.max(16, w * 0.3)}px Arial`;
      ctx.textAlign = "center";
      ctx.fillText("⚔️", x + w/2, y + h * 0.65);
      
      // Torches
      ctx.fillStyle = `hsla(25, 100%, 50%, ${0.8 + Math.sin(time * 4) * 0.2})`;
      ctx.beginPath();
      ctx.arc(x + w * 0.14, y + h * 0.28, 4, 0, Math.PI * 2);
      ctx.arc(x + w * 0.86, y + h * 0.28, 4, 0, Math.PI * 2);
      ctx.fill();
    };

    // Draw forge/crafting
    const drawForge = (x: number, y: number, w: number, h: number) => {
      // Orange glow
      const glow = ctx.createRadialGradient(x + w/2, y + h/2, 0, x + w/2, y + h/2, w * 0.8);
      glow.addColorStop(0, `hsla(25, 100%, 50%, ${0.3 + Math.sin(time * 3) * 0.1})`);
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.fillRect(x - w*0.2, y - h*0.2, w * 1.4, h * 1.4);
      
      // Stone furnace
      ctx.fillStyle = "hsla(20, 20%, 25%, 1)";
      ctx.fillRect(x, y + h * 0.3, w, h * 0.7);
      
      // Chimney
      ctx.fillRect(x + w * 0.35, y, w * 0.3, h * 0.4);
      
      // Smoke
      ctx.fillStyle = `hsla(0, 0%, 50%, ${0.3 + Math.sin(time * 2) * 0.1})`;
      for (let i = 0; i < 3; i++) {
        const smokeY = y - 10 - i * 12 - (time * 20 % 30);
        const smokeX = x + w * 0.5 + Math.sin(time + i) * 5;
        ctx.beginPath();
        ctx.arc(smokeX, smokeY, 5 + i * 2, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Fire opening
      const fireGrad = ctx.createRadialGradient(x + w/2, y + h * 0.6, 0, x + w/2, y + h * 0.6, w * 0.25);
      fireGrad.addColorStop(0, `hsla(40, 100%, 60%, ${0.9 + Math.sin(time * 5) * 0.1})`);
      fireGrad.addColorStop(0.5, "hsla(25, 100%, 50%, 0.8)");
      fireGrad.addColorStop(1, "hsla(0, 100%, 30%, 0.6)");
      ctx.fillStyle = fireGrad;
      ctx.beginPath();
      ctx.arc(x + w/2, y + h * 0.6, w * 0.2, 0, Math.PI * 2);
      ctx.fill();
      
      // Anvil
      ctx.fillStyle = "hsla(220, 10%, 30%, 1)";
      ctx.fillRect(x + w * 0.6, y + h * 0.75, w * 0.35, h * 0.15);
      
      // Hammer icon
      ctx.font = `${Math.max(12, w * 0.25)}px Arial`;
      ctx.textAlign = "center";
      ctx.fillText("🔨", x + w/2, y + h * 0.5);
    };

    // Draw shop
    const drawShop = (x: number, y: number, w: number, h: number) => {
      // Green glow
      const glow = ctx.createRadialGradient(x + w/2, y + h/2, 0, x + w/2, y + h/2, w * 0.7);
      glow.addColorStop(0, "hsla(140, 70%, 40%, 0.25)");
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.fillRect(x - w*0.2, y - h*0.2, w * 1.4, h * 1.4);
      
      // Building
      ctx.fillStyle = "hsla(35, 30%, 35%, 1)";
      ctx.fillRect(x, y + h * 0.25, w, h * 0.75);
      
      // Roof (awning style)
      ctx.fillStyle = "hsla(140, 50%, 35%, 1)";
      ctx.beginPath();
      ctx.moveTo(x - 5, y + h * 0.3);
      ctx.lineTo(x + w/2, y);
      ctx.lineTo(x + w + 5, y + h * 0.3);
      ctx.lineTo(x + w + 5, y + h * 0.35);
      ctx.lineTo(x - 5, y + h * 0.35);
      ctx.closePath();
      ctx.fill();
      
      // Stripes on awning
      ctx.fillStyle = "hsla(140, 60%, 25%, 1)";
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(x + i * w * 0.25, y + h * 0.25, w * 0.1, h * 0.1);
      }
      
      // Window display
      ctx.fillStyle = "hsla(45, 60%, 50%, 0.6)";
      ctx.fillRect(x + w * 0.1, y + h * 0.45, w * 0.35, h * 0.25);
      ctx.fillRect(x + w * 0.55, y + h * 0.45, w * 0.35, h * 0.25);
      
      // Door
      ctx.fillStyle = "hsla(30, 40%, 25%, 1)";
      ctx.fillRect(x + w * 0.35, y + h * 0.7, w * 0.3, h * 0.3);
      
      // Shop sign
      ctx.font = `${Math.max(14, w * 0.25)}px Arial`;
      ctx.textAlign = "center";
      ctx.fillText("🛒", x + w/2, y + h * 0.55);
      
      // Coins decoration
      ctx.fillStyle = `hsla(45, 100%, 50%, ${0.7 + Math.sin(time * 2) * 0.2})`;
      ctx.font = `${Math.max(8, w * 0.12)}px Arial`;
      ctx.fillText("💰", x + w * 0.2, y + h * 0.55);
      ctx.fillText("💰", x + w * 0.8, y + h * 0.55);
    };

    // Draw guild hall
    const drawGuildHall = (x: number, y: number, w: number, h: number) => {
      // Cyan glow
      const glow = ctx.createRadialGradient(x + w/2, y + h/2, 0, x + w/2, y + h/2, w * 0.7);
      glow.addColorStop(0, "hsla(185, 80%, 50%, 0.25)");
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.fillRect(x - w*0.2, y - h*0.2, w * 1.4, h * 1.4);
      
      // Building
      ctx.fillStyle = "hsla(210, 25%, 30%, 1)";
      ctx.fillRect(x, y + h * 0.3, w, h * 0.7);
      
      // Roof
      ctx.fillStyle = "hsla(185, 40%, 35%, 1)";
      ctx.beginPath();
      ctx.moveTo(x - 3, y + h * 0.35);
      ctx.lineTo(x + w/2, y);
      ctx.lineTo(x + w + 3, y + h * 0.35);
      ctx.closePath();
      ctx.fill();
      
      // Banner
      ctx.fillStyle = "hsla(185, 60%, 45%, 1)";
      ctx.fillRect(x + w * 0.35, y + h * 0.4, w * 0.3, h * 0.25);
      
      // Guild icon
      ctx.font = `${Math.max(12, w * 0.25)}px Arial`;
      ctx.textAlign = "center";
      ctx.fillText("🏰", x + w/2, y + h * 0.6);
      
      // Door
      ctx.fillStyle = "hsla(30, 30%, 20%, 1)";
      ctx.fillRect(x + w * 0.3, y + h * 0.7, w * 0.4, h * 0.3);
    };

    const draw = () => {
      time += 0.015;
      
      // === CAVE BACKGROUND ===
      const caveGradient = ctx.createLinearGradient(0, 0, 0, height);
      caveGradient.addColorStop(0, "hsl(220, 30%, 6%)");
      caveGradient.addColorStop(0.3, "hsl(220, 25%, 10%)");
      caveGradient.addColorStop(0.7, "hsl(210, 20%, 8%)");
      caveGradient.addColorStop(1, "hsl(200, 30%, 5%)");
      ctx.fillStyle = caveGradient;
      ctx.fillRect(0, 0, width, height);

      // === CAVE WALLS ===
      ctx.fillStyle = "hsla(220, 20%, 12%, 0.8)";
      
      // Left cave wall
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(width * 0.06, 0);
      ctx.lineTo(width * 0.08, height * 0.12);
      ctx.lineTo(width * 0.05, height * 0.3);
      ctx.lineTo(width * 0.07, height * 0.5);
      ctx.lineTo(width * 0.04, height * 0.7);
      ctx.lineTo(width * 0.06, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // Right cave wall
      ctx.beginPath();
      ctx.moveTo(width, 0);
      ctx.lineTo(width * 0.94, 0);
      ctx.lineTo(width * 0.92, height * 0.15);
      ctx.lineTo(width * 0.95, height * 0.35);
      ctx.lineTo(width * 0.93, height * 0.55);
      ctx.lineTo(width * 0.95, height * 0.75);
      ctx.lineTo(width * 0.94, height);
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // Top cave ceiling with stalactites
      ctx.fillStyle = "hsla(220, 25%, 8%, 0.9)";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(width, 0);
      ctx.lineTo(width, height * 0.08);
      const stalCount = Math.floor(width / 50);
      for (let i = stalCount; i > 0; i--) {
        const sx = (i / stalCount) * (width - 60) + 30;
        const stalHeight = height * 0.04 + Math.sin(sx * 0.1) * height * 0.03;
        ctx.lineTo(sx + 15, height * 0.07);
        ctx.lineTo(sx, height * 0.07 + stalHeight);
        ctx.lineTo(sx - 15, height * 0.07);
      }
      ctx.lineTo(0, height * 0.08);
      ctx.closePath();
      ctx.fill();

      // === DRAW BUILDINGS ===
      const hitboxes = hitboxesRef.current;
      
      // Shop (left side)
      const shop = hitboxes.find(h => h.id === "shop");
      if (shop) drawShop(shop.x, shop.y, shop.width, shop.height);
      
      // Forge/Crafting (left bottom)
      const crafting = hitboxes.find(h => h.id === "crafting");
      if (crafting) drawForge(crafting.x, crafting.y, crafting.width, crafting.height);
      
      // Mine (top center)
      const mining = hitboxes.find(h => h.id === "mining");
      if (mining) drawMineEntrance(mining.x, mining.y, mining.width, mining.height);
      
      // Dungeon Portal (right)
      const dungeon = hitboxes.find(h => h.id === "dungeon");
      if (dungeon) drawDungeonPortal(dungeon.x, dungeon.y, dungeon.width, dungeon.height);
      
      // Arena (right bottom)
      const arena = hitboxes.find(h => h.id === "arena");
      if (arena) drawArena(arena.x, arena.y, arena.width, arena.height);
      
      // Guild Hall (bottom center-right)
      const guild = hitboxes.find(h => h.id === "guild");
      if (guild) drawGuildHall(guild.x, guild.y, guild.width, guild.height);

      // === WATERFALL (right side, behind buildings) ===
      const waterfallX = width * 0.88;
      const waterfallWidth = width * 0.04;
      
      // Waterfall glow
      const waterfallGlow = ctx.createRadialGradient(
        waterfallX, height/2, 10,
        waterfallX, height/2, width * 0.08
      );
      waterfallGlow.addColorStop(0, "hsla(190, 80%, 50%, 0.12)");
      waterfallGlow.addColorStop(1, "transparent");
      ctx.fillStyle = waterfallGlow;
      ctx.fillRect(waterfallX - width * 0.05, height * 0.1, width * 0.1, height * 0.8);

      // Waterfall streams
      for (let i = 0; i < 3; i++) {
        const streamX = waterfallX + i * 6;
        const offset = Math.sin(time * 3 + i) * 2;
        
        ctx.strokeStyle = `hsla(190, 70%, ${65 + i * 5}%, ${0.3 - i * 0.08})`;
        ctx.lineWidth = 4 - i;
        ctx.beginPath();
        
        for (let y = height * 0.1; y < height * 0.85; y += 8) {
          const waveX = streamX + offset + Math.sin((y + time * 100) * 0.05) * 3;
          if (y === height * 0.1) {
            ctx.moveTo(waveX, y);
          } else {
            ctx.lineTo(waveX, y);
          }
        }
        ctx.stroke();
      }

      // === CENTRAL LAKE ===
      const lakeX = width / 2;
      const lakeY = height * 0.92;
      const lakeRadiusX = width * 0.3;
      const lakeRadiusY = height * 0.1;

      const lakeGradient = ctx.createRadialGradient(
        lakeX, lakeY, 0,
        lakeX, lakeY, lakeRadiusX
      );
      lakeGradient.addColorStop(0, "hsla(195, 70%, 35%, 0.9)");
      lakeGradient.addColorStop(0.5, "hsla(200, 60%, 25%, 0.85)");
      lakeGradient.addColorStop(1, "hsla(210, 50%, 15%, 0.7)");

      ctx.fillStyle = lakeGradient;
      ctx.beginPath();
      ctx.ellipse(lakeX, lakeY, lakeRadiusX, lakeRadiusY, 0, 0, Math.PI * 2);
      ctx.fill();

      // Lake ripples
      ctx.strokeStyle = "hsla(185, 80%, 55%, 0.15)";
      ctx.lineWidth = 1;
      for (let r = 0; r < 3; r++) {
        const rippleRadius = lakeRadiusX * 0.3 + r * lakeRadiusX * 0.25 + Math.sin(time * 2 + r) * 8;
        const rippleY = lakeRadiusY * (rippleRadius / lakeRadiusX);
        ctx.beginPath();
        ctx.ellipse(lakeX, lakeY, Math.min(rippleRadius, lakeRadiusX - 10), Math.min(rippleY, lakeRadiusY - 3), 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // === FLOATING PARTICLES ===
      for (let i = 0; i < 20; i++) {
        const px = (i * 97 + Math.sin(time * 0.3 + i * 0.7) * 30) % (width * 0.85) + width * 0.08;
        const py = (i * 43 + Math.cos(time * 0.2 + i * 0.5) * 25) % (height * 0.7) + height * 0.15;
        const particleSize = 2 + Math.sin(time + i);
        const alpha = 0.25 + Math.sin(time * 2 + i) * 0.15;
        
        const particleGlow = ctx.createRadialGradient(px, py, 0, px, py, particleSize * 3);
        particleGlow.addColorStop(0, `hsla(185, 100%, 70%, ${alpha})`);
        particleGlow.addColorStop(1, "transparent");
        ctx.fillStyle = particleGlow;
        ctx.beginPath();
        ctx.arc(px, py, particleSize * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // === BUILDING LABELS ===
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.textAlign = "center";
      ctx.font = `bold ${Math.max(10, width * 0.015)}px sans-serif`;
      
      hitboxes.forEach(hb => {
        ctx.fillText(hb.label, hb.x + hb.width / 2, hb.y + hb.height + 14);
      });

      // === CAVE VIGNETTE ===
      const vignette = ctx.createRadialGradient(
        width / 2, height / 2, Math.min(width, height) * 0.3,
        width / 2, height / 2, Math.max(width, height) * 0.7
      );
      vignette.addColorStop(0, "transparent");
      vignette.addColorStop(1, "hsla(220, 40%, 3%, 0.6)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 rounded-xl"
      style={{ imageRendering: "auto", cursor: onLocationClick ? "pointer" : "default" }}
      onClick={handleClick}
    />
  );
}

import { useRef, useEffect, useCallback, useState } from "react";

interface SideScrollingWorldProps {
  viewportWidth: number;
  viewportHeight: number;
  playerX: number;
  onLocationClick?: (location: string) => void;
  onGroundClick?: (x: number) => void;
}

// World is much wider than viewport - multiple "screens"
const WORLD_WIDTH = 2400;
const GROUND_Y_PERCENT = 0.75;

// Building definitions positioned along the horizontal world
const BUILDINGS = [
  { id: "shop", label: "Loja", x: 120, width: 140, icon: "🛒", roofColor: "#4ade80", baseColor: "#a3a3a3" },
  { id: "crafting", label: "Forja", x: 380, width: 130, icon: "🔨", roofColor: "#f97316", baseColor: "#78716c" },
  { id: "mining", label: "Mina", x: 680, width: 150, icon: "⛏️", roofColor: "#78716c", baseColor: "#44403c" },
  { id: "arena", label: "Arena", x: 1000, width: 160, icon: "⚔️", roofColor: "#ef4444", baseColor: "#a3a3a3" },
  { id: "dungeon", label: "Masmorra", x: 1350, width: 140, icon: "💀", roofColor: "#8b5cf6", baseColor: "#57534e" },
  { id: "guild", label: "Guilda", x: 1650, width: 150, icon: "🏰", roofColor: "#06b6d4", baseColor: "#78716c" },
  { id: "training", label: "Treino", x: 1950, width: 130, icon: "💪", roofColor: "#eab308", baseColor: "#a3a3a3" },
  { id: "pets", label: "Pets", x: 2200, width: 120, icon: "🐾", roofColor: "#ec4899", baseColor: "#a3a3a3" },
];

export function SideScrollingWorld({
  viewportWidth,
  viewportHeight,
  playerX,
  onLocationClick,
  onGroundClick,
}: SideScrollingWorldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraX, setCameraX] = useState(0);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);

  // Calculate camera position to follow player
  useEffect(() => {
    const halfViewport = viewportWidth / 2;
    let targetCameraX = playerX - halfViewport;
    
    // Clamp camera to world bounds
    targetCameraX = Math.max(0, Math.min(WORLD_WIDTH - viewportWidth, targetCameraX));
    
    setCameraX(targetCameraX);
  }, [playerX, viewportWidth]);

  const groundY = viewportHeight * GROUND_Y_PERCENT;

  // Handle click - check for building or ground
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Convert to world coordinates
    const worldX = clickX + cameraX;

    // Check if clicked on a building
    for (const building of BUILDINGS) {
      const buildingTop = groundY - 100;
      const buildingBottom = groundY;
      
      if (
        worldX >= building.x &&
        worldX <= building.x + building.width &&
        clickY >= buildingTop - 30 && // Include roof
        clickY <= buildingBottom
      ) {
        e.stopPropagation();
        onLocationClick?.(building.id);
        return;
      }
    }

    // Ground click - move player
    if (clickY >= groundY - 50 && clickY <= viewportHeight) {
      onGroundClick?.(worldX);
    }
  }, [cameraX, groundY, onLocationClick, onGroundClick, viewportHeight]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      timeRef.current += 0.02;
      const time = timeRef.current;

      // Clear canvas
      ctx.clearRect(0, 0, viewportWidth, viewportHeight);

      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
      skyGrad.addColorStop(0, "hsl(220, 60%, 15%)");
      skyGrad.addColorStop(0.5, "hsl(240, 40%, 20%)");
      skyGrad.addColorStop(1, "hsl(260, 30%, 25%)");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, viewportWidth, groundY);

      // Stars
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      for (let i = 0; i < 30; i++) {
        const starX = ((i * 73 + time * 2) % (viewportWidth + 100)) - 50;
        const starY = (i * 17) % (groundY - 20);
        const twinkle = 1 + Math.sin(time * 3 + i) * 0.4;
        ctx.beginPath();
        ctx.arc(starX, starY, twinkle, 0, Math.PI * 2);
        ctx.fill();
      }

      // Far background mountains (parallax - slower)
      const parallaxBg = cameraX * 0.2;
      ctx.fillStyle = "hsl(260, 20%, 18%)";
      for (let i = 0; i < 8; i++) {
        const mx = i * 350 - parallaxBg;
        if (mx > -200 && mx < viewportWidth + 200) {
          ctx.beginPath();
          ctx.moveTo(mx, groundY);
          ctx.lineTo(mx + 120, groundY - 80);
          ctx.lineTo(mx + 240, groundY);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Mid-ground hills (parallax - medium)
      const parallaxMid = cameraX * 0.5;
      ctx.fillStyle = "hsl(250, 25%, 22%)";
      for (let i = 0; i < 10; i++) {
        const hx = i * 280 - parallaxMid;
        if (hx > -150 && hx < viewportWidth + 150) {
          ctx.beginPath();
          ctx.moveTo(hx, groundY);
          ctx.quadraticCurveTo(hx + 70, groundY - 50, hx + 140, groundY);
          ctx.fill();
        }
      }

      // Ground
      const groundGrad = ctx.createLinearGradient(0, groundY, 0, viewportHeight);
      groundGrad.addColorStop(0, "hsl(30, 25%, 25%)");
      groundGrad.addColorStop(0.3, "hsl(25, 30%, 20%)");
      groundGrad.addColorStop(1, "hsl(20, 35%, 15%)");
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, groundY, viewportWidth, viewportHeight - groundY);

      // Cobblestone path
      ctx.fillStyle = "hsl(220, 10%, 30%)";
      ctx.fillRect(0, groundY, viewportWidth, 8);
      ctx.fillStyle = "hsl(220, 10%, 25%)";
      ctx.fillRect(0, groundY + 8, viewportWidth, 4);

      // Draw buildings
      for (const building of BUILDINGS) {
        const screenX = building.x - cameraX;
        
        // Only draw if visible
        if (screenX + building.width < -50 || screenX > viewportWidth + 50) continue;

        const bHeight = 90;
        const bTop = groundY - bHeight;
        const bWidth = building.width;

        // Building glow
        const glow = ctx.createRadialGradient(
          screenX + bWidth / 2, bTop + bHeight / 2, 0,
          screenX + bWidth / 2, bTop + bHeight / 2, bWidth
        );
        glow.addColorStop(0, `${building.roofColor}33`);
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.fillRect(screenX - 20, bTop - 40, bWidth + 40, bHeight + 60);

        // Building base
        ctx.fillStyle = building.baseColor;
        ctx.fillRect(screenX, bTop + 25, bWidth, bHeight - 25);

        // Building darker sides
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fillRect(screenX, bTop + 25, 8, bHeight - 25);
        ctx.fillRect(screenX + bWidth - 8, bTop + 25, 8, bHeight - 25);

        // Roof
        ctx.fillStyle = building.roofColor;
        ctx.beginPath();
        ctx.moveTo(screenX - 10, bTop + 30);
        ctx.lineTo(screenX + bWidth / 2, bTop - 10);
        ctx.lineTo(screenX + bWidth + 10, bTop + 30);
        ctx.closePath();
        ctx.fill();

        // Awning stripes
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        for (let s = 0; s < 4; s++) {
          const stripeX = screenX + 5 + s * (bWidth / 4);
          ctx.fillRect(stripeX, bTop + 25, bWidth / 8, 10);
        }

        // Window with glow
        const windowGlow = 0.5 + Math.sin(time * 2 + building.x * 0.01) * 0.3;
        ctx.fillStyle = `rgba(255, 220, 150, ${windowGlow})`;
        const winW = bWidth * 0.25;
        const winH = 20;
        ctx.fillRect(screenX + bWidth * 0.15, bTop + 45, winW, winH);
        ctx.fillRect(screenX + bWidth * 0.6, bTop + 45, winW, winH);

        // Door
        ctx.fillStyle = "hsl(30, 40%, 20%)";
        const doorW = bWidth * 0.3;
        const doorH = 35;
        ctx.fillRect(screenX + bWidth / 2 - doorW / 2, groundY - doorH, doorW, doorH);

        // Door handle
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.arc(screenX + bWidth / 2 + doorW / 4, groundY - doorH / 2, 3, 0, Math.PI * 2);
        ctx.fill();

        // Sign/Icon
        ctx.font = `${Math.max(24, bWidth * 0.2)}px Arial`;
        ctx.textAlign = "center";
        ctx.fillText(building.icon, screenX + bWidth / 2, bTop + 75);

        // Label
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.font = `bold ${Math.max(12, bWidth * 0.1)}px sans-serif`;
        ctx.fillText(building.label, screenX + bWidth / 2, groundY + 20);
      }

      // Lamp posts between buildings
      const lampPositions = [280, 550, 850, 1180, 1500, 1800, 2100];
      for (const lampX of lampPositions) {
        const screenLampX = lampX - cameraX;
        if (screenLampX < -30 || screenLampX > viewportWidth + 30) continue;

        // Pole
        ctx.fillStyle = "#374151";
        ctx.fillRect(screenLampX - 3, groundY - 70, 6, 70);

        // Lamp head
        ctx.fillStyle = "#1f2937";
        ctx.fillRect(screenLampX - 12, groundY - 80, 24, 15);

        // Light glow
        const lightGlow = ctx.createRadialGradient(
          screenLampX, groundY - 72, 0,
          screenLampX, groundY - 50, 40
        );
        lightGlow.addColorStop(0, `rgba(255, 200, 100, ${0.4 + Math.sin(time * 4 + lampX) * 0.1})`);
        lightGlow.addColorStop(1, "transparent");
        ctx.fillStyle = lightGlow;
        ctx.beginPath();
        ctx.ellipse(screenLampX, groundY - 50, 35, 45, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Trees/decorations
      const treePositions = [200, 600, 920, 1250, 1550, 1850, 2050];
      for (const treeX of treePositions) {
        const screenTreeX = treeX - cameraX;
        if (screenTreeX < -40 || screenTreeX > viewportWidth + 40) continue;

        // Trunk
        ctx.fillStyle = "#5c4033";
        ctx.fillRect(screenTreeX - 6, groundY - 50, 12, 50);

        // Leaves (oval)
        ctx.fillStyle = "#22c55e";
        ctx.beginPath();
        ctx.ellipse(screenTreeX, groundY - 70, 20, 35, 0, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = "#4ade80";
        ctx.beginPath();
        ctx.ellipse(screenTreeX - 5, groundY - 80, 10, 15, -0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Scroll indicators when near edges
      if (cameraX > 20) {
        // Left arrow
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.beginPath();
        ctx.moveTo(30, viewportHeight / 2);
        ctx.lineTo(50, viewportHeight / 2 - 20);
        ctx.lineTo(50, viewportHeight / 2 + 20);
        ctx.closePath();
        ctx.fill();
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("◀", 40, viewportHeight / 2 + 35);
      }

      if (cameraX < WORLD_WIDTH - viewportWidth - 20) {
        // Right arrow
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.beginPath();
        ctx.moveTo(viewportWidth - 30, viewportHeight / 2);
        ctx.lineTo(viewportWidth - 50, viewportHeight / 2 - 20);
        ctx.lineTo(viewportWidth - 50, viewportHeight / 2 + 20);
        ctx.closePath();
        ctx.fill();
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("▶", viewportWidth - 40, viewportHeight / 2 + 35);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [viewportWidth, viewportHeight, cameraX, groundY]);

  return (
    <canvas
      ref={canvasRef}
      width={viewportWidth}
      height={viewportHeight}
      className="absolute inset-0"
      style={{ imageRendering: "pixelated", cursor: "pointer" }}
      onClick={handleClick}
    />
  );
}

export { WORLD_WIDTH, GROUND_Y_PERCENT, BUILDINGS };

import { useEffect, useRef } from "react";

interface WaterBackgroundProps {
  width: number;
  height: number;
}

export function WaterBackground({ width, height }: WaterBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const draw = () => {
      time += 0.015;
      
      // === CAVE BACKGROUND ===
      // Dark rocky gradient
      const caveGradient = ctx.createLinearGradient(0, 0, 0, height);
      caveGradient.addColorStop(0, "hsl(220, 30%, 6%)");
      caveGradient.addColorStop(0.3, "hsl(220, 25%, 10%)");
      caveGradient.addColorStop(0.7, "hsl(210, 20%, 8%)");
      caveGradient.addColorStop(1, "hsl(200, 30%, 5%)");
      ctx.fillStyle = caveGradient;
      ctx.fillRect(0, 0, width, height);

      // === CAVE WALLS (rocky textures) ===
      ctx.fillStyle = "hsla(220, 20%, 12%, 0.8)";
      
      // Left cave wall
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(60, 0);
      ctx.lineTo(80, 50);
      ctx.lineTo(50, 120);
      ctx.lineTo(70, 200);
      ctx.lineTo(40, 280);
      ctx.lineTo(60, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // Right cave wall
      ctx.beginPath();
      ctx.moveTo(width, 0);
      ctx.lineTo(width - 50, 0);
      ctx.lineTo(width - 70, 60);
      ctx.lineTo(width - 45, 140);
      ctx.lineTo(width - 65, 220);
      ctx.lineTo(width - 50, 300);
      ctx.lineTo(width - 60, height);
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // Top cave ceiling with stalactites
      ctx.fillStyle = "hsla(220, 25%, 8%, 0.9)";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(width, 0);
      ctx.lineTo(width, 40);
      for (let x = width - 30; x > 30; x -= 40) {
        const stalHeight = 20 + Math.sin(x * 0.1) * 15;
        ctx.lineTo(x + 20, 35);
        ctx.lineTo(x, 35 + stalHeight);
        ctx.lineTo(x - 20, 35);
      }
      ctx.lineTo(0, 40);
      ctx.closePath();
      ctx.fill();

      // === WATERFALL (right side) ===
      const waterfallX = width - 100;
      const waterfallWidth = 35;
      
      // Waterfall glow
      const waterfallGlow = ctx.createRadialGradient(
        waterfallX + waterfallWidth/2, height/2, 10,
        waterfallX + waterfallWidth/2, height/2, 80
      );
      waterfallGlow.addColorStop(0, "hsla(190, 80%, 50%, 0.15)");
      waterfallGlow.addColorStop(1, "transparent");
      ctx.fillStyle = waterfallGlow;
      ctx.fillRect(waterfallX - 40, 40, waterfallWidth + 80, height - 40);

      // Waterfall streams
      for (let i = 0; i < 4; i++) {
        const streamX = waterfallX + i * 10;
        const offset = Math.sin(time * 3 + i) * 2;
        
        ctx.strokeStyle = `hsla(190, 70%, ${65 + i * 5}%, ${0.4 - i * 0.08})`;
        ctx.lineWidth = 6 - i;
        ctx.beginPath();
        
        for (let y = 50; y < height - 80; y += 8) {
          const waveX = streamX + offset + Math.sin((y + time * 100) * 0.05) * 3;
          if (y === 50) {
            ctx.moveTo(waveX, y);
          } else {
            ctx.lineTo(waveX, y);
          }
        }
        ctx.stroke();
      }

      // Waterfall splash at bottom
      for (let i = 0; i < 8; i++) {
        const splashX = waterfallX + waterfallWidth/2 + Math.sin(time * 4 + i * 0.8) * 25;
        const splashY = height - 85 + Math.abs(Math.sin(time * 5 + i)) * 15;
        const splashSize = 3 + Math.sin(time * 3 + i) * 2;
        
        ctx.fillStyle = `hsla(190, 80%, 70%, ${0.3 + Math.sin(time + i) * 0.15})`;
        ctx.beginPath();
        ctx.arc(splashX, splashY, splashSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // === CENTRAL LAKE ===
      const lakeX = width / 2;
      const lakeY = height - 60;
      const lakeRadiusX = 200;
      const lakeRadiusY = 50;

      // Lake water gradient
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
      ctx.strokeStyle = "hsla(185, 80%, 55%, 0.2)";
      ctx.lineWidth = 1.5;
      for (let r = 0; r < 4; r++) {
        const rippleRadius = 40 + r * 45 + Math.sin(time * 2 + r) * 8;
        const rippleY = lakeRadiusY * (rippleRadius / lakeRadiusX);
        ctx.beginPath();
        ctx.ellipse(lakeX, lakeY, Math.min(rippleRadius, lakeRadiusX - 10), Math.min(rippleY, lakeRadiusY - 5), 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Lake shine/reflection
      const shineGradient = ctx.createLinearGradient(lakeX - 80, lakeY - 30, lakeX + 80, lakeY - 10);
      shineGradient.addColorStop(0, "transparent");
      shineGradient.addColorStop(0.5, "hsla(185, 100%, 80%, 0.15)");
      shineGradient.addColorStop(1, "transparent");
      ctx.fillStyle = shineGradient;
      ctx.beginPath();
      ctx.ellipse(lakeX, lakeY - 15, 100, 15, 0, 0, Math.PI * 2);
      ctx.fill();

      // === FLOATING PARTICLES (magical cave dust) ===
      for (let i = 0; i < 25; i++) {
        const px = (i * 97 + Math.sin(time * 0.3 + i * 0.7) * 40) % (width - 100) + 50;
        const py = (i * 43 + Math.cos(time * 0.2 + i * 0.5) * 30) % (height - 120) + 60;
        const particleSize = 2 + Math.sin(time + i) * 1;
        const alpha = 0.3 + Math.sin(time * 2 + i) * 0.2;
        
        const particleGlow = ctx.createRadialGradient(px, py, 0, px, py, particleSize * 3);
        particleGlow.addColorStop(0, `hsla(185, 100%, 70%, ${alpha})`);
        particleGlow.addColorStop(1, "transparent");
        ctx.fillStyle = particleGlow;
        ctx.beginPath();
        ctx.arc(px, py, particleSize * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // === AMBIENT BUBBLES (rising from lake) ===
      for (let i = 0; i < 12; i++) {
        const bubbleX = lakeX - 150 + (i * 30);
        const bubbleProgress = ((time * 20 + i * 50) % 150);
        const bubbleY = lakeY - bubbleProgress;
        const bubbleSize = 2 + Math.sin(i) * 1.5;
        const bubbleAlpha = Math.max(0, 0.4 - bubbleProgress / 200);
        
        if (bubbleY > 60) {
          ctx.fillStyle = `hsla(190, 70%, 65%, ${bubbleAlpha})`;
          ctx.beginPath();
          ctx.arc(bubbleX + Math.sin(time + i) * 5, bubbleY, bubbleSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // === CAVE EDGE VIGNETTE ===
      const vignette = ctx.createRadialGradient(
        width / 2, height / 2, Math.min(width, height) * 0.25,
        width / 2, height / 2, Math.max(width, height) * 0.65
      );
      vignette.addColorStop(0, "transparent");
      vignette.addColorStop(1, "hsla(220, 40%, 3%, 0.7)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      // === ROCK DETAILS ===
      // Small rocks at bottom
      ctx.fillStyle = "hsla(220, 20%, 15%, 0.9)";
      const rocks = [
        { x: 80, y: height - 30, rx: 25, ry: 12 },
        { x: 150, y: height - 25, rx: 18, ry: 10 },
        { x: width - 150, y: height - 28, rx: 22, ry: 11 },
        { x: width - 80, y: height - 22, rx: 15, ry: 8 },
      ];
      rocks.forEach(rock => {
        ctx.beginPath();
        ctx.ellipse(rock.x, rock.y, rock.rx, rock.ry, 0, 0, Math.PI * 2);
        ctx.fill();
      });

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
      style={{ imageRendering: "auto" }}
    />
  );
}

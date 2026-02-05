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
      time += 0.02;
      
      // Dark water gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "hsl(200, 60%, 8%)");
      gradient.addColorStop(0.5, "hsl(200, 50%, 12%)");
      gradient.addColorStop(1, "hsl(200, 40%, 6%)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Animated water waves (horizontal lines)
      ctx.strokeStyle = "hsla(185, 80%, 50%, 0.08)";
      ctx.lineWidth = 2;
      
      for (let y = 30; y < height; y += 40) {
        ctx.beginPath();
        for (let x = 0; x <= width; x += 10) {
          const waveY = y + Math.sin((x + time * 50) * 0.02) * 6 + Math.sin((x + time * 30) * 0.03) * 4;
          if (x === 0) {
            ctx.moveTo(x, waveY);
          } else {
            ctx.lineTo(x, waveY);
          }
        }
        ctx.stroke();
      }

      // Bubbles
      ctx.fillStyle = "hsla(185, 80%, 60%, 0.15)";
      for (let i = 0; i < 20; i++) {
        const bubbleX = ((i * 47 + time * 20) % width);
        const bubbleY = height - ((i * 31 + time * 30) % height);
        const size = 3 + Math.sin(time + i) * 2;
        ctx.beginPath();
        ctx.arc(bubbleX, bubbleY, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Glowing particles (cyan accents)
      for (let i = 0; i < 15; i++) {
        const px = (i * 73 + Math.sin(time * 0.5 + i) * 30) % width;
        const py = (i * 53 + Math.cos(time * 0.3 + i) * 20) % height;
        const glow = ctx.createRadialGradient(px, py, 0, px, py, 8);
        glow.addColorStop(0, "hsla(185, 100%, 70%, 0.4)");
        glow.addColorStop(1, "hsla(185, 100%, 50%, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Cave edges (dark vignette)
      const vignette = ctx.createRadialGradient(
        width / 2, height / 2, Math.min(width, height) * 0.3,
        width / 2, height / 2, Math.max(width, height) * 0.7
      );
      vignette.addColorStop(0, "transparent");
      vignette.addColorStop(1, "hsla(220, 50%, 5%, 0.6)");
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
      style={{ imageRendering: "auto" }}
    />
  );
}

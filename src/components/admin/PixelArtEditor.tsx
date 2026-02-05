 import { useState, useCallback } from "react";
 import { Button } from "@/components/ui/button";
 import { Label } from "@/components/ui/label";
 import { Input } from "@/components/ui/input";
 import { Eraser, Paintbrush, RotateCcw, Download } from "lucide-react";
 
 interface PixelArtEditorProps {
   width?: number;
   height?: number;
   initialData?: string;
   onSave: (svgData: string) => void;
 }
 
 const PRESET_COLORS = [
   "#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF",
   "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500", "#800080",
   "#FFD700", "#C0C0C0", "#8B4513", "#FFC0CB", "#90EE90",
   "#ADD8E6", "#F5DEB3", "#DDA0DD", "#98FB98", "#87CEEB",
   "#FFB6C1", "#E6E6FA", "#FFDAB9", "#D2691E", "#4B0082",
 ];
 
 export function PixelArtEditor({ 
   width = 16, 
   height = 24, 
   initialData,
   onSave 
 }: PixelArtEditorProps) {
   const [pixels, setPixels] = useState<(string | null)[][]>(() => {
     if (initialData) {
       try {
         return JSON.parse(initialData);
       } catch {
         return Array(height).fill(null).map(() => Array(width).fill(null));
       }
     }
     return Array(height).fill(null).map(() => Array(width).fill(null));
   });
   
   const [currentColor, setCurrentColor] = useState("#FFD700");
   const [isErasing, setIsErasing] = useState(false);
   const [isDrawing, setIsDrawing] = useState(false);
   const [customColor, setCustomColor] = useState("#FFD700");
 
   const pixelSize = 12;
 
   const handlePixelClick = useCallback((row: number, col: number) => {
     setPixels(prev => {
       const newPixels = prev.map(r => [...r]);
       newPixels[row][col] = isErasing ? null : currentColor;
       return newPixels;
     });
   }, [currentColor, isErasing]);
 
   const handleMouseDown = (row: number, col: number) => {
     setIsDrawing(true);
     handlePixelClick(row, col);
   };
 
   const handleMouseEnter = (row: number, col: number) => {
     if (isDrawing) {
       handlePixelClick(row, col);
     }
   };
 
   const handleMouseUp = () => {
     setIsDrawing(false);
   };
 
   const clearCanvas = () => {
     setPixels(Array(height).fill(null).map(() => Array(width).fill(null)));
   };
 
   const generateSVG = (): string => {
     let paths = "";
     for (let row = 0; row < height; row++) {
       for (let col = 0; col < width; col++) {
         const color = pixels[row][col];
         if (color) {
           paths += `<rect x="${col}" y="${row}" width="1" height="1" fill="${color}"/>`;
         }
       }
     }
     return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">${paths}</svg>`;
   };
 
   const handleSave = () => {
     const pixelData = JSON.stringify(pixels);
     onSave(pixelData);
   };
 
   const downloadSVG = () => {
     const svg = generateSVG();
     const blob = new Blob([svg], { type: "image/svg+xml" });
     const url = URL.createObjectURL(blob);
     const a = document.createElement("a");
     a.href = url;
     a.download = "pixel-art.svg";
     a.click();
     URL.revokeObjectURL(url);
   };
 
   return (
     <div className="space-y-4" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
       {/* Tools */}
       <div className="flex items-center gap-2 flex-wrap">
         <Button
           size="sm"
           variant={!isErasing ? "default" : "outline"}
           onClick={() => setIsErasing(false)}
         >
           <Paintbrush className="w-4 h-4 mr-1" />
           Pincel
         </Button>
         <Button
           size="sm"
           variant={isErasing ? "default" : "outline"}
           onClick={() => setIsErasing(true)}
         >
           <Eraser className="w-4 h-4 mr-1" />
           Borracha
         </Button>
         <Button size="sm" variant="outline" onClick={clearCanvas}>
           <RotateCcw className="w-4 h-4 mr-1" />
           Limpar
         </Button>
         <Button size="sm" variant="outline" onClick={downloadSVG}>
           <Download className="w-4 h-4 mr-1" />
           SVG
         </Button>
       </div>
 
       {/* Color Palette */}
       <div className="space-y-2">
         <Label className="text-xs">Cor Selecionada</Label>
         <div className="flex items-center gap-2 flex-wrap">
           {PRESET_COLORS.map((color) => (
             <button
               key={color}
               className={`w-6 h-6 rounded border-2 transition-transform hover:scale-110 ${
                 currentColor === color && !isErasing ? "border-primary ring-2 ring-primary/50" : "border-border"
               }`}
               style={{ backgroundColor: color }}
               onClick={() => {
                 setCurrentColor(color);
                 setIsErasing(false);
               }}
             />
           ))}
           <Input
             type="color"
             value={customColor}
             onChange={(e) => {
               setCustomColor(e.target.value);
               setCurrentColor(e.target.value);
               setIsErasing(false);
             }}
             className="w-8 h-8 p-0 border-2 cursor-pointer"
           />
         </div>
       </div>
 
       {/* Canvas */}
       <div className="flex gap-4">
         <div 
           className="border border-border rounded bg-muted/30 p-2 select-none"
           style={{ 
             display: "grid",
             gridTemplateColumns: `repeat(${width}, ${pixelSize}px)`,
             gap: "1px",
           }}
         >
           {pixels.map((row, rowIndex) =>
             row.map((color, colIndex) => (
               <div
                 key={`${rowIndex}-${colIndex}`}
                 className="cursor-crosshair hover:opacity-70 transition-opacity"
                 style={{
                   width: pixelSize,
                   height: pixelSize,
                   backgroundColor: color || "transparent",
                   border: color ? "none" : "1px dashed hsl(var(--border))",
                 }}
                 onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                 onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
               />
             ))
           )}
         </div>
 
         {/* Preview */}
         <div className="space-y-2">
           <Label className="text-xs">Preview (2x)</Label>
           <div 
             className="border border-border rounded bg-card p-2"
             style={{ width: width * 2 + 16, height: height * 2 + 16 }}
           >
             <svg 
               viewBox={`0 0 ${width} ${height}`}
               style={{ width: width * 2, height: height * 2 }}
             >
               {pixels.map((row, rowIndex) =>
                 row.map((color, colIndex) =>
                   color ? (
                     <rect
                       key={`${rowIndex}-${colIndex}`}
                       x={colIndex}
                       y={rowIndex}
                       width={1}
                       height={1}
                       fill={color}
                     />
                   ) : null
                 )
               )}
             </svg>
           </div>
         </div>
       </div>
 
       {/* Save Button */}
       <Button onClick={handleSave} className="w-full">
         Salvar Pixel Art
       </Button>
     </div>
   );
 }
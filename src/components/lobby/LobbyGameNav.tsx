import { motion } from "framer-motion";
import { 
  Hammer, 
  ShoppingBag, 
  Skull, 
  Swords, 
  Backpack,
  Users,
  Pickaxe
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavPoint {
  id: string;
  label: string;
  icon: React.ReactNode;
  x: number; // percentage
  y: number; // percentage
  color: string;
  route?: string;
  action?: () => void;
}

interface LobbyGameNavProps {
  onNavigate: (route: string) => void;
  lobbyWidth: number;
  lobbyHeight: number;
}

export function LobbyGameNav({ onNavigate, lobbyWidth, lobbyHeight }: LobbyGameNavProps) {
  const navPoints: NavPoint[] = [
    {
      id: "crafting",
      label: "Forja",
      icon: <Hammer className="w-5 h-5" />,
      x: 8,
      y: 65,
      color: "from-orange-500 to-amber-600",
      route: "crafting",
    },
    {
      id: "shop",
      label: "Loja",
      icon: <ShoppingBag className="w-5 h-5" />,
      x: 15,
      y: 25,
      color: "from-emerald-500 to-green-600",
      route: "shop",
    },
    {
      id: "dungeon",
      label: "Masmorra",
      icon: <Skull className="w-5 h-5" />,
      x: 85,
      y: 30,
      color: "from-purple-500 to-violet-700",
      route: "dungeons",
    },
    {
      id: "arena",
      label: "Arena",
      icon: <Swords className="w-5 h-5" />,
      x: 88,
      y: 70,
      color: "from-red-500 to-rose-600",
      route: "arena",
    },
    {
      id: "mining",
      label: "Mina",
      icon: <Pickaxe className="w-5 h-5" />,
      x: 50,
      y: 15,
      color: "from-stone-400 to-stone-600",
      route: "mining",
    },
    {
      id: "inventory",
      label: "Inventário",
      icon: <Backpack className="w-5 h-5" />,
      x: 50,
      y: 85,
      color: "from-blue-500 to-indigo-600",
      route: "inventory",
    },
    {
      id: "guild",
      label: "Guilda",
      icon: <Users className="w-5 h-5" />,
      x: 75,
      y: 85,
      color: "from-cyan-500 to-teal-600",
      route: "guild",
    },
  ];

  return (
    <>
      {navPoints.map((point, index) => (
        <motion.button
          key={point.id}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.1, type: "spring" }}
          onClick={(e) => {
            e.stopPropagation();
            if (point.route) onNavigate(point.route);
            if (point.action) point.action();
          }}
          className={cn(
            "absolute z-20 flex flex-col items-center gap-1 group cursor-pointer",
            "transform -translate-x-1/2 -translate-y-1/2"
          )}
          style={{
            left: `${point.x}%`,
            top: `${point.y}%`,
          }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Glow effect */}
          <div className={cn(
            "absolute inset-0 rounded-full blur-xl opacity-50 group-hover:opacity-80 transition-opacity",
            `bg-gradient-to-br ${point.color}`
          )} 
          style={{ width: 48, height: 48, left: -8, top: -8 }}
          />
          
          {/* Icon container */}
          <div className={cn(
            "relative w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center",
            "border-2 border-white/30 shadow-lg",
            `bg-gradient-to-br ${point.color}`,
            "text-white"
          )}>
            {point.icon}
          </div>
          
          {/* Label */}
          <span className="text-[10px] sm:text-xs font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] whitespace-nowrap">
            {point.label}
          </span>
        </motion.button>
      ))}
    </>
  );
}

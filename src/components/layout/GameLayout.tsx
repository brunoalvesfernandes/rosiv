import { cn } from "@/lib/utils";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Swords, 
  User, 
  Target, 
  Dumbbell, 
  Trophy, 
  LogOut,
  Shield,
  Coins,
  Menu,
  X,
  Loader2,
  Store,
  Package
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCharacter } from "@/hooks/useCharacter";
import { toast } from "sonner";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

import { Users } from "lucide-react";

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Shield },
  { label: "Personagem", href: "/character", icon: User },
  { label: "Missões", href: "/missions", icon: Target },
  { label: "Treino", href: "/training", icon: Dumbbell },
  { label: "Arena", href: "/arena", icon: Swords },
  { label: "Guildas", href: "/guilds", icon: Users },
  { label: "Loja", href: "/shop", icon: Store },
  { label: "Inventário", href: "/inventory", icon: Package },
  { label: "Ranking", href: "/ranking", icon: Trophy },
];

interface GameLayoutProps {
  children: React.ReactNode;
}

export function GameLayout({ children }: GameLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { data: character, isLoading } = useCharacter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    toast.success("Até logo, guerreiro!");
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const playerName = character?.name || "Guerreiro";
  const playerLevel = character?.level || 1;
  const playerGold = character?.gold || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Swords className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold hidden sm:block">
              Realm of Shadows
            </span>
          </Link>

          {/* Player Info (Desktop) */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm">
              <Coins className="w-4 h-4 text-gold" />
              <span className="font-bold text-gold">{playerGold.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                {playerName.charAt(0)}
              </div>
              <div className="text-sm">
                <p className="font-medium">{playerName}</p>
                <p className="text-xs text-muted-foreground">Nível {playerLevel}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-primary"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card p-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center font-bold text-primary-foreground">
                {playerName.charAt(0)}
              </div>
              <div>
                <p className="font-medium">{playerName}</p>
                <p className="text-xs text-muted-foreground">Nível {playerLevel}</p>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <Coins className="w-4 h-4 text-gold" />
                <span className="font-bold text-gold">{playerGold.toLocaleString()}</span>
              </div>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    location.pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-secondary w-full"
              >
                <LogOut className="w-5 h-5" />
                Sair
              </button>
            </nav>
          </div>
        )}
      </header>

      <div className="flex">
        {/* Sidebar (Desktop) */}
        <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card min-h-[calc(100vh-4rem)] p-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  location.pathname === item.href
                    ? "bg-primary text-primary-foreground shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

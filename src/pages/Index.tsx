import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Swords, Shield, Target, Trophy, Users, Zap, ChevronRight } from "lucide-react";

const features = [
  {
    icon: Swords,
    title: "Combate Épico",
    description: "Lute contra monstros e outros jogadores em batalhas intensas",
  },
  {
    icon: Target,
    title: "Missões",
    description: "Complete missões para ganhar experiência e recompensas",
  },
  {
    icon: Zap,
    title: "Treinamento",
    description: "Treine seus atributos e fique mais forte a cada dia",
  },
  {
    icon: Trophy,
    title: "Ranking",
    description: "Suba no ranking e prove que você é o melhor caçador",
  },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center">
        {/* Background Effects - Solo Leveling Style */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Main blue glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[150px]" />
          {/* Purple accent */}
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-accent/15 rounded-full blur-[120px]" />
          {/* Dark overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
          {/* Grid pattern overlay */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(hsl(200 100% 50% / 0.3) 1px, transparent 1px),
                               linear-gradient(90deg, hsl(200 100% 50% / 0.3) 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* System Icon */}
            <div className="relative w-28 h-28 mx-auto mb-8">
              <div className="absolute inset-0 rounded-lg bg-gradient-primary animate-pulse-glow" />
              <div className="relative w-full h-full rounded-lg bg-card border border-primary/50 flex items-center justify-center system-border">
                <Swords className="w-14 h-14 text-primary animate-glow-pulse" />
              </div>
            </div>

            {/* System notification style */}
            <div className="inline-block mb-6 px-4 py-1 rounded border border-primary/30 bg-primary/5 text-primary text-sm font-display tracking-wider uppercase animate-system-flicker">
              ⟨ SYSTEM ONLINE ⟩
            </div>

            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-foreground mb-6 tracking-tight">
              SOLO{" "}
              <span className="text-transparent bg-clip-text bg-gradient-primary">
                HUNTER
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Você foi escolhido pelo Sistema. Complete dungeons, derrote monstros 
              e suba de nível para se tornar o <span className="text-primary">Caçador mais forte</span> de todos.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gap-2 px-8 text-lg font-display tracking-wide system-border hover:shadow-[0_0_30px_hsl(200_100%_50%/0.4)] transition-all duration-300">
                <Link to="/register">
                  <Shield className="w-5 h-5" />
                  DESPERTAR
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2 px-8 text-lg font-display tracking-wide border-accent/50 hover:border-accent hover:bg-accent/10 transition-all duration-300">
                <Link to="/login">
                  Entrar no Sistema
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-6 h-10 rounded-full border-2 border-primary/50 flex justify-center pt-2">
            <div className="w-1 h-2 bg-primary rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative py-24 bg-card/30">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 mb-4 text-xs font-display tracking-widest uppercase text-primary border border-primary/30 rounded">
              Habilidades do Sistema
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold">
              FUNCIONALIDADES
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={feature.title}
                  className="group relative bg-card/80 backdrop-blur border border-border hover:border-primary/50 rounded-sm p-6 transition-all duration-300 hover:shadow-[0_0_30px_hsl(200_100%_50%/0.15)]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary/50" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary/50" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary/50" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary/50" />
                  
                  <div className="w-14 h-14 rounded-sm bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2 tracking-wide">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3 text-center">
            <div className="group">
              <p className="font-display text-5xl md:text-6xl font-bold text-primary group-hover:animate-pulse-glow transition-all">1,000+</p>
              <p className="text-muted-foreground mt-2 font-display tracking-wide">Caçadores Ativos</p>
            </div>
            <div className="group">
              <p className="font-display text-5xl md:text-6xl font-bold text-gold group-hover:animate-pulse-glow transition-all">50+</p>
              <p className="text-muted-foreground mt-2 font-display tracking-wide">Dungeons</p>
            </div>
            <div className="group">
              <p className="font-display text-5xl md:text-6xl font-bold text-accent group-hover:animate-pulse-glow transition-all">∞</p>
              <p className="text-muted-foreground mt-2 font-display tracking-wide">Possibilidades</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-24 overflow-hidden">
        {/* Background effect */}
        <div className="absolute inset-0 bg-gradient-system opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(240_20%_4%)_70%)]" />
        
        <div className="container mx-auto px-4 text-center relative">
          <div className="inline-block px-3 py-1 mb-6 text-xs font-display tracking-widest uppercase text-foreground/80 border border-foreground/30 rounded">
            Alerta do Sistema
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            VOCÊ FOI ESCOLHIDO
          </h2>
          <p className="text-foreground/80 mb-10 max-w-xl mx-auto text-lg">
            Aceite o poder do Sistema e comece sua jornada para se tornar o Caçador Supremo
          </p>
          <Button asChild size="lg" variant="secondary" className="gap-2 px-10 text-lg font-display tracking-wide bg-foreground text-background hover:bg-foreground/90">
            <Link to="/register">
              <Users className="w-5 h-5" />
              ACEITAR DESPERTAR
            </Link>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-card/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="font-display tracking-wide">© 2026 Solo Hunter. Sistema Ativo.</p>
        </div>
      </footer>
    </div>
  );
}

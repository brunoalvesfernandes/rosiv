import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Swords, Shield, Target, Trophy, Users, Zap } from "lucide-react";

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
    description: "Suba no ranking e prove que você é o melhor guerreiro",
  },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gold/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo */}
            <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-primary flex items-center justify-center shadow-[0_0_50px_hsl(var(--primary)/0.5)] mb-8 animate-float">
              <Swords className="w-12 h-12 text-primary-foreground" />
            </div>

            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6">
              Realm of{" "}
              <span className="text-primary">Shadows</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Entre em um mundo de fantasia sombria. Crie seu personagem, complete missões, 
              treine seus atributos e lute para se tornar o guerreiro mais poderoso do reino.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gap-2 px-8">
                <Link to="/register">
                  <Shield className="w-5 h-5" />
                  Criar Personagem
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2 px-8">
                <Link to="/login">
                  Entrar
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
            Recursos do Jogo
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={feature.title}
                  className="bg-card border border-border rounded-xl p-6 text-center hover:border-primary/50 hover:shadow-[0_0_30px_hsl(var(--primary)/0.1)] transition-all duration-300"
                >
                  <div className="w-14 h-14 mx-auto rounded-xl bg-secondary flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3 text-center">
            <div>
              <p className="font-display text-4xl md:text-5xl font-bold text-primary">1,000+</p>
              <p className="text-muted-foreground mt-2">Guerreiros Ativos</p>
            </div>
            <div>
              <p className="font-display text-4xl md:text-5xl font-bold text-gold">50+</p>
              <p className="text-muted-foreground mt-2">Missões Únicas</p>
            </div>
            <div>
              <p className="font-display text-4xl md:text-5xl font-bold text-xp">∞</p>
              <p className="text-muted-foreground mt-2">Aventuras</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Pronto para a Batalha?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Crie sua conta agora e comece sua jornada para se tornar uma lenda
          </p>
          <Button asChild size="lg" variant="secondary" className="gap-2 px-8">
            <Link to="/register">
              <Users className="w-5 h-5" />
              Começar Agora
            </Link>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 Realm of Shadows. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

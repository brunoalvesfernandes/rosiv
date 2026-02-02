import { useState, useEffect } from "react";
import { GameLayout } from "@/components/layout/GameLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Swords, Shield, Target, Trophy, Loader2, Clock, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMyGuild, useGuilds, useGuildMembers } from "@/hooks/useGuilds";
import { useActiveWars, useMyGuildWar, useWarBattles, useDeclareWar, useWarAttack, GuildWar } from "@/hooks/useGuildWars";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { playGuildWarBgm, stopBgm } from "@/utils/gameAudio";

export default function GuildWars() {
  const { user } = useAuth();
  const { data: myGuildData } = useMyGuild();
  const myGuild = myGuildData?.guilds as { id: string; name: string } | undefined;
  const isLeader = myGuildData?.role === "leader";

  const { data: activeWars, isLoading: warsLoading } = useActiveWars();
  const { data: myWar } = useMyGuildWar(myGuild?.id);
  const { data: warBattles } = useWarBattles(myWar?.id);
  const { data: allGuilds } = useGuilds();
  const { data: enemyMembers } = useGuildMembers(
    myWar
      ? myWar.attacker_guild_id === myGuild?.id
        ? myWar.defender_guild_id
        : myWar.attacker_guild_id
      : undefined
  );

  const declareWar = useDeclareWar();
  const warAttack = useWarAttack();

  const [declareDialogOpen, setDeclareDialogOpen] = useState(false);

  // Play guild war background music
  useEffect(() => {
    playGuildWarBgm();
    return () => stopBgm();
  }, []);

  // Filter guilds that can be attacked
  const availableTargets = allGuilds?.filter(
    (g) =>
      g.id !== myGuild?.id &&
      !activeWars?.some(
        (w) => w.attacker_guild_id === g.id || w.defender_guild_id === g.id
      )
  );

  const handleDeclareWar = (targetGuildId: string) => {
    if (!myGuild) return;
    declareWar.mutate(
      { attackerGuildId: myGuild.id, defenderGuildId: targetGuildId },
      { onSuccess: () => setDeclareDialogOpen(false) }
    );
  };

  const isAttacker = myWar?.attacker_guild_id === myGuild?.id;
  const myScore = isAttacker ? myWar?.attacker_score : myWar?.defender_score;
  const enemyScore = isAttacker ? myWar?.defender_score : myWar?.attacker_score;
  const enemyGuildName = isAttacker
    ? myWar?.defender_guild_name
    : myWar?.attacker_guild_name;

  return (
    <GameLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Swords className="w-8 h-8 text-destructive" />
              Guerras de Guildas
            </h1>
            <p className="text-muted-foreground">Batalhe pela glória de sua guilda</p>
          </div>

          {myGuild && !myWar && isLeader && (
            <Dialog open={declareDialogOpen} onOpenChange={setDeclareDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Swords className="w-4 h-4" />
                  Declarar Guerra
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Escolha um Alvo</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[400px]">
                  <div className="space-y-2">
                    {availableTargets?.map((guild) => (
                      <div
                        key={guild.id}
                        className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{guild.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Nível {guild.level} • {guild.member_count} membros
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeclareWar(guild.id)}
                          disabled={declareWar.isPending}
                        >
                          Atacar
                        </Button>
                      </div>
                    ))}
                    {availableTargets?.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">
                        Nenhuma guilda disponível para atacar
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {!myGuild && (
          <Card className="bg-card/50 backdrop-blur border-primary/20">
            <CardContent className="py-12 text-center">
              <Shield className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Entre em uma guilda para participar de guerras</p>
            </CardContent>
          </Card>
        )}

        {myGuild && myWar && (
          <Card className="bg-destructive/10 border-destructive/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Swords className="w-5 h-5" />
                Guerra em Andamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <p className="font-bold text-lg">{myGuild.name}</p>
                  <p className="text-3xl font-bold text-primary">{myScore || 0}</p>
                  <Badge variant="secondary">
                    {isAttacker ? "Atacante" : "Defensor"}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-muted-foreground">VS</div>
                <div className="text-center flex-1">
                  <p className="font-bold text-lg">{enemyGuildName}</p>
                  <p className="text-3xl font-bold text-destructive">{enemyScore || 0}</p>
                  <Badge variant="outline">
                    {isAttacker ? "Defensor" : "Atacante"}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                Termina {formatDistanceToNow(new Date(myWar.ends_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </div>

              <div className="flex items-center justify-center gap-2">
                <Trophy className="w-4 h-4 text-gold" />
                <span className="text-sm">
                  Recompensa: {myWar.gold_reward} ouro + {myWar.xp_reward} XP
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {myGuild && myWar && (
          <Tabs defaultValue="attack" className="space-y-4">
            <TabsList>
              <TabsTrigger value="attack">Atacar</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
            </TabsList>

            <TabsContent value="attack">
              <Card className="bg-card/50 backdrop-blur border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-destructive" />
                    Membros Inimigos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {enemyMembers?.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                            <Users className="w-5 h-5 text-destructive" />
                          </div>
                          <div>
                            <p className="font-medium">{member.character_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Nível {member.character_level}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            warAttack.mutate({
                              warId: myWar.id,
                              defenderId: member.user_id,
                              myGuildId: myGuild.id,
                              isAttacker,
                            })
                          }
                          disabled={warAttack.isPending}
                        >
                          <Swords className="w-4 h-4 mr-1" />
                          Atacar
                        </Button>
                      </div>
                    ))}
                    {(!enemyMembers || enemyMembers.length === 0) && (
                      <p className="text-center text-muted-foreground py-4">
                        Nenhum inimigo disponível
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card className="bg-card/50 backdrop-blur border-primary/20">
                <CardHeader>
                  <CardTitle>Batalhas Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {warBattles?.map((battle) => {
                        const won = battle.winner_id === battle.attacker_id;
                        return (
                          <div
                            key={battle.id}
                            className={`p-3 rounded-lg ${
                              won ? "bg-primary/10" : "bg-destructive/10"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{battle.attacker_name}</span>
                              <span className="text-sm text-muted-foreground">VS</span>
                              <span className="font-medium">{battle.defender_name}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm mt-1">
                              <span className={won ? "text-primary" : "text-muted-foreground"}>
                                {battle.attacker_damage} dano
                              </span>
                              <Badge variant={won ? "default" : "destructive"}>
                                {won ? "Vitória" : "Derrota"}
                              </Badge>
                              <span className={!won ? "text-destructive" : "text-muted-foreground"}>
                                {battle.defender_damage} dano
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      {(!warBattles || warBattles.length === 0) && (
                        <p className="text-center text-muted-foreground py-4">
                          Nenhuma batalha ainda
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* All Active Wars */}
        <Card className="bg-card/50 backdrop-blur border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-primary" />
              Guerras Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {warsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : activeWars && activeWars.length > 0 ? (
              <div className="space-y-2">
                {activeWars.map((war) => (
                  <div
                    key={war.id}
                    className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                  >
                    <div className="flex-1">
                      <span className="font-medium">{war.attacker_guild_name}</span>
                      <span className="text-primary font-bold mx-2">
                        {war.attacker_score}
                      </span>
                    </div>
                    <span className="text-muted-foreground">VS</span>
                    <div className="flex-1 text-right">
                      <span className="text-destructive font-bold mx-2">
                        {war.defender_score}
                      </span>
                      <span className="font-medium">{war.defender_guild_name}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Nenhuma guerra ativa no momento
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </GameLayout>
  );
}

import { useState, useEffect } from "react";
import { GameLayout } from "@/components/layout/GameLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Castle,
  Users,
  Swords,
  Clock,
  Coins,
  Star,
  Play,
  UserPlus,
  LogOut,
  Check,
  Loader2,
  Shield,
  Heart,
} from "lucide-react";
import {
  useDungeons,
  useAvailableRuns,
  useCreateRun,
  useJoinRun,
  useLeaveRun,
  useSetReady,
  useStartRun,
  useAttackBoss,
  Dungeon,
  DungeonRun,
} from "@/hooks/useDungeons";
import { useAuth } from "@/contexts/AuthContext";
import { useCharacter } from "@/hooks/useCharacter";
import { cn } from "@/lib/utils";


function DungeonCard({
  dungeon,
  onCreateRun,
  isCreating,
  characterLevel,
}: {
  dungeon: Dungeon;
  onCreateRun: () => void;
  isCreating: boolean;
  characterLevel: number;
}) {
  const canEnter = characterLevel >= dungeon.min_level;

  return (
    <Card className={cn("bg-card/50 backdrop-blur border-primary/20", !canEnter && "opacity-60")}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{dungeon.icon}</span>
            <CardTitle className="text-lg">{dungeon.name}</CardTitle>
          </div>
          <Badge variant={canEnter ? "default" : "secondary"}>Nv. {dungeon.min_level}+</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{dungeon.description}</p>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-primary" />
            <span>
              {dungeon.min_players}-{dungeon.max_players}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>{dungeon.duration_minutes}min</span>
          </div>
        </div>

        <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-destructive" />
            <span className="font-medium text-destructive">{dungeon.boss_name}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" /> {dungeon.boss_hp} HP
            </span>
            <span className="flex items-center gap-1">
              <Swords className="w-3 h-3" /> {dungeon.boss_strength} ATK
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3" /> {dungeon.boss_defense} DEF
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1 text-primary">
              <Coins className="w-4 h-4" /> {dungeon.gold_reward}
            </span>
            <span className="flex items-center gap-1 text-accent-foreground">
              <Star className="w-4 h-4" /> {dungeon.xp_reward} XP
            </span>
          </div>
          <Button size="sm" onClick={onCreateRun} disabled={!canEnter || isCreating}>
            {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 mr-1" />}
            Criar Grupo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ActiveRunCard({
  run,
  currentUserId,
  onJoin,
  onLeave,
  onSetReady,
  onStart,
  onAttack,
  isJoining,
  isLeaving,
  isStarting,
  isAttacking,
}: {
  run: DungeonRun;
  currentUserId?: string;
  onJoin: () => void;
  onLeave: () => void;
  onSetReady: (ready: boolean) => void;
  onStart: () => void;
  onAttack: () => void;
  isJoining: boolean;
  isLeaving: boolean;
  isStarting: boolean;
  isAttacking: boolean;
}) {
  const dungeon = run.dungeon;
  if (!dungeon) return null;

  const isParticipant = run.participants?.some((p) => p.user_id === currentUserId);
  const myParticipation = run.participants?.find((p) => p.user_id === currentUserId);
  const isCreator = run.created_by === currentUserId;
  const participantCount = run.participants?.length || 0;
  const allReady = (run.participants?.every((p) => p.is_ready) ?? false) && participantCount >= dungeon.min_players;
  const canStart = isCreator && allReady && run.status === "waiting";
  const isActive = run.status === "active";
  const bossHpPercent = (run.current_boss_hp / dungeon.boss_hp) * 100;

  // Debug info
  const readyCount = run.participants?.filter(p => p.is_ready).length || 0;

  return (
    <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{dungeon.icon}</span>
            <div>
              <CardTitle className="text-lg">{dungeon.name}</CardTitle>
              <p className="text-xs text-muted-foreground">vs {dungeon.boss_name}</p>
            </div>
          </div>
          <Badge variant={isActive ? "destructive" : "secondary"}>
            {isActive ? "Em Combate" : "Aguardando"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Boss HP (if active) */}
        {isActive && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1 text-destructive">
                <Heart className="w-4 h-4" /> HP do Boss
              </span>
              <span>
                {run.current_boss_hp} / {dungeon.boss_hp}
              </span>
            </div>
            <Progress value={bossHpPercent} className="h-3" />
          </div>
        )}

        {/* Participants */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-1">
              <Users className="w-4 h-4" /> Participantes
            </span>
            <span className="text-sm text-muted-foreground">
              {readyCount}/{participantCount} prontos • {participantCount}/{dungeon.max_players} jogadores
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {run.participants?.map((p) => (
              <div
                key={p.id}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg text-sm",
                  p.is_ready ? "bg-green-500/10 border border-green-500/20" : "bg-muted/50"
                )}
              >
                {p.is_ready && <Check className="w-3 h-3 text-green-500" />}
                <span className="truncate">{p.character_name}</span>
                {isActive && <span className="ml-auto text-xs text-muted-foreground">{p.damage_dealt} dmg</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-border">
          {!isParticipant && participantCount < dungeon.max_players && !isActive && (
            <Button size="sm" onClick={onJoin} disabled={isJoining} className="flex-1">
              {isJoining ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4 mr-1" />}
              Entrar
            </Button>
          )}

          {isParticipant && !isActive && (
            <>
              <Button
                size="sm"
                variant={myParticipation?.is_ready ? "secondary" : "default"}
                onClick={() => onSetReady(!myParticipation?.is_ready)}
                className="flex-1"
              >
                {myParticipation?.is_ready ? "Cancelar" : "Pronto"}
              </Button>
              <Button size="sm" variant="outline" onClick={onLeave} disabled={isLeaving}>
                {isLeaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
              </Button>
            </>
          )}

          {canStart && (
            <Button size="sm" onClick={onStart} disabled={isStarting} className="flex-1 bg-green-600 hover:bg-green-700">
              {isStarting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 mr-1" />}
              Iniciar Batalha!
            </Button>
          )}

          {isCreator && !canStart && run.status === "waiting" && participantCount >= dungeon.min_players && (
            <div className="text-xs text-muted-foreground text-center w-full">
              Aguardando todos ficarem prontos ({readyCount}/{participantCount})
            </div>
          )}

          {isCreator && !canStart && run.status === "waiting" && participantCount < dungeon.min_players && (
            <div className="text-xs text-muted-foreground text-center w-full">
              Mínimo de {dungeon.min_players} jogadores para iniciar
            </div>
          )}

          {isParticipant && isActive && (
            <Button size="sm" onClick={onAttack} disabled={isAttacking} className="flex-1">
              {isAttacking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Swords className="w-4 h-4 mr-1" />}
              Atacar (5 energia)
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dungeons() {
  const { user } = useAuth();
  const { data: character } = useCharacter();
  const { data: dungeons, isLoading: dungeonsLoading } = useDungeons();
  const { runs, isLoading: runsLoading } = useAvailableRuns();

  const createRun = useCreateRun();
  const joinRun = useJoinRun();
  const leaveRun = useLeaveRun();
  const setReady = useSetReady();
  const startRun = useStartRun();
  const attackBoss = useAttackBoss();

  const [creatingDungeonId, setCreatingDungeonId] = useState<string | null>(null);


  const handleCreateRun = async (dungeon: Dungeon) => {
    setCreatingDungeonId(dungeon.id);
    try {
      await createRun.mutateAsync(dungeon);
    } finally {
      setCreatingDungeonId(null);
    }
  };

  const myActiveRun = runs.find((r) => r.participants?.some((p) => p.user_id === user?.id));

  return (
    <GameLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Castle className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-display font-bold">Masmorras</h1>
            <p className="text-muted-foreground">Coopere com outros jogadores para derrotar bosses poderosos</p>
          </div>
        </div>

        <Tabs defaultValue={myActiveRun ? "active" : "dungeons"}>
          <TabsList className="w-full max-w-md">
            <TabsTrigger value="dungeons" className="flex-1">
              <Castle className="w-4 h-4 mr-1" />
              Masmorras
            </TabsTrigger>
            <TabsTrigger value="active" className="flex-1">
              <Users className="w-4 h-4 mr-1" />
              Grupos Ativos
              {runs.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {runs.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dungeons" className="mt-6">
            {dungeonsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {dungeons?.map((dungeon) => (
                  <DungeonCard
                    key={dungeon.id}
                    dungeon={dungeon}
                    onCreateRun={() => handleCreateRun(dungeon)}
                    isCreating={creatingDungeonId === dungeon.id}
                    characterLevel={character?.level || 1}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="mt-6">
            {runsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : runs.length === 0 ? (
              <Card className="bg-card/50 backdrop-blur border-primary/20">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Castle className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum grupo ativo no momento</p>
                  <p className="text-sm text-muted-foreground">Crie um grupo em uma masmorra para começar!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {runs.map((run) => (
                  <ActiveRunCard
                    key={run.id}
                    run={run}
                    currentUserId={user?.id}
                    onJoin={() => joinRun.mutate(run.id)}
                    onLeave={() => leaveRun.mutate(run.id)}
                    onSetReady={(ready) => setReady.mutate({ runId: run.id, isReady: ready })}
                    onStart={() =>
                      startRun.mutate({ runId: run.id, durationMinutes: run.dungeon?.duration_minutes || 30 })
                    }
                    onAttack={() => attackBoss.mutate({ run, dungeon: run.dungeon! })}
                    isJoining={joinRun.isPending}
                    isLeaving={leaveRun.isPending}
                    isStarting={startRun.isPending}
                    isAttacking={attackBoss.isPending}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </GameLayout>
  );
}

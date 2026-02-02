import { useState } from "react";
import { GameLayout } from "@/components/layout/GameLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Shield, Users, Crown, Star, UserPlus, LogOut, UserMinus, ChevronUp, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useGuilds,
  useMyGuild,
  useGuildMembers,
  useGuildRequests,
  useCreateGuild,
  useRequestJoinGuild,
  useAcceptRequest,
  useRejectRequest,
  useLeaveGuild,
  useKickMember,
  usePromoteMember,
  Guild,
  GuildMember,
} from "@/hooks/useGuilds";

export default function Guilds() {
  const { user } = useAuth();
  const { data: guilds, isLoading: guildsLoading } = useGuilds();
  const { data: myGuildData, isLoading: myGuildLoading } = useMyGuild();
  
  const myGuild = myGuildData?.guilds as Guild | undefined;
  const myMembership = myGuildData;
  
  const { data: members } = useGuildMembers(myGuild?.id);
  const { data: requests } = useGuildRequests(myGuild?.id);

  const createGuild = useCreateGuild();
  const requestJoin = useRequestJoinGuild();
  const acceptRequest = useAcceptRequest();
  const rejectRequest = useRejectRequest();
  const leaveGuild = useLeaveGuild();
  const kickMember = useKickMember();
  const promoteMember = usePromoteMember();

  const [newGuildName, setNewGuildName] = useState("");
  const [newGuildDesc, setNewGuildDesc] = useState("");
  const [joinMessage, setJoinMessage] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [selectedGuild, setSelectedGuild] = useState<Guild | null>(null);

  const isLoading = guildsLoading || myGuildLoading;
  const isLeader = myMembership?.role === "leader";
  const isOfficer = myMembership?.role === "officer" || isLeader;

  const handleCreateGuild = () => {
    if (!newGuildName.trim()) return;
    createGuild.mutate(
      { name: newGuildName, description: newGuildDesc },
      {
        onSuccess: () => {
          setNewGuildName("");
          setNewGuildDesc("");
          setCreateDialogOpen(false);
        },
      }
    );
  };

  const handleRequestJoin = () => {
    if (!selectedGuild) return;
    requestJoin.mutate(
      { guildId: selectedGuild.id, message: joinMessage },
      {
        onSuccess: () => {
          setJoinMessage("");
          setJoinDialogOpen(false);
          setSelectedGuild(null);
        },
      }
    );
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "leader":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Crown className="w-3 h-3 mr-1" />Líder</Badge>;
      case "officer":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30"><Star className="w-3 h-3 mr-1" />Oficial</Badge>;
      default:
        return <Badge variant="secondary"><Users className="w-3 h-3 mr-1" />Membro</Badge>;
    }
  };

  if (isLoading) {
    return (
      <GameLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              Guildas
            </h1>
            <p className="text-muted-foreground">Una-se a outros guerreiros</p>
          </div>
          
          {!myGuild && (
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Shield className="w-4 h-4" />
                  Criar Guilda
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Guilda</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Nome da Guilda</label>
                    <Input
                      value={newGuildName}
                      onChange={(e) => setNewGuildName(e.target.value)}
                      placeholder="Ex: Cavaleiros da Aurora"
                      maxLength={30}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Descrição (opcional)</label>
                    <Textarea
                      value={newGuildDesc}
                      onChange={(e) => setNewGuildDesc(e.target.value)}
                      placeholder="Descreva sua guilda..."
                      maxLength={200}
                    />
                  </div>
                  <Button
                    onClick={handleCreateGuild}
                    disabled={!newGuildName.trim() || createGuild.isPending}
                    className="w-full"
                  >
                    {createGuild.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar Guilda"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {myGuild ? (
          <Tabs defaultValue="info" className="space-y-4">
            <TabsList>
              <TabsTrigger value="info">Minha Guilda</TabsTrigger>
              <TabsTrigger value="members">Membros ({members?.length || 0})</TabsTrigger>
              {isOfficer && (
                <TabsTrigger value="requests">
                  Solicitações {requests && requests.length > 0 && `(${requests.length})`}
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="info">
              <Card className="bg-card/50 backdrop-blur border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-6 h-6 text-primary" />
                      {myGuild.name}
                    </CardTitle>
                    <Badge variant="outline">Nível {myGuild.level}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    {myGuild.description || "Sem descrição"}
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-secondary/30 rounded-lg">
                      <p className="text-2xl font-bold text-foreground">{members?.length || 0}</p>
                      <p className="text-xs text-muted-foreground">/ {myGuild.max_members} Membros</p>
                    </div>
                    <div className="text-center p-3 bg-secondary/30 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-400">{myGuild.gold_bank}</p>
                      <p className="text-xs text-muted-foreground">Ouro no Cofre</p>
                    </div>
                    <div className="text-center p-3 bg-secondary/30 rounded-lg">
                      <p className="text-2xl font-bold text-primary">{myGuild.experience}</p>
                      <p className="text-xs text-muted-foreground">Experiência</p>
                    </div>
                    <div className="text-center p-3 bg-secondary/30 rounded-lg">
                      <p className="text-2xl font-bold text-foreground">{myGuild.leader_name}</p>
                      <p className="text-xs text-muted-foreground">Líder</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    {getRoleBadge(myMembership?.role || "member")}
                    <span className="text-sm text-muted-foreground">
                      Contribuição: {myMembership?.contribution || 0} pontos
                    </span>
                  </div>

                  <Button
                    variant="destructive"
                    onClick={() => leaveGuild.mutate(myGuild.id)}
                    disabled={leaveGuild.isPending}
                    className="gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    {isLeader ? "Dissolver Guilda" : "Sair da Guilda"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="members">
              <Card className="bg-card/50 backdrop-blur border-primary/20">
                <CardHeader>
                  <CardTitle>Membros da Guilda</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {members?.map((member: GuildMember) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                              <Users className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{member.character_name}</p>
                              <p className="text-sm text-muted-foreground">
                                Nível {member.character_level} • {member.contribution} contribuição
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getRoleBadge(member.role)}
                            
                            {isLeader && member.user_id !== user?.id && (
                              <div className="flex gap-1">
                                {member.role === "member" && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => promoteMember.mutate({ memberId: member.id, newRole: "officer" })}
                                    title="Promover a Oficial"
                                  >
                                    <ChevronUp className="w-4 h-4" />
                                  </Button>
                                )}
                                {member.role === "officer" && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => promoteMember.mutate({ memberId: member.id, newRole: "member" })}
                                    title="Rebaixar a Membro"
                                  >
                                    <ChevronDown className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => kickMember.mutate({ memberId: member.id, guildId: myGuild.id })}
                                  title="Expulsar"
                                >
                                  <UserMinus className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {isOfficer && (
              <TabsContent value="requests">
                <Card className="bg-card/50 backdrop-blur border-primary/20">
                  <CardHeader>
                    <CardTitle>Solicitações de Entrada</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {requests && requests.length > 0 ? (
                      <div className="space-y-2">
                        {requests.map((request) => (
                          <div
                            key={request.id}
                            className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                          >
                            <div>
                              <p className="font-medium">{request.character_name}</p>
                              {request.message && (
                                <p className="text-sm text-muted-foreground">"{request.message}"</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  acceptRequest.mutate({
                                    requestId: request.id,
                                    guildId: request.guild_id,
                                    userId: request.user_id,
                                  })
                                }
                                disabled={acceptRequest.isPending}
                              >
                                <UserPlus className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => rejectRequest.mutate(request.id)}
                                disabled={rejectRequest.isPending}
                              >
                                <UserMinus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhuma solicitação pendente
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {guilds?.map((guild) => (
              <Card key={guild.id} className="bg-card/50 backdrop-blur border-primary/20 hover:border-primary/40 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      {guild.name}
                    </CardTitle>
                    <Badge variant="outline">Nv. {guild.level}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {guild.description || "Sem descrição"}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      <Users className="w-4 h-4 inline mr-1" />
                      {guild.member_count}/{guild.max_members}
                    </span>
                    <span className="text-muted-foreground">
                      <Crown className="w-4 h-4 inline mr-1" />
                      {guild.leader_name}
                    </span>
                  </div>

                  <Dialog open={joinDialogOpen && selectedGuild?.id === guild.id} onOpenChange={(open) => {
                    setJoinDialogOpen(open);
                    if (!open) setSelectedGuild(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        variant="secondary"
                        className="w-full"
                        onClick={() => setSelectedGuild(guild)}
                        disabled={(guild.member_count || 0) >= guild.max_members}
                      >
                        {(guild.member_count || 0) >= guild.max_members ? "Guilda Cheia" : "Solicitar Entrada"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Entrar em {guild.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Mensagem (opcional)</label>
                          <Textarea
                            value={joinMessage}
                            onChange={(e) => setJoinMessage(e.target.value)}
                            placeholder="Diga por que quer entrar..."
                            maxLength={100}
                          />
                        </div>
                        <Button
                          onClick={handleRequestJoin}
                          disabled={requestJoin.isPending}
                          className="w-full"
                        >
                          {requestJoin.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar Solicitação"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}

            {guilds?.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Shield className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Nenhuma guilda criada ainda</p>
                <p className="text-sm text-muted-foreground">Seja o primeiro a criar uma!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </GameLayout>
  );
}

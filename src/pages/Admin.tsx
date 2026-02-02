import { useState } from "react";
import { GameLayout } from "@/components/layout/GameLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Loader2, 
  Shield, 
  Users, 
  Gift, 
  PawPrint, 
  Ban, 
  Coins, 
  TrendingUp,
  History,
  AlertTriangle,
  CheckCircle,
  Package,
  Music
} from "lucide-react";
import { MusicManager } from "@/components/admin/MusicManager";
import { useAdmin } from "@/hooks/useAdmin";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Admin() {
  const { 
    isAdmin, 
    isCheckingAdmin, 
    allCharacters, 
    allPets,
    adminLogs,
    isLoading,
    giveGold,
    setLevel,
    givePet,
    banPlayer,
    unbanPlayer,
    giveItem,
  } = useAdmin();

  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [goldAmount, setGoldAmount] = useState("");
  const [newLevel, setNewLevel] = useState("");
  const [selectedPetId, setSelectedPetId] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [itemQuantity, setItemQuantity] = useState("1");
  const [banReason, setBanReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch items for gift
  const { data: items } = useQuery({
    queryKey: ["admin_items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: isAdmin === true,
  });

  if (isCheckingAdmin) {
    return (
      <GameLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </GameLayout>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const filteredCharacters = allCharacters?.filter(char => 
    char.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSelectedPlayerData = () => {
    return allCharacters?.find(c => c.user_id === selectedPlayer);
  };

  const handleGiveGold = () => {
    const player = getSelectedPlayerData();
    if (player && goldAmount) {
      giveGold.mutate({
        characterId: player.id,
        userId: player.user_id,
        amount: parseInt(goldAmount),
      });
      setGoldAmount("");
    }
  };

  const handleSetLevel = () => {
    const player = getSelectedPlayerData();
    if (player && newLevel) {
      setLevel.mutate({
        characterId: player.id,
        userId: player.user_id,
        level: parseInt(newLevel),
      });
      setNewLevel("");
    }
  };

  const handleGivePet = () => {
    if (selectedPlayer && selectedPetId) {
      givePet.mutate({
        userId: selectedPlayer,
        petId: selectedPetId,
      });
      setSelectedPetId("");
    }
  };

  const handleGiveItem = () => {
    if (selectedPlayer && selectedItemId) {
      giveItem.mutate({
        userId: selectedPlayer,
        itemId: selectedItemId,
        quantity: parseInt(itemQuantity) || 1,
      });
      setSelectedItemId("");
      setItemQuantity("1");
    }
  };

  const handleBan = () => {
    const player = getSelectedPlayerData();
    if (player && banReason) {
      banPlayer.mutate({
        characterId: player.id,
        userId: player.user_id,
        reason: banReason,
      });
      setBanReason("");
      setSelectedPlayer(null);
    }
  };

  const handleUnban = (characterId: string, userId: string) => {
    unbanPlayer.mutate({ characterId, userId });
  };

  return (
    <GameLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              Painel Administrativo
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie jogadores, presentes e configurações do jogo
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{allCharacters?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Jogadores</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <PawPrint className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{allPets?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Pets</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Ban className="w-8 h-8 text-destructive" />
                <div>
                  <p className="text-2xl font-bold">
                    {allCharacters?.filter(c => c.is_banned).length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Banidos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <History className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{adminLogs?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Ações hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="players" className="space-y-4">
          <TabsList>
            <TabsTrigger value="players">
              <Users className="w-4 h-4 mr-2" />
              Jogadores
            </TabsTrigger>
            <TabsTrigger value="gifts">
              <Gift className="w-4 h-4 mr-2" />
              Presentes
            </TabsTrigger>
            <TabsTrigger value="music">
              <Music className="w-4 h-4 mr-2" />
              Músicas
            </TabsTrigger>
            <TabsTrigger value="logs">
              <History className="w-4 h-4 mr-2" />
              Histórico
            </TabsTrigger>
          </TabsList>

          {/* Players Tab */}
          <TabsContent value="players" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Lista de Jogadores</span>
                  <Input
                    placeholder="Buscar jogador..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Nível</TableHead>
                        <TableHead>Classe</TableHead>
                        <TableHead>Ouro</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCharacters?.map((char) => (
                        <TableRow key={char.id}>
                          <TableCell className="font-medium">{char.name}</TableCell>
                          <TableCell>{char.level}</TableCell>
                          <TableCell className="capitalize">{char.class || "—"}</TableCell>
                          <TableCell className="text-gold">{char.gold.toLocaleString()}</TableCell>
                          <TableCell>
                            {char.is_banned ? (
                              <Badge variant="destructive">Banido</Badge>
                            ) : (
                              <Badge variant="secondary">Ativo</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedPlayer(char.user_id)}
                              >
                                Gerenciar
                              </Button>
                              {char.is_banned ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUnban(char.id, char.user_id)}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="destructive">
                                      <Ban className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle className="flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-destructive" />
                                        Banir Jogador
                                      </DialogTitle>
                                      <DialogDescription>
                                        Tem certeza que deseja banir {char.name}?
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label>Motivo do banimento</Label>
                                        <Textarea
                                          placeholder="Descreva o motivo..."
                                          value={banReason}
                                          onChange={(e) => {
                                            setBanReason(e.target.value);
                                            setSelectedPlayer(char.user_id);
                                          }}
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button
                                        variant="destructive"
                                        onClick={handleBan}
                                        disabled={!banReason || banPlayer.isPending}
                                      >
                                        {banPlayer.isPending ? (
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                          "Confirmar Banimento"
                                        )}
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gifts Tab */}
          <TabsContent value="gifts" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Select Player */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Selecionar Jogador</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedPlayer || ""} onValueChange={setSelectedPlayer}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha um jogador..." />
                    </SelectTrigger>
                    <SelectContent>
                      {allCharacters?.map((char) => (
                        <SelectItem key={char.user_id} value={char.user_id}>
                          {char.name} (Nível {char.level})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedPlayer && (
                    <div className="mt-4 p-3 rounded-lg bg-muted">
                      <p className="font-medium">{getSelectedPlayerData()?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Nível {getSelectedPlayerData()?.level} • {getSelectedPlayerData()?.gold.toLocaleString()} ouro
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Give Gold */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Coins className="w-5 h-5 text-gold" />
                    Dar Ouro
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Quantidade</Label>
                    <Input
                      type="number"
                      placeholder="1000"
                      value={goldAmount}
                      onChange={(e) => setGoldAmount(e.target.value)}
                      min="1"
                    />
                  </div>
                  <Button 
                    className="w-full"
                    onClick={handleGiveGold}
                    disabled={!selectedPlayer || !goldAmount || giveGold.isPending}
                  >
                    {giveGold.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Enviar Ouro"
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Set Level */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Alterar Nível
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Novo Nível</Label>
                    <Input
                      type="number"
                      placeholder="10"
                      value={newLevel}
                      onChange={(e) => setNewLevel(e.target.value)}
                      min="1"
                      max="100"
                    />
                  </div>
                  <Button 
                    className="w-full"
                    onClick={handleSetLevel}
                    disabled={!selectedPlayer || !newLevel || setLevel.isPending}
                  >
                    {setLevel.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Definir Nível"
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Give Pet */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PawPrint className="w-5 h-5 text-purple-500" />
                    Dar Pet
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Pet</Label>
                    <Select value={selectedPetId} onValueChange={setSelectedPetId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha um pet..." />
                      </SelectTrigger>
                      <SelectContent>
                        {allPets?.map((pet) => (
                          <SelectItem key={pet.id} value={pet.id}>
                            {pet.icon} {pet.name} ({pet.rarity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={handleGivePet}
                    disabled={!selectedPlayer || !selectedPetId || givePet.isPending}
                  >
                    {givePet.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Enviar Pet"
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Give Item */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-500" />
                    Dar Item
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <Label>Item</Label>
                      <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Escolha um item..." />
                        </SelectTrigger>
                        <SelectContent>
                          {items?.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name} ({item.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Quantidade</Label>
                      <Input
                        type="number"
                        value={itemQuantity}
                        onChange={(e) => setItemQuantity(e.target.value)}
                        min="1"
                      />
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4"
                    onClick={handleGiveItem}
                    disabled={!selectedPlayer || !selectedItemId || giveItem.isPending}
                  >
                    {giveItem.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Enviar Item"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Ações</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {adminLogs?.map((log) => {
                      const targetChar = allCharacters?.find(c => c.user_id === log.target_user_id);
                      
                      return (
                        <div 
                          key={log.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div>
                            <p className="font-medium">
                              {log.action.replace(/_/g, " ").toUpperCase()}
                            </p>
                            {targetChar && (
                              <p className="text-sm text-muted-foreground">
                                Jogador: {targetChar.name}
                              </p>
                            )}
                            {log.details && (
                              <p className="text-xs text-muted-foreground">
                                {JSON.stringify(log.details)}
                              </p>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      );
                    })}
                    
                    {(!adminLogs || adminLogs.length === 0) && (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhuma ação registrada ainda.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Music Tab */}
          <TabsContent value="music" className="space-y-4">
            <MusicManager />
          </TabsContent>
        </Tabs>
      </div>
    </GameLayout>
  );
}

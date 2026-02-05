 import { GameLayout } from "@/components/layout/GameLayout";
 import { MiniLayeredAvatar } from "@/components/game/MiniLayeredAvatar";
 import { Trophy, Medal, Crown, TrendingUp, Loader2, Shield, Coins, Zap, Star, Users } from "lucide-react";
 import { useCharacter, RankedCharacter } from "@/hooks/useCharacter";
 import { useEquippedVipClothing } from "@/hooks/useVipClothing";
 import { Badge } from "@/components/ui/badge";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { useQuery } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 
 const getRankIcon = (rank: number) => {
   switch (rank) {
     case 1:
       return <Crown className="w-6 h-6 text-gold" />;
     case 2:
       return <Medal className="w-6 h-6 text-muted-foreground" />;
     case 3:
       return <Medal className="w-6 h-6 text-bronze" />;
     default:
       return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-muted-foreground">#{rank}</span>;
   }
 };
 
 const getRankBg = (rank: number) => {
   switch (rank) {
     case 1:
       return "bg-gold/10 border-gold/30";
     case 2:
       return "bg-muted/50 border-muted-foreground/30";
     case 3:
       return "bg-bronze/10 border-bronze/30";
     default:
       return "bg-card border-border";
   }
 };
 
 // Calculate power for display
 const calculatePower = (c: RankedCharacter) => {
   return (c.strength * 3 + c.defense * 2 + c.vitality * 2 + c.agility * 2 + c.luck) * c.level;
 };
 
 // Hook for ranking by level
 function useRankingByLevel() {
   return useQuery({
     queryKey: ["ranking", "level"],
     queryFn: async () => {
       const { data: characters, error } = await supabase
         .from("characters")
         .select("*")
         .order("level", { ascending: false })
         .order("current_xp", { ascending: false })
         .limit(50);
 
       if (error) throw error;
       return characters as RankedCharacter[];
     },
   });
 }
 
 // Hook for ranking by power
 function useRankingByPower() {
   return useQuery({
     queryKey: ["ranking", "power"],
     queryFn: async () => {
       const { data: characters, error } = await supabase
         .from("characters")
         .select("*")
         .limit(100);
 
       if (error) throw error;
       
       // Sort by calculated power
       const sorted = (characters || []).sort((a, b) => {
         const powerA = calculatePower(a as RankedCharacter);
         const powerB = calculatePower(b as RankedCharacter);
         return powerB - powerA;
       });
       
       return sorted.slice(0, 50) as RankedCharacter[];
     },
   });
 }
 
 // Hook for ranking by gold
 function useRankingByGold() {
   return useQuery({
     queryKey: ["ranking", "gold"],
     queryFn: async () => {
       const { data: characters, error } = await supabase
         .from("characters")
         .select("*")
         .order("gold", { ascending: false })
         .limit(50);
 
       if (error) throw error;
       return characters as RankedCharacter[];
     },
   });
 }
 
 // Hook for guild ranking
 interface GuildRanking {
   id: string;
   name: string;
   level: number;
   experience: number;
   icon: string | null;
   member_count: number;
   total_power: number;
 }
 
 function useGuildRanking() {
   return useQuery({
     queryKey: ["ranking", "guilds"],
     queryFn: async () => {
       // Get all guilds
       const { data: guilds, error: guildsError } = await supabase
         .from("guilds")
         .select("id, name, level, experience, icon")
         .order("level", { ascending: false })
         .order("experience", { ascending: false });
 
       if (guildsError) throw guildsError;
       if (!guilds || guilds.length === 0) return [];
 
       // Get member counts and power for each guild
       const guildIds = guilds.map(g => g.id);
       
       const { data: members } = await supabase
         .from("guild_members")
         .select("guild_id, user_id")
         .in("guild_id", guildIds);
 
       // Get all member user_ids
       const userIds = [...new Set((members || []).map(m => m.user_id))];
       
       const { data: characters } = await supabase
         .from("characters")
         .select("user_id, strength, defense, vitality, agility, luck, level")
         .in("user_id", userIds);
 
       // Calculate per-guild stats
       const guildStats = new Map<string, { count: number; power: number }>();
       
       for (const guild of guilds) {
         const guildMembers = (members || []).filter(m => m.guild_id === guild.id);
         let totalPower = 0;
         
         for (const member of guildMembers) {
           const char = (characters || []).find(c => c.user_id === member.user_id);
           if (char) {
             totalPower += calculatePower(char as RankedCharacter);
           }
         }
         
         guildStats.set(guild.id, { count: guildMembers.length, power: totalPower });
       }
 
       // Build ranking
       const ranking: GuildRanking[] = guilds.map(g => ({
         ...g,
         member_count: guildStats.get(g.id)?.count || 0,
         total_power: guildStats.get(g.id)?.power || 0,
       }));
 
       // Sort by total power
       return ranking.sort((a, b) => b.total_power - a.total_power).slice(0, 20);
     },
   });
 }
 
 interface PlayerRowProps {
   player: RankedCharacter;
   rank: number;
   isMe: boolean;
   valueLabel: string;
   value: string | number;
   valueColor?: string;
 }
 
 function PlayerRow({ player, rank, isMe, valueLabel, value, valueColor = "text-primary" }: PlayerRowProps) {
   return (
     <div 
       className={`rounded-xl border p-3 sm:p-4 transition-all hover:shadow-lg ${
         isMe ? "bg-primary/10 border-primary/30" : getRankBg(rank)
       }`}
     >
       <div className="flex items-center gap-3 sm:gap-4">
         <div className="w-8 sm:w-10 flex justify-center">
           {getRankIcon(rank)}
         </div>
         <MiniLayeredAvatar 
           customization={player.avatar_customization}
           size="sm"
           rank={rank <= 3 ? rank : undefined}
         />
         <div className="flex-1 min-w-0">
           <p className="font-display font-bold truncate">
             {player.name}
             {isMe && <span className="text-primary ml-2">(Você)</span>}
           </p>
           <p className="text-sm text-muted-foreground">Nível {player.level}</p>
         </div>
         <div className="text-right">
           <p className={`font-bold ${valueColor}`}>{typeof value === 'number' ? value.toLocaleString() : value}</p>
           <p className="text-xs text-muted-foreground">{valueLabel}</p>
         </div>
       </div>
     </div>
   );
 }
 
 export default function Ranking() {
   const { data: myCharacter } = useCharacter();
   const { data: levelRanking, isLoading: levelLoading } = useRankingByLevel();
   const { data: powerRanking, isLoading: powerLoading } = useRankingByPower();
   const { data: goldRanking, isLoading: goldLoading } = useRankingByGold();
   const { data: guildRanking, isLoading: guildLoading } = useGuildRanking();
 
   const renderLoading = () => (
     <div className="flex items-center justify-center py-12">
       <Loader2 className="w-8 h-8 animate-spin text-primary" />
     </div>
   );
 
   const renderEmpty = (message: string) => (
     <div className="text-center py-12 bg-card border border-border rounded-xl">
       <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
       <p className="text-muted-foreground">{message}</p>
     </div>
   );
 
   return (
     <GameLayout>
       <div className="space-y-6 animate-fade-in">
         {/* Header */}
         <div>
           <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
             <Trophy className="w-8 h-8 text-gold" />
             Ranking Global
           </h1>
           <p className="text-muted-foreground mt-1">
             Os guerreiros e guildas mais poderosos do reino
           </p>
         </div>
 
         {/* Ranking Tabs */}
         <Tabs defaultValue="level" className="w-full">
           <TabsList className="grid w-full grid-cols-4 mb-4">
             <TabsTrigger value="level" className="gap-1 text-xs sm:text-sm">
               <Star className="w-4 h-4" />
               <span className="hidden sm:inline">Nível</span>
             </TabsTrigger>
             <TabsTrigger value="power" className="gap-1 text-xs sm:text-sm">
               <Zap className="w-4 h-4" />
               <span className="hidden sm:inline">Poder</span>
             </TabsTrigger>
             <TabsTrigger value="gold" className="gap-1 text-xs sm:text-sm">
               <Coins className="w-4 h-4" />
               <span className="hidden sm:inline">Ouro</span>
             </TabsTrigger>
             <TabsTrigger value="guilds" className="gap-1 text-xs sm:text-sm">
               <Users className="w-4 h-4" />
               <span className="hidden sm:inline">Guildas</span>
             </TabsTrigger>
           </TabsList>
 
           {/* Top Level */}
           <TabsContent value="level" className="space-y-2">
             <h2 className="font-display text-lg font-bold flex items-center gap-2 mb-3">
               <Star className="w-5 h-5 text-xp" />
               Top Nível
             </h2>
             {levelLoading && renderLoading()}
             {!levelLoading && (!levelRanking || levelRanking.length === 0) && renderEmpty("Nenhum guerreiro no ranking")}
             {!levelLoading && levelRanking && levelRanking.map((player, index) => (
               <PlayerRow
                 key={player.id}
                 player={player}
                 rank={index + 1}
                 isMe={player.user_id === myCharacter?.user_id}
                 valueLabel="Nível"
                 value={player.level}
                 valueColor="text-xp"
               />
             ))}
           </TabsContent>
 
           {/* Top Power */}
           <TabsContent value="power" className="space-y-2">
             <h2 className="font-display text-lg font-bold flex items-center gap-2 mb-3">
               <Zap className="w-5 h-5 text-primary" />
               Top Poder
             </h2>
             {powerLoading && renderLoading()}
             {!powerLoading && (!powerRanking || powerRanking.length === 0) && renderEmpty("Nenhum guerreiro no ranking")}
             {!powerLoading && powerRanking && powerRanking.map((player, index) => (
               <PlayerRow
                 key={player.id}
                 player={player}
                 rank={index + 1}
                 isMe={player.user_id === myCharacter?.user_id}
                 valueLabel="Poder"
                 value={calculatePower(player)}
                 valueColor="text-primary"
               />
             ))}
           </TabsContent>
 
           {/* Top Gold */}
           <TabsContent value="gold" className="space-y-2">
             <h2 className="font-display text-lg font-bold flex items-center gap-2 mb-3">
               <Coins className="w-5 h-5 text-gold" />
               Top Ricos
             </h2>
             {goldLoading && renderLoading()}
             {!goldLoading && (!goldRanking || goldRanking.length === 0) && renderEmpty("Nenhum guerreiro no ranking")}
             {!goldLoading && goldRanking && goldRanking.map((player, index) => (
               <PlayerRow
                 key={player.id}
                 player={player}
                 rank={index + 1}
                 isMe={player.user_id === myCharacter?.user_id}
                 valueLabel="Ouro"
                 value={player.gold}
                 valueColor="text-gold"
               />
             ))}
           </TabsContent>
 
           {/* Top Guilds */}
           <TabsContent value="guilds" className="space-y-2">
             <h2 className="font-display text-lg font-bold flex items-center gap-2 mb-3">
               <Shield className="w-5 h-5 text-accent" />
               Top Guildas
             </h2>
             {guildLoading && renderLoading()}
             {!guildLoading && (!guildRanking || guildRanking.length === 0) && renderEmpty("Nenhuma guilda no ranking")}
             {!guildLoading && guildRanking && guildRanking.map((guild, index) => {
               const rank = index + 1;
               return (
                 <div 
                   key={guild.id}
                   className={`rounded-xl border p-3 sm:p-4 transition-all hover:shadow-lg ${getRankBg(rank)}`}
                 >
                   <div className="flex items-center gap-3 sm:gap-4">
                     <div className="w-8 sm:w-10 flex justify-center">
                       {getRankIcon(rank)}
                     </div>
                     <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-xl">
                       {guild.icon || "⚔️"}
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="font-display font-bold truncate">{guild.name}</p>
                       <div className="flex items-center gap-2 text-sm text-muted-foreground">
                         <span>Nv. {guild.level}</span>
                         <span>•</span>
                         <span>{guild.member_count} membros</span>
                       </div>
                     </div>
                     <div className="text-right">
                       <p className="font-bold text-primary">{guild.total_power.toLocaleString()}</p>
                       <p className="text-xs text-muted-foreground">Poder Total</p>
                     </div>
                   </div>
                 </div>
               );
             })}
           </TabsContent>
         </Tabs>
       </div>
     </GameLayout>
   );
 }

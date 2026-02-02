import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Item rewards for day 7 (cycles through different items each week)
const DAY7_ITEM_POOLS = [
  { name: "Poção de Vida Grande", type: "consumable", rarity: "rare" },
  { name: "Poção de Energia Grande", type: "consumable", rarity: "rare" },
  { name: "Poção de Mana Grande", type: "consumable", rarity: "rare" },
  { name: "Elixir do Guerreiro", type: "consumable", rarity: "epic" },
];

// Daily rewards configuration - rewards increase with streak
interface DailyReward {
  day: number;
  gold: number;
  xp: number;
  label: string;
  itemReward?: boolean;
  itemName?: string;
}

const DAILY_REWARDS: DailyReward[] = [
  { day: 1, gold: 50, xp: 25, label: "Dia 1" },
  { day: 2, gold: 75, xp: 40, label: "Dia 2" },
  { day: 3, gold: 100, xp: 60, label: "Dia 3" },
  { day: 4, gold: 150, xp: 80, label: "Dia 4" },
  { day: 5, gold: 200, xp: 100, label: "Dia 5" },
  { day: 6, gold: 300, xp: 150, label: "Dia 6" },
  { day: 7, gold: 500, xp: 250, label: "Dia 7", itemReward: true },
];

export function useDailyLogin() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get today's login status and current streak
  const { data: loginData, isLoading } = useQuery({
    queryKey: ["daily-login", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

      // Check if already logged in today
      const { data: todayLogin } = await supabase
        .from("daily_logins")
        .select("*")
        .eq("user_id", user.id)
        .eq("login_date", today)
        .single();

      if (todayLogin) {
        const reward = { ...DAILY_REWARDS[(todayLogin.day_streak - 1) % 7] };
        if (reward.itemReward) {
          const weekNumber = Math.floor((todayLogin.day_streak - 1) / 7);
          const itemIndex = weekNumber % DAY7_ITEM_POOLS.length;
          reward.itemName = DAY7_ITEM_POOLS[itemIndex].name;
        }
        return {
          hasLoggedInToday: true,
          rewardClaimed: todayLogin.reward_claimed,
          currentStreak: todayLogin.day_streak,
          todayReward: reward,
        };
      }

      // Check yesterday's login for streak calculation
      const { data: yesterdayLogin } = await supabase
        .from("daily_logins")
        .select("day_streak")
        .eq("user_id", user.id)
        .eq("login_date", yesterday)
        .single();

      const newStreak = yesterdayLogin ? yesterdayLogin.day_streak + 1 : 1;
      const reward = { ...DAILY_REWARDS[(newStreak - 1) % 7] };
      if (reward.itemReward) {
        const weekNumber = Math.floor((newStreak - 1) / 7);
        const itemIndex = weekNumber % DAY7_ITEM_POOLS.length;
        reward.itemName = DAY7_ITEM_POOLS[itemIndex].name;
      }

      return {
        hasLoggedInToday: false,
        rewardClaimed: false,
        currentStreak: newStreak,
        todayReward: reward,
      };
    },
    enabled: !!user,
  });

  // Claim daily reward
  const claimReward = useMutation({
    mutationFn: async () => {
      if (!user || !loginData) throw new Error("Not authenticated");

      const today = new Date().toISOString().split("T")[0];
      const reward = loginData.todayReward;

      // Insert or update today's login
      if (!loginData.hasLoggedInToday) {
        const { error: insertError } = await supabase
          .from("daily_logins")
          .insert({
            user_id: user.id,
            login_date: today,
            day_streak: loginData.currentStreak,
            reward_claimed: true,
            gold_reward: reward.gold,
            xp_reward: reward.xp,
          });

        if (insertError) throw insertError;
      } else {
        const { error: updateError } = await supabase
          .from("daily_logins")
          .update({ reward_claimed: true })
          .eq("user_id", user.id)
          .eq("login_date", today);

        if (updateError) throw updateError;
      }

      // Update character with rewards
      const { data: character } = await supabase
        .from("characters")
        .select("gold, current_xp, xp_to_next_level, level, available_points")
        .eq("user_id", user.id)
        .single();

      if (character) {
        let newXp = character.current_xp + reward.xp;
        let newLevel = character.level;
        let xpToNext = character.xp_to_next_level;
        let newPoints = character.available_points;

        // Check for level up
        while (newXp >= xpToNext) {
          newXp -= xpToNext;
          newLevel++;
          xpToNext = Math.floor(xpToNext * 1.2);
          newPoints += 3; // 3 points per level
        }

        await supabase
          .from("characters")
          .update({
            gold: character.gold + reward.gold,
            current_xp: newXp,
            level: newLevel,
            xp_to_next_level: xpToNext,
            available_points: newPoints,
          })
          .eq("user_id", user.id);
      }

      // Give item reward on day 7
      if (reward.itemReward && reward.itemName) {
        // Find the item in the database
        const { data: item } = await supabase
          .from("items")
          .select("id")
          .eq("name", reward.itemName)
          .single();

        if (item) {
          // Check if player already has this item
          const { data: existingItem } = await supabase
            .from("player_inventory")
            .select("id, quantity")
            .eq("user_id", user.id)
            .eq("item_id", item.id)
            .single();

          if (existingItem) {
            // Increment quantity
            await supabase
              .from("player_inventory")
              .update({ quantity: existingItem.quantity + 1 })
              .eq("id", existingItem.id);
          } else {
            // Add new item
            await supabase
              .from("player_inventory")
              .insert({
                user_id: user.id,
                item_id: item.id,
                quantity: 1,
              });
          }
        }
      }

      return reward;
    },
    onSuccess: (reward) => {
      queryClient.invalidateQueries({ queryKey: ["daily-login"] });
      queryClient.invalidateQueries({ queryKey: ["character"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      const itemMsg = reward.itemName ? ` + ${reward.itemName}!` : "";
      toast.success(`Recompensa resgatada! +${reward.gold} ouro, +${reward.xp} XP${itemMsg}`);
    },
    onError: (error) => {
      toast.error("Erro ao resgatar recompensa: " + error.message);
    },
  });

  // Get login history for displaying streak calendar
  const { data: loginHistory } = useQuery({
    queryKey: ["daily-login-history", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];

      const { data } = await supabase
        .from("daily_logins")
        .select("login_date, day_streak, reward_claimed")
        .eq("user_id", user.id)
        .gte("login_date", sevenDaysAgo)
        .order("login_date", { ascending: true });

      return data || [];
    },
    enabled: !!user,
  });

  return {
    loginData,
    isLoading,
    claimReward,
    loginHistory,
    dailyRewards: DAILY_REWARDS,
  };
}

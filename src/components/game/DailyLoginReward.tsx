import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Coins, Sparkles, Check, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDailyLogin } from "@/hooks/useDailyLogin";

export function DailyLoginReward() {
  const { loginData, isLoading, claimReward, dailyRewards } = useDailyLogin();
  const [isOpen, setIsOpen] = useState(false);

  // Auto-open modal when there's an unclaimed reward
  useEffect(() => {
    if (loginData && !loginData.rewardClaimed) {
      const timer = setTimeout(() => setIsOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, [loginData]);

  if (isLoading || !loginData) return null;

  const currentDayIndex = (loginData.currentStreak - 1) % 7;

  return (
    <>
      {/* Floating button to open rewards */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 p-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg hover:scale-110 transition-transform animate-pulse"
        title="Login Diário"
      >
        <Gift className="w-6 h-6 text-white" />
        {!loginData.rewardClaimed && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
            !
          </span>
        )}
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Login Diário
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Sequência atual: <span className="text-primary font-bold">{loginData.currentStreak} dias</span>
                </p>
              </div>

              {/* Rewards Grid */}
              <div className="grid grid-cols-7 gap-2 mb-6">
                {dailyRewards.map((reward, index) => {
                  const isPast = index < currentDayIndex;
                  const isCurrent = index === currentDayIndex;
                  const isFuture = index > currentDayIndex;
                  const isClaimed = isCurrent && loginData.rewardClaimed;

                  return (
                    <div
                      key={reward.day}
                      className={`relative flex flex-col items-center p-2 rounded-lg border transition-all ${
                        isCurrent && !isClaimed
                          ? "border-primary bg-primary/10 ring-2 ring-primary/50"
                          : isPast || isClaimed
                          ? "border-green-500/50 bg-green-500/10"
                          : "border-border bg-muted/30"
                      }`}
                    >
                      <span className="text-[10px] font-medium text-muted-foreground mb-1">
                        {reward.label}
                      </span>
                      
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                        isCurrent && !isClaimed
                          ? "bg-gradient-to-r from-amber-500 to-orange-500"
                          : isPast || isClaimed
                          ? "bg-green-500"
                          : "bg-muted"
                      }`}>
                        {isPast || isClaimed ? (
                          <Check className="w-4 h-4 text-white" />
                        ) : (
                          <Gift className={`w-4 h-4 ${isCurrent ? "text-white" : "text-muted-foreground"}`} />
                        )}
                      </div>

                      <div className="flex items-center gap-0.5 text-[9px]">
                        <Coins className="w-3 h-3 text-gold" />
                        <span className="text-gold font-medium">{reward.gold}</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-[9px]">
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        <span className="text-purple-400 font-medium">{reward.xp}</span>
                      </div>

                      {/* Day 7 special indicator */}
                      {index === 6 && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full flex items-center justify-center">
                          <span className="text-[6px] text-black font-bold">★</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Today's Reward */}
              <div className="bg-muted/50 rounded-xl p-4 mb-4">
                <p className="text-sm text-muted-foreground text-center mb-2">
                  Recompensa de hoje
                </p>
                <div className="flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <Coins className="w-6 h-6 text-gold" />
                    <span className="text-xl font-bold text-gold">
                      +{loginData.todayReward.gold}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                    <span className="text-xl font-bold text-purple-400">
                      +{loginData.todayReward.xp} XP
                    </span>
                  </div>
                </div>
              </div>

              {/* Claim Button */}
              <Button
                onClick={() => {
                  claimReward.mutate();
                  setIsOpen(false);
                }}
                disabled={loginData.rewardClaimed || claimReward.isPending}
                className="w-full h-12 text-lg font-bold"
                variant={loginData.rewardClaimed ? "outline" : "default"}
              >
                {loginData.rewardClaimed ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Resgatado Hoje
                  </>
                ) : claimReward.isPending ? (
                  "Resgatando..."
                ) : (
                  <>
                    <Gift className="w-5 h-5 mr-2" />
                    Resgatar Recompensa
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-3">
                Mantenha sua sequência para ganhar recompensas maiores!
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

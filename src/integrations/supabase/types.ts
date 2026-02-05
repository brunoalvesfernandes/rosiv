export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string
          created_at: string
          description: string
          gold_reward: number
          icon: string | null
          id: string
          name: string
          requirement_type: string
          requirement_value: number
          xp_reward: number
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          gold_reward?: number
          icon?: string | null
          id?: string
          name: string
          requirement_type: string
          requirement_value: number
          xp_reward?: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          gold_reward?: number
          icon?: string | null
          id?: string
          name?: string
          requirement_type?: string
          requirement_value?: number
          xp_reward?: number
        }
        Relationships: []
      }
      admin_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          target_user_id: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Relationships: []
      }
      area_music: {
        Row: {
          area_label: string
          area_name: string
          created_at: string
          id: string
          music_url: string | null
          updated_at: string
        }
        Insert: {
          area_label: string
          area_name: string
          created_at?: string
          id?: string
          music_url?: string | null
          updated_at?: string
        }
        Update: {
          area_label?: string
          area_name?: string
          created_at?: string
          id?: string
          music_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      battle_logs: {
        Row: {
          arena_points_change: number
          attacker_damage: number
          attacker_id: string
          created_at: string
          defender_damage: number
          defender_id: string | null
          defender_npc_name: string | null
          gold_gained: number
          id: string
          is_pvp: boolean
          winner_id: string | null
          xp_gained: number
        }
        Insert: {
          arena_points_change?: number
          attacker_damage?: number
          attacker_id: string
          created_at?: string
          defender_damage?: number
          defender_id?: string | null
          defender_npc_name?: string | null
          gold_gained?: number
          id?: string
          is_pvp?: boolean
          winner_id?: string | null
          xp_gained?: number
        }
        Update: {
          arena_points_change?: number
          attacker_damage?: number
          attacker_id?: string
          created_at?: string
          defender_damage?: number
          defender_id?: string | null
          defender_npc_name?: string | null
          gold_gained?: number
          id?: string
          is_pvp?: boolean
          winner_id?: string | null
          xp_gained?: number
        }
        Relationships: []
      }
      characters: {
        Row: {
          accessory: string | null
          agility: number
          arena_points: number
          available_points: number
          avatar_customization: string | null
          avatar_id: string
          ban_reason: string | null
          banned_at: string | null
          class: Database["public"]["Enums"]["character_class"] | null
          created_at: string
          current_energy: number
          current_hp: number
          current_mana: number
          current_xp: number
          defense: number
          eye_color: string
          face_style: string
          gold: number
          hair_color: string
          hair_style: string
          id: string
          is_banned: boolean
          is_protected: boolean
          last_energy_regen: string
          last_hp_regen: string
          last_mana_regen: string
          level: number
          luck: number
          max_energy: number
          max_hp: number
          max_mana: number
          missions_completed: number
          name: string
          pants_color: string
          protection_until: string | null
          shirt_color: string
          shoes_color: string
          skin_tone: string
          strength: number
          total_battles: number
          updated_at: string
          user_id: string
          vip_accessory_id: string | null
          vip_hair_id: string | null
          vip_pants_id: string | null
          vip_shirt_id: string | null
          vitality: number
          wins: number
          xp_to_next_level: number
        }
        Insert: {
          accessory?: string | null
          agility?: number
          arena_points?: number
          available_points?: number
          avatar_customization?: string | null
          avatar_id?: string
          ban_reason?: string | null
          banned_at?: string | null
          class?: Database["public"]["Enums"]["character_class"] | null
          created_at?: string
          current_energy?: number
          current_hp?: number
          current_mana?: number
          current_xp?: number
          defense?: number
          eye_color?: string
          face_style?: string
          gold?: number
          hair_color?: string
          hair_style?: string
          id?: string
          is_banned?: boolean
          is_protected?: boolean
          last_energy_regen?: string
          last_hp_regen?: string
          last_mana_regen?: string
          level?: number
          luck?: number
          max_energy?: number
          max_hp?: number
          max_mana?: number
          missions_completed?: number
          name: string
          pants_color?: string
          protection_until?: string | null
          shirt_color?: string
          shoes_color?: string
          skin_tone?: string
          strength?: number
          total_battles?: number
          updated_at?: string
          user_id: string
          vip_accessory_id?: string | null
          vip_hair_id?: string | null
          vip_pants_id?: string | null
          vip_shirt_id?: string | null
          vitality?: number
          wins?: number
          xp_to_next_level?: number
        }
        Update: {
          accessory?: string | null
          agility?: number
          arena_points?: number
          available_points?: number
          avatar_customization?: string | null
          avatar_id?: string
          ban_reason?: string | null
          banned_at?: string | null
          class?: Database["public"]["Enums"]["character_class"] | null
          created_at?: string
          current_energy?: number
          current_hp?: number
          current_mana?: number
          current_xp?: number
          defense?: number
          eye_color?: string
          face_style?: string
          gold?: number
          hair_color?: string
          hair_style?: string
          id?: string
          is_banned?: boolean
          is_protected?: boolean
          last_energy_regen?: string
          last_hp_regen?: string
          last_mana_regen?: string
          level?: number
          luck?: number
          max_energy?: number
          max_hp?: number
          max_mana?: number
          missions_completed?: number
          name?: string
          pants_color?: string
          protection_until?: string | null
          shirt_color?: string
          shoes_color?: string
          skin_tone?: string
          strength?: number
          total_battles?: number
          updated_at?: string
          user_id?: string
          vip_accessory_id?: string | null
          vip_hair_id?: string | null
          vip_pants_id?: string | null
          vip_shirt_id?: string | null
          vitality?: number
          wins?: number
          xp_to_next_level?: number
        }
        Relationships: [
          {
            foreignKeyName: "characters_vip_accessory_id_fkey"
            columns: ["vip_accessory_id"]
            isOneToOne: false
            referencedRelation: "vip_clothing"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "characters_vip_hair_id_fkey"
            columns: ["vip_hair_id"]
            isOneToOne: false
            referencedRelation: "vip_clothing"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "characters_vip_pants_id_fkey"
            columns: ["vip_pants_id"]
            isOneToOne: false
            referencedRelation: "vip_clothing"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "characters_vip_shirt_id_fkey"
            columns: ["vip_shirt_id"]
            isOneToOne: false
            referencedRelation: "vip_clothing"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          created_at: string
          guild_id: string | null
          id: string
          is_global: boolean
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          guild_id?: string | null
          id?: string
          is_global?: boolean
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          guild_id?: string | null
          id?: string
          is_global?: boolean
          message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_logins: {
        Row: {
          created_at: string
          day_streak: number
          gold_reward: number
          id: string
          login_date: string
          reward_claimed: boolean
          user_id: string
          xp_reward: number
        }
        Insert: {
          created_at?: string
          day_streak?: number
          gold_reward?: number
          id?: string
          login_date?: string
          reward_claimed?: boolean
          user_id: string
          xp_reward?: number
        }
        Update: {
          created_at?: string
          day_streak?: number
          gold_reward?: number
          id?: string
          login_date?: string
          reward_claimed?: boolean
          user_id?: string
          xp_reward?: number
        }
        Relationships: []
      }
      dungeon_participants: {
        Row: {
          damage_dealt: number
          id: string
          is_ready: boolean
          joined_at: string
          run_id: string
          user_id: string
        }
        Insert: {
          damage_dealt?: number
          id?: string
          is_ready?: boolean
          joined_at?: string
          run_id: string
          user_id: string
        }
        Update: {
          damage_dealt?: number
          id?: string
          is_ready?: boolean
          joined_at?: string
          run_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dungeon_participants_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "dungeon_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      dungeon_runs: {
        Row: {
          created_at: string
          created_by: string
          current_boss_hp: number
          dungeon_id: string
          ends_at: string | null
          id: string
          started_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          created_by: string
          current_boss_hp: number
          dungeon_id: string
          ends_at?: string | null
          id?: string
          started_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          current_boss_hp?: number
          dungeon_id?: string
          ends_at?: string | null
          id?: string
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "dungeon_runs_dungeon_id_fkey"
            columns: ["dungeon_id"]
            isOneToOne: false
            referencedRelation: "dungeons"
            referencedColumns: ["id"]
          },
        ]
      }
      dungeons: {
        Row: {
          boss_defense: number
          boss_hp: number
          boss_name: string
          boss_strength: number
          created_at: string
          description: string
          duration_minutes: number
          gold_reward: number
          icon: string | null
          id: string
          max_players: number
          min_level: number
          min_players: number
          name: string
          xp_reward: number
        }
        Insert: {
          boss_defense: number
          boss_hp: number
          boss_name: string
          boss_strength: number
          created_at?: string
          description: string
          duration_minutes?: number
          gold_reward: number
          icon?: string | null
          id?: string
          max_players?: number
          min_level?: number
          min_players?: number
          name: string
          xp_reward: number
        }
        Update: {
          boss_defense?: number
          boss_hp?: number
          boss_name?: string
          boss_strength?: number
          created_at?: string
          description?: string
          duration_minutes?: number
          gold_reward?: number
          icon?: string | null
          id?: string
          max_players?: number
          min_level?: number
          min_players?: number
          name?: string
          xp_reward?: number
        }
        Relationships: []
      }
      guild_members: {
        Row: {
          contribution: number
          created_at: string
          guild_id: string
          id: string
          joined_at: string
          role: Database["public"]["Enums"]["guild_role"]
          user_id: string
        }
        Insert: {
          contribution?: number
          created_at?: string
          guild_id: string
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["guild_role"]
          user_id: string
        }
        Update: {
          contribution?: number
          created_at?: string
          guild_id?: string
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["guild_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_members_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_requests: {
        Row: {
          created_at: string
          guild_id: string
          id: string
          message: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          guild_id: string
          id?: string
          message?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          guild_id?: string
          id?: string
          message?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_requests_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_wars: {
        Row: {
          attacker_guild_id: string
          attacker_score: number
          defender_guild_id: string
          defender_score: number
          ends_at: string
          gold_reward: number
          id: string
          started_at: string
          status: string
          winner_guild_id: string | null
          xp_reward: number
        }
        Insert: {
          attacker_guild_id: string
          attacker_score?: number
          defender_guild_id: string
          defender_score?: number
          ends_at?: string
          gold_reward?: number
          id?: string
          started_at?: string
          status?: string
          winner_guild_id?: string | null
          xp_reward?: number
        }
        Update: {
          attacker_guild_id?: string
          attacker_score?: number
          defender_guild_id?: string
          defender_score?: number
          ends_at?: string
          gold_reward?: number
          id?: string
          started_at?: string
          status?: string
          winner_guild_id?: string | null
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "guild_wars_attacker_guild_id_fkey"
            columns: ["attacker_guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_wars_defender_guild_id_fkey"
            columns: ["defender_guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_wars_winner_guild_id_fkey"
            columns: ["winner_guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guilds: {
        Row: {
          created_at: string
          description: string | null
          experience: number
          gold_bank: number
          icon: string | null
          id: string
          leader_id: string
          level: number
          max_members: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          experience?: number
          gold_bank?: number
          icon?: string | null
          id?: string
          leader_id: string
          level?: number
          max_members?: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          experience?: number
          gold_bank?: number
          icon?: string | null
          id?: string
          leader_id?: string
          level?: number
          max_members?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      items: {
        Row: {
          agility_bonus: number
          created_at: string
          defense_bonus: number
          description: string
          energy_restore: number
          hp_restore: number
          icon: string | null
          id: string
          is_consumable: boolean
          luck_bonus: number
          mana_bonus: number
          mana_restore: number
          min_level: number
          name: string
          price: number
          rarity: string
          strength_bonus: number
          type: string
          vitality_bonus: number
        }
        Insert: {
          agility_bonus?: number
          created_at?: string
          defense_bonus?: number
          description: string
          energy_restore?: number
          hp_restore?: number
          icon?: string | null
          id?: string
          is_consumable?: boolean
          luck_bonus?: number
          mana_bonus?: number
          mana_restore?: number
          min_level?: number
          name: string
          price: number
          rarity?: string
          strength_bonus?: number
          type: string
          vitality_bonus?: number
        }
        Update: {
          agility_bonus?: number
          created_at?: string
          defense_bonus?: number
          description?: string
          energy_restore?: number
          hp_restore?: number
          icon?: string | null
          id?: string
          is_consumable?: boolean
          luck_bonus?: number
          mana_bonus?: number
          mana_restore?: number
          min_level?: number
          name?: string
          price?: number
          rarity?: string
          strength_bonus?: number
          type?: string
          vitality_bonus?: number
        }
        Relationships: []
      }
      materials: {
        Row: {
          created_at: string
          description: string
          drop_source: string
          icon: string | null
          id: string
          name: string
          rarity: string
        }
        Insert: {
          created_at?: string
          description: string
          drop_source: string
          icon?: string | null
          id?: string
          name: string
          rarity?: string
        }
        Update: {
          created_at?: string
          description?: string
          drop_source?: string
          icon?: string | null
          id?: string
          name?: string
          rarity?: string
        }
        Relationships: []
      }
      mining_drops: {
        Row: {
          drop_chance: number
          id: string
          material_id: string
          max_quantity: number
          min_quantity: number
          node_id: string
        }
        Insert: {
          drop_chance?: number
          id?: string
          material_id: string
          max_quantity?: number
          min_quantity?: number
          node_id: string
        }
        Update: {
          drop_chance?: number
          id?: string
          material_id?: string
          max_quantity?: number
          min_quantity?: number
          node_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mining_drops_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mining_drops_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "mining_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      mining_nodes: {
        Row: {
          created_at: string
          description: string
          hp: number
          icon: string | null
          id: string
          name: string
          required_mining_power: number
          tier: number
        }
        Insert: {
          created_at?: string
          description: string
          hp?: number
          icon?: string | null
          id?: string
          name: string
          required_mining_power?: number
          tier?: number
        }
        Update: {
          created_at?: string
          description?: string
          hp?: number
          icon?: string | null
          id?: string
          name?: string
          required_mining_power?: number
          tier?: number
        }
        Relationships: []
      }
      missions: {
        Row: {
          category: string
          cooldown_minutes: number | null
          created_at: string
          description: string
          difficulty: string
          duration_minutes: number
          energy_cost: number
          gold_reward: number
          id: string
          is_repeatable: boolean
          min_level: number
          title: string
          xp_reward: number
        }
        Insert: {
          category: string
          cooldown_minutes?: number | null
          created_at?: string
          description: string
          difficulty: string
          duration_minutes: number
          energy_cost?: number
          gold_reward: number
          id?: string
          is_repeatable?: boolean
          min_level?: number
          title: string
          xp_reward: number
        }
        Update: {
          category?: string
          cooldown_minutes?: number | null
          created_at?: string
          description?: string
          difficulty?: string
          duration_minutes?: number
          energy_cost?: number
          gold_reward?: number
          id?: string
          is_repeatable?: boolean
          min_level?: number
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      npcs: {
        Row: {
          created_at: string
          defense: number
          gold_reward: number
          hp: number
          id: string
          level: number
          name: string
          strength: number
          xp_reward: number
        }
        Insert: {
          created_at?: string
          defense: number
          gold_reward: number
          hp: number
          id?: string
          level: number
          name: string
          strength: number
          xp_reward: number
        }
        Update: {
          created_at?: string
          defense?: number
          gold_reward?: number
          hp?: number
          id?: string
          level?: number
          name?: string
          strength?: number
          xp_reward?: number
        }
        Relationships: []
      }
      pet_foods: {
        Row: {
          created_at: string
          description: string
          happiness_restore: number
          hunger_restore: number
          icon: string | null
          id: string
          name: string
          price: number
          rarity: string
        }
        Insert: {
          created_at?: string
          description: string
          happiness_restore?: number
          hunger_restore?: number
          icon?: string | null
          id?: string
          name: string
          price?: number
          rarity?: string
        }
        Update: {
          created_at?: string
          description?: string
          happiness_restore?: number
          hunger_restore?: number
          icon?: string | null
          id?: string
          name?: string
          price?: number
          rarity?: string
        }
        Relationships: []
      }
      pets: {
        Row: {
          ability_cooldown: number
          ability_type: string
          ability_value: number
          agility_bonus: number
          created_at: string
          defense_bonus: number
          description: string
          icon: string | null
          id: string
          luck_bonus: number
          name: string
          rarity: string
          strength_bonus: number
          vitality_bonus: number
        }
        Insert: {
          ability_cooldown?: number
          ability_type: string
          ability_value?: number
          agility_bonus?: number
          created_at?: string
          defense_bonus?: number
          description: string
          icon?: string | null
          id?: string
          luck_bonus?: number
          name: string
          rarity?: string
          strength_bonus?: number
          vitality_bonus?: number
        }
        Update: {
          ability_cooldown?: number
          ability_type?: string
          ability_value?: number
          agility_bonus?: number
          created_at?: string
          defense_bonus?: number
          description?: string
          icon?: string | null
          id?: string
          luck_bonus?: number
          name?: string
          rarity?: string
          strength_bonus?: number
          vitality_bonus?: number
        }
        Relationships: []
      }
      pickaxes: {
        Row: {
          created_at: string
          description: string
          icon: string | null
          id: string
          is_craftable: boolean
          max_durability: number
          mining_power: number
          name: string
          price: number | null
          rarity: string
        }
        Insert: {
          created_at?: string
          description: string
          icon?: string | null
          id?: string
          is_craftable?: boolean
          max_durability?: number
          mining_power?: number
          name: string
          price?: number | null
          rarity?: string
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string | null
          id?: string
          is_craftable?: boolean
          max_durability?: number
          mining_power?: number
          name?: string
          price?: number | null
          rarity?: string
        }
        Relationships: []
      }
      player_achievements: {
        Row: {
          achievement_id: string
          claimed: boolean
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          claimed?: boolean
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          claimed?: boolean
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      player_inventory: {
        Row: {
          acquired_at: string
          created_at: string
          id: string
          is_equipped: boolean
          item_id: string
          quantity: number
          user_id: string
        }
        Insert: {
          acquired_at?: string
          created_at?: string
          id?: string
          is_equipped?: boolean
          item_id: string
          quantity?: number
          user_id: string
        }
        Update: {
          acquired_at?: string
          created_at?: string
          id?: string
          is_equipped?: boolean
          item_id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_inventory_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      player_materials: {
        Row: {
          created_at: string
          id: string
          material_id: string
          quantity: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          material_id: string
          quantity?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          material_id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_materials_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      player_missions: {
        Row: {
          completed_at: string | null
          completes_at: string
          created_at: string
          id: string
          mission_id: string
          started_at: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completes_at: string
          created_at?: string
          id?: string
          mission_id: string
          started_at?: string
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completes_at?: string
          created_at?: string
          id?: string
          mission_id?: string
          started_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_missions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      player_pet_foods: {
        Row: {
          created_at: string
          food_id: string
          id: string
          quantity: number
          user_id: string
        }
        Insert: {
          created_at?: string
          food_id: string
          id?: string
          quantity?: number
          user_id: string
        }
        Update: {
          created_at?: string
          food_id?: string
          id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_pet_foods_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "pet_foods"
            referencedColumns: ["id"]
          },
        ]
      }
      player_pets: {
        Row: {
          acquired_at: string
          created_at: string
          experience: number
          happiness: number
          hunger: number
          id: string
          is_active: boolean
          last_ability_use: string | null
          last_fed: string | null
          level: number
          nickname: string | null
          pet_id: string
          user_id: string
        }
        Insert: {
          acquired_at?: string
          created_at?: string
          experience?: number
          happiness?: number
          hunger?: number
          id?: string
          is_active?: boolean
          last_ability_use?: string | null
          last_fed?: string | null
          level?: number
          nickname?: string | null
          pet_id: string
          user_id: string
        }
        Update: {
          acquired_at?: string
          created_at?: string
          experience?: number
          happiness?: number
          hunger?: number
          id?: string
          is_active?: boolean
          last_ability_use?: string | null
          last_fed?: string | null
          level?: number
          nickname?: string | null
          pet_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_pets_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      player_pickaxes: {
        Row: {
          created_at: string
          current_durability: number
          id: string
          is_equipped: boolean
          pickaxe_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_durability: number
          id?: string
          is_equipped?: boolean
          pickaxe_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_durability?: number
          id?: string
          is_equipped?: boolean
          pickaxe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_pickaxes_pickaxe_id_fkey"
            columns: ["pickaxe_id"]
            isOneToOne: false
            referencedRelation: "pickaxes"
            referencedColumns: ["id"]
          },
        ]
      }
      player_presence: {
        Row: {
          character_name: string
          is_online: boolean
          last_seen: string
          user_id: string
        }
        Insert: {
          character_name: string
          is_online?: boolean
          last_seen?: string
          user_id: string
        }
        Update: {
          character_name?: string
          is_online?: boolean
          last_seen?: string
          user_id?: string
        }
        Relationships: []
      }
      player_vip_clothing: {
        Row: {
          acquired_at: string
          clothing_id: string
          id: string
          is_equipped: boolean | null
          user_id: string
        }
        Insert: {
          acquired_at?: string
          clothing_id: string
          id?: string
          is_equipped?: boolean | null
          user_id: string
        }
        Update: {
          acquired_at?: string
          clothing_id?: string
          id?: string
          is_equipped?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_vip_clothing_clothing_id_fkey"
            columns: ["clothing_id"]
            isOneToOne: false
            referencedRelation: "vip_clothing"
            referencedColumns: ["id"]
          },
        ]
      }
      private_messages: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          receiver_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          receiver_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recipe_materials: {
        Row: {
          id: string
          material_id: string
          quantity_required: number
          recipe_id: string
        }
        Insert: {
          id?: string
          material_id: string
          quantity_required?: number
          recipe_id: string
        }
        Update: {
          id?: string
          material_id?: string
          quantity_required?: number
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_materials_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_materials_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          crafting_time_minutes: number
          created_at: string
          description: string
          icon: string | null
          id: string
          name: string
          required_level: number
          result_item_id: string
        }
        Insert: {
          crafting_time_minutes?: number
          created_at?: string
          description: string
          icon?: string | null
          id?: string
          name: string
          required_level?: number
          result_item_id: string
        }
        Update: {
          crafting_time_minutes?: number
          created_at?: string
          description?: string
          icon?: string | null
          id?: string
          name?: string
          required_level?: number
          result_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipes_result_item_id_fkey"
            columns: ["result_item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      training_sessions: {
        Row: {
          completed_at: string | null
          completes_at: string
          created_at: string
          energy_cost: number
          id: string
          started_at: string
          stat_gain: number
          stat_type: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completes_at: string
          created_at?: string
          energy_cost?: number
          id?: string
          started_at?: string
          stat_gain?: number
          stat_type: string
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completes_at?: string
          created_at?: string
          energy_cost?: number
          id?: string
          started_at?: string
          stat_gain?: number
          stat_type?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vip_clothing: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          min_level: number | null
          name: string
          price_brl_cents: number | null
          price_gold: number | null
          price_premium: number | null
          rarity: string
          type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          min_level?: number | null
          name: string
          price_brl_cents?: number | null
          price_gold?: number | null
          price_premium?: number | null
          rarity?: string
          type: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          min_level?: number | null
          name?: string
          price_brl_cents?: number | null
          price_gold?: number | null
          price_premium?: number | null
          rarity?: string
          type?: string
        }
        Relationships: []
      }
      vip_purchases: {
        Row: {
          amount_cents: number
          clothing_id: string
          created_at: string
          expires_at: string | null
          id: string
          paid_at: string | null
          payment_id: string | null
          pix_copy_paste: string | null
          qr_code: string | null
          qr_code_base64: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          clothing_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          paid_at?: string | null
          payment_id?: string | null
          pix_copy_paste?: string | null
          qr_code?: string | null
          qr_code_base64?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          clothing_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          paid_at?: string | null
          payment_id?: string | null
          pix_copy_paste?: string | null
          qr_code?: string | null
          qr_code_base64?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vip_purchases_clothing_id_fkey"
            columns: ["clothing_id"]
            isOneToOne: false
            referencedRelation: "vip_clothing"
            referencedColumns: ["id"]
          },
        ]
      }
      war_battles: {
        Row: {
          attacker_damage: number
          attacker_id: string
          created_at: string
          defender_damage: number
          defender_id: string
          id: string
          war_id: string
          winner_id: string | null
        }
        Insert: {
          attacker_damage?: number
          attacker_id: string
          created_at?: string
          defender_damage?: number
          defender_id: string
          id?: string
          war_id: string
          winner_id?: string | null
        }
        Update: {
          attacker_damage?: number
          attacker_id?: string
          created_at?: string
          defender_damage?: number
          defender_id?: string
          id?: string
          war_id?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "war_battles_war_id_fkey"
            columns: ["war_id"]
            isOneToOne: false
            referencedRelation: "guild_wars"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_power: {
        Args: {
          p_agility: number
          p_defense: number
          p_level: number
          p_luck: number
          p_strength: number
          p_vitality: number
        }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      character_class: "warrior" | "mage" | "archer"
      guild_role: "leader" | "officer" | "member"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      character_class: ["warrior", "mage", "archer"],
      guild_role: ["leader", "officer", "member"],
    },
  },
} as const

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
          avatar_id: string
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
          vitality: number
          wins: number
          xp_to_next_level: number
        }
        Insert: {
          accessory?: string | null
          agility?: number
          arena_points?: number
          available_points?: number
          avatar_id?: string
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
          vitality?: number
          wins?: number
          xp_to_next_level?: number
        }
        Update: {
          accessory?: string | null
          agility?: number
          arena_points?: number
          available_points?: number
          avatar_id?: string
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
          vitality?: number
          wins?: number
          xp_to_next_level?: number
        }
        Relationships: []
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
    }
    Enums: {
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
      character_class: ["warrior", "mage", "archer"],
      guild_role: ["leader", "officer", "member"],
    },
  },
} as const

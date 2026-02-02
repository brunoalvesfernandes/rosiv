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
          agility: number
          arena_points: number
          available_points: number
          created_at: string
          current_energy: number
          current_hp: number
          current_mana: number
          current_xp: number
          defense: number
          gold: number
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
          protection_until: string | null
          strength: number
          total_battles: number
          updated_at: string
          user_id: string
          vitality: number
          wins: number
          xp_to_next_level: number
        }
        Insert: {
          agility?: number
          arena_points?: number
          available_points?: number
          created_at?: string
          current_energy?: number
          current_hp?: number
          current_mana?: number
          current_xp?: number
          defense?: number
          gold?: number
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
          protection_until?: string | null
          strength?: number
          total_battles?: number
          updated_at?: string
          user_id: string
          vitality?: number
          wins?: number
          xp_to_next_level?: number
        }
        Update: {
          agility?: number
          arena_points?: number
          available_points?: number
          created_at?: string
          current_energy?: number
          current_hp?: number
          current_mana?: number
          current_xp?: number
          defense?: number
          gold?: number
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
          protection_until?: string | null
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
      [_ in never]: never
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
    Enums: {},
  },
} as const

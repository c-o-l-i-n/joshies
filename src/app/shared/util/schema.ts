export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      bracket: {
        Row: {
          created_at: string;
          data: Json | null;
          event_id: number;
          id: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          data?: Json | null;
          event_id: number;
          id?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          data?: Json | null;
          event_id?: number;
          id?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'bracket_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'event';
            referencedColumns: ['id'];
          },
        ];
      };
      event: {
        Row: {
          created_at: string;
          description: string | null;
          format: Database['public']['Enums']['event_format'];
          id: number;
          image_url: string | null;
          lower_scores_are_better: boolean;
          name: string;
          points_label: string | null;
          round_number: number;
          rules: string | null;
          scoring_map: number[];
          session_id: number;
          team_size: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          format?: Database['public']['Enums']['event_format'];
          id?: number;
          image_url?: string | null;
          lower_scores_are_better?: boolean;
          name: string;
          points_label?: string | null;
          round_number: number;
          rules?: string | null;
          scoring_map: number[];
          session_id: number;
          team_size: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          format?: Database['public']['Enums']['event_format'];
          id?: number;
          image_url?: string | null;
          lower_scores_are_better?: boolean;
          name?: string;
          points_label?: string | null;
          round_number?: number;
          rules?: string | null;
          scoring_map?: number[];
          session_id?: number;
          team_size?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'event_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'session';
            referencedColumns: ['id'];
          },
        ];
      };
      event_format_standard_scoring_formula: {
        Row: {
          created_at: string;
          formula: string;
          id: Database['public']['Enums']['event_format'];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          formula: string;
          id: Database['public']['Enums']['event_format'];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          formula?: string;
          id?: Database['public']['Enums']['event_format'];
          updated_at?: string;
        };
        Relationships: [];
      };
      event_participant: {
        Row: {
          created_at: string;
          id: number;
          player_id: number;
          team_id: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          player_id: number;
          team_id: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          player_id?: number;
          team_id?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'event_participant_player_id_fkey';
            columns: ['player_id'];
            isOneToOne: false;
            referencedRelation: 'player';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'event_participant_team_id_fkey';
            columns: ['team_id'];
            isOneToOne: false;
            referencedRelation: 'event_team';
            referencedColumns: ['id'];
          },
        ];
      };
      event_team: {
        Row: {
          created_at: string;
          event_id: number;
          id: number;
          name: string | null;
          seed: number | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          event_id: number;
          id?: number;
          name?: string | null;
          seed?: number | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          event_id?: number;
          id?: number;
          name?: string | null;
          seed?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'event_team_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'event';
            referencedColumns: ['id'];
          },
        ];
      };
      event_team_round_score: {
        Row: {
          created_at: string;
          id: number;
          round_number: number;
          score: number;
          team_id: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          round_number: number;
          score?: number;
          team_id: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          round_number?: number;
          score?: number;
          team_id?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'event_team_round_score_team_id_fkey';
            columns: ['team_id'];
            isOneToOne: false;
            referencedRelation: 'event_team';
            referencedColumns: ['id'];
          },
        ];
      };
      game_state: {
        Row: {
          bank_balance: number;
          created_at: string;
          game_master_user_id: string;
          id: number;
          round_number: number;
          round_phase: Database['public']['Enums']['round_phase'];
          session_id: number;
          session_status: Database['public']['Enums']['session_status'];
          updated_at: string;
        };
        Insert: {
          bank_balance?: number;
          created_at?: string;
          game_master_user_id: string;
          id?: number;
          round_number: number;
          round_phase?: Database['public']['Enums']['round_phase'];
          session_id: number;
          session_status?: Database['public']['Enums']['session_status'];
          updated_at?: string;
        };
        Update: {
          bank_balance?: number;
          created_at?: string;
          game_master_user_id?: string;
          id?: number;
          round_number?: number;
          round_phase?: Database['public']['Enums']['round_phase'];
          session_id?: number;
          session_status?: Database['public']['Enums']['session_status'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'active_session_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'session';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'game_state_game_master_user_id_fkey';
            columns: ['game_master_user_id'];
            isOneToOne: false;
            referencedRelation: 'user';
            referencedColumns: ['id'];
          },
        ];
      };
      gameboard_move: {
        Row: {
          created_at: string;
          distance_traveled: number;
          gameboard_space_id: number;
          id: number;
          player_id: number;
          round_number: number;
          updated_at: string;
        };
        Insert: {
          created_at: string;
          distance_traveled: number;
          gameboard_space_id: number;
          id?: number;
          player_id: number;
          round_number: number;
          updated_at: string;
        };
        Update: {
          created_at?: string;
          distance_traveled?: number;
          gameboard_space_id?: number;
          id?: number;
          player_id?: number;
          round_number?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'gameboard_move_gameboard_space_id_fkey';
            columns: ['gameboard_space_id'];
            isOneToOne: false;
            referencedRelation: 'gameboard_space';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'gameboard_move_player_id_fkey';
            columns: ['player_id'];
            isOneToOne: false;
            referencedRelation: 'player';
            referencedColumns: ['id'];
          },
        ];
      };
      gameboard_space: {
        Row: {
          color: string;
          created_at: string;
          effect: Database['public']['Enums']['gameboard_space_effect'];
          effect_data: Json;
          icon_class: string | null;
          id: number;
          name: string;
          session_id: number;
          updated_at: string;
        };
        Insert: {
          color?: string;
          created_at?: string;
          effect?: Database['public']['Enums']['gameboard_space_effect'];
          effect_data?: Json;
          icon_class?: string | null;
          id?: number;
          name?: string;
          session_id: number;
          updated_at?: string;
        };
        Update: {
          color?: string;
          created_at?: string;
          effect?: Database['public']['Enums']['gameboard_space_effect'];
          effect_data?: Json;
          icon_class?: string | null;
          id?: number;
          name?: string;
          session_id?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'gameboard_space_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'session';
            referencedColumns: ['id'];
          },
        ];
      };
      player: {
        Row: {
          created_at: string;
          enabled: boolean;
          id: number;
          score: number;
          session_id: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          enabled?: boolean;
          id?: number;
          score?: number;
          session_id: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          enabled?: boolean;
          id?: number;
          score?: number;
          session_id?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'player_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'public_player_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'session';
            referencedColumns: ['id'];
          },
        ];
      };
      player_round_score: {
        Row: {
          created_at: string;
          id: number;
          player_id: number;
          round_number: number;
          score: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          player_id: number;
          round_number: number;
          score: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          player_id?: number;
          round_number?: number;
          score?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'public_player_round_score_player_id_fkey';
            columns: ['player_id'];
            isOneToOne: false;
            referencedRelation: 'player';
            referencedColumns: ['id'];
          },
        ];
      };
      rules: {
        Row: {
          created_at: string;
          id: number;
          rules: string | null;
          session_id: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          rules?: string | null;
          session_id: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          rules?: string | null;
          session_id?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'public_rules_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: true;
            referencedRelation: 'session';
            referencedColumns: ['id'];
          },
        ];
      };
      session: {
        Row: {
          created_at: string;
          end_date: string;
          id: number;
          name: string;
          num_rounds: number;
          start_date: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          end_date?: string;
          id?: number;
          name?: string;
          num_rounds: number;
          start_date?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          end_date?: string;
          id?: number;
          name?: string;
          num_rounds?: number;
          start_date?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      special_space_event: {
        Row: {
          created_at: string;
          id: number;
          player_id: number;
          results: Json | null;
          round_number: number;
          session_id: number;
          special_space_id: number;
          status: Database['public']['Enums']['space_event_status'];
          template_id: number | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          player_id: number;
          results?: Json | null;
          round_number: number;
          session_id: number;
          special_space_id: number;
          status: Database['public']['Enums']['space_event_status'];
          template_id?: number | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          player_id?: number;
          results?: Json | null;
          round_number?: number;
          session_id?: number;
          special_space_id?: number;
          status?: Database['public']['Enums']['space_event_status'];
          template_id?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'special_space_event_player_id_fkey';
            columns: ['player_id'];
            isOneToOne: false;
            referencedRelation: 'player';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'special_space_event_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'session';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'special_space_event_special_space_id_fkey';
            columns: ['special_space_id'];
            isOneToOne: false;
            referencedRelation: 'gameboard_space';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'special_space_event_template_id_fkey';
            columns: ['template_id'];
            isOneToOne: false;
            referencedRelation: 'special_space_event_template';
            referencedColumns: ['id'];
          },
        ];
      };
      special_space_event_template: {
        Row: {
          created_at: string;
          description: string;
          details: Json;
          id: number;
          name: string;
          session_id: number;
          type: Database['public']['Enums']['special_space_event_type'];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          details: Json;
          id?: number;
          name: string;
          session_id: number;
          type: Database['public']['Enums']['special_space_event_type'];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          details?: Json;
          id?: number;
          name?: string;
          session_id?: number;
          type?: Database['public']['Enums']['special_space_event_type'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'special_space_event_template_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'session';
            referencedColumns: ['id'];
          },
        ];
      };
      transaction: {
        Row: {
          created_at: string;
          description: string | null;
          id: number;
          num_points: number;
          player_id: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: number;
          num_points: number;
          player_id: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: number;
          num_points?: number;
          player_id?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'transaction_player_id_fkey';
            columns: ['player_id'];
            isOneToOne: false;
            referencedRelation: 'player';
            referencedColumns: ['id'];
          },
        ];
      };
      user: {
        Row: {
          avatar_url: string;
          can_edit_profile: boolean;
          created_at: string;
          display_name: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string;
          can_edit_profile?: boolean;
          created_at?: string;
          display_name?: string;
          id: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string;
          can_edit_profile?: boolean;
          created_at?: string;
          display_name?: string;
          id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      user_notifications_subscription: {
        Row: {
          created_at: string;
          id: number;
          notifications_subscription: Json;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          notifications_subscription: Json;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          notifications_subscription?: Json;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_notifications_subscription_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      lifetime_user_stats: {
        Row: {
          avatar_url: string | null;
          average_score: number | null;
          display_name: string | null;
          lifetime_score: number | null;
          num_sessions: number | null;
          user_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'player_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user';
            referencedColumns: ['id'];
          },
        ];
      };
      moves_for_current_round: {
        Row: {
          avatar_url: string | null;
          display_name: string | null;
          gameboard_space_id: number | null;
          player_id: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'gameboard_move_gameboard_space_id_fkey';
            columns: ['gameboard_space_id'];
            isOneToOne: false;
            referencedRelation: 'gameboard_space';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'gameboard_move_player_id_fkey';
            columns: ['player_id'];
            isOneToOne: false;
            referencedRelation: 'player';
            referencedColumns: ['id'];
          },
        ];
      };
      special_space_events_for_current_round: {
        Row: {
          avatar_url: string | null;
          display_name: string | null;
          id: number | null;
          player_id: number | null;
          status: Database['public']['Enums']['space_event_status'] | null;
          template_id: number | null;
          template_name: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'special_space_event_player_id_fkey';
            columns: ['player_id'];
            isOneToOne: false;
            referencedRelation: 'player';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'special_space_event_template_id_fkey';
            columns: ['template_id'];
            isOneToOne: false;
            referencedRelation: 'special_space_event_template';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Functions: {
      create_session: {
        Args: {
          session_name: string;
          session_start_date: string;
          session_end_date: string;
          num_rounds: number;
          player_user_ids: string[];
        };
        Returns: undefined;
      };
      end_round: {
        Args: {
          _round_number: number;
          player_score_changes: Json;
        };
        Returns: undefined;
      };
      get_all_scores_from_session: {
        Args: {
          sessionid: number;
        };
        Returns: Record<string, unknown>[];
      };
      get_player_round_scores_from_session: {
        Args: {
          sessionid: number;
        };
        Returns: {
          player_id: number;
          display_name: string;
          avatar_url: string;
          scores: number[];
        }[];
      };
      log_round_moves: {
        Args: {
          roundnumber: number;
          playermoves: Json;
        };
        Returns: undefined;
      };
      override_points: {
        Args: {
          data: Json;
        };
        Returns: undefined;
      };
      reorder_events: {
        Args: {
          events_with_new_round_number: Json;
        };
        Returns: undefined;
      };
      start_session_early: {
        Args: {
          now: string;
        };
        Returns: undefined;
      };
      submit_gain_points_based_on_rank: {
        Args: {
          special_space_event_id: number;
          special_space_event_template_id: number;
          player_score_changes: Json;
        };
        Returns: undefined;
      };
      submit_special_space_event_score: {
        Args: {
          special_space_event_id: number;
          score: number;
        };
        Returns: undefined;
      };
    };
    Enums: {
      chaos_space_event_type:
        | 'everyone_gains_points_based_on_rank'
        | 'everyone_loses_percentage_of_their_points'
        | 'everyone_loses_percentage_of_their_points_based_on_task_failure'
        | 'point_swap';
      event_format:
        | 'single_elimination_tournament'
        | 'double_elimination_tournament'
        | 'score_based_single_round';
      gameboard_space_effect:
        | 'gain_points'
        | 'gain_points_or_do_activity'
        | 'special'
        | 'duel';
      round_phase:
        | 'gameboard_moves'
        | 'special_space_events'
        | 'duels'
        | 'chaos_space_events'
        | 'event'
        | 'waiting_for_next_round';
      session_status: 'not_started' | 'in_progress' | 'finished';
      space_event_status:
        | 'event_not_selected'
        | 'waiting_to_begin'
        | 'in_progress'
        | 'finished'
        | 'canceled';
      special_space_event_type:
        | 'player_gains_points_based_on_game_score'
        | 'everyone_gains_points_based_on_rank';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
        PublicSchema['Views'])
    ? (PublicSchema['Tables'] &
        PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never;

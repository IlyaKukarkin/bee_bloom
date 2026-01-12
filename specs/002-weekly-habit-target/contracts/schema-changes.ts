/**
 * Schema Contract: Weekly Habit Target
 * 
 * This file documents the schema changes for adding weekly target support.
 * TinyBase doesn't enforce schemas at runtime, but this serves as the contract
 * for TypeScript types and migration expectations.
 */

// ============================================================================
// SCHEMA CHANGE: Add weeklyTarget to habits table
// ============================================================================

export const SCHEMA_CHANGE = {
  table: "habits",
  operation: "ADD_FIELD",
  field: "weeklyTarget",
  type: "number",
  constraints: {
    required: true,
    min: 1,
    max: 7,
    default: 7,
  },
  migrationRequired: true,
} as const;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Updated Habit row type with weeklyTarget field
 */
export interface HabitRowWithTarget {
  id: string;
  title: string;
  description?: string | null;
  color: string;
  groupId: string | null;
  order?: number;
  createdAt: string; // ISO 8601
  deletedAt: string | null; // ISO 8601 or null
  weeklyTarget: number; // NEW: 1-7, default 7
}

/**
 * Weekly progress calculation result (not stored, computed)
 */
export interface WeeklyProgress {
  habitId: string;
  current: number; // Completions this week
  target: number; // From habit.weeklyTarget
  display: string; // Format: "X/Y" e.g. "3/7"
  percentComplete: number; // current / target * 100
}

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const WEEKLY_TARGET_VALIDATION = {
  /**
   * Validate weeklyTarget value is within allowed range
   */
  isValid: (value: number): boolean => {
    return Number.isInteger(value) && value >= 1 && value <= 7;
  },

  /**
   * Valid options for UI picker
   */
  OPTIONS: [1, 2, 3, 4, 5, 6, 7] as const,

  /**
   * Default value for new habits and migration
   */
  DEFAULT: 7 as const,
} as const;

// ============================================================================
// MIGRATION CONTRACT
// ============================================================================

export const MIGRATION_CONTRACT = {
  name: "migrateToWeeklyTarget",
  version: "1.2.0", // Semantic version bump
  description: "Add weeklyTarget field to all existing habits with default value 7",
  
  /**
   * Migration should be idempotent - safe to run multiple times
   */
  idempotent: true,

  /**
   * Changes applied by migration
   */
  changes: [
    {
      table: "habits",
      operation: "SET_CELL",
      cell: "weeklyTarget",
      value: 7,
      condition: "IF field missing AND habit not deleted",
    },
  ],

  /**
   * Verification after migration
   */
  verify: {
    check: "All non-deleted habits have weeklyTarget field",
    failIf: "Any habit.weeklyTarget is undefined or null",
  },
} as const;

// ============================================================================
// QUERY CONTRACTS
// ============================================================================

/**
 * Contract for weekly progress calculation
 */
export interface WeeklyProgressQuery {
  /**
   * Input parameters
   */
  input: {
    habitId: string;
    weekStart: string; // ISO 8601 date
    weekEnd: string; // ISO 8601 date
  };

  /**
   * Expected checks table query
   */
  query: {
    table: "checks";
    filters: {
      habitId: string;
      dateRange: [string, string]; // [weekStart, weekEnd]
      completed: true;
    };
    aggregation: "COUNT";
  };

  /**
   * Output format
   */
  output: WeeklyProgress;
}

// ============================================================================
// UI COMPONENT PROPS CONTRACTS
// ============================================================================

/**
 * Props for WeeklyTargetPicker component
 */
export interface WeeklyTargetPickerProps {
  value: number; // Current selected value (1-7)
  onValueChange: (value: number) => void; // Callback when selection changes
  disabled?: boolean; // Optional: disable picker
  label?: string; // Optional: label text (default: "Weekly Target")
}

/**
 * Props for weekly progress display
 */
export interface WeeklyProgressDisplayProps {
  current: number; // Completions this week
  target: number; // Weekly target
  habitId?: string; // Optional: for accessibility labels
}

// ============================================================================
// BACKWARD COMPATIBILITY
// ============================================================================

/**
 * Legacy habit type (before weeklyTarget)
 * Used for migration detection
 */
export interface LegacyHabitRow {
  id: string;
  title: string;
  description?: string | null;
  color: string;
  groupId: string | null;
  order?: number;
  createdAt: string;
  deletedAt: string | null;
  // weeklyTarget: DOES NOT EXIST
}

/**
 * Type guard to check if habit has weeklyTarget
 */
export function hasWeeklyTarget(
  habit: LegacyHabitRow | HabitRowWithTarget
): habit is HabitRowWithTarget {
  return "weeklyTarget" in habit && typeof habit.weeklyTarget === "number";
}

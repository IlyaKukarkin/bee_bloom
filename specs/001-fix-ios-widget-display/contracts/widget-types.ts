/**
 * Widget Type Contracts: iOS Widget Display Recovery
 * 
 * Feature: 001-fix-ios-widget-display
 * Date: 2026-03-09
 * 
 * Type definitions for widget data structures and API interfaces.
 */

// ============================================================================
// Widget Size & Capacity
// ============================================================================

/**
 * Internal widget size category mapped from iOS WidgetKit family names.
 */
export type WidgetSize = 'small' | 'medium' | 'large';

/**
 * Maximum number of habits displayable per widget size.
 * 
 * Updated per spec clarifications:
 * - Small: 4 habits (name + status only)
 * - Medium: 4 habits (name + status + weekly progress)
 * - Large: 8 habits (name + status + weekly progress)
 */
export const WIDGET_CAPACITY: Record<WidgetSize, number> = {
  small: 4,
  medium: 4,
  large: 8,
};

// ============================================================================
// Widget Data Entities
// ============================================================================

/**
 * Weekly progress tracking data for medium/large widgets.
 */
export interface WeeklyProgress {
  /** Number of days completed this week (0-7) */
  completed: number;
  
  /** Target number of days to complete this week (from HabitRow.weeklyTarget) */
  target: number;
}

/**
 * Minimal habit information for widget display.
 * 
 * Extended to include optional weekly progress for medium/large widgets.
 */
export interface HabitWidgetItem {
  /** Habit unique identifier */
  id: string;
  
  /** Habit display name */
  title: string;
  
  /** Visual indicator color (hex format, e.g., "#FF5733") */
  color: string;
  
  /** Optional group association (null if ungrouped) */
  groupId: string | null;
  
  /** Group display name if grouped (null if ungrouped) */
  groupTitle: string | null;
  
  /** User-defined sort priority (lower = higher priority) */
  order: number;
  
  /** 
   * Weekly progress data (only populated for medium/large widgets).
   * Undefined if widget is small or habit has no weeklyTarget.
   */
  weeklyProgress?: WeeklyProgress;
}

/**
 * Aggregate view state representing widget display at a point in time.
 */
export interface WidgetViewState {
  /** Incomplete habits to display, sorted by priority, limited by capacity */
  incompleteHabits: HabitWidgetItem[];
  
  /** Total count of all active incomplete habits (may exceed capacity) */
  totalIncomplete: number;
  
  /** True if all active habits are checked today */
  allComplete: boolean;
  
  /** True if any active habits exist (including completed ones) */
  hasHabits: boolean;
  
  /** Timestamp when this state snapshot was generated */
  generatedAt: Date;
}

// ============================================================================
// Widget Store Interface
// ============================================================================

/**
 * Widget-specific store instance for shared SQLite access via App Groups.
 */
export interface WidgetStore {
  /** TinyBase store instance connected to shared SQLite database */
  store: Store;
  
  /** Expo SQLite persister managing auto-save and load */
  persister: Persister;
  
  /** Promise that resolves when initial data load completes */
  loadPromise: Promise<void>;
  
  /** Returns true if store data is loaded and ready */
  isLoaded: () => boolean;
}

// ============================================================================
// iOS WidgetKit Mapping
// ============================================================================

/**
 * iOS WidgetKit family names (from expo-widgets WidgetBase.family).
 */
export type WidgetKitFamily = 
  | 'systemSmall' 
  | 'systemMedium' 
  | 'systemLarge'
  | 'systemExtraLarge'  // iPad only, not used in this feature
  | 'accessoryCircular'  // Lock Screen, not used in this feature
  | 'accessoryRectangular'  // Lock Screen, not used in this feature
  | 'accessoryInline';  // Lock Screen, not used in this feature

/**
 * Maps iOS WidgetKit family name to internal size category.
 * 
 * @param family - iOS WidgetKit family name from props.family
 * @returns Internal widget size category
 * 
 * @example
 * getWidgetSizeFromFamily('systemSmall') // returns 'small'
 * getWidgetSizeFromFamily('systemMedium') // returns 'medium'
 * getWidgetSizeFromFamily('systemLarge') // returns 'large'
 */
export function getWidgetSizeFromFamily(family: WidgetKitFamily): WidgetSize {
  if (family === 'systemSmall') return 'small';
  if (family === 'systemMedium') return 'medium';
  return 'large';  // systemLarge and any other size defaults to large
}

// ============================================================================
// Timeline Configuration
// ============================================================================

/**
 * Timeline entry for widget updates.
 */
export interface WidgetTimelineEntry {
  /** Date/time when widget should display this entry */
  date: Date;
  
  /** Props passed to widget component (empty object for shared SQLite approach) */
  props: Record<string, unknown>;
}

/**
 * Generates timeline dates for widget refresh schedule.
 * 
 * Returns array of dates for: now, +15min, +30min, +45min, +60min, next midnight
 * 
 * @param now - Current date/time (defaults to new Date())
 * @returns Array of Date objects for timeline entries
 */
export function buildTimelineDates(now?: Date): Date[];

// ============================================================================
// Expo Widgets API (expo-widgets ~55.0.3)
// ============================================================================

/**
 * Props passed to widget component by expo-widgets.
 * 
 * CRITICAL: Widget component MUST have 'widget' directive as first line.
 */
export interface WidgetBase<T = Record<string, unknown>> {
  /** The date/time of this timeline entry */
  date: Date;
  
  /** The iOS WidgetKit family name (size) */
  family: WidgetKitFamily;
  
  /** Custom props passed via timeline entry (merged with T) */
  [key: string]: unknown;
}

/**
 * Widget instance created by createWidget().
 */
export interface Widget<T = Record<string, unknown>> {
  /** Updates widget timeline with scheduled entries */
  updateTimeline: (entries: WidgetTimelineEntry[]) => void;
  
  /** Sets widget to single snapshot (no timeline) */
  updateSnapshot: (props: T) => void;
  
  /** Force reloads widget immediately */
  reload: () => void;
  
  /** Returns current timeline entries */
  getTimeline: () => Promise<WidgetTimelineEntry[]>;
}

/**
 * Creates a widget instance with expo-widgets.
 * 
 * @param name - Widget name matching app.json configuration
 * @param component - Widget component function with 'widget' directive
 * @returns Widget instance for timeline management
 * 
 * @example
 * const MyWidget = (props: WidgetBase) => {
 *   'widget';  // ← REQUIRED DIRECTIVE
 *   return <VStack>...</VStack>;
 * };
 * 
 * const widget = createWidget('MyWidget', MyWidget);
 * widget.updateTimeline([{ date: new Date(), props: {} }]);
 */
export function createWidget<T extends Record<string, unknown>>(
  name: string,
  component: (props: WidgetBase<T>) => JSX.Element
): Widget<T>;

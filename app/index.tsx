import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import {
	Animated,
	Pressable,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	View,
} from "react-native";
import DraggableFlatList, {
	type RenderItemParams,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "tinybase/ui-react";
import { AnimatedCheckbox } from "../src/components/animations";
import { Body, Button, Surface, Title } from "../src/components/ui";
import { copy } from "../src/lib/copy";
import { todayKey } from "../src/lib/dates";
import { toggleDailyCheck } from "../src/store/checks";
import { reorderGroupList } from "../src/store/groups";
import { reorderHabitWithinGroup } from "../src/store/habits";
import { getGroupedHabits, getOrderedGroups } from "../src/store/selectors";
import type { HabitGroupRow, HabitRow } from "../src/store/types";

type HabitWithCheck = HabitRow & {
	isChecked: boolean;
};

type GroupWithHabits = {
	group: HabitGroupRow | null;
	habits: HabitWithCheck[];
};

type AnimatedHabitItemProps = RenderItemParams<HabitWithCheck> & {
	onEdit: (id: string) => void;
	onToggle: (id: string) => void;
};

const AnimatedHabitItem = React.memo(function AnimatedHabitItem({
	item,
	drag,
	isActive,
	onEdit,
	onToggle,
}: AnimatedHabitItemProps) {
	const pulseAnim = React.useRef(new Animated.Value(1)).current;

	React.useEffect(() => {
		if (isActive) {
			const pulse = Animated.loop(
				Animated.sequence([
					Animated.timing(pulseAnim, {
						toValue: 0.6,
						duration: 500,
						useNativeDriver: true,
					}),
					Animated.timing(pulseAnim, {
						toValue: 1,
						duration: 500,
						useNativeDriver: true,
					}),
				]),
			);
			pulse.start();
			return () => pulse.stop();
		}
		pulseAnim.setValue(1);
	}, [isActive, pulseAnim]);

	return (
		<Animated.View style={{ opacity: pulseAnim }}>
			<Surface style={styles.habitRow}>
				<Pressable style={styles.habitContent} onPress={() => onEdit(item.id)}>
					<Pressable
						onLongPress={drag}
						delayLongPress={200}
						hitSlop={10}
						style={styles.dragHandle}
					>
						<View style={[styles.colorDot, { backgroundColor: item.color }]} />
					</Pressable>
					<View style={styles.habitText}>
						<Body style={styles.habitTitle}>{item.title}</Body>
						{item.description && (
							<Body muted style={styles.habitDescription}>
								{item.description}
							</Body>
						)}
					</View>
				</Pressable>
				<AnimatedCheckbox isChecked={item.isChecked}>
					<TouchableOpacity
						style={[
							styles.checkbox,
							{ borderColor: item.color },
							item.isChecked && { backgroundColor: item.color },
						]}
						onPress={() => onToggle(item.id)}
						accessibilityLabel={item.isChecked ? "Uncheck" : "Check"}
					>
						{item.isChecked && <Body style={styles.checkmark}>✓</Body>}
					</TouchableOpacity>
				</AnimatedCheckbox>
			</Surface>
		</Animated.View>
	);
});

const AnimatedGroupItem = React.memo(function AnimatedGroupItem({
	item,
	drag,
	isActive,
}: RenderItemParams<HabitGroupRow>) {
	const pulseAnim = React.useRef(new Animated.Value(1)).current;

	React.useEffect(() => {
		if (isActive) {
			const pulse = Animated.loop(
				Animated.sequence([
					Animated.timing(pulseAnim, {
						toValue: 0.6,
						duration: 500,
						useNativeDriver: true,
					}),
					Animated.timing(pulseAnim, {
						toValue: 1,
						duration: 500,
						useNativeDriver: true,
					}),
				]),
			);
			pulse.start();
			return () => pulse.stop();
		}
		pulseAnim.setValue(1);
	}, [isActive, pulseAnim]);

	return (
		<Animated.View style={{ opacity: pulseAnim }}>
			<Surface style={styles.habitRow}>
				<Pressable
					style={styles.habitContent}
					onLongPress={drag}
					accessibilityLabel={`Drag group ${item.title}`}
				>
					<View
						style={[
							styles.colorDot,
							{ backgroundColor: item.color || "#6b7280" },
						]}
					/>
					<View style={styles.habitText}>
						<Body style={styles.habitTitle}>{item.title}</Body>
						<Body muted style={styles.groupModeSubtext}>
							Hold to drag groups
						</Body>
					</View>
				</Pressable>
			</Surface>
		</Animated.View>
	);
});

export default function Home() {
	const router = useRouter();
	const store = useStore();
	const scrollRef = React.useRef<ScrollView>(null);
	const today = React.useMemo(() => todayKey(), []);

	const [groupedHabits, setGroupedHabits] = React.useState<GroupWithHabits[]>(
		[],
	);
	const [groups, setGroups] = React.useState<HabitGroupRow[]>([]);
	const [groupMode, setGroupMode] = React.useState(false);
	const [isDragging, setIsDragging] = React.useState(false);

	const loadHabits = React.useCallback(() => {
		if (!store) return;

		const grouped = getGroupedHabits(store);
		const checksTable = store.getTable("checks");
		const result: GroupWithHabits[] = [];

		grouped.forEach(({ group, habits }) => {
			const habitsWithChecks: HabitWithCheck[] = habits.map((habit) => {
				const checkId = `${habit.id}:${today}`;
				const check = checksTable?.[checkId];
				return {
					...habit,
					isChecked: Boolean(check?.completed),
				};
			});

			result.push({
				group,
				habits: habitsWithChecks,
			});
		});

		setGroupedHabits(result);
	}, [store, today]);

	const loadGroups = React.useCallback(() => {
		if (!store) return;
		const orderedGroups = getOrderedGroups(store);
		setGroups(orderedGroups);
	}, [store]);

	React.useEffect(() => {
		loadHabits();
		loadGroups();
		if (!store) return;

		const listenerId = store.addTablesListener(() => {
			loadHabits();
			loadGroups();
		});

		return () => {
			store.delListener(listenerId);
		};
	}, [store, loadHabits, loadGroups]);

	const handleToggle = React.useCallback(
		(habitId: string) => {
			if (!store) return;

			const isNowChecked = toggleDailyCheck(store, habitId, today);

			// Haptic feedback only when checking (not unchecking)
			if (isNowChecked) {
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
			}
		},
		[store, today],
	);

	const handleEdit = React.useCallback(
		(habitId: string) => {
			router.push({ pathname: "/habit/[id]", params: { id: habitId } });
		},
		[router],
	);

	const handleHabitDragEnd =
		(_groupId: string | null) =>
		({
			data,
			from,
			to,
		}: {
			data: HabitWithCheck[];
			from: number;
			to: number;
		}) => {
			if (!store || from === to) return;

			// data is the new visual order, movedHabit is at its new position
			const movedHabit = data[to];
			if (!movedHabit) return;

			// Persist to store - the listener will update UI
			try {
				reorderHabitWithinGroup(store, movedHabit.id, to);
			} catch (error) {
				console.error("Failed to reorder habit:", error);
				// UI will remain in current state since store listener didn't fire
			}
		};

	const handleGroupDragEnd = ({
		data,
		from,
		to,
	}: {
		data: HabitGroupRow[];
		from: number;
		to: number;
	}) => {
		if (!store || from === to) return;
		const movedGroup = data[to];
		if (!movedGroup) return;

		// Persist to store - the listener will update UI
		try {
			reorderGroupList(store, movedGroup.id, to);
		} catch (error) {
			console.error("Failed to reorder group:", error);
			// UI will remain in current state since store listener didn't fire
		}
	};

	const handleEnterGroupMode = () => {
		setGroupMode(true);
	};

	const handleExitGroupMode = () => {
		setGroupMode(false);
	};

	const renderHabitItem = React.useCallback(
		(params: RenderItemParams<HabitWithCheck>) => (
			<AnimatedHabitItem
				{...params}
				onEdit={handleEdit}
				onToggle={handleToggle}
			/>
		),
		[handleEdit, handleToggle],
	);

	const renderGroupItem = React.useCallback(
		(params: RenderItemParams<HabitGroupRow>) => (
			<AnimatedGroupItem {...params} />
		),
		[],
	);

	if (groupMode) {
		return (
			<GestureHandlerRootView style={{ flex: 1 }}>
				<SafeAreaView style={styles.screen}>
					<View style={styles.header}>
						<Title>Groups</Title>
						<Button onPress={handleExitGroupMode} style={styles.addButton}>
							Done
						</Button>
					</View>
					<Body muted style={styles.groupModeHint}>
						Drag to reorder groups. Habits are hidden in this mode.
					</Body>
					{groups.length === 0 ? (
						<Surface style={styles.card}>
							<Body muted>No groups yet. Create one to reorder.</Body>
							<Button onPress={handleExitGroupMode}>Back</Button>
						</Surface>
					) : (
						<DraggableFlatList
							data={groups}
							keyExtractor={(item) => item.id}
							renderItem={renderGroupItem}
							onDragBegin={() =>
								Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
							}
							onDragEnd={(params) => {
								Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
								handleGroupDragEnd(params);
							}}
							contentContainerStyle={styles.list}
						/>
					)}
				</SafeAreaView>
			</GestureHandlerRootView>
		);
	}

	if (groupedHabits.length === 0) {
		return (
			<GestureHandlerRootView style={{ flex: 1 }}>
				<SafeAreaView style={styles.screen}>
					<Surface style={styles.card}>
						<Title>{copy.emptyTodayTitle}</Title>
						<Body muted>{copy.emptyTodayBody}</Body>
						<Button onPress={() => router.push("/habit/new")}>
							Add a habit
						</Button>
					</Surface>
				</SafeAreaView>
			</GestureHandlerRootView>
		);
	}

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<SafeAreaView style={styles.screen}>
				<View style={styles.header}>
					<Title>Today</Title>
					<Button
						onPress={() => router.push("/habit/new")}
						style={styles.addButton}
					>
						+ Add
					</Button>
				</View>

				<ScrollView
					style={styles.scrollView}
					contentContainerStyle={styles.scrollContent}
					ref={scrollRef}
					scrollEnabled={!isDragging}
				>
					{groupedHabits.map(({ group, habits }) => (
						<View key={group?.id || "ungrouped"} style={styles.groupContainer}>
							<Pressable onLongPress={handleEnterGroupMode}>
								<Body muted style={styles.groupHeader}>
									{group?.title || "Ungrouped"}
								</Body>
							</Pressable>
							<DraggableFlatList
								data={habits}
								keyExtractor={(item) => item.id}
								renderItem={renderHabitItem}
								extraData={habits}
								simultaneousHandlers={scrollRef}
								activationDistance={16}
								onDragBegin={() => {
									setIsDragging(true);
									Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
								}}
								onDragEnd={(params) => {
									setIsDragging(false);
									Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
									handleHabitDragEnd(group?.id || null)(params);
								}}
								onRelease={() => setIsDragging(false)}
								ItemSeparatorComponent={() => (
									<View style={styles.habitSeparator} />
								)}
								ListFooterComponent={<View style={styles.habitSeparator} />}
								scrollEnabled={false}
							/>
						</View>
					))}
				</ScrollView>
			</SafeAreaView>
		</GestureHandlerRootView>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: "#f7f5f2",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 16,
		paddingBottom: 8,
	},
	addButton: {
		paddingHorizontal: 16,
		paddingVertical: 8,
	},
	scrollView: {
		flex: 1,
		overflow: "visible",
	},
	scrollContent: {
		padding: 16,
		overflow: "visible",
	},
	groupContainer: {
		marginBottom: 24,
		overflow: "visible",
	},
	habitSeparator: {
		height: 12,
	},
	list: {
		padding: 16,
		gap: 12,
	},
	card: {
		gap: 12,
		margin: 16,
	},
	groupModeHint: {
		paddingHorizontal: 16,
		paddingBottom: 8,
	},
	habitRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 16,
		gap: 12,
		overflow: "visible",
	},
	habitContent: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	dragHandle: {
		padding: 4,
		alignItems: "center",
		justifyContent: "center",
	},
	colorDot: {
		width: 12,
		height: 12,
		borderRadius: 6,
	},
	habitText: {
		flex: 1,
		gap: 4,
	},
	habitTitle: {
		fontWeight: "600",
	},
	habitDescription: {
		fontSize: 14,
	},
	groupModeSubtext: {
		fontSize: 12,
	},
	groupHeader: {
		fontSize: 14,
		fontWeight: "600",
		paddingTop: 12,
		paddingBottom: 8,
		paddingHorizontal: 4,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},

	checkbox: {
		width: 32,
		height: 32,
		borderRadius: 16,
		borderWidth: 2,
		justifyContent: "center",
		alignItems: "center",
	},
	checkmark: {
		color: "#ffffff",
		fontSize: 18,
		fontWeight: "700",
	},
});

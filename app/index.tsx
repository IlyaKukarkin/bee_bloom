import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import DraggableFlatList, {
	type RenderItemParams,
	ScaleDecorator,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "tinybase/ui-react";
import { AnimatedCheckbox } from "../src/components/animations";
import { Body, Button, Surface, Title } from "../src/components/ui";
import { copy } from "../src/lib/copy";
import { todayKey } from "../src/lib/dates";
import { useTheme } from "../src/lib/theme";
import { toggleDailyCheck } from "../src/store/checks";
import { moveHabitToGroup, reorderHabitWithinGroup } from "../src/store/habits";
import { getGroupedHabits } from "../src/store/selectors";
import type { HabitRow } from "../src/store/types";

type HabitWithCheck = HabitRow & {
	isChecked: boolean;
	groupTitle: string | null;
};

export default function Home() {
	const router = useRouter();
	const _theme = useTheme();
	const store = useStore();
	const today = todayKey();

	const [flatHabits, setFlatHabits] = React.useState<HabitWithCheck[]>([]);

	const loadHabits = React.useCallback(() => {
		if (!store) return;

		const grouped = getGroupedHabits(store);
		const checksTable = store.getTable("checks");
		const flat: HabitWithCheck[] = [];

		grouped.forEach(({ group, habits }) => {
			habits.forEach((habit) => {
				const checkId = `${habit.id}:${today}`;
				const check = checksTable?.[checkId];
				flat.push({
					...habit,
					isChecked: Boolean(check?.completed),
					groupTitle: group?.title || null,
				});
			});
		});

		setFlatHabits(flat);
	}, [store, today]);

	React.useEffect(() => {
		loadHabits();
		if (!store) return;

		const listenerId = store.addTablesListener(() => {
			loadHabits();
		});

		return () => {
			store.delListener(listenerId);
		};
	}, [store, loadHabits]);

	const handleToggle = (habitId: string) => {
		if (!store) return;
		toggleDailyCheck(store, habitId, today);
	};

	const handleEdit = (habitId: string) => {
		router.push({ pathname: "/habit/[id]", params: { id: habitId } });
	};

	const handleDragEnd = ({
		data,
		from,
		to,
	}: {
		data: HabitWithCheck[];
		from: number;
		to: number;
	}) => {
		if (!store || from === to) return;

		const movedHabit = flatHabits[from];
		const targetHabit = data[to];

		// Cross-group move
		if (movedHabit.groupId !== targetHabit.groupId) {
			const targetGroupHabits = data.filter(
				(h) => h.groupId === targetHabit.groupId,
			);
			const targetIndex = targetGroupHabits.findIndex(
				(h) => h.id === targetHabit.id,
			);
			moveHabitToGroup(
				store,
				movedHabit.id,
				targetHabit.groupId || null,
				targetIndex,
			);
		} else {
			// Within-group reorder
			const groupHabits = data.filter((h) => h.groupId === movedHabit.groupId);
			const targetIndex = groupHabits.findIndex((h) => h.id === targetHabit.id);
			reorderHabitWithinGroup(store, movedHabit.id, targetIndex);
		}
	};

	const renderItem = ({
		item,
		drag,
		isActive,
	}: RenderItemParams<HabitWithCheck>) => {
		const index = flatHabits.findIndex((h) => h.id === item.id);
		const showGroupHeader =
			index === 0 || flatHabits[index - 1]?.groupTitle !== item.groupTitle;

		return (
			<ScaleDecorator>
				<View>
					{showGroupHeader && (
						<Body muted style={styles.groupHeader}>
							{item.groupTitle || "Ungrouped"}
						</Body>
					)}
					<Surface style={[styles.habitRow, isActive && styles.habitRowActive]}>
						<Pressable
							style={styles.habitContent}
							onPress={() => handleEdit(item.id)}
							onLongPress={drag}
						>
							<View
								style={[styles.colorDot, { backgroundColor: item.color }]}
							/>
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
								onPress={() => handleToggle(item.id)}
								accessibilityLabel={item.isChecked ? "Uncheck" : "Check"}
							>
								{item.isChecked && <Body style={styles.checkmark}>✓</Body>}
							</TouchableOpacity>
						</AnimatedCheckbox>
					</Surface>
				</View>
			</ScaleDecorator>
		);
	};

	if (flatHabits.length === 0) {
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

				<DraggableFlatList
					data={flatHabits}
					keyExtractor={(item) => item.id}
					renderItem={renderItem}
					onDragEnd={handleDragEnd}
					contentContainerStyle={styles.list}
				/>
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
	list: {
		padding: 16,
		gap: 12,
	},
	card: {
		gap: 12,
		margin: 16,
	},
	habitRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 16,
		gap: 12,
	},
	habitContent: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
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
	groupHeader: {
		fontSize: 14,
		fontWeight: "600",
		paddingTop: 12,
		paddingBottom: 8,
		paddingHorizontal: 4,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	habitRowActive: {
		opacity: 0.8,
		transform: [{ scale: 1.02 }],
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

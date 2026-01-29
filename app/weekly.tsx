import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "tinybase/ui-react";
import { Body, Button, Surface, Title } from "../src/components/ui";
import {
	type GroupedWeeklyData,
	getWeekDaysFromMonday,
	getWeeklyDataByGroup,
	type HabitWithWeeklyChecks,
	useWeeklyProgress,
} from "../src/store/selectors";

function HabitWeeklyRow({
	item,
	dates,
}: {
	item: HabitWithWeeklyChecks;
	dates: string[];
}) {
	const progress = useWeeklyProgress(item.habit.id);

	const formatDay = (dateStr: string) => {
		const date = new Date(`${dateStr}T00:00:00`);
		return date.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1);
	};

	return (
		<Surface style={styles.habitRow}>
			<Body style={styles.habitName} numberOfLines={2}>
				{item.habit.title}
			</Body>
			<View style={styles.habitMetaRow}>
				<View style={styles.colorAndProgress}>
					<View
						style={[styles.colorDot, { backgroundColor: item.habit.color }]}
					/>
					<Body muted style={styles.progressText}>
						{progress.display}
					</Body>
				</View>
				<View style={styles.checksRow}>
					{item.checks.map((check, idx) => (
						<View key={dates[idx]} style={styles.dayColumn}>
							<View
								style={[
									styles.checkDot,
									check.completed && {
										backgroundColor: item.habit.color,
									},
								]}
							>
								<Body
									style={[
										styles.dayLetter,
										check.completed && styles.dayLetterCompleted,
									]}
								>
									{formatDay(dates[idx])}
								</Body>
							</View>
						</View>
					))}
				</View>
			</View>
		</Surface>
	);
}

export default function Weekly() {
	const router = useRouter();
	const store = useStore();
	const [groupedData, setGroupedData] = useState<GroupedWeeklyData[]>([]);
	const dates = getWeekDaysFromMonday();

	const loadData = useCallback(() => {
		if (!store) return;
		const data = getWeeklyDataByGroup(store);
		setGroupedData(data);
	}, [store]);

	useFocusEffect(
		useCallback(() => {
			loadData();
		}, [loadData]),
	);

	useEffect(() => {
		loadData();

		if (!store) return;
		const listenerId = store.addTablesListener(() => {
			loadData();
		});

		return () => {
			store.delListener(listenerId);
		};
	}, [store, loadData]);

	if (groupedData.length === 0) {
		return (
			<SafeAreaView style={styles.screen}>
				<Surface style={styles.card}>
					<Title>Weekly Review</Title>
					<Body muted>Add habits to see your weekly progress.</Body>
					<Button onPress={() => router.push("/habit/new")}>Add a habit</Button>
				</Surface>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.screen}>
			<View style={styles.header}>
				<Title>Weekly</Title>
			</View>

			<ScrollView contentContainerStyle={styles.content}>
				{/* Grouped habits */}
				{groupedData.map(({ groupTitle, habits }) => (
					<View key={groupTitle} style={styles.groupSection}>
						<Body style={styles.groupTitle}>{groupTitle}</Body>
						{habits.map((item) => (
							<HabitWeeklyRow key={item.habit.id} item={item} dates={dates} />
						))}
					</View>
				))}
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: "#f7f5f2",
	},
	header: {
		padding: 16,
		paddingBottom: 8,
	},
	content: {
		padding: 16,
		gap: 20,
	},
	card: {
		gap: 12,
		margin: 16,
	},
	dayHeaders: {
		flexDirection: "row",
		alignItems: "center",
		paddingBottom: 8,
	},
	habitNameColumn: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		paddingRight: 12,
	},
	checksRow: {
		flexDirection: "row",
		alignItems: "center",
	},
	dayColumn: {
		width: 28,
		alignItems: "center",
		justifyContent: "center",
	},
	progressText: {
		width: 52,
		textAlign: "center",
		fontWeight: "600",
	},
	dayLabel: {
		fontSize: 12,
		fontWeight: "600",
	},
	groupSection: {
		gap: 8,
	},
	groupTitle: {
		fontSize: 14,
		fontWeight: "600",
		textTransform: "uppercase",
		letterSpacing: 0.5,
		color: "#4d5b4d",
		paddingBottom: 4,
	},
	habitRow: {
		flexDirection: "column",
		gap: 8,
		padding: 12,
	},
	habitMetaRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 12,
	},
	colorDot: {
		width: 12,
		height: 12,
		borderRadius: 6,
	},
	habitName: {
		fontSize: 15,
		fontWeight: "600",
	},
	colorAndProgress: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	checkDot: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: "#d8e2d8",
		opacity: 0.5,
		alignItems: "center",
		justifyContent: "center",
	},
	dayLetter: {
		fontSize: 11,
		fontWeight: "700",
		color: "#1f2d1f",
	},
	dayLetterCompleted: {
		color: "#ffffff",
	},
});

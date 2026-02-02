import { Button, HStack, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import { foregroundStyle, frame, padding } from "@expo/ui/swift-ui/modifiers";
import { updateWidgetTimeline, type WidgetBase } from "expo-widgets";
import {
	createWidgetStore,
	getWidgetSizeFromFamily,
	getWidgetViewState,
	setHabitComplete,
} from "../src/store/widget-bridge";

let widgetStore: ReturnType<typeof createWidgetStore> | null = null;

function getWidgetStore() {
	if (!widgetStore) {
		widgetStore = createWidgetStore();
		widgetStore.loadPromise.then(() => {
			refreshWidgetTimeline();
		});
	}

	return widgetStore;
}

const RETRY_DELAY_MS = 5000;
const MAX_RETRIES = 3;

function getNextMidnight(now = new Date()): Date {
	const next = new Date(now);
	next.setDate(now.getDate() + 1);
	next.setHours(0, 0, 0, 0);
	return next;
}

function buildTimelineDates(now = new Date()): Date[] {
	const dates = [
		now,
		new Date(now.getTime() + 15 * 60 * 1000),
		new Date(now.getTime() + 30 * 60 * 1000),
		new Date(now.getTime() + 45 * 60 * 1000),
		new Date(now.getTime() + 60 * 60 * 1000),
		getNextMidnight(now),
	];

	const unique = new Map<number, Date>();
	dates.forEach((date) => {
		unique.set(date.getTime(), date);
	});

	return Array.from(unique.values()).sort((a, b) => a.getTime() - b.getTime());
}

export function refreshWidgetTimeline(retryCount = 0): void {
	try {
		updateWidgetTimeline("HabitWidget", buildTimelineDates(), HabitWidget);
	} catch (error) {
		if (retryCount >= MAX_RETRIES) {
			console.error("Widget timeline update failed after max retries:", error);
			return;
		}
		setTimeout(() => {
			refreshWidgetTimeline(retryCount + 1);
		}, RETRY_DELAY_MS);
	}
}

const HabitWidget = (props: WidgetBase) => {
	const storeInstance = getWidgetStore();
	const isLoaded = storeInstance.isLoaded();
	const widgetSize = getWidgetSizeFromFamily(props.family);

	// Show loading state until store data is ready
	if (!isLoaded) {
		return (
			<VStack
				modifiers={[
					padding({ all: 16 }),
					frame({ maxWidth: Infinity, maxHeight: Infinity }),
				]}
			>
				<Text size={14} modifiers={[foregroundStyle("#666666")]}>
					Loading habits…
				</Text>
			</VStack>
		);
	}

	const viewState = getWidgetViewState(storeInstance.store, widgetSize);
	const { incompleteHabits, totalIncomplete, allComplete, hasHabits } =
		viewState;
	const overflowCount = totalIncomplete - incompleteHabits.length;

	if (!hasHabits) {
		return (
			<VStack
				modifiers={[
					padding({ all: 16 }),
					frame({ maxWidth: Infinity, maxHeight: Infinity }),
				]}
			>
				<Text size={14} modifiers={[foregroundStyle("#666666")]}>
					Add your first habit in BeeBloom
				</Text>
			</VStack>
		);
	}

	if (allComplete) {
		return (
			<VStack
				modifiers={[
					padding({ all: 16 }),
					frame({ maxWidth: Infinity, maxHeight: Infinity }),
				]}
			>
				<Text size={16} weight="semibold">
					All habits completed today! 🌸
				</Text>
			</VStack>
		);
	}

	return (
		<VStack
			modifiers={[
				padding({ all: 12 }),
				frame({ maxWidth: Infinity, alignment: "topLeading" }),
			]}
		>
			<Text size={12} weight="medium" modifiers={[foregroundStyle("#999999")]}>
				BeeBloom
			</Text>

			<Spacer />

			{incompleteHabits.map((habit) => (
				<Button
					key={habit.id}
					onPress={() => {
						try {
							setHabitComplete(storeInstance.store, habit.id);
							refreshWidgetTimeline();
						} catch (error) {
							console.error("Failed to complete habit:", error);
						}
					}}
				>
					<HStack modifiers={[padding({ vertical: 4 })]}>
						<Text size={16} modifiers={[foregroundStyle(habit.color)]}>
							●
						</Text>

						<Text
							modifiers={[
								// Responsive typography: smaller size for compact widget.
								foregroundStyle("#000000"),
								padding({ leading: 8 }),
							]}
							size={widgetSize === "small" ? 13 : 14}
						>
							{habit.title}
						</Text>
					</HStack>
				</Button>
			))}

			{overflowCount > 0 && (
				<Text
					size={11}
					modifiers={[foregroundStyle("#999999"), padding({ top: 4 })]}
				>
					{`+${overflowCount} more`}
				</Text>
			)}
		</VStack>
	);
};

export default HabitWidget;

import { Button, HStack, Link, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import {
	font,
	foregroundStyle,
	frame,
	padding,
} from "@expo/ui/swift-ui/modifiers";
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
	} catch (_error) {
		if (retryCount >= MAX_RETRIES) return;
		setTimeout(() => {
			refreshWidgetTimeline(retryCount + 1);
		}, RETRY_DELAY_MS);
	}
}

const HabitWidget = (props: WidgetBase) => {
	const storeInstance = getWidgetStore();
	const widgetSize = getWidgetSizeFromFamily(props.family);
	const viewState = getWidgetViewState(storeInstance.store, widgetSize);
	const { incompleteHabits, totalIncomplete, allComplete, hasHabits } =
		viewState;
	const overflowCount = totalIncomplete - incompleteHabits.length;

	if (!hasHabits) {
		return (
			<Link url="beebloom://today">
				<VStack
					modifiers={[
						padding(16),
						frame({ maxWidth: Infinity, maxHeight: Infinity }),
					]}
				>
					<Text modifiers={[font({ size: 14 }), foregroundStyle("#666666")]}>
						Add your first habit in BeeBloom
					</Text>
				</VStack>
			</Link>
		);
	}

	if (allComplete) {
		return (
			<Link url="beebloom://today">
				<VStack
					modifiers={[
						padding(16),
						frame({ maxWidth: Infinity, maxHeight: Infinity }),
					]}
				>
					<Text modifiers={[font({ size: 16, weight: "semibold" })]}>
						All habits completed today! 🌸
					</Text>
				</VStack>
			</Link>
		);
	}

	return (
		<VStack
			modifiers={[
				padding(12),
				frame({ maxWidth: Infinity, alignment: "topLeading" }),
			]}
		>
			<Text
				modifiers={[
					font({ size: 12, weight: "medium" }),
					foregroundStyle("#999999"),
				]}
			>
				BeeBloom
			</Text>

			<Spacer />

			{incompleteHabits.map((habit) => (
				<Button
					key={habit.id}
						action={() => {
							setHabitComplete(storeInstance.store, habit.id);
						refreshWidgetTimeline();
					}}
				>
					<HStack modifiers={[padding({ vertical: 4 })]}>
						<Text
							modifiers={[foregroundStyle(habit.color), font({ size: 16 })]}
						>
							●
						</Text>

						<Text
							modifiers={[
								font({ size: widgetSize === "small" ? 13 : 14 }),
								foregroundStyle("#000000"),
								padding({ leading: 8 }),
							]}
						>
							{habit.title}
						</Text>
					</HStack>
				</Button>
			))}

			{overflowCount > 0 && (
				<Text
					modifiers={[
						font({ size: 11 }),
						foregroundStyle("#999999"),
						padding({ top: 4 }),
					]}
				>
					+{overflowCount} more
				</Text>
			)}
		</VStack>
	);
};

export default HabitWidget;

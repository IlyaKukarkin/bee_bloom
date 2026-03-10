import { Text, VStack } from "@expo/ui/swift-ui";
import {
	font,
	foregroundStyle,
	frame,
	padding,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetBase } from "expo-widgets";

// Minimal test widget from Expo docs
const TestWidget = (props: WidgetBase) => {
	"widget";
	
	return (
		<VStack
			modifiers={[
				padding({ all: 16 }),
				frame({ maxWidth: Infinity, maxHeight: Infinity }),
			]}
		>
			<Text modifiers={[font({ size: 18, weight: "bold" })]}>
				Test Widget
			</Text>
			<Text modifiers={[font({ size: 14 }), foregroundStyle("#666666")]}>
				Widget Size: {props.family}
			</Text>
			<Text modifiers={[font({ size: 14 }), foregroundStyle("#666666")]}>
				🐝 BeeBloom Test
			</Text>
		</VStack>
	);
};

// Initialize the widget
createWidget("TestWidget", TestWidget);

export default TestWidget;

import type React from "react";
import { useState } from "react";
import {
	Modal,
	Pressable,
	Text as RNText,
	ScrollView,
	type StyleProp,
	StyleSheet,
	type TextStyle,
	TouchableOpacity,
	View,
	type ViewStyle,
} from "react-native";
import { useTheme } from "../lib/theme";

export function Surface({
	children,
	style,
}: {
	children: React.ReactNode;
	style?: StyleProp<ViewStyle>;
}) {
	const theme = useTheme();
	return (
		<View
			style={[
				styles.surface,
				{
					backgroundColor: theme.colors.surface,
					borderColor: theme.colors.border,
				},
				style,
			]}
		>
			{children}
		</View>
	);
}

export function Title({ children }: { children: React.ReactNode }) {
	const theme = useTheme();
	return (
		<RNText style={[styles.title, { color: theme.colors.text }]}>
			{children}
		</RNText>
	);
}

export function Body({
	children,
	muted,
	style,
}: {
	children: React.ReactNode;
	muted?: boolean;
	style?: StyleProp<TextStyle>;
}) {
	const theme = useTheme();
	return (
		<RNText
			style={[
				styles.body,
				{ color: muted ? theme.colors.subtext : theme.colors.text },
				style,
			]}
		>
			{children}
		</RNText>
	);
}

export function Button({
	children,
	onPress,
	disabled,
	style,
	variant = "primary",
}: {
	children: React.ReactNode;
	onPress: () => void;
	disabled?: boolean;
	style?: StyleProp<ViewStyle>;
	variant?: "primary" | "secondary";
}) {
	const theme = useTheme();
	const isSecondary = variant === "secondary";
	return (
		<Pressable
			onPress={onPress}
			disabled={disabled}
			style={({ pressed }) => [
				styles.button,
				{
					backgroundColor: isSecondary
						? theme.colors.warning
						: theme.colors.accent,
					opacity: pressed ? 0.85 : disabled ? 0.4 : 1,
				},
				style,
			]}
		>
			<RNText style={[styles.buttonText, { color: "#fff" }]}>{children}</RNText>
		</Pressable>
	);
}

export function WeeklyTargetPicker({
	value,
	onValueChange,
}: {
	value: number;
	onValueChange: (value: number) => void;
}) {
	const theme = useTheme();
	const [modalVisible, setModalVisible] = useState(false);

	const options = [
		{ label: "1 time per week", value: 1 },
		{ label: "2 times per week", value: 2 },
		{ label: "3 times per week", value: 3 },
		{ label: "4 times per week", value: 4 },
		{ label: "5 times per week", value: 5 },
		{ label: "6 times per week", value: 6 },
		{ label: "7 times per week", value: 7 },
	];

	const selectedOption = options.find((opt) => opt.value === value);

	return (
		<View style={styles.pickerContainer}>
			<RNText
				style={[
					styles.pickerLabel,
					{ color: theme.colors.text, marginBottom: 8 },
				]}
			>
				Weekly Target
			</RNText>
			<TouchableOpacity
				style={[
					styles.dropdownButton,
					{
						borderColor: theme.colors.border,
						backgroundColor: "#ffffff",
					},
				]}
				onPress={() => setModalVisible(true)}
			>
				<RNText style={[styles.dropdownText, { color: theme.colors.text }]}>
					{selectedOption?.label || "Select target"}
				</RNText>
				<RNText style={[styles.dropdownArrow, { color: theme.colors.subtext }]}>
					▼
				</RNText>
			</TouchableOpacity>

			<Modal
				visible={modalVisible}
				transparent={true}
				animationType="fade"
				onRequestClose={() => setModalVisible(false)}
			>
				<Pressable
					style={styles.modalOverlay}
					onPress={() => setModalVisible(false)}
				>
					<View
						style={[
							styles.modalContent,
							{
								backgroundColor: theme.colors.surface,
								borderColor: theme.colors.border,
							},
						]}
					>
						<ScrollView>
							{options.map((option) => (
								<TouchableOpacity
									key={option.value}
									style={[
										styles.option,
										option.value === value && styles.optionSelected,
										{ borderBottomColor: theme.colors.border },
									]}
									onPress={() => {
										onValueChange(option.value);
										setModalVisible(false);
									}}
								>
									<RNText
										style={[
											styles.optionText,
											{ color: theme.colors.text },
											option.value === value && styles.optionTextSelected,
										]}
									>
										{option.label}
									</RNText>
								</TouchableOpacity>
							))}
						</ScrollView>
					</View>
				</Pressable>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	surface: {
		borderWidth: 1,
		borderRadius: 12,
		padding: 16,
	},
	title: {
		fontSize: 22,
		fontWeight: "700",
	},
	body: {
		fontSize: 16,
		fontWeight: "500",
	},
	button: {
		borderRadius: 12,
		paddingVertical: 12,
		paddingHorizontal: 16,
		alignItems: "center",
		justifyContent: "center",
	},
	buttonText: {
		fontSize: 16,
		fontWeight: "700",
	},
	pickerContainer: {
		marginVertical: 8,
	},
	pickerLabel: {
		fontSize: 16,
		fontWeight: "600",
	},
	dropdownButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		borderWidth: 1,
		borderRadius: 8,
		padding: 12,
		minHeight: 48,
	},
	dropdownText: {
		fontSize: 16,
	},
	dropdownArrow: {
		fontSize: 12,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
	modalContent: {
		width: "80%",
		maxHeight: "60%",
		borderRadius: 12,
		borderWidth: 1,
		overflow: "hidden",
	},
	option: {
		padding: 16,
		borderBottomWidth: 1,
	},
	optionSelected: {
		backgroundColor: "rgba(60, 124, 90, 0.1)",
	},
	optionText: {
		fontSize: 16,
	},
	optionTextSelected: {
		fontWeight: "600",
	},
});

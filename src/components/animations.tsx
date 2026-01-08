import type React from "react";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";

type AnimatedRowProps = {
	children: React.ReactNode;
	delay?: number;
};

export function AnimatedRow({ children, delay = 0 }: AnimatedRowProps) {
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const slideAnim = useRef(new Animated.Value(20)).current;

	useEffect(() => {
		Animated.parallel([
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 400,
				delay,
				useNativeDriver: true,
			}),
			Animated.timing(slideAnim, {
				toValue: 0,
				duration: 400,
				delay,
				useNativeDriver: true,
			}),
		]).start();
	}, [delay, fadeAnim, slideAnim]);

	return (
		<Animated.View
			style={[
				styles.container,
				{
					opacity: fadeAnim,
					transform: [{ translateY: slideAnim }],
				},
			]}
		>
			{children}
		</Animated.View>
	);
}

type AnimatedCheckboxProps = {
	children: React.ReactNode;
	isChecked: boolean;
};

export function AnimatedCheckbox({
	children,
	isChecked,
}: AnimatedCheckboxProps) {
	const scaleAnim = useRef(new Animated.Value(1)).current;
	const prevChecked = useRef(isChecked);

	useEffect(() => {
		// Only animate on transition from unchecked to checked
		if (isChecked && !prevChecked.current) {
			Animated.sequence([
				Animated.timing(scaleAnim, {
					toValue: 1.2,
					duration: 150,
					useNativeDriver: true,
				}),
				Animated.timing(scaleAnim, {
					toValue: 1,
					duration: 150,
					useNativeDriver: true,
				}),
			]).start();
		}
		prevChecked.current = isChecked;
	}, [isChecked, scaleAnim]);

	return (
		<Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
			{children}
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	container: {
		width: "100%",
	},
});

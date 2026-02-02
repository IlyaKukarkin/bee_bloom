import { Paths } from "expo-file-system";
import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";
import type { Store } from "tinybase";
import { createLocalPersister } from "tinybase/persisters/persister-browser";
import { createExpoSqlitePersister } from "tinybase/persisters/persister-expo-sqlite";
import { useCreatePersister } from "tinybase/ui-react";

const LOCAL_KEY = "beebloom-store-v1";
const DB_NAME = "beebloom.db";

// Use App Group directory on iOS to share database with widget extension
const getDbDirectory = () => {
	if (process.env.EXPO_OS === "web") return undefined;
	if (Platform.OS === "ios") {
		return Paths.appleSharedContainers["group.com.ilyakukarkinorg.beebloom"]
			?.uri;
	}
	return undefined;
};

export const useAndStartPersister = (store: Store) =>
	// Persist store to Expo SQLite on native, local storage on web; load once, then auto-save.
	useCreatePersister(
		store,
		(s) =>
			process.env.EXPO_OS === "web"
				? createLocalPersister(s, LOCAL_KEY)
				: createExpoSqlitePersister(
						s,
						SQLite.openDatabaseSync(DB_NAME, undefined, getDbDirectory()),
					),
		[],

		async (persister) => {
			try {
				await persister.load();
				await persister.startAutoSave();
			} catch (error) {
				console.warn(
					"Persister initialization failed, continuing without persistence",
					error,
				);
			}
		},
	);

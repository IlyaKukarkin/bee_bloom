import * as SQLite from "expo-sqlite";
import type { Store } from "tinybase";
import { createLocalPersister } from "tinybase/persisters/persister-browser";
import { createExpoSqlitePersister } from "tinybase/persisters/persister-expo-sqlite";
import { useCreatePersister } from "tinybase/ui-react";

const LOCAL_KEY = "beebloom-store-v1";
const DB_NAME = "beebloom.db";

export const useAndStartPersister = (store: Store) =>
	// Persist store to Expo SQLite on native, local storage on web; load once, then auto-save.
	useCreatePersister(
		store,
		(s) =>
			process.env.EXPO_OS === "web"
				? createLocalPersister(s, LOCAL_KEY)
				: createExpoSqlitePersister(s, SQLite.openDatabaseSync(DB_NAME)),
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

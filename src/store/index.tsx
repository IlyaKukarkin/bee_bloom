import React from "react";
import { createStore } from "tinybase";
import { Provider, useCreateStore } from "tinybase/ui-react";
import {
	migrateToGroupsAndOrdering,
	migrateToWeeklyTarget,
} from "./migrations";
import { useAndStartPersister } from "./persister";
import { schema } from "./schema";

export function StoreProvider({ children }: { children: React.ReactNode }) {
	const store = useCreateStore(() => {
		const s = createStore();
		// Apply schema definition
		// biome-ignore lint/suspicious/noExplicitAny: TinyBase schema requires any type
		s.setSchema(schema as any);
		return s;
	});

	// Run migration once before starting persister to avoid races
	const migrationRanRef = React.useRef(false);
	React.useEffect(() => {
		if (store && !migrationRanRef.current) {
			migrateToGroupsAndOrdering(store);
			migrateToWeeklyTarget(store);
			migrationRanRef.current = true;
		}
	}, [store]);

	useAndStartPersister(store);

	return <Provider store={store}>{children}</Provider>;
}

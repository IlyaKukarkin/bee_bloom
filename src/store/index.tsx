import React from "react";
import { createStore } from "tinybase";
import { Provider, useCreateStore } from "tinybase/ui-react";
import { migrateToGroupsAndOrdering } from "./migrations";
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

	// Run migration once synchronously before starting persister to avoid races
	const migrationRanRef = React.useRef(false);
	if (store && !migrationRanRef.current) {
		migrateToGroupsAndOrdering(store);
		migrationRanRef.current = true;
	}

	useAndStartPersister(store);

	return <Provider store={store}>{children}</Provider>;
}

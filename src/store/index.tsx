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

	// Run migration before starting persister
	React.useEffect(() => {
		if (store) {
			migrateToGroupsAndOrdering(store);
		}
	}, [store]);

	useAndStartPersister(store);

	return <Provider store={store}>{children}</Provider>;
}

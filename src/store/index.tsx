import React from 'react';
import { createStore } from 'tinybase';
import { Provider, useCreateStore } from 'tinybase/ui-react';
import { schema } from './schema';
import { useAndStartPersister } from './persister';
import { migrateToGroupsAndOrdering } from './migrations';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const store = useCreateStore(() => {
    const s = createStore();
    // Apply schema definition; using `any` to keep types minimal for MVP
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

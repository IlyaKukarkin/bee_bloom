// Minimal schema description for Tinybase
// Note: we avoid tinybase/schemas import to keep types simple in this MVP.
export const schema = {
  tables: {
    habits: {
      id: { type: 'string' },
      title: { type: 'string' },
      description: { type: 'string' },
      color: { type: 'string' },
      group: { type: 'string' },
      createdAt: { type: 'string' },
      deletedAt: { type: 'string' },
    },
    checks: {
      habitId: { type: 'string' },
      date: { type: 'string' },
      completed: { type: 'boolean' },
      updatedAt: { type: 'string' },
    },
  },
} as const;

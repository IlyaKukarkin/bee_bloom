// Minimal schema description for Tinybase
// Note: we avoid tinybase/schemas import to keep types simple in this MVP.
export const schema = {
	tables: {
		habitGroups: {
			id: { type: "string" },
			title: { type: "string" },
			color: { type: "string" },
			order: { type: "number" },
			createdAt: { type: "string" },
		},
		habits: {
			id: { type: "string" },
			title: { type: "string" },
			description: { type: "string" },
			color: { type: "string" },
			groupId: { type: "string" },
			order: { type: "number" },
			createdAt: { type: "string" },
			deletedAt: { type: "string" },
		},
		checks: {
			habitId: { type: "string" },
			date: { type: "string" },
			completed: { type: "boolean" },
			updatedAt: { type: "string" },
		},
	},
} as const;

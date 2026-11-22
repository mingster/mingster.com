export type StringNVType = {
	value: string;
	label: string;
};

export enum TicketPriority {
	Low = 1,
	Medium = 2,
	High = 3,
}

export enum TicketStatus {
	Open = 0,
	Active = 10,
	Replied = 11,
	Closed = 20,
	Postponed = 30,
	Archived = 40,
	Merged = 50,
}

export const PageAction = {
	create: "create",
	modify: "modify",
	delete: "delete",
} as const;

export type SubscriptionForUI = {
	id: string;
	customer: string;
	priceId: string;
	productName: string;
	status: string;
	start_date: Date;
	canceled_at: Date | null;
};

export enum SubscriptionStatus {
	Inactive = 0,
	Active = 1,
	Cancelled = 20,
}

// Role enum values for client-side use (matches Prisma schema)
// Server components should use Role from @prisma/client
export const Role = {
	user: "user",
	admin: "admin",
} as const;

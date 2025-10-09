export type StringNVType = {
	value: string;
	label: string;
};

export type GeneralNVType = {
	value: number;
	label: string;
};

/*
export enum Role {
	USER = 0,
	ADMIN = 1,
	owner = 2,
}
*/

export enum Role {
	user = "user",
	admin = "admin",
	owner = "owner",
}

export enum TicketPriority {
	Low = 1,
	Medium = 2,
	High = 3,
}

export enum PageAction {
	Create = "Create",
	Modify = "Modify",
	Delete = "Delete",
}

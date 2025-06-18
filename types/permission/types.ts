export type RolePermission = {
	id: string;
	roleName: string;
	permission: Permission[];
};

export type Permission = {
	id: string;
	tag: string;
};

export type Role = {
	id: string;
	tag: string;
};

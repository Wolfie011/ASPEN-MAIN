import type { User, PublicUser } from "./types";

export function toPublicUser(user: User): PublicUser {
	const { hashedPassword, hashedPin, rfidCard, ...publicUser } = user;
	return publicUser;
}

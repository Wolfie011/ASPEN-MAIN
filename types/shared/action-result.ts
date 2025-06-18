export interface ActionResult {
	success?: string;
	error?: string;
	data?: any;
}

export interface ActionResultGeneric<T = void> extends ActionResult {
	data?: T;
	message?: string;
	state?: string;
}

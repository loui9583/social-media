import { writable } from "svelte/store";

const defaultApi = "http://localhost:3000";
export const api = writable(defaultApi);

export const user = writable({
    token: 1234,
    username: 1234
});

export const token = writable()
export const username = writable()
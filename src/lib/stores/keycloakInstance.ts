import type { KeycloakAdapter } from "keycloak-js";
import { writable } from "svelte/store";

export const keycloakInstance = writable<any>();

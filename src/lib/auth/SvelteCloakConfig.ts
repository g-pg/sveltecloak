import { keycloakInstance } from "$lib/stores/keycloakInstance.js";
import { type KeycloakAdapter, type KeycloakConfig } from "keycloak-js";
import { get } from "svelte/store";

type RouterConfig = {
	[key: string]: {
		[key: string]: string[];
	};
};

type Options = {
	strict?: boolean;
	unauthorizedUrl?: string;
};

class SvelteCloakConfig {
	private _ROUTER_CONFIG: RouterConfig = {
		"*": {
			"": [""],
		},
	};

	private _options: Options = {
		strict: false,
		unauthorizedUrl: "/",
	};

	private _keycloakConfig: KeycloakConfig | {} = {};

	public keycloak: any = {};

	private _currentRoute = "";
	private _initCallback: () => any | void = () => {};

	public config(keycloakConfig: KeycloakConfig, routerConfig?: RouterConfig, options?: Options) {
		this._keycloakConfig = keycloakConfig;

		routerConfig ? (this._ROUTER_CONFIG = routerConfig) : null;

		if (options) {
			this._options = Object.assign(this._options, options);
		}
	}

	public set initCallback(callback: () => any | void) {
		this._initCallback = callback;
	}

	public get initCallback() {
		return this._initCallback;
	}

	public get keycloakConfig() {
		return this._keycloakConfig;
	}

	public get unauthorizedUrl(): string {
		return this._options.unauthorizedUrl!;
	}

	public set currentRoute(currentRoute: string) {
		this._currentRoute = currentRoute;
	}

	private _findConfiguredRoute() {
		let parentConfiguredRoute = "";
		let isWildcardRoute = false;

		try {
			let routeToCheck = this._currentRoute.split("/");

			while (!parentConfiguredRoute && routeToCheck.length) {
				const joinedRoute = routeToCheck.join("/");
				const wildcardRoute = [...routeToCheck.slice(0, -1), "*"].join("/");
				if (this._ROUTER_CONFIG.hasOwnProperty(joinedRoute)) {
					parentConfiguredRoute = joinedRoute;
				} else if (this._ROUTER_CONFIG.hasOwnProperty(wildcardRoute)) {
					parentConfiguredRoute = wildcardRoute;
					isWildcardRoute = true;
				}

				routeToCheck.pop();
			}

			if ((this._options?.strict && !parentConfiguredRoute) || isWildcardRoute) {
				throw new Error(
					"SvelteCloak: Every route authorization must be defined while on strict mode"
				);
			}
		} catch (error: any) {
			console.log(error.message);
		}

		return parentConfiguredRoute;
	}

	public checkAuthorization() {
		const routePermissions = this._ROUTER_CONFIG[this._findConfiguredRoute()];

		let authorized = true;

		for (const resource of Object.keys(routePermissions)) {
			const matchPermissions = routePermissions[resource].every((role) => {
				return this.keycloak.hasResourceRole(role, resource);
			});

			if (!matchPermissions) {
				authorized = false;
				break;
			}
		}

		return authorized;
	}
}

const svelteCloak = new SvelteCloakConfig();

export default svelteCloak;

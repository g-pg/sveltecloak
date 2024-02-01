<script lang="ts">
	import svelteCloak from "$lib/auth/SvelteCloakConfig.js";
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { onMount } from "svelte";
	import { keycloakInstance } from "$lib/stores/keycloakInstance.js";

	let authorized = false;

	svelteCloak.currentRoute = $page.url.pathname;

	onMount(async () => {
		const Keycloak = (await import("keycloak-js")).default;

		if (!$keycloakInstance) {
			$keycloakInstance = new Keycloak(svelteCloak.keycloakConfig);
		}

		try {
			if (!$keycloakInstance.authenticated) {
				await $keycloakInstance.init({
					onLoad: "login-required",
				});
				svelteCloak.keycloak = $keycloakInstance;
				svelteCloak.initCallback();
			}

			const hasAuthorization = svelteCloak.checkAuthorization();

			if (hasAuthorization) {
				authorized = true;
			} else {
				goto(svelteCloak.unauthorizedUrl);
			}
		} catch (error) {
			console.log(error);
		}
	});
</script>

{#if authorized}
	<slot />
{/if}

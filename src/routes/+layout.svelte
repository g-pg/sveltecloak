<script lang="ts">
	import SvelteCloak from "$lib/auth/SvelteCloak.svelte";
	import svelteCloak from "$lib/auth/SvelteCloakConfig.js";

	const keycloakConfig = {
		url: "https://cas.axonlab.com.br",
		realm: "HUB",
		clientId: "HUB_Ui",
	};

	const svelteCloakRouter = {
		"/admin": {
			HUB_Server: ["admin"],
			account: ["edit-user"],
		},

		"/admin/*": {
			HUB_Server: ["admin", "user"],
			account: ["edit-user"],
		},
	};

	svelteCloak.config(keycloakConfig, svelteCloakRouter, {
		strict: true,
	});
</script>

<SvelteCloak>
	<slot />
</SvelteCloak>

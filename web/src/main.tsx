import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/config/query";
import { useAuthStore } from "@/modules/auth/store/authStore";
import "./index.css";

// Importar el árbol de rutas auto-generado por el compilador de TanStack Router
import { routeTree } from "./routeTree.gen";

const router = createRouter({
	routeTree,
	context: {
		queryClient,
		auth: {
			get isAuthenticated() {
				return !!useAuthStore.getState().accessToken;
			},
			get accessToken() {
				return useAuthStore.getState().accessToken;
			},
			get user() {
				return useAuthStore.getState().user;
			},
		},
	},
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

// Para que el Router reaccione dinámicamente a cambios de estado en Zustand
function App() {
	const auth = useAuthStore();
	return (
		<RouterProvider
			router={router}
			context={{
				auth: {
					isAuthenticated: !!auth.accessToken,
					accessToken: auth.accessToken,
					user: auth.user,
				},
			}}
		/>
	);
}

const rootElement = document.getElementById("root");
if (rootElement && !rootElement.innerHTML) {
	createRoot(rootElement).render(
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<App />
			</QueryClientProvider>
		</StrictMode>,
	);
}

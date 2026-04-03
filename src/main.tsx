import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

function runOneTimeSupabaseSessionCleanup() {
	if (typeof window === "undefined") return;

	const migrationKey = "parksmart:migration:clear-supabase-session-v1";
	if (window.localStorage.getItem(migrationKey) === "done") return;

	const shouldClearStorageKey = (key: string) => {
		const normalized = key.toLowerCase();
		return (
			normalized.includes("supabase.auth.token") ||
			(normalized.startsWith("sb-") && normalized.includes("-auth-token"))
		);
	};

	try {
		const localKeysToClear = Object.keys(window.localStorage).filter(shouldClearStorageKey);
		for (const key of localKeysToClear) {
			window.localStorage.removeItem(key);
		}

		const sessionKeysToClear = Object.keys(window.sessionStorage).filter(shouldClearStorageKey);
		for (const key of sessionKeysToClear) {
			window.sessionStorage.removeItem(key);
		}
	} finally {
		window.localStorage.setItem(migrationKey, "done");
	}
}

runOneTimeSupabaseSessionCleanup();

createRoot(document.getElementById("root")!).render(<App />);

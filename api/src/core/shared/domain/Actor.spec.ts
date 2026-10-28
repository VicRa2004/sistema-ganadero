import { describe, expect, it } from "bun:test";
import { assertPuedeAcceder } from "./Actor";

describe("assertPuedeAcceder", () => {
	it("permite al dueño y al ADMIN", () => {
		expect(() =>
			assertPuedeAcceder({ id: 1, role: "USER" }, 1, "no"),
		).not.toThrow();
		expect(() =>
			assertPuedeAcceder({ id: 9, role: "ADMIN" }, 1, "no"),
		).not.toThrow();
	});

	it("lanza 403 con el mensaje dado a otro usuario", () => {
		expect(() =>
			assertPuedeAcceder({ id: 2, role: "USER" }, 1, "No puedes"),
		).toThrow("No puedes");
	});
});

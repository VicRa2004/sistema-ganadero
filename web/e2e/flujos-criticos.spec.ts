import {
	expect,
	type Page,
	request as playwrightRequest,
	test,
} from "@playwright/test";

test.beforeAll(async () => {
	const apiCtx = await playwrightRequest.newContext({
		baseURL: "http://localhost:5173",
	});
	const loginRes = await apiCtx.post("/api/auth/login", {
		data: { email: "admin@dev.com", password: "SecurePass123!" },
	});
	const loginJson = (await loginRes.json()) as { accessToken?: string };
	const token = loginJson.accessToken;
	if (token) {
		const authHeaders = { Authorization: `Bearer ${token}` };
		const terrenosRes = await apiCtx.get("/api/terrenos", {
			headers: authHeaders,
		});
		const terrenosJson = (await terrenosRes.json()) as {
			data?: unknown[];
		};
		if ((terrenosJson.data?.length ?? 0) === 0) {
			await apiCtx.post("/api/terrenos", {
				headers: authHeaders,
				multipart: {
					nombre: "Potrero E2E",
					ubicacion: "Zona Norte",
					extensionHectareas: "50",
					capacidadMaxima: "100",
				},
			});
		}

		const propRes = await apiCtx.get("/api/propietarios", {
			headers: authHeaders,
		});
		const propJson = (await propRes.json()) as { data?: unknown[] };
		if ((propJson.data?.length ?? 0) === 0) {
			await apiCtx.post("/api/propietarios", {
				headers: authHeaders,
				multipart: {
					nombre: "Rancho E2E",
				},
			});
		}
	}
	await apiCtx.dispose();
});

async function loginAsAdmin(page: Page) {
	await page.goto("/login");
	const permissionsResponsePromise = page.waitForResponse(
		(res) =>
			res.url().includes("/api/permissions/users/") && res.status() === 200,
	);
	await page.fill("#email", "admin@dev.com");
	await page.fill("#password", "SecurePass123!");
	await page.click('button[type="submit"]');
	const permRes = await permissionsResponsePromise;
	expect(permRes.ok()).toBe(true);
	await page.waitForURL("**/dashboard");
}

test.describe("Flujos críticos web (E2E)", () => {
	test("1. Login carga permisos desde /api/permissions/users/:id y navega al dashboard", async ({
		page,
	}) => {
		await loginAsAdmin(page);
		await expect(
			page.getByRole("link", { name: "Ganado" }).first(),
		).toBeVisible();
	});

	test("2. Registrar ganado valida foco/ARIA accesible y guarda en tabla", async ({
		page,
	}) => {
		const arete = `E2E-${Date.now()}`;
		await loginAsAdmin(page);

		await page.getByRole("link", { name: "Ganado" }).first().click();
		await page.waitForURL("**/dashboard/ganado**");

		await page.getByRole("button", { name: /Registrar Ganado/i }).click();
		const dialog = page.getByRole("dialog");
		await expect(
			dialog.getByRole("heading", { name: /Registrar Cabeza de Ganado/i }),
		).toBeVisible();

		// Submit vacío: verifica foco en primer campo inválido y aria-invalid="true"
		await dialog.getByRole("button", { name: /Registrar ganado/i }).click();
		const areteInput = dialog.locator("#identificador");
		await expect(areteInput).toHaveAttribute("aria-invalid", "true");
		await expect(areteInput).toBeFocused();

		// Esperar catálogos cargados y completar formulario válido
		await expect(dialog.locator("#razaId option")).not.toHaveCount(1);
		await expect(dialog.locator("#terrenoId option")).not.toHaveCount(1);
		await expect(dialog.locator("#propietarioId option")).not.toHaveCount(1);

		await areteInput.fill(arete);
		await dialog.locator("#sexo").selectOption("MACHO");
		await dialog.locator("#peso").fill("315");
		await dialog.locator("#fechaNacimiento").fill("2025-05-01");
		await dialog.locator("#razaId").selectOption({ index: 1 });
		await dialog.locator("#terrenoId").selectOption({ index: 1 });
		await dialog.locator("#propietarioId").selectOption({ index: 1 });

		await dialog.getByRole("button", { name: /Registrar ganado/i }).click();
		await expect(dialog).toBeHidden();

		await page.fill("#buscar-arete", arete);
		await expect(page.getByText(arete)).toBeVisible();
	});

	test("3. Consumir insumo actualiza stock y registra SALIDA consistente en Kardex", async ({
		page,
	}) => {
		const nombreInsumo = `Insumo E2E ${Date.now()}`;
		await loginAsAdmin(page);

		await page
			.getByRole("link", { name: /Inventario de Insumos/i })
			.first()
			.click();
		await page.waitForURL("**/dashboard/insumos**");

		await page.getByRole("button", { name: /Registrar Insumo/i }).click();
		const formDialog = page.getByRole("dialog");
		await formDialog.locator("#nombre").fill(nombreInsumo);
		await formDialog.locator("#stockInicial").fill("50");
		await formDialog.locator("#stockMinimo").fill("5");
		await formDialog.locator("#costoUnitario").fill("15");
		await formDialog.locator("#lote").fill("LOT-E2E");
		await formDialog.getByRole("button", { name: /Registrar Insumo/i }).click();
		await expect(formDialog).toBeHidden();

		await page
			.getByPlaceholder("Buscar por nombre de insumo...")
			.fill(nombreInsumo);
		const row = page.locator("tr", { hasText: nombreInsumo });
		await expect(row).toBeVisible();

		await row.getByRole("button", { name: /Consumir/i }).click();
		const consumirDialog = page.getByRole("dialog");
		await consumirDialog.locator("#cantidad").fill("5");
		await consumirDialog.locator("#motivo").fill("Consumo prueba E2E");
		await consumirDialog
			.getByRole("button", { name: /Confirmar Consumo/i })
			.click();
		await expect(consumirDialog).toBeHidden();

		await expect(row).toContainText("45 ml");

		await row.getByRole("button", { name: /Kardex/i }).click();
		const kardexDialog = page.getByRole("dialog");
		await expect(kardexDialog.getByText("consistente")).toBeVisible();
		await expect(
			kardexDialog.locator("tbody").getByText("SALIDA").first(),
		).toBeVisible();
		await expect(kardexDialog.getByText("Consumo prueba E2E")).toBeVisible();
	});
});

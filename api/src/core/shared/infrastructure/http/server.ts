import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { swaggerUI } from "@hono/swagger-ui";
import { swaggerSpec } from "@/core/config/swagger";

import { container } from "@/core/shared/infrastructure/di/container";
import { UserRouter } from "@/core/user/infrastructure/http/routes/UserRouter";
import { AuthRouter } from "@/modules/auth/infrastructure/http/routes/AuthRouter";
import { PermissionRouter } from "@/modules/authorization/infrastructure/http/routes/PermissionRouter";
import { RazaRouter } from "@/modules/raza/infrastructure/http/routes/RazaRouter";
import { PropietarioRouter } from "@/modules/propietario/infrastructure/http/routes/PropietarioRouter";
import { InsumoRouter } from "@/modules/inventario-insumos/infrastructure/http/routes/InsumoRouter";
import { RanchoRouter } from "@/modules/rancho/infrastructure/http/routes/RanchoRouter";
import { GanadoRouter } from "@/modules/ganado/infrastructure/http/routes/GanadoRouter";

const app = new Hono();

// 1. Middlewares Nativos (Reemplazan a helmet, morgan y cors)
app.use("*", secureHeaders());
app.use(
	"*",
	cors({
		origin: (origin) => origin,
		credentials: true,
	}),
);
app.use("*", logger());
// Nota: express.json() desaparece. Hono procesa el JSON automáticamente
// cuando llamas a c.req.json() en tus controladores.

// 2. Documentación de la API (Swagger)
// Hono necesita que expongas el JSON y luego le digas a la UI dónde leerlo
app.get("/api-docs.json", (c) => c.json(swaggerSpec));
app.get("/api-docs", swaggerUI({ url: "/api-docs.json" }));

// 3. Resolución de dependencias (TSyringe sigue intacto)
const userRouter = container.resolve(UserRouter);
const authRouter = container.resolve(AuthRouter);
const permissionRouter = container.resolve(PermissionRouter);
const razaRouter = container.resolve(RazaRouter);
const propietarioRouter = container.resolve(PropietarioRouter);
const insumoRouter = container.resolve(InsumoRouter);
const ranchoRouter = container.resolve(RanchoRouter);
const ganadoRouter = container.resolve(GanadoRouter);

// 4. Registro de rutas
// En Hono se usa .route() en lugar de .use() para anidar otros routers
app.route("/api/user", userRouter.router);
app.route("/api/auth", authRouter.router);
app.route("/api/permissions", permissionRouter.router);
app.route("/api/razas", razaRouter.router);
app.route("/api/propietarios", propietarioRouter.router);
app.route("/api/insumos", insumoRouter.router);
app.route("/api/ranchos", ranchoRouter.router);
app.route("/api/ganado", ganadoRouter.router);

// 5. Global Error Handler
app.onError((err, c) => {
	console.error(err);

	// Extraemos el status (forzando tipo de manera segura para Hono)
	const status = (err as any).status || 500;

	return c.json(
		{ error: err.message || "Internal Server Error" },
		status as any, // Casteo necesario porque Hono es muy estricto con los códigos HTTP (StatusCode)
	);
});

export { app };

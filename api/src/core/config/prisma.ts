import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@/generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });

// Modelos con borrado lógico (columna `deletedAt`): toda lectura o modificación masiva ignora los
// eliminados. Un modelo nuevo con `deletedAt` debe añadirse aquí.
const softDeleteModels = new Set<string>([
	"Raza",
	"Propietario",
	"Terreno",
	"Ganado",
	"Insumo",
	"SesionSanitaria",
	"AplicacionSanitaria",
	"TratamientoMedico",
	"Veterinario",
] satisfies Prisma.ModelName[]);
const filteredOperations = new Set([
	"findFirst",
	"findFirstOrThrow",
	"findMany",
	"count",
	"aggregate",
	"groupBy",
	"updateMany",
	"updateManyAndReturn",
	"deleteMany",
]);

const prisma = new PrismaClient({ adapter }).$extends({
	query: {
		$allModels: {
			$allOperations({ model, operation, args, query }) {
				if (softDeleteModels.has(model) && filteredOperations.has(operation)) {
					// `deletedAt` explícito en el `where` gana (p. ej. para consultar la papelera)
					const a = args as { where?: object };
					a.where = { deletedAt: null, ...a.where };
				}
				return query(args);
			},
		},
	},
});

export { prisma };

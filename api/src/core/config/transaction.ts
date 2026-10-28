import { AsyncLocalStorage } from "node:async_hooks";
import { prisma } from "./prisma";

// El cliente extendido ya no es `Prisma.TransactionClient`: se deriva el tipo de la transacción interactiva.
type DbClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

const transactionStorage = new AsyncLocalStorage<DbClient>();

/**
 * Cliente de BD a usar en los repositorios: el de la transacción activa si la hay
 * (ver `runInTransaction`) o el cliente global en caso contrario.
 */
export const db = (): DbClient => transactionStorage.getStore() ?? prisma;

/**
 * Ejecuta `work` dentro de una transacción de BD. Los repositorios que usen `db()`
 * participan automáticamente en ella; si `work` lanza, se revierte todo.
 */
export const runInTransaction = <T>(work: () => Promise<T>): Promise<T> => {
	// Si ya hay una transacción en curso se reutiliza (no se anidan)
	if (transactionStorage.getStore()) return work();

	return prisma.$transaction((tx) => transactionStorage.run(tx, work));
};

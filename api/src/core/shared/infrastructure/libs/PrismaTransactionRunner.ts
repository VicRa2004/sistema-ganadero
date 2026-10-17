import { injectable } from "tsyringe";
import { runInTransaction } from "@/core/config/transaction";
import type { TransactionRunner } from "../../domain/services/TransactionRunner";

@injectable()
export class PrismaTransactionRunner implements TransactionRunner {
	public run<T>(work: () => Promise<T>): Promise<T> {
		return runInTransaction(work);
	}
}

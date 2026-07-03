import prisma from '../config/database.js';

export class AccountingService {
  /**
   * Automatically creates a double-entry Journal Entry based on dynamic account mappings configured in settings.
   */
  static async createMappedDoubleEntry(params: {
    companyId: string;
    reference: string;
    description: string;
    transactionType: string; // e.g. "BOOKING_INVOICE", "FUEL_EXPENSE", "VEHICLE_MAINTENANCE", "PAYROLL", "DRIVER_ADVANCE", "CUSTOMER_PAYMENT"
    amount: number;
    costCenterId?: string | null;
  }) {
    const { companyId, reference, description, transactionType, amount, costCenterId } = params;

    if (amount <= 0) return null;

    // Resolve Account Mappings
    const mapping = await prisma.accountMapping.findFirst({
      where: { companyId, transactionType },
      include: {
        debitAccount: true,
        creditAccount: true,
      },
    });

    if (!mapping) {
      throw new Error(`GL Integration Error: Account mapping not found for transaction type '${transactionType}'. Please configure it in System Settings.`);
    }

    // Create the JournalEntry and the matching debit/credit JournalLines
    const journalEntry = await prisma.journalEntry.create({
      data: {
        companyId,
        reference,
        date: new Date(),
        description,
        status: 'POSTED',
        costCenterId: costCenterId ?? undefined,
        lines: {
          create: [
            {
              accountId: mapping.debitAccountId,
              debit: amount,
              credit: 0,
              description,
            },
            {
              accountId: mapping.creditAccountId,
              debit: 0,
              credit: amount,
              description,
            },
          ],
        },
      },
    });

    return journalEntry;
  }

  /**
   * Fallback double-entry using explicit codes (if needed).
   */
  static async createDoubleEntry(params: {
    companyId: string;
    reference: string;
    description: string;
    debitAccountCode: string;
    creditAccountCode: string;
    amount: number;
    costCenterId?: string | null;
  }) {
    const { companyId, reference, description, debitAccountCode, creditAccountCode, amount, costCenterId } = params;

    if (amount <= 0) return null;

    const debitAccount = await prisma.account.findFirst({
      where: { companyId, code: debitAccountCode },
    });
    if (!debitAccount) {
      throw new Error(`GL Integration Error: Debit account with code ${debitAccountCode} not found.`);
    }

    const creditAccount = await prisma.account.findFirst({
      where: { companyId, code: creditAccountCode },
    });
    if (!creditAccount) {
      throw new Error(`GL Integration Error: Credit account with code ${creditAccountCode} not found.`);
    }

    const journalEntry = await prisma.journalEntry.create({
      data: {
        companyId,
        reference,
        date: new Date(),
        description,
        status: 'POSTED',
        costCenterId: costCenterId ?? undefined,
        lines: {
          create: [
            {
              accountId: debitAccount.id,
              debit: amount,
              credit: 0,
              description,
            },
            {
              accountId: creditAccount.id,
              debit: 0,
              credit: amount,
              description,
            },
          ],
        },
      },
    });

    return journalEntry;
  }
}

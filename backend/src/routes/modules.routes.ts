import { Router } from 'express';
import prisma from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { AccountingService } from '../services/accounting.service.js';

function createCrudRouter(model: keyof typeof prisma, include?: object) {
  const router = Router();
  router.use(authenticate);

  router.get('/', async (req, res, next) => {
    try {
      const companyId = req.user!.companyId;
      const items = await (prisma[model] as any).findMany({
        where: { companyId },
        include,
        orderBy: { createdAt: 'desc' },
      });
      res.json(items);
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const item = await (prisma[model] as any).findFirst({
        where: { id: req.params.id, companyId: req.user!.companyId },
        include,
      });
      if (!item) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      res.json(item);
    } catch (err) {
      next(err);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const item = await (prisma[model] as any).create({
        data: { ...req.body, companyId: req.user!.companyId },
        include,
      });
      res.status(201).json(item);
    } catch (err) {
      next(err);
    }
  });

  router.put('/:id', async (req, res, next) => {
    try {
      const existing = await (prisma[model] as any).findFirst({
        where: { id: req.params.id, companyId: req.user!.companyId },
      });
      if (!existing) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      const item = await (prisma[model] as any).update({
        where: { id: req.params.id },
        data: req.body,
        include,
      });
      res.json(item);
    } catch (err) {
      next(err);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      const existing = await (prisma[model] as any).findFirst({
        where: { id: req.params.id, companyId: req.user!.companyId },
      });
      if (!existing) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      await (prisma[model] as any).delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  return router;
}

export const salesRoutes = createCrudRouter('customer', { branches: true });
export const supplierRoutes = createCrudRouter('supplier');
export const itemRoutes = createCrudRouter('item');
export const locationRoutes = createCrudRouter('location');
export const accountRoutes = createCrudRouter('account');
export const costCenterRoutes = createCrudRouter('costCenter');
export const leadRoutes = createCrudRouter('lead', { tasks: true });
export const employeeRoutes = createCrudRouter('employee');
export const fixedAssetRoutes = createCrudRouter('fixedAsset');
export const salesInvoiceRoutes = createCrudRouter('salesInvoice', { customer: true });
export const purchaseInvoiceRoutes = createCrudRouter('purchaseInvoice', { supplier: true });
export const stockTransferRoutes = createCrudRouter('stockTransfer', { item: true });

// ─── Bank Account Routes ─────────────────────────────────────────────────────
const bankAccountRouter = Router();
bankAccountRouter.use(authenticate);

bankAccountRouter.get('/', async (req, res, next) => {
  try {
    const accounts = await prisma.bankAccount.findMany({
      where: { companyId: req.user!.companyId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(accounts);
  } catch (err) { next(err); }
});

bankAccountRouter.post('/', async (req, res, next) => {
  try {
    const { name, accountNo, bankName, accountId, balance } = req.body;
    const acc = await prisma.bankAccount.create({
      data: { name, accountNo: accountNo || '', bankName: bankName || '', accountId, balance: balance || 0, companyId: req.user!.companyId },
    });
    res.status(201).json(acc);
  } catch (err) { next(err); }
});

bankAccountRouter.put('/:id', async (req, res, next) => {
  try {
    const acc = await prisma.bankAccount.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(acc);
  } catch (err) { next(err); }
});

bankAccountRouter.delete('/:id', async (req, res, next) => {
  try {
    await prisma.bankAccount.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) { next(err); }
});

bankAccountRouter.post('/transfer', async (req, res, next) => {
  try {
    const companyId = req.user!.companyId;
    const { fromAccount, toAccount, amount, description } = req.body;

    if (!fromAccount || !toAccount || !amount) {
      res.status(400).json({ error: 'fromAccount, toAccount and amount are required.' });
      return;
    }

    const fromAcc = await prisma.bankAccount.findFirst({ where: { id: fromAccount, companyId } });
    const toAcc = await prisma.bankAccount.findFirst({ where: { id: toAccount, companyId } });

    if (!fromAcc || !toAcc) {
      res.status(404).json({ error: 'One or both accounts not found.' });
      return;
    }

    // Post double entry journal: Debit toAccount GL account, Credit fromAccount GL account
    const ref = `TRF-${Date.now().toString().slice(-8)}`;
    await prisma.journalEntry.create({
      data: {
        reference: ref,
        date: new Date(),
        description: description || `Fund transfer: ${fromAcc.name} → ${toAcc.name}`,
        status: 'POSTED',
        companyId,
        lines: {
          create: [
            { accountId: toAcc.accountId, debit: amount, credit: 0 },
            { accountId: fromAcc.accountId, debit: 0, credit: amount },
          ],
        },
      },
    });

    res.json({ success: true, reference: ref });
  } catch (err) { next(err); }
});

export const bankAccountRoutes = bankAccountRouter;

const salesOrderRouter = Router();
salesOrderRouter.use(authenticate);
salesOrderRouter.get('/', async (req, res, next) => {
  try {
    const orders = await prisma.salesOrder.findMany({
      where: { companyId: req.user!.companyId },
      include: { customer: true, lines: { include: { item: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});
export const salesOrderRoutes = salesOrderRouter;

const purchaseOrderRouter = Router();
purchaseOrderRouter.use(authenticate);
purchaseOrderRouter.get('/', async (req, res, next) => {
  try {
    const orders = await prisma.purchaseOrder.findMany({
      where: { companyId: req.user!.companyId },
      include: { supplier: true, lines: { include: { item: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});
export const purchaseOrderRoutes = purchaseOrderRouter;

const journalRouter = Router();
journalRouter.use(authenticate);
journalRouter.get('/', async (req, res, next) => {
  try {
    const entries = await prisma.journalEntry.findMany({
      where: { companyId: req.user!.companyId },
      include: { lines: { include: { account: true } }, costCenter: true },
      orderBy: { date: 'desc' },
    });
    res.json(entries);
  } catch (err) {
    next(err);
  }
});
export const journalRoutes = journalRouter;

const workOrderRouter = Router();
workOrderRouter.use(authenticate);
workOrderRouter.get('/', async (req, res, next) => {
  try {
    const orders = await prisma.workOrder.findMany({
      where: { companyId: req.user!.companyId },
      include: { bom: true, lines: { include: { item: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});
export const workOrderRoutes = workOrderRouter;

const reportRouter = Router();
reportRouter.use(authenticate);
reportRouter.get('/trial-balance', async (req, res, next) => {
  try {
    const accounts = await prisma.account.findMany({
      where: { companyId: req.user!.companyId, isActive: true },
      include: {
        journalLines: {
          include: { journalEntry: true },
          where: { journalEntry: { status: 'POSTED' } },
        },
      },
      orderBy: { code: 'asc' },
    });

    const rows = accounts.map((account) => {
      const debit = account.journalLines.reduce((sum, l) => sum + Number(l.debit), 0);
      const credit = account.journalLines.reduce((sum, l) => sum + Number(l.credit), 0);
      return { code: account.code, name: account.name, type: account.type, debit, credit, balance: debit - credit };
    });

    res.json(rows);
  } catch (err) {
    next(err);
  }
});
export const reportRoutes = reportRouter;

// ─── Logistics & Fleet Management Routes ──────────────────────────────────────

export const vehicleRoutes = createCrudRouter('vehicle');
export const driverRoutes = createCrudRouter('driver', { employee: true });
export const routeRoutes = createCrudRouter('route');
export const documentRoutes = createCrudRouter('documentAttachment');

// ─── Account Mappings Router ──────────────────────────────────────────────────
const mappingRouter = Router();
mappingRouter.use(authenticate);

mappingRouter.get('/', async (req, res, next) => {
  try {
    const mappings = await prisma.accountMapping.findMany({
      where: { companyId: req.user!.companyId },
      include: { debitAccount: true, creditAccount: true },
    });
    res.json(mappings);
  } catch (err) {
    next(err);
  }
});

mappingRouter.post('/', async (req, res, next) => {
  try {
    const companyId = req.user!.companyId;
    const { transactionType, debitAccountId, creditAccountId } = req.body;

    const mapping = await prisma.accountMapping.upsert({
      where: { companyId_transactionType: { companyId, transactionType } },
      update: { debitAccountId, creditAccountId },
      create: { transactionType, debitAccountId, creditAccountId, companyId },
      include: { debitAccount: true, creditAccount: true },
    });

    res.json(mapping);
  } catch (err) {
    next(err);
  }
});

export const accountMappingRoutes = mappingRouter;

// ─── Bookings Router (Logistics Workflow) ──────────────────────────────────────
const bookingRouter = Router();
bookingRouter.use(authenticate);

bookingRouter.get('/', async (req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { companyId: req.user!.companyId },
      include: { customer: true, trip: true, invoice: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

bookingRouter.post('/', async (req, res, next) => {
  try {
    const companyId = req.user!.companyId;
    const { bookingNo, date, customerId, originAddress, destinationAddress, cargoDescription, cargoWeight, cargoVolume, estDeliveryDate, charges, status } = req.body;

    const bNo = bookingNo || `BKG-${Date.now().toString().slice(-6)}`;
    const audit = JSON.stringify([{ status: status || 'QUOTATION', timestamp: new Date().toISOString(), user: req.user!.userId }]);

    const booking = await prisma.booking.create({
      data: {
        bookingNo: bNo,
        date: date ? new Date(date) : new Date(),
        customerId,
        originAddress,
        destinationAddress,
        cargoDescription,
        cargoWeight: cargoWeight ? Number(cargoWeight) : null,
        cargoVolume: cargoVolume ? Number(cargoVolume) : null,
        estDeliveryDate: estDeliveryDate ? new Date(estDeliveryDate) : null,
        charges: Number(charges),
        status: status || 'QUOTATION',
        auditTrail: audit,
        companyId,
      },
      include: { customer: true },
    });

    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
});

bookingRouter.put('/:id', async (req, res, next) => {
  try {
    const companyId = req.user!.companyId;
    const existing = await prisma.booking.findFirst({
      where: { id: req.params.id, companyId },
    });
    if (!existing) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    const { charges, cargoWeight, cargoVolume, date, estDeliveryDate, actDeliveryDate, status, ...rest } = req.body;
    
    let audit = existing.auditTrail;
    if (status && status !== existing.status) {
      const trail = existing.auditTrail ? JSON.parse(existing.auditTrail) : [];
      trail.push({ status, timestamp: new Date().toISOString(), user: req.user!.userId });
      audit = JSON.stringify(trail);
    }

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        status: status || undefined,
        auditTrail: audit,
        date: date ? new Date(date) : undefined,
        estDeliveryDate: estDeliveryDate ? new Date(estDeliveryDate) : undefined,
        actDeliveryDate: actDeliveryDate ? new Date(actDeliveryDate) : undefined,
        charges: charges !== undefined ? Number(charges) : undefined,
        cargoWeight: cargoWeight !== undefined ? (cargoWeight ? Number(cargoWeight) : null) : undefined,
        cargoVolume: cargoVolume !== undefined ? (cargoVolume ? Number(cargoVolume) : null) : undefined,
      },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Quotation to Booking conversion
bookingRouter.post('/:id/convert', async (req, res, next) => {
  try {
    const companyId = req.user!.companyId;
    const booking = await prisma.booking.findFirst({
      where: { id: req.params.id, companyId },
    });
    if (!booking) {
      res.status(404).json({ error: 'Quotation/Booking not found' });
      return;
    }

    const trail = booking.auditTrail ? JSON.parse(booking.auditTrail) : [];
    trail.push({ status: 'BOOKING', timestamp: new Date().toISOString(), user: req.user!.userId });

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'BOOKING',
        auditTrail: JSON.stringify(trail),
      },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Proof of Delivery submission
bookingRouter.post('/:id/pod', async (req, res, next) => {
  try {
    const companyId = req.user!.companyId;
    const { podNotes } = req.body;
    const booking = await prisma.booking.findFirst({
      where: { id: req.params.id, companyId },
    });
    if (!booking) {
      res.status(404).json({ error: 'Shipment not found' });
      return;
    }

    const trail = booking.auditTrail ? JSON.parse(booking.auditTrail) : [];
    trail.push({ status: 'DELIVERED', timestamp: new Date().toISOString(), user: req.user!.userId });

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'DELIVERED',
        podNotes: podNotes || 'Delivered with clean Proof of Delivery.',
        podSubmittedAt: new Date(),
        actDeliveryDate: new Date(),
        auditTrail: JSON.stringify(trail),
      },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

bookingRouter.post('/:id/invoice', async (req, res, next) => {
  try {
    const companyId = req.user!.companyId;
    const booking = await prisma.booking.findFirst({
      where: { id: req.params.id, companyId },
      include: { customer: true },
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    if (booking.invoiceId) {
      res.status(400).json({ error: 'Booking is already invoiced' });
      return;
    }

    // Find or create default service item for freight charges
    let item = await prisma.item.findFirst({
      where: { companyId, category: 'Logistics', code: 'ITEM001' },
    });
    if (!item) {
      item = await prisma.item.create({
        data: {
          code: 'ITEM001',
          name: 'Corporate Cargo Service',
          category: 'Logistics',
          unit: 'Trip',
          companyId,
          salePrice: booking.charges,
        },
      });
    }

    const invoiceRef = `INV-BKG-${booking.bookingNo}`;

    // Create SalesInvoice
    const invoice = await prisma.salesInvoice.create({
      data: {
        reference: invoiceRef,
        date: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        type: 'CREDIT',
        status: 'POSTED',
        customerId: booking.customerId,
        companyId,
        subtotal: booking.charges,
        total: booking.charges,
        notes: `Automated logistics invoice for Booking Ref: ${booking.bookingNo}`,
        lines: {
          create: [
            {
              itemId: item.id,
              description: `Logistics transport charges for shipment ${booking.bookingNo}. Route: ${booking.originAddress} to ${booking.destinationAddress}`,
              quantity: 1,
              unitPrice: booking.charges,
              lineTotal: booking.charges,
            },
          ],
        },
      },
    });

    // Post dynamically using AccountMapping service
    await AccountingService.createMappedDoubleEntry({
      companyId,
      reference: invoiceRef,
      description: `Logistics service invoice for booking ${booking.bookingNo}`,
      transactionType: 'BOOKING_INVOICE',
      amount: Number(booking.charges),
    });

    // Link invoice to booking
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        invoiceId: invoice.id,
      },
      include: { invoice: true },
    });

    res.json(updatedBooking);
  } catch (err) {
    next(err);
  }
});

bookingRouter.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.booking.findFirst({
      where: { id: req.params.id, companyId: req.user!.companyId },
    });
    if (!existing) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    await prisma.booking.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export const bookingRoutes = bookingRouter;

// ─── Trips Router ─────────────────────────────────────────────────────────────
const tripRouter = Router();
tripRouter.use(authenticate);

tripRouter.get('/', async (req, res, next) => {
  try {
    const trips = await prisma.trip.findMany({
      where: { companyId: req.user!.companyId },
      include: { vehicle: true, driver: true, route: true, bookings: true, expenses: true, fuelLogs: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(trips);
  } catch (err) {
    next(err);
  }
});

tripRouter.post('/', async (req, res, next) => {
  try {
    const companyId = req.user!.companyId;
    const { tripNo, date, vehicleId, driverId, routeId, startOdometer, notes, bookingIds } = req.body;

    const tNo = tripNo || `TRIP-${Date.now().toString().slice(-6)}`;

    // Create the trip
    const trip = await prisma.trip.create({
      data: {
        tripNo: tNo,
        date: date ? new Date(date) : new Date(),
        vehicleId,
        driverId,
        routeId,
        status: 'PLANNED',
        startOdometer: startOdometer ? Number(startOdometer) : null,
        notes,
        companyId,
      },
    });

    // Assign bookings
    if (bookingIds && bookingIds.length > 0) {
      for (const bId of bookingIds) {
        const bk = await prisma.booking.findFirst({ where: { id: bId, companyId } });
        if (bk) {
          const trail = bk.auditTrail ? JSON.parse(bk.auditTrail) : [];
          trail.push({ status: 'SHIPMENT', timestamp: new Date().toISOString(), user: req.user!.userId });
          await prisma.booking.update({
            where: { id: bId },
            data: {
              tripId: trip.id,
              status: 'SHIPMENT',
              auditTrail: JSON.stringify(trail),
            },
          });
        }
      }
    }

    res.status(201).json(trip);
  } catch (err) {
    next(err);
  }
});

tripRouter.post('/:id/dispatch', async (req, res, next) => {
  try {
    const companyId = req.user!.companyId;
    const trip = await prisma.trip.findFirst({
      where: { id: req.params.id, companyId },
      include: { bookings: true },
    });

    if (!trip) {
      res.status(404).json({ error: 'Trip not found' });
      return;
    }

    // Set trip status
    await prisma.trip.update({
      where: { id: trip.id },
      data: { status: 'DISPATCHED' },
    });

    // Set vehicle busy, driver busy
    await prisma.vehicle.update({
      where: { id: trip.vehicleId },
      data: { status: 'ACTIVE', availability: false },
    });

    await prisma.driver.update({
      where: { id: trip.driverId },
      data: { status: 'ON_TRIP' },
    });

    // Update assigned bookings
    for (const booking of trip.bookings) {
      const trail = booking.auditTrail ? JSON.parse(booking.auditTrail) : [];
      trail.push({ status: 'DISPATCHED', timestamp: new Date().toISOString(), user: req.user!.userId });
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: 'DISPATCHED',
          auditTrail: JSON.stringify(trail),
        },
      });
    }

    res.json({ message: 'Trip successfully dispatched' });
  } catch (err) {
    next(err);
  }
});

tripRouter.post('/:id/complete', async (req, res, next) => {
  try {
    const companyId = req.user!.companyId;
    const { endOdometer } = req.body;

    const trip = await prisma.trip.findFirst({
      where: { id: req.params.id, companyId },
      include: { bookings: true },
    });

    if (!trip) {
      res.status(404).json({ error: 'Trip not found' });
      return;
    }

    // Complete trip
    await prisma.trip.update({
      where: { id: trip.id },
      data: {
        status: 'COMPLETED',
        endOdometer: endOdometer ? Number(endOdometer) : undefined,
      },
    });

    // Set vehicle free, driver free
    await prisma.vehicle.update({
      where: { id: trip.vehicleId },
      data: { status: 'ACTIVE', availability: true },
    });

    await prisma.driver.update({
      where: { id: trip.driverId },
      data: { status: 'AVAILABLE' },
    });

    // Update bookings
    for (const booking of trip.bookings) {
      const trail = booking.auditTrail ? JSON.parse(booking.auditTrail) : [];
      trail.push({ status: 'IN_TRANSIT', timestamp: new Date().toISOString(), user: req.user!.userId });
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: 'IN_TRANSIT',
          auditTrail: JSON.stringify(trail),
        },
      });
    }

    res.json({ message: 'Trip completed. Cargo transitioned to In-Transit / pending POD.' });
  } catch (err) {
    next(err);
  }
});

tripRouter.post('/:id/fuel', async (req, res, next) => {
  try {
    const companyId = req.user!.companyId;
    const { date, liters, pricePerLiter, totalCost, odometer, station } = req.body;

    const trip = await prisma.trip.findFirst({
      where: { id: req.params.id, companyId },
    });

    if (!trip) {
      res.status(404).json({ error: 'Trip not found' });
      return;
    }

    const fuelRef = `FUEL-TRIP-${trip.tripNo}-${Date.now().toString().slice(-4)}`;

    // Create journal entry using Mapped double entry
    const journalEntry = await AccountingService.createMappedDoubleEntry({
      companyId,
      reference: fuelRef,
      description: `Fuel Purchase: ${liters}L @ Rs.${pricePerLiter}/L for Trip ${trip.tripNo}`,
      transactionType: 'FUEL_EXPENSE',
      amount: Number(totalCost),
    });

    const fuelLog = await prisma.fuelLog.create({
      data: {
        tripId: trip.id,
        vehicleId: trip.vehicleId,
        date: date ? new Date(date) : new Date(),
        liters: Number(liters),
        pricePerLiter: Number(pricePerLiter),
        totalCost: Number(totalCost),
        odometer: Number(odometer),
        station,
        journalEntryId: journalEntry?.id,
      },
    });

    res.status(201).json(fuelLog);
  } catch (err) {
    next(err);
  }
});

tripRouter.post('/:id/expenses', async (req, res, next) => {
  try {
    const companyId = req.user!.companyId;
    const { expenseDate, category, amount, description } = req.body;

    const trip = await prisma.trip.findFirst({
      where: { id: req.params.id, companyId },
    });

    if (!trip) {
      res.status(404).json({ error: 'Trip not found' });
      return;
    }

    const expRef = `EXP-TRIP-${trip.tripNo}-${Date.now().toString().slice(-4)}`;

    // Post operating expense using Mapped double entry (mapped to FUEL_EXPENSE / Operating Expense)
    const journalEntry = await AccountingService.createMappedDoubleEntry({
      companyId,
      reference: expRef,
      description: `Trip Expense [${category}]: ${description} for Trip ${trip.tripNo}`,
      transactionType: 'FUEL_EXPENSE',
      amount: Number(amount),
    });

    const expense = await prisma.tripExpense.create({
      data: {
        tripId: trip.id,
        expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
        category,
        amount: Number(amount),
        description,
        journalEntryId: journalEntry?.id,
      },
    });

    res.status(201).json(expense);
  } catch (err) {
    next(err);
  }
});

export const tripRoutes = tripRouter;

// ─── Maintenance Router ───────────────────────────────────────────────────────
const maintenanceRouter = Router();
maintenanceRouter.use(authenticate);

maintenanceRouter.post('/', async (req, res, next) => {
  try {
    const companyId = req.user!.companyId;
    const { vehicleId, date, type, cost, description, status } = req.body;

    const vehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, companyId },
    });
    if (!vehicle) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }

    const maintRef = `MAIN-${vehicle.plateNumber}-${Date.now().toString().slice(-4)}`;

    // Automatically post to accounting GL using mappings
    const journalEntry = await AccountingService.createMappedDoubleEntry({
      companyId,
      reference: maintRef,
      description: `Vehicle Maintenance: ${type} for Vehicle ${vehicle.plateNumber}`,
      transactionType: 'VEHICLE_MAINTENANCE',
      amount: Number(cost),
    });

    // Create the record
    const log = await prisma.vehicleMaintenance.create({
      data: {
        vehicleId,
        date: date ? new Date(date) : new Date(),
        type,
        cost: Number(cost),
        description,
        status,
        journalEntryId: journalEntry?.id,
      },
      include: { vehicle: true },
    });

    // If active, temporarily mark vehicle status to maintenance
    if (status === 'IN_PROGRESS') {
      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: { status: 'MAINTENANCE' },
      });
    }

    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
});

maintenanceRouter.delete('/:id', async (req, res, next) => {
  try {
    const companyId = req.user!.companyId;
    const existing = await prisma.vehicleMaintenance.findFirst({
      where: { id: req.params.id, vehicle: { companyId } },
    });
    if (!existing) {
      res.status(404).json({ error: 'Record not found' });
      return;
    }
    await prisma.vehicleMaintenance.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export const maintenanceRoutes = maintenanceRouter;

// ─── Driver Advance & Salary Endpoints ──────────────────────────────────────────
const customDriverRouter = Router();
customDriverRouter.use(authenticate);

customDriverRouter.post('/:id/advances', async (req, res, next) => {
  try {
    const companyId = req.user!.companyId;
    const { amount } = req.body;
    const driver = await prisma.driver.findFirst({
      where: { id: req.params.id, companyId },
    });
    if (!driver) {
      res.status(404).json({ error: 'Driver profile not found' });
      return;
    }

    const ref = `ADV-${driver.licenseNumber}-${Date.now().toString().slice(-4)}`;
    
    // Debit Driver Advances, Credit Cash
    await AccountingService.createMappedDoubleEntry({
      companyId,
      reference: ref,
      description: `Cash Advance to driver: ${driver.name}`,
      transactionType: 'DRIVER_ADVANCE',
      amount: Number(amount),
    });

    const updated = await prisma.driver.update({
      where: { id: driver.id },
      data: { advances: { increment: Number(amount) } },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

customDriverRouter.post('/:id/pay-salary', async (req, res, next) => {
  try {
    const companyId = req.user!.companyId;
    const driver = await prisma.driver.findFirst({
      where: { id: req.params.id, companyId },
    });
    if (!driver) {
      res.status(404).json({ error: 'Driver profile not found' });
      return;
    }

    const basicSalary = Number(driver.salary || 0);
    const advances = Number(driver.advances || 0);
    const netPayable = basicSalary - advances;

    const ref = `PAY-${driver.licenseNumber}-${Date.now().toString().slice(-4)}`;

    if (basicSalary > 0) {
      // Debit Salary / Payroll Expense, Credit Cash
      await AccountingService.createMappedDoubleEntry({
        companyId,
        reference: ref,
        description: `Salary Payout for Driver ${driver.name}. Basic: Rs.${basicSalary}, Deduct Advance: Rs.${advances}, Net: Rs.${netPayable}`,
        transactionType: 'PAYROLL',
        amount: basicSalary, // Debits payroll expense
      });
    }

    const updated = await prisma.driver.update({
      where: { id: driver.id },
      data: { advances: 0 }, // Reset advances after salary deductions
    });

    res.json({ message: 'Salary paid successfully', driver: updated, netPayable });
  } catch (err) {
    next(err);
  }
});

export const customDriverRoutes = customDriverRouter;

// ─── Logistics Reports Router ───────────────────────────────────────────────
const logisticsReportRouter = Router();
logisticsReportRouter.use(authenticate);

logisticsReportRouter.get('/profit-loss', async (req, res, next) => {
  try {
    const companyId = req.user!.companyId;

    // Revenue: sum of charges of all bookings invoiced
    const bookings = await prisma.booking.findMany({
      where: { companyId, invoiceId: { not: null } },
      select: { charges: true },
    });
    const revenue = bookings.reduce((sum, b) => sum + Number(b.charges), 0);

    // Expenses
    const [fuelCostSum, maintenanceCostSum, driverSalaries] = await Promise.all([
      prisma.fuelLog.aggregate({
        _sum: { totalCost: true },
        where: { vehicle: { companyId } },
      }),
      prisma.vehicleMaintenance.aggregate({
        _sum: { cost: true },
        where: { vehicle: { companyId } },
      }),
      prisma.driver.aggregate({
        _sum: { salary: true },
        where: { companyId },
      }),
    ]);

    const fuel = Number(fuelCostSum._sum.totalCost || 0);
    const maintenance = Number(maintenanceCostSum._sum.cost || 0);
    const salaries = Number(driverSalaries._sum.salary || 0);
    const totalExpenses = fuel + maintenance + salaries;

    res.json({
      revenue,
      expenses: {
        fuel,
        maintenance,
        salaries,
        total: totalExpenses,
      },
      netProfit: revenue - totalExpenses,
    });
  } catch (err) {
    next(err);
  }
});

logisticsReportRouter.get('/fleet-utilization', async (req, res, next) => {
  try {
    const companyId = req.user!.companyId;
    const [totalVehicles, activeVehicles, maintenanceVehicles] = await Promise.all([
      prisma.vehicle.count({ where: { companyId } }),
      prisma.vehicle.count({ where: { companyId, status: 'ACTIVE' } }),
      prisma.vehicle.count({ where: { companyId, status: 'MAINTENANCE' } }),
    ]);

    res.json({
      total: totalVehicles,
      active: activeVehicles,
      maintenance: maintenanceVehicles,
      idle: totalVehicles - activeVehicles - maintenanceVehicles,
    });
  } catch (err) {
    next(err);
  }
});

logisticsReportRouter.get('/driver-performance', async (req, res, next) => {
  try {
    const companyId = req.user!.companyId;
    const drivers = await prisma.driver.findMany({
      where: { companyId },
      include: {
        trips: {
          where: { status: 'COMPLETED' },
        },
      },
    });

    const rows = drivers.map((d) => ({
      id: d.id,
      name: d.name,
      license: d.licenseNumber,
      rating: Number(d.rating),
      tripsCompleted: d.trips.length,
      advances: Number(d.advances),
      salary: Number(d.salary),
    }));

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export const logisticsReportRoutes = logisticsReportRouter;

// ─── Company Profile Router ──────────────────────────────────────────────────
const companyRouter = Router();
companyRouter.use(authenticate);

companyRouter.put('/:id', async (req, res, next) => {
  try {
    const { name, currency, ntn, gst, address, phone, email } = req.body;
    
    if (req.user!.companyId !== req.params.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const updated = await prisma.company.update({
      where: { id: req.params.id },
      data: { name, currency, ntn, gst, address, phone, email },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

export const companyRoutes = companyRouter;

import { Router } from 'express';
import prisma from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/summary', async (req, res, next) => {
  try {
    const companyId = req.user!.companyId;

    const [
      customerCount,
      supplierCount,
      itemCount,
      openSalesOrders,
      openPurchaseOrders,
      pendingInvoices,
      bookingCount,
      activeVehicles,
      activeDrivers,
      completedTrips,
      fuelAggregation,
      expenseAggregation,
      chargesAggregation,
      arAggregation,
      apAggregation,
      bankAggregation,
      recentBookings,
    ] = await Promise.all([
      prisma.customer.count({ where: { companyId, isActive: true } }),
      prisma.supplier.count({ where: { companyId, isActive: true } }),
      prisma.item.count({ where: { companyId, isActive: true } }),
      prisma.salesOrder.count({ where: { companyId, status: { not: 'CANCELLED' } } }),
      prisma.purchaseOrder.count({ where: { companyId, status: { not: 'CANCELLED' } } }),
      prisma.salesInvoice.count({ where: { companyId, status: 'POSTED' } }),

      // Logistics metrics
      prisma.booking.count({ where: { companyId } }),
      prisma.vehicle.count({ where: { companyId, status: 'ACTIVE' } }),
      prisma.driver.count({ where: { companyId, status: 'AVAILABLE' } }),
      prisma.trip.count({ where: { companyId, status: 'COMPLETED' } }),
      prisma.fuelLog.aggregate({
        _sum: { totalCost: true },
        where: { vehicle: { companyId } },
      }),
      prisma.tripExpense.aggregate({
        _sum: { amount: true },
        where: { trip: { companyId } },
      }),
      prisma.booking.aggregate({
        _sum: { charges: true },
        where: { companyId },
      }),

      // Financial metrics
      prisma.salesInvoice.aggregate({
        _sum: { total: true },
        where: { companyId, status: 'POSTED' },
      }),
      prisma.purchaseInvoice.aggregate({
        _sum: { total: true },
        where: { companyId, status: 'POSTED' },
      }),
      prisma.bankAccount.aggregate({
        _sum: { balance: true },
        where: { companyId, isActive: true },
      }),
      prisma.booking.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { customer: true },
      }),
    ]);

    const fuelCost = Number(fuelAggregation._sum.totalCost || 0);
    const expenseCost = Number(expenseAggregation._sum.amount || 0);
    const totalCharges = Number(chargesAggregation._sum.charges || 0);
    const totalCosts = fuelCost + expenseCost;
    const profitability = totalCharges - totalCosts;

    res.json({
      customers: customerCount,
      suppliers: supplierCount,
      items: itemCount,
      openSalesOrders,
      openPurchaseOrders,
      pendingInvoices,

      // Logistics
      bookings: bookingCount,
      activeVehicles,
      activeDrivers,
      completedTrips,
      logisticsRevenue: totalCharges,
      logisticsCost: totalCosts,
      logisticsProfit: profitability,

      // Financial
      outstandingAR: Number(arAggregation._sum.total || 0),
      outstandingAP: Number(apAggregation._sum.total || 0),
      bankBalance: Number(bankAggregation._sum.balance || 0),
      recentBookings,
    });
  } catch (err) {
    next(err);
  }
});

export default router;

import { Router } from 'express';
import authRoutes from './auth.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import {
  salesRoutes,
  supplierRoutes,
  itemRoutes,
  locationRoutes,
  accountRoutes,
  costCenterRoutes,
  leadRoutes,
  employeeRoutes,
  fixedAssetRoutes,
  salesOrderRoutes,
  purchaseOrderRoutes,
  journalRoutes,
  workOrderRoutes,
  reportRoutes,
  vehicleRoutes,
  driverRoutes,
  routeRoutes,
  bookingRoutes,
  tripRoutes,
  maintenanceRoutes,
  documentRoutes,
  accountMappingRoutes,
  customDriverRoutes,
  logisticsReportRoutes,
  companyRoutes,
  salesInvoiceRoutes,
  purchaseInvoiceRoutes,
  stockTransferRoutes,
  bankAccountRoutes,
} from './modules.routes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'hisaab-erp-api' });
});

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/customers', salesRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/items', itemRoutes);
router.use('/locations', locationRoutes);
router.use('/accounts', accountRoutes);
router.use('/cost-centers', costCenterRoutes);
router.use('/leads', leadRoutes);
router.use('/employees', employeeRoutes);
router.use('/fixed-assets', fixedAssetRoutes);
router.use('/sales-orders', salesOrderRoutes);
router.use('/purchase-orders', purchaseOrderRoutes);
router.use('/journal-entries', journalRoutes);
router.use('/work-orders', workOrderRoutes);
router.use('/reports', reportRoutes);

// Logistics ERP Routes
router.use('/vehicles', vehicleRoutes);
router.use('/drivers', driverRoutes);
router.use('/routes', routeRoutes);
router.use('/bookings', bookingRoutes);
router.use('/trips', tripRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/documents', documentRoutes);
router.use('/settings/account-mappings', accountMappingRoutes);
router.use('/drivers-operations', customDriverRoutes);
router.use('/logistics-reports', logisticsReportRoutes);
router.use('/companies', companyRoutes);
router.use('/sales-invoices', salesInvoiceRoutes);
router.use('/purchase-invoices', purchaseInvoiceRoutes);
router.use('/stock-transfers', stockTransferRoutes);
router.use('/bank-accounts', bankAccountRoutes);

export default router;

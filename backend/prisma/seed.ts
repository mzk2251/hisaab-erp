import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.upsert({
    where: { code: 'DEMO' },
    update: {},
    create: {
      code: 'DEMO',
      name: 'Demo Logistics (Pvt) Ltd',
      ntn: '1234567-8',
      gst: '17',
      address: 'Karachi, Pakistan',
      phone: '+92-21-1234567',
      email: 'demo@logistics-erp.local',
      currency: 'PKR',
    },
  });

  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      password: hashedPassword,
      name: 'Logistics Admin',
      role: 'ADMIN',
      companyId: company.id,
    },
  });

  // Chart of Accounts
  const accounts = [
    { code: '1000', name: 'Cash', type: 'ASSET' as const },
    { code: '1100', name: 'Accounts Receivable', type: 'ASSET' as const },
    { code: '1150', name: 'Driver Advances', type: 'ASSET' as const },
    { code: '1200', name: 'Inventory', type: 'ASSET' as const },
    { code: '2000', name: 'Accounts Payable', type: 'LIABILITY' as const },
    { code: '3000', name: 'Owner Equity', type: 'EQUITY' as const },
    { code: '4000', name: 'Freight Sales Revenue', type: 'INCOME' as const },
    { code: '5000', name: 'Cost of Goods Sold', type: 'EXPENSE' as const },
    { code: '5100', name: 'Operating & Fleet Expenses', type: 'EXPENSE' as const },
  ];

  for (const account of accounts) {
    await prisma.account.upsert({
      where: { companyId_code: { companyId: company.id, code: account.code } },
      update: {},
      create: { ...account, companyId: company.id },
    });
  }

  // Get Account IDs to map
  const dbAccounts = await prisma.account.findMany({ where: { companyId: company.id } });
  const getAcctId = (code: string) => dbAccounts.find((a) => a.code === code)!.id;

  // Dynamic Account Mappings Seeding
  const mappings = [
    { type: 'BOOKING_INVOICE', debit: '1100', credit: '4000' },
    { type: 'CUSTOMER_PAYMENT', debit: '1000', credit: '1100' },
    { type: 'VENDOR_PAYMENT', debit: '2000', credit: '1000' },
    { type: 'FUEL_EXPENSE', debit: '5100', credit: '1000' },
    { type: 'VEHICLE_MAINTENANCE', debit: '5100', credit: '1000' },
    { type: 'PAYROLL', debit: '5100', credit: '1000' },
    { type: 'DRIVER_ADVANCE', debit: '1150', credit: '1000' },
  ];

  for (const m of mappings) {
    await prisma.accountMapping.upsert({
      where: { companyId_transactionType: { companyId: company.id, transactionType: m.type } },
      update: {
        debitAccountId: getAcctId(m.debit),
        creditAccountId: getAcctId(m.credit),
      },
      create: {
        transactionType: m.type,
        debitAccountId: getAcctId(m.debit),
        creditAccountId: getAcctId(m.credit),
        companyId: company.id,
      },
    });
  }

  await prisma.location.upsert({
    where: { companyId_code: { companyId: company.id, code: 'MAIN' } },
    update: {},
    create: { code: 'MAIN', name: 'Main Terminal', companyId: company.id },
  });

  await prisma.currency.upsert({
    where: { companyId_code: { companyId: company.id, code: 'PKR' } },
    update: {},
    create: { code: 'PKR', name: 'Pakistani Rupee', symbol: 'Rs', companyId: company.id },
  });

  await prisma.currency.upsert({
    where: { companyId_code: { companyId: company.id, code: 'USD' } },
    update: {},
    create: { code: 'USD', name: 'US Dollar', symbol: '$', rate: 278.5, companyId: company.id },
  });

  const customer = await prisma.customer.upsert({
    where: { companyId_code: { companyId: company.id, code: 'C001' } },
    update: {},
    create: {
      code: 'C001',
      name: 'ABC Logistics Customer',
      ntn: '9876543-2',
      email: 'logistics@abctraders.pk',
      phone: '+92-300-1234567',
      address: 'Lahore, Pakistan',
      creditLimit: 500000,
      companyId: company.id,
    },
  });

  await prisma.supplier.upsert({
    where: { companyId_code: { companyId: company.id, code: 'S001' } },
    update: {},
    create: {
      code: 'S001',
      name: 'XYZ Fuel Station',
      ntn: '5555555-1',
      email: 'fuel@xyzsuppliers.pk',
      vendorType: 'FUEL',
      balance: 12000,
      companyId: company.id,
    },
  });

  await prisma.item.upsert({
    where: { companyId_code: { companyId: company.id, code: 'ITEM001' } },
    update: {},
    create: {
      code: 'ITEM001',
      name: 'Corporate Cargo Service',
      category: 'Logistics',
      unit: 'Trip',
      costPrice: 60000,
      salePrice: 85000,
      reorderLevel: 0,
      companyId: company.id,
    },
  });

  await prisma.costCenter.upsert({
    where: { companyId_code: { companyId: company.id, code: 'HQ' } },
    update: {},
    create: { code: 'HQ', name: 'Head Office', type: 'BRANCH', companyId: company.id },
  });

  // Drivers & Employees
  const driverEmp1 = await prisma.employee.upsert({
    where: { companyId_code: { companyId: company.id, code: 'EMP-002' } },
    update: {},
    create: {
      code: 'EMP-002',
      name: 'Ziyad Khan',
      department: 'Logistics',
      designation: 'Lead Driver',
      joinDate: new Date('2025-01-15'),
      basicSalary: 45000,
      companyId: company.id,
    },
  });

  const driverEmp2 = await prisma.employee.upsert({
    where: { companyId_code: { companyId: company.id, code: 'EMP-003' } },
    update: {},
    create: {
      code: 'EMP-003',
      name: 'Mehmood Ali',
      department: 'Logistics',
      designation: 'Assistant Driver',
      joinDate: new Date('2025-03-10'),
      basicSalary: 35000,
      companyId: company.id,
    },
  });

  // Drivers
  const driver1 = await prisma.driver.upsert({
    where: { companyId_licenseNumber: { companyId: company.id, licenseNumber: 'LIC-112233' } },
    update: {},
    create: {
      name: 'Ziyad Khan',
      licenseNumber: 'LIC-112233',
      phone: '+92-300-9876543',
      status: 'AVAILABLE',
      employeeId: driverEmp1.id,
      cnic: '42101-1234567-1',
      licenseExpiry: new Date('2028-12-31'),
      medicalDetails: 'Fit - Normal Vision',
      emergencyContact: 'Brother - +92-300-1112223',
      rating: 4.8,
      salary: 45000,
      advances: 15000,
      companyId: company.id,
    },
  });

  const driver2 = await prisma.driver.upsert({
    where: { companyId_licenseNumber: { companyId: company.id, licenseNumber: 'LIC-445566' } },
    update: {},
    create: {
      name: 'Mehmood Ali',
      licenseNumber: 'LIC-445566',
      phone: '+92-301-7654321',
      status: 'AVAILABLE',
      employeeId: driverEmp2.id,
      cnic: '35201-7654321-2',
      licenseExpiry: new Date('2027-05-15'),
      medicalDetails: 'Fit - Wear glasses for reading',
      emergencyContact: 'Spouse - +92-301-3334445',
      rating: 4.5,
      salary: 35000,
      advances: 5000,
      companyId: company.id,
    },
  });

  // Vehicles
  const vehicle1 = await prisma.vehicle.upsert({
    where: { companyId_plateNumber: { companyId: company.id, plateNumber: 'LHR-7890' } },
    update: {},
    create: {
      plateNumber: 'LHR-7890',
      make: 'Hino',
      model: '500 Series',
      year: 2022,
      type: '10-Wheeler Truck',
      status: 'ACTIVE',
      category: 'Heavy Duty',
      registrationNo: 'REG-HINO-500',
      ownershipType: 'OWNED',
      insuranceExpiry: new Date('2026-12-31'),
      fitnessExpiry: new Date('2026-10-15'),
      permitExpiry: new Date('2026-09-30'),
      taxExpiry: new Date('2026-08-31'),
      tyreCount: 10,
      gpsDeviceId: 'GPS-7890',
      companyId: company.id,
    },
  });

  const vehicle2 = await prisma.vehicle.upsert({
    where: { companyId_plateNumber: { companyId: company.id, plateNumber: 'KHI-4567' } },
    update: {},
    create: {
      plateNumber: 'KHI-4567',
      make: 'Isuzu',
      model: 'Forward',
      year: 2021,
      type: '6-Wheeler Van',
      status: 'ACTIVE',
      category: 'Medium Duty',
      registrationNo: 'REG-ISZ-FORWARD',
      ownershipType: 'OWNED',
      insuranceExpiry: new Date('2026-11-30'),
      fitnessExpiry: new Date('2026-09-20'),
      permitExpiry: new Date('2026-05-15'), // EXPIRED for demonstration!
      taxExpiry: new Date('2026-10-31'),
      tyreCount: 6,
      gpsDeviceId: 'GPS-4567',
      companyId: company.id,
    },
  });

  const vehicle3 = await prisma.vehicle.upsert({
    where: { companyId_plateNumber: { companyId: company.id, plateNumber: 'ISL-1234' } },
    update: {},
    create: {
      plateNumber: 'ISL-1234',
      make: 'Volvo',
      model: 'FH16',
      year: 2023,
      type: 'Multi-axle Trailer',
      status: 'MAINTENANCE',
      category: 'Heavy Trailer',
      registrationNo: 'REG-VOL-FH16',
      ownershipType: 'LEASED',
      insuranceExpiry: new Date('2027-01-15'),
      fitnessExpiry: new Date('2026-06-30'), // EXPIRED!
      permitExpiry: new Date('2027-02-28'),
      taxExpiry: new Date('2026-12-31'),
      tyreCount: 18,
      gpsDeviceId: 'GPS-1234',
      companyId: company.id,
    },
  });

  // Routes
  const route1 = await prisma.route.upsert({
    where: { companyId_name: { companyId: company.id, name: 'Karachi to Lahore' } },
    update: {},
    create: {
      name: 'Karachi to Lahore',
      origin: 'Karachi',
      destination: 'Lahore',
      distanceKm: 1210,
      estDurationHrs: 16.5,
      companyId: company.id,
    },
  });

  const route2 = await prisma.route.upsert({
    where: { companyId_name: { companyId: company.id, name: 'Islamabad to Peshawar' } },
    update: {},
    create: {
      name: 'Islamabad to Peshawar',
      origin: 'Islamabad',
      destination: 'Peshawar',
      distanceKm: 185,
      estDurationHrs: 2.5,
      companyId: company.id,
    },
  });

  // Bookings / Quotations
  await prisma.booking.upsert({
    where: { companyId_bookingNo: { companyId: company.id, bookingNo: 'BKG-001' } },
    update: {},
    create: {
      bookingNo: 'BKG-001',
      date: new Date('2026-07-02'),
      customerId: customer.id,
      status: 'SHIPMENT',
      originAddress: 'Karachi Port Terminal 1',
      destinationAddress: 'ABC Warehouse Lahore',
      cargoDescription: 'Raw materials and plastic resins',
      cargoWeight: 14.5,
      cargoVolume: 42.0,
      estDeliveryDate: new Date('2026-07-05'),
      charges: 85000,
      companyId: company.id,
    },
  });

  await prisma.booking.upsert({
    where: { companyId_bookingNo: { companyId: company.id, bookingNo: 'BKG-002' } },
    update: {},
    create: {
      bookingNo: 'BKG-002',
      date: new Date('2026-07-03'),
      customerId: customer.id,
      status: 'QUOTATION',
      originAddress: 'F-6 Markaz Islamabad',
      destinationAddress: 'Peshawar University Rd',
      cargoDescription: 'Textiles and garments',
      cargoWeight: 3.2,
      cargoVolume: 12.0,
      estDeliveryDate: new Date('2026-07-04'),
      charges: 25000,
      companyId: company.id,
    },
  });

  // Vehicle Maintenance Log
  await prisma.vehicleMaintenance.create({
    data: {
      vehicleId: vehicle3.id,
      date: new Date('2026-06-25'),
      type: 'Tire Replacement',
      cost: 45000,
      description: 'Replaced front two steering tires with new Michelin tires',
      status: 'COMPLETED',
    },
  });

  console.log('Seed completed.');
  console.log('Login: admin@demo.com / admin123 (Company Code: DEMO)');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

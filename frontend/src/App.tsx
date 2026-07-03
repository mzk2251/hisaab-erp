import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './pages/Dashboard';
import LoginPage from './pages/Login';
import ModulePage from './pages/ModulePage';
import BookingsPage from './pages/BookingsPage';
import TripsPage from './pages/TripsPage';
import { VehiclesPage, DriversPage, RoutesPage } from './pages/FleetModulePages';
import MaintenancePage from './pages/MaintenancePage';
import DocumentsPage from './pages/DocumentsPage';
import AccountMappingsPage from './pages/AccountMappingsPage';
import OperationsReportsPage from './pages/OperationsReportsPage';
import CustomersPage from './pages/CustomersPage';
import VendorsPage from './pages/VendorsPage';
import CompanyPage from './pages/CompanyPage';
import BankingPage from './pages/BankingPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const locationsFields = [
    { key: 'code', label: 'Warehouse Code', type: 'text' as const, required: true },
    { key: 'name', label: 'Warehouse Name', type: 'text' as const, required: true },
    { key: 'address', label: 'Address', type: 'text' as const },
  ];

  const accountsFields = [
    { key: 'code', label: 'Account Code', type: 'text' as const, required: true },
    { key: 'name', label: 'Account Name', type: 'text' as const, required: true },
    { key: 'type', label: 'Account Type', type: 'select' as const, options: [{ value: 'ASSET', label: 'Asset' }, { value: 'LIABILITY', label: 'Liability' }, { value: 'EQUITY', label: 'Equity' }, { value: 'INCOME', label: 'Income' }, { value: 'EXPENSE', label: 'Expense' }], required: true },
  ];

  const costCenterFields = [
    { key: 'code', label: 'Cost Center Code', type: 'text' as const, required: true },
    { key: 'name', label: 'Center Name', type: 'text' as const, required: true },
    { key: 'type', label: 'Center Type', type: 'select' as const, options: [{ value: 'BRANCH', label: 'Branch' }, { value: 'DEPARTMENT', label: 'Department' }, { value: 'PROJECT', label: 'Project' }], required: true },
  ];

  const leadsFields = [
    { key: 'name', label: 'Contact Name', type: 'text' as const, required: true },
    { key: 'company', label: 'Company Name', type: 'text' as const },
    { key: 'phone', label: 'Phone', type: 'text' as const },
    { key: 'email', label: 'Email', type: 'text' as const },
    { key: 'stage', label: 'Lead Stage', type: 'select' as const, options: [{ value: 'NEW', label: 'New / Cold' }, { value: 'CONTACTED', label: 'Contacted' }, { value: 'QUALIFIED', label: 'Qualified' }, { value: 'PROPOSAL', label: 'Proposal Sent' }, { value: 'WON', label: 'Won / Signed' }], required: true },
  ];

  const fixedAssetsFields = [
    { key: 'code', label: 'Asset Code', type: 'text' as const, required: true },
    { key: 'name', label: 'Asset Name', type: 'text' as const, required: true },
    { key: 'category', label: 'Category', type: 'text' as const, required: true },
    { key: 'bookValue', label: 'Book Value (PKR)', type: 'number' as const, required: true },
  ];

  const payrollFields = [
    { key: 'code', label: 'Employee ID', type: 'text' as const, required: true },
    { key: 'name', label: 'Full Name', type: 'text' as const, required: true },
    { key: 'department', label: 'Department', type: 'text' as const, required: true },
    { key: 'designation', label: 'Designation', type: 'text' as const, required: true },
    { key: 'basicSalary', label: 'Basic Salary (PKR)', type: 'number' as const, required: true },
  ];

  const itemsFields = [
    { key: 'code', label: 'Item Code', type: 'text' as const, required: true },
    { key: 'name', label: 'Item Name', type: 'text' as const, required: true },
    { key: 'category', label: 'Category', type: 'text' as const, required: true },
    { key: 'unit', label: 'Unit', type: 'text' as const, required: true },
    { key: 'salePrice', label: 'Sale Price (PKR)', type: 'number' as const, required: true },
    { key: 'purchasePrice', label: 'Purchase Price (PKR)', type: 'number' as const, required: true },
  ];

  const salesInvoicesFields = [
    { key: 'reference', label: 'Reference Code', type: 'text' as const, required: true },
    { key: 'date', label: 'Invoice Date', type: 'date' as const, required: true },
    { key: 'dueDate', label: 'Due Date', type: 'date' as const, required: true },
    { key: 'type', label: 'Billing Type', type: 'select' as const, options: [{ value: 'CASH', label: 'Cash Payment' }, { value: 'CREDIT', label: 'Credit Account' }], required: true },
    { key: 'status', label: 'Status', type: 'select' as const, options: [{ value: 'DRAFT', label: 'Draft' }, { value: 'POSTED', label: 'Posted' }], required: true },
    { key: 'total', label: 'Total Amount (PKR)', type: 'number' as const, required: true },
  ];

  const purchaseInvoicesFields = [
    { key: 'reference', label: 'Reference Bill No', type: 'text' as const, required: true },
    { key: 'date', label: 'Bill Date', type: 'date' as const, required: true },
    { key: 'dueDate', label: 'Due Date', type: 'date' as const, required: true },
    { key: 'type', label: 'Billing Type', type: 'select' as const, options: [{ value: 'CASH', label: 'Cash Payment' }, { value: 'CREDIT', label: 'Credit Account' }], required: true },
    { key: 'status', label: 'Status', type: 'select' as const, options: [{ value: 'DRAFT', label: 'Draft' }, { value: 'POSTED', label: 'Posted' }], required: true },
    { key: 'total', label: 'Total Amount (PKR)', type: 'number' as const, required: true },
  ];

  const stockTransfersFields = [
    { key: 'reference', label: 'Transfer Ref No', type: 'text' as const, required: true },
    { key: 'date', label: 'Transfer Date', type: 'date' as const, required: true },
    { key: 'quantity', label: 'Quantity', type: 'number' as const, required: true },
    { key: 'status', label: 'Status', type: 'select' as const, options: [{ value: 'PENDING', label: 'Pending' }, { value: 'COMPLETED', label: 'Completed' }], required: true },
  ];

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        
        {/* Core Sales, Purchase & Inventory */}
        <Route path="customers" element={<CustomersPage />} />
        <Route path="suppliers" element={<VendorsPage />} />
        <Route path="items" element={<ModulePage title="Items & Inventory" description="Inventory and service items" endpoint="/items" columns={[{ key: 'code', label: 'Code' }, { key: 'name', label: 'Name' }, { key: 'category', label: 'Category' }, { key: 'salePrice', label: 'Sale Price' }]} fields={itemsFields} />} />
        <Route path="locations" element={<ModulePage title="Locations" description="Warehouses and stock locations" endpoint="/locations" columns={[{ key: 'code', label: 'Code' }, { key: 'name', label: 'Name' }, { key: 'address', label: 'Address' }]} fields={locationsFields} />} />
        
        {/* Accounting */}
        <Route path="accounts" element={<ModulePage title="Chart of Accounts" description="General ledger account structure" endpoint="/accounts" columns={[{ key: 'code', label: 'Code' }, { key: 'name', label: 'Name' }, { key: 'type', label: 'Type' }]} fields={accountsFields} />} />
        <Route path="journal-entries" element={<ModulePage title="Journal Entries" description="Payment, receipt, and journal vouchers" endpoint="/journal-entries" columns={[{ key: 'reference', label: 'Reference' }, { key: 'date', label: 'Date', render: (r) => String(r.date).slice(0, 10) }, { key: 'status', label: 'Status' }, { key: 'description', label: 'Description' }]} />} />
        <Route path="cost-centers" element={<ModulePage title="Cost Centers" description="Projects, branches, and departments" endpoint="/cost-centers" columns={[{ key: 'code', label: 'Code' }, { key: 'name', label: 'Name' }, { key: 'type', label: 'Type' }]} fields={costCenterFields} />} />
        <Route path="reports" element={<ReportsPage />} />

        {/* CRM, Manufacturing & HR */}
        <Route path="leads" element={<ModulePage title="CRM / Leads" description="Lead management and pipeline" endpoint="/leads" columns={[{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'stage', label: 'Stage' }, { key: 'source', label: 'Source' }]} fields={leadsFields} />} />
        <Route path="sales-orders" element={<ModulePage title="Sales Orders" description="Customer sales orders" endpoint="/sales-orders" columns={[{ key: 'reference', label: 'Reference' }, { key: 'date', label: 'Date', render: (r) => String(r.date).slice(0, 10) }, { key: 'status', label: 'Status' }, { key: 'total', label: 'Total' }]} />} />
        <Route path="purchase-orders" element={<ModulePage title="Purchase Orders" description="Supplier purchase orders" endpoint="/purchase-orders" columns={[{ key: 'reference', label: 'Reference' }, { key: 'date', label: 'Date', render: (r) => String(r.date).slice(0, 10) }, { key: 'status', label: 'Status' }, { key: 'total', label: 'Total' }]} />} />
        <Route path="fixed-assets" element={<ModulePage title="Fixed Assets" description="Asset register and depreciation" endpoint="/fixed-assets" columns={[{ key: 'code', label: 'Code' }, { key: 'name', label: 'Name' }, { key: 'category', label: 'Category' }, { key: 'bookValue', label: 'Book Value' }]} fields={fixedAssetsFields} />} />
        <Route path="payroll" element={<ModulePage title="Payroll / HR" description="Employee records and payroll" endpoint="/employees" columns={[{ key: 'code', label: 'Code' }, { key: 'name', label: 'Name' }, { key: 'department', label: 'Department' }, { key: 'basicSalary', label: 'Basic Salary' }]} fields={payrollFields} />} />
        <Route path="manufacturing" element={<ModulePage title="Manufacturing" description="Work orders and production" endpoint="/work-orders" columns={[{ key: 'reference', label: 'Reference' }, { key: 'date', label: 'Date', render: (r) => String(r.date).slice(0, 10) }, { key: 'status', label: 'Status' }, { key: 'quantity', label: 'Quantity' }]} />} />
        
        {/* Logistics ERP Modules */}
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="trips" element={<TripsPage />} />
        <Route path="vehicles" element={<VehiclesPage />} />
        <Route path="drivers" element={<DriversPage />} />
        <Route path="routes" element={<RoutesPage />} />
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="settings/accounts" element={<AccountMappingsPage />} />
        <Route path="settings/company" element={<CompanyPage />} />
        <Route path="logistics-reports" element={<OperationsReportsPage />} />
        <Route path="banking" element={<BankingPage />} />
        <Route path="sales-invoices" element={<ModulePage title="Sales Invoices" description="Cash, credit, and sales tax invoices" endpoint="/sales-invoices" columns={[{ key: 'reference', label: 'Reference Code' }, { key: 'date', label: 'Billing Date', render: (r) => String(r.date).slice(0, 10) }, { key: 'type', label: 'Type' }, { key: 'status', label: 'Status' }, { key: 'total', label: 'Total' }]} fields={salesInvoicesFields} />} />
        <Route path="purchase-invoices" element={<ModulePage title="Purchase Invoices" description="Supplier bills and debit notes" endpoint="/purchase-invoices" columns={[{ key: 'reference', label: 'Reference Bill' }, { key: 'date', label: 'Bill Date', render: (r) => String(r.date).slice(0, 10) }, { key: 'type', label: 'Type' }, { key: 'status', label: 'Status' }, { key: 'total', label: 'Total' }]} fields={purchaseInvoicesFields} />} />
        <Route path="stock-transfers" element={<ModulePage title="Stock Transfers" description="Inter-location warehouse stock transfers" endpoint="/stock-transfers" columns={[{ key: 'reference', label: 'Transfer Ref' }, { key: 'date', label: 'Transfer Date', render: (r) => String(r.date).slice(0, 10) }, { key: 'quantity', label: 'Quantity' }, { key: 'status', label: 'Status' }]} fields={stockTransfersFields} />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}


function ReportsPage() {
  return (
    <ModulePage
      title="Trial Balance"
      description="General ledger trial balance report"
      endpoint="/reports/trial-balance"
      columns={[
        { key: 'code', label: 'Account Code' },
        { key: 'name', label: 'Account Name' },
        { key: 'debit', label: 'Debit' },
        { key: 'credit', label: 'Credit' },
        { key: 'balance', label: 'Balance' },
      ]}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

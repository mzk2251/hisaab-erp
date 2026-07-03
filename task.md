# Phased ERP Transformation Task Checklist

## Phase 2: Navigation Shell & Generic CRUD Layouts
- [x] Refactor navigation sidebar, breadcrumbs, search, and page headers
- [x] Develop reusable `CrudModal` component in frontend to handle additions/edits/deletions of simple entities
- [x] Implement Excel/PDF client-side export utility and printing layouts

## Phase 3: Master Registries (Company, Customers & Vendors)
- [x] Build **Company Settings** page (Branch and Department CRUD, Currency, Fiscal year settings)
- [x] Build **Customers Console** (List with filters, Create/Edit forms, Billing/Delivery Addresses, Credit Limit inputs, and Ledger Statement view)
- [x] Build **Vendors/Suppliers Console** (List with filters, Create/Edit forms, Payment Terms, Categorization by vendorType [Transport, Fuel, Repair, General], and Vendor Statement Ledger view)

## Phase 4: Core Ledger Cycles (Inventory, Purchasing, Sales, Banking)
- [ ] Build **Inventory Master** (Items catalog with categories, Warehouse Locations, Stock adjustments & Stock transfer forms)
- [ ] Build **Purchasing Board** (Purchase Order entries, Goods Receipt records, Purchase Invoice booking, Vendor Payment entries)
- [ ] Build **Sales Board** (Quotations, Sales Orders, Sales Invoice matching, Customer Payment logs)
- [ ] Build **Banking Portal** (Register Bank/Cash accounts, Bank transfers form, Reconciliation checks)

## Phase 5: Dashboard Widgets & Reporting Sheets
- [ ] Implement Profit & Loss Statement, Balance Sheet exportable views
- [ ] Implement Fleet utilization charts, Trip profitability ledger, Driver rating performance lists
- [ ] Add summary widgets to the home dashboard (Outstanding AR/AP, Stock alerts, Fleet ratios)

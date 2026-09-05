export const mockCustomers = [
  { 
    id: 'CUST-001', 
    name: 'ABC Company', 
    tier: 'Gold', 
    email: 'customer@abc.com', 
    phone: '+919876543210',
    contactPerson: 'Vikram Mehta',
    address: 'Tech Park Tower B, Suite 402, Mumbai, MH'
  },
  { 
    id: 'CUST-002', 
    name: 'XYZ Ltd', 
    tier: 'Platinum', 
    email: 'procurement@xyz.com', 
    phone: '+919812345678',
    contactPerson: 'Ananya Roy',
    address: 'Cyber City Phase II, Gurugram, HR'
  },
  { 
    id: 'CUST-003', 
    name: 'DEF Inc', 
    tier: 'Silver', 
    email: 'sales@definc.com', 
    phone: '+919711223344',
    contactPerson: 'Siddharth Rao',
    address: 'Electronic City, Bengaluru, KA'
  },
  { 
    id: 'CUST-004', 
    name: 'Global Tech Corp', 
    tier: 'Gold', 
    email: 'purchasing@globaltech.com', 
    phone: '+919899887766',
    contactPerson: 'Neha Sharma',
    address: 'HITEC City, Hyderabad, TS'
  }
];

export const mockProducts = [
  { id: 'PROD-001', name: 'Laptop Pro 15"', category: 'Hardware', price: 500, cost: 350, tax: 18, sku: 'HW-LTP-15', inStock: 45, maxDiscount: 15 },
  { id: 'PROD-002', name: 'Monitor 27" 4K', category: 'Hardware', price: 300, cost: 200, tax: 18, sku: 'HW-MNT-27', inStock: 30, maxDiscount: 12 },
  { id: 'PROD-003', name: 'Ergonomic Keyboard', category: 'Accessories', price: 50, cost: 25, tax: 18, sku: 'ACC-KBD-01', inStock: 120, maxDiscount: 20 },
  { id: 'PROD-004', name: 'Precision Wireless Mouse', category: 'Accessories', price: 25, cost: 12, tax: 18, sku: 'ACC-MSE-01', inStock: 200, maxDiscount: 25 },
  { id: 'PROD-005', name: 'USB-C Multiport Hub', category: 'Accessories', price: 40, cost: 20, tax: 18, sku: 'ACC-HUB-01', inStock: 85, maxDiscount: 15 },
  { id: 'PROD-006', name: 'Enterprise Setup & Deployment', category: 'Service', price: 1500, cost: 600, tax: 18, sku: 'SRV-STP-01', inStock: 999, maxDiscount: 10 },
  { id: 'PROD-007', name: '24/7 Priority Support SLA', category: 'Subscription', price: 2500, cost: 1000, tax: 18, sku: 'SUB-SLA-247', inStock: 999, maxDiscount: 10 },
  { id: 'PROD-008', name: 'Docking Station Dual 4K', category: 'Accessories', price: 120, cost: 70, tax: 18, sku: 'ACC-DOC-02', inStock: 40, maxDiscount: 15 }
];

export const mockUpsells = [
  { id: 'UP-001', name: 'Premium Laptop Pro 16"', priceAdd: 200, category: 'Upgrade', description: 'Upgrade to M3 Max Chip + 32GB RAM' },
  { id: 'UP-002', name: 'Extended 3-Year Onsite Warranty', priceAdd: 150, category: 'Protection', description: 'Zero-deductible next-day replacement' },
  { id: 'UP-003', name: 'Universal USB-C Docking Station', priceAdd: 80, category: 'Accessory', description: 'Dual 4K display output & 100W PD charging' },
  { id: 'UP-004', name: 'Annual On-Site Staff Training', priceAdd: 450, category: 'Service', description: '2 days dedicated on-site training for 25 staff' }
];

export const mockQuotations = [
  {
    id: 'Q-1042',
    customer: 'ABC Company',
    customerId: 'CUST-001',
    customerEmail: 'customer@abc.com',
    customerPhone: '+919876543210',
    customerTier: 'Gold Tier',
    amount: 13000,
    discountAmount: 1300,
    overallDiscountPercent: 10,
    total: 11700,
    status: 'pending_approval', // draft | pending_approval | approved | confirmed | negotiation | returned
    date: '2024-08-20',
    salesRep: 'Rahul Sharma',
    margin: 22.5,
    riskScore: 'high', // high | medium | low
    items: [
      { id: 'PROD-001', product: 'Laptop Pro 15"', qty: 20, price: 500, cost: 350, discount: 12, total: 8800, category: 'Hardware' },
      { id: 'PROD-002', product: 'Monitor 27" 4K', qty: 10, price: 300, cost: 200, discount: 19, total: 2430, category: 'Service' }
    ],
    riskReason: 'Line item "Setup/Service" discount (19%) exceeds allowable limit (10%). Overall pattern indicates multiple small margin breaches.',
    approvalChain: [
      { step: 1, role: 'Sales Manager', name: 'Priya Patel', status: 'approved', date: '2024-08-21 09:15', comment: 'Approved with condition to review service delivery timeframe.' },
      { step: 2, role: 'Finance Director', name: 'Amit Kumar', status: 'pending', date: null, comment: 'Waiting for margin impact analysis.' }
    ],
    auditTrail: [
      { date: '2024-08-20 10:30', user: 'Rahul Sharma', action: 'Created quotation draft Q-1042' },
      { date: '2024-08-20 14:10', user: 'Rahul Sharma', action: 'Submitted Q-1042 for Manager approval' },
      { date: '2024-08-21 09:15', user: 'Priya Patel', action: 'Returned by Manager: "Need justification for 19% service discount"' },
      { date: '2024-08-21 14:20', user: 'Rahul Sharma', action: 'Resubmitted Q-1042 with client contract notes attached' }
    ]
  },
  {
    id: 'Q-1039',
    customer: 'XYZ Ltd',
    customerId: 'CUST-002',
    customerEmail: 'procurement@xyz.com',
    customerPhone: '+919812345678',
    customerTier: 'Platinum Tier',
    amount: 24500,
    discountAmount: 2450,
    overallDiscountPercent: 10,
    total: 22050,
    status: 'pending_approval',
    date: '2024-08-19',
    salesRep: 'Rahul Sharma',
    margin: 28.0,
    riskScore: 'medium',
    items: [
      { id: 'PROD-001', product: 'Laptop Pro 15"', qty: 35, price: 500, cost: 350, discount: 10, total: 15750, category: 'Hardware' },
      { id: 'PROD-007', product: '24/7 Priority Support SLA', qty: 1, price: 2500, cost: 1000, discount: 15, total: 2125, category: 'Subscription' }
    ],
    riskReason: 'SLA support contract discount is 5% over standard threshold for Platinum tier.',
    approvalChain: [
      { step: 1, role: 'Sales Manager', name: 'Priya Patel', status: 'approved', date: '2024-08-19 16:00', comment: 'Approved due to large volume deal.' },
      { step: 2, role: 'Finance Director', name: 'Amit Kumar', status: 'pending', date: null, comment: 'Under review' }
    ],
    auditTrail: [
      { date: '2024-08-19 11:00', user: 'Rahul Sharma', action: 'Created quotation Q-1039' },
      { date: '2024-08-19 16:00', user: 'Priya Patel', action: 'Approved by Sales Manager' }
    ]
  },
  {
    id: 'Q-1035',
    customer: 'DEF Inc',
    customerId: 'CUST-003',
    customerEmail: 'sales@definc.com',
    customerPhone: '+919711223344',
    customerTier: 'Silver Tier',
    amount: 8500,
    discountAmount: 425,
    overallDiscountPercent: 5,
    total: 8075,
    status: 'approved',
    date: '2024-08-18',
    salesRep: 'Rahul Sharma',
    margin: 34.2,
    riskScore: 'low',
    items: [
      { id: 'PROD-002', product: 'Monitor 27" 4K', qty: 15, price: 300, cost: 200, discount: 5, total: 4275, category: 'Hardware' },
      { id: 'PROD-003', product: 'Ergonomic Keyboard', qty: 15, price: 50, cost: 25, discount: 5, total: 712, category: 'Accessories' }
    ],
    riskReason: 'All discounts within compliant thresholds. High gross margin of 34.2%.',
    approvalChain: [
      { step: 1, role: 'Sales Manager', name: 'Priya Patel', status: 'approved', date: '2024-08-18 17:30', comment: 'Compliant deal. Pre-approved.' }
    ],
    auditTrail: [
      { date: '2024-08-18 14:00', user: 'Rahul Sharma', action: 'Created quotation Q-1035' },
      { date: '2024-08-18 17:30', user: 'Priya Patel', action: 'Approved by Sales Manager' }
    ]
  },
  {
    id: 'Q-1044',
    customer: 'ABC Company',
    customerId: 'CUST-001',
    customerEmail: 'customer@abc.com',
    customerPhone: '+919876543210',
    customerTier: 'Gold Tier',
    amount: 5400,
    discountAmount: 0,
    overallDiscountPercent: 0,
    total: 5400,
    status: 'draft',
    date: '2024-08-22',
    salesRep: 'Rahul Sharma',
    margin: 30.0,
    riskScore: 'low',
    items: [
      { id: 'PROD-001', product: 'Laptop Pro 15"', qty: 10, price: 500, cost: 350, discount: 0, total: 5000, category: 'Hardware' },
      { id: 'PROD-005', product: 'USB-C Multiport Hub', qty: 10, price: 40, cost: 20, discount: 0, total: 400, category: 'Accessories' }
    ],
    riskReason: 'Draft state - no custom discounts requested.',
    approvalChain: [
      { step: 1, role: 'Sales Manager', name: 'Priya Patel', status: 'pending', date: null, comment: 'Draft - Not submitted' }
    ],
    auditTrail: [
      { date: '2024-08-22 09:00', user: 'Rahul Sharma', action: 'Created quotation draft Q-1044' }
    ]
  },
  {
    id: 'Q-1045',
    customer: 'Global Tech Corp',
    customerId: 'CUST-004',
    customerEmail: 'purchasing@globaltech.com',
    customerPhone: '+919899887766',
    customerTier: 'Gold Tier',
    amount: 18200,
    discountAmount: 1820,
    overallDiscountPercent: 10,
    total: 16380,
    status: 'negotiation',
    date: '2024-08-21',
    salesRep: 'Rahul Sharma',
    margin: 25.5,
    riskScore: 'medium',
    items: [
      { id: 'PROD-001', product: 'Laptop Pro 15"', qty: 25, price: 500, cost: 350, discount: 10, total: 11250, category: 'Hardware' },
      { id: 'PROD-006', product: 'Enterprise Setup & Deployment', qty: 1, price: 1500, cost: 600, discount: 10, total: 1350, category: 'Service' }
    ],
    riskReason: 'Customer submitted counter-offer requesting 15% discount.',
    approvalChain: [
      { step: 1, role: 'Sales Manager', name: 'Priya Patel', status: 'approved', date: '2024-08-21 11:00', comment: 'Initial quote approved' }
    ],
    auditTrail: [
      { date: '2024-08-21 10:00', user: 'Rahul Sharma', action: 'Created quotation Q-1045' },
      { date: '2024-08-21 15:30', user: 'ABC Company', action: 'Client counter-requested 15% discount' }
    ]
  }
];

export const mockApprovals = [
  {
    id: 'APP-1042',
    quoteId: 'Q-1042',
    customer: 'ABC Corp',
    customerId: 'CUST-001',
    customerEmail: 'customer@abc.com',
    customerPhone: '+919876543210',
    blendedRisk: 'high',
    stage: 'Finance Review',
    assignedTo: 'Amit Kumar',
    date: 'Aug 20, 2024',
    status: 'pending', // pending | returned | approved
    violations: [
      { line: 'Laptop Pro 15" (Hardware)', discount: 12, limit: 15, valid: true },
      { line: 'Setup & Deployment (Service)', discount: 19, limit: 10, valid: false, overLimit: 9 }
    ],
    worstLine: 'Service line is 9% over limit',
    overallPattern: 'Multiple small violations causing margin erosion',
    approvalSteps: [
      { role: 'Sales Manager', name: 'Priya Patel', status: 'approved', date: 'Aug 21, 2024' },
      { role: 'Finance Director', name: 'Amit Kumar', status: 'pending', date: null }
    ],
    auditTrail: [
      { time: 'Aug 20 10:30', user: 'Rahul Sharma', text: 'Submitted quote Q-1042 for approval' },
      { time: 'Aug 21 09:15', user: 'Priya Patel (Mgr)', text: 'Returned by Manager: "Need justification"' },
      { time: 'Aug 21 14:20', user: 'Rahul Sharma', text: 'Resubmitted with updated business justification' }
    ]
  },
  {
    id: 'APP-1039',
    quoteId: 'Q-1039',
    customer: 'XYZ Ltd',
    customerId: 'CUST-002',
    customerEmail: 'procurement@xyz.com',
    customerPhone: '+919812345678',
    blendedRisk: 'medium',
    stage: 'Finance Review',
    assignedTo: 'Amit Kumar',
    date: 'Aug 19, 2024',
    status: 'pending',
    violations: [
      { line: '24/7 Priority Support SLA', discount: 15, limit: 10, valid: false, overLimit: 5 }
    ],
    worstLine: 'SLA Support is 5% over allowed tier limit',
    overallPattern: 'Volume discount exception for Platinum customer',
    approvalSteps: [
      { role: 'Sales Manager', name: 'Priya Patel', status: 'approved', date: 'Aug 19, 2024' },
      { role: 'Finance Director', name: 'Amit Kumar', status: 'pending', date: null }
    ],
    auditTrail: [
      { time: 'Aug 19 11:00', user: 'Rahul Sharma', text: 'Submitted quote Q-1039' },
      { time: 'Aug 19 16:00', user: 'Priya Patel', text: 'Approved step 1' }
    ]
  },
  {
    id: 'APP-1035',
    quoteId: 'Q-1035',
    customer: 'DEF Inc',
    customerId: 'CUST-003',
    customerEmail: 'sales@definc.com',
    customerPhone: '+919711223344',
    blendedRisk: 'low',
    stage: 'Approved',
    assignedTo: 'Priya Patel',
    date: 'Aug 18, 2024',
    status: 'approved',
    violations: [],
    worstLine: 'None - standard pricing policy compliant',
    overallPattern: 'High margin deal compliant with standard discount rules',
    approvalSteps: [
      { role: 'Sales Manager', name: 'Priya Patel', status: 'approved', date: 'Aug 18, 2024' }
    ],
    auditTrail: [
      { time: 'Aug 18 14:00', user: 'Rahul Sharma', text: 'Submitted Q-1035' },
      { time: 'Aug 18 17:30', user: 'Priya Patel', text: 'Approved' }
    ]
  }
];

export const mockOrders = [
  {
    id: 'ORD-221',
    quoteId: 'Q-1042',
    customer: 'ABC Corp',
    customerId: 'CUST-001',
    customerEmail: 'customer@abc.com',
    customerPhone: '+919876543210',
    itemsCount: 3,
    totalQty: 30,
    status: 'Partial',
    warehouse: 'East Depot',
    orderDate: '2024-08-21',
    totalValue: 11700,
    warehouseSplit: [
      { warehouse: 'East Depot', location: 'New York, NY', itemsAllocated: 22, status: 'Ready to Ship', estimatedDelivery: 'Aug 24, 2024' },
      { warehouse: 'Main Warehouse', location: 'Chicago, IL', itemsAllocated: 8, status: 'Backorder (Restocking)', estimatedDelivery: 'Sep 02, 2024' }
    ],
    lineItems: [
      { name: 'Laptop Pro 15"', ordered: 20, shipNow: 15, backorder: 5 },
      { name: 'Monitor 27" 4K', ordered: 10, shipNow: 7, backorder: 3 }
    ]
  },
  {
    id: 'ORD-222',
    quoteId: 'Q-1035',
    customer: 'XYZ Ltd',
    customerId: 'CUST-002',
    customerEmail: 'procurement@xyz.com',
    customerPhone: '+919812345678',
    itemsCount: 1,
    totalQty: 5,
    status: 'Ready',
    warehouse: 'Main WH',
    orderDate: '2024-08-20',
    totalValue: 8075,
    warehouseSplit: [
      { warehouse: 'Main WH', location: 'Chicago, IL', itemsAllocated: 5, status: 'Ready to Ship', estimatedDelivery: 'Aug 23, 2024' }
    ],
    lineItems: [
      { name: 'Monitor 27" 4K', ordered: 5, shipNow: 5, backorder: 0 }
    ]
  },
  {
    id: 'ORD-223',
    quoteId: 'Q-1039',
    customer: 'DEF Inc',
    customerId: 'CUST-003',
    customerEmail: 'sales@definc.com',
    customerPhone: '+919711223344',
    itemsCount: 2,
    totalQty: 15,
    status: 'Partial',
    warehouse: 'West Coast Hub',
    orderDate: '2024-08-22',
    totalValue: 14200,
    warehouseSplit: [
      { warehouse: 'West Coast Hub', location: 'Reno, NV', itemsAllocated: 10, status: 'Ready to Ship', estimatedDelivery: 'Aug 25, 2024' },
      { warehouse: 'East Depot', location: 'New York, NY', itemsAllocated: 5, status: 'In Transit', estimatedDelivery: 'Aug 27, 2024' }
    ],
    lineItems: [
      { name: 'Ergonomic Keyboard', ordered: 15, shipNow: 10, backorder: 5 }
    ]
  }
];

export const mockSubscriptions = [
  {
    id: 'SUB-401',
    customer: 'ABC Corp',
    customerId: 'CUST-001',
    customerEmail: 'customer@abc.com',
    customerPhone: '+919876543210',
    plan: 'Care Plan 2yr',
    cycle: 'Monthly',
    nextBill: 'Sep 15, 2024',
    amount: 450,
    status: 'Active',
    startDate: '2024-03-15',
    oneTimeLines: [
      { description: 'Initial Hardware Onboarding & Setup', amount: 1500 }
    ],
    recurringLines: [
      { description: 'Device Management & Remote Telemetry (Monthly)', amount: 300, cycle: 'Monthly' },
      { description: 'Next-Day Hardware Replacement SLA', amount: 150, cycle: 'Monthly' }
    ]
  },
  {
    id: 'SUB-402',
    customer: 'XYZ Ltd',
    customerId: 'CUST-002',
    customerEmail: 'procurement@xyz.com',
    customerPhone: '+919812345678',
    plan: 'Support SLA Enterprise',
    cycle: 'Quarterly',
    nextBill: 'Nov 01, 2024',
    amount: 2500,
    status: 'Active',
    startDate: '2024-01-01',
    oneTimeLines: [
      { description: 'Enterprise Architecture Audit', amount: 3500 }
    ],
    recurringLines: [
      { description: '24/7 Dedicated TAM & Priority Escalation', amount: 2500, cycle: 'Quarterly' }
    ]
  },
  {
    id: 'SUB-403',
    customer: 'DEF Inc',
    customerId: 'CUST-003',
    customerEmail: 'sales@definc.com',
    customerPhone: '+919711223344',
    plan: 'Basic Cloud Tier',
    cycle: 'Monthly',
    nextBill: 'Sep 01, 2024',
    amount: 199,
    status: 'Paused',
    startDate: '2023-11-10',
    oneTimeLines: [],
    recurringLines: [
      { description: 'Standard Cloud SaaS License (10 Seats)', amount: 199, cycle: 'Monthly' }
    ]
  }
];

export const mockInvoices = [
  {
    id: 'INV-1042',
    date: 'Aug 20, 2024',
    dueDate: 'Sep 19, 2024',
    customer: 'ABC Corp',
    customerId: 'CUST-001',
    customerEmail: 'customer@abc.com',
    customerPhone: '+919876543210',
    amount: 2730,
    status: 'Unpaid',
    items: [
      { description: 'Laptop Pro 15" Partial Fulfillment (5 Units)', qty: 5, unitPrice: 500, total: 2500 },
      { description: 'Shipping & Delivery Freight', qty: 1, unitPrice: 230, total: 230 }
    ],
    subtotal: 2730,
    tax: 0,
    total: 2730
  },
  {
    id: 'INV-1043',
    date: 'Aug 21, 2024',
    dueDate: 'Sep 20, 2024',
    customer: 'XYZ Ltd',
    customerId: 'CUST-002',
    customerEmail: 'procurement@xyz.com',
    customerPhone: '+919812345678',
    amount: 5000,
    status: 'Paid',
    items: [
      { description: 'Monitor 27" 4K Delivery (10 Units)', qty: 10, unitPrice: 300, total: 3000 },
      { description: 'On-site Installation & Configuration', qty: 1, unitPrice: 2000, total: 2000 }
    ],
    subtotal: 5000,
    tax: 0,
    total: 5000
  },
  {
    id: 'INV-1044',
    date: 'Aug 22, 2024',
    dueDate: 'Sep 21, 2024',
    customer: 'DEF Inc',
    customerId: 'CUST-003',
    customerEmail: 'sales@definc.com',
    customerPhone: '+919711223344',
    amount: 8075,
    status: 'Unpaid',
    items: [
      { description: 'Quotation Q-1035 Full Settlement Order', qty: 1, unitPrice: 8075, total: 8075 }
    ],
    subtotal: 8075,
    tax: 0,
    total: 8075
  }
];

export const mockDealHealth = [
  {
    id: 'DH-01',
    dealName: 'ABC Company Hardware Refresh',
    customer: 'ABC Company',
    customerEmail: 'customer@abc.com',
    customerPhone: '+919876543210',
    type: 'stalled',
    issue: 'Idle - no customer response after quote delivery',
    days: 12,
    value: 11700,
    rep: 'Rahul Sharma',
    suggestedAction: 'Nudge'
  },
  {
    id: 'DH-02',
    dealName: 'XYZ Ltd Support Contract',
    customer: 'XYZ Ltd',
    customerEmail: 'procurement@xyz.com',
    customerPhone: '+919812345678',
    type: 'anomaly',
    issue: 'Discount anomaly - 19% service discount requested',
    days: 4,
    value: 22050,
    rep: 'Rahul Sharma',
    suggestedAction: 'Review'
  },
  {
    id: 'DH-03',
    dealName: 'DEF Inc Workstation Order',
    customer: 'DEF Inc',
    customerEmail: 'sales@definc.com',
    customerPhone: '+919711223344',
    type: 'slippage',
    issue: 'Delivery at risk - Warehouse stock delayed by 3 days',
    days: 3,
    value: 8075,
    rep: 'Rahul Sharma',
    suggestedAction: 'Escalate'
  }
];

export const mockActivities = [
  { id: 'ACT-1', text: 'Quote Q-1042 submitted for Finance approval', time: '2 min ago', type: 'approval' },
  { id: 'ACT-2', text: 'Customer ABC Company requested counter discount', time: '1 hour ago', type: 'customer' },
  { id: 'ACT-3', text: 'Order #ORD-221 shipped partially from East Depot', time: '3 hours ago', type: 'fulfillment' },
  { id: 'ACT-4', text: 'Invoice INV-1043 paid by XYZ Ltd ($5,000)', time: '5 hours ago', type: 'invoice' },
  { id: 'ACT-5', text: 'Quote Q-1035 approved by Manager Priya Patel', time: '1 day ago', type: 'approval' }
];

export const mockReportsData = {
  summary: {
    totalRevenue: 124500,
    activeQuotes: 45,
    approvedCount: 18,
    conversionRate: 68
  },
  byTeam: [
    { team: 'Team North', quotes: 28, revenue: 64000, avgDiscount: 8.5 },
    { team: 'Team South', quotes: 17, revenue: 60500, avgDiscount: 10.2 }
  ],
  byStatus: [
    { status: 'Approved', count: 18, percentage: 40 },
    { status: 'Pending Approval', count: 12, percentage: 26 },
    { status: 'Under Negotiation', count: 9, percentage: 20 },
    { status: 'Draft', count: 6, percentage: 14 }
  ]
};

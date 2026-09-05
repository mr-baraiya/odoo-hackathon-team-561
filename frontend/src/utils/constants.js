export const API_BASE_URL = 'http://192.168.9.168:5000';

export const ROLES = {
  ADMIN: 'admin',
  REP: 'rep',
  MANAGER: 'manager',
  FINANCE: 'finance',
  CUSTOMER: 'customer',
};

export const SEED_USERS = [
  { 
    id: '00000000-0000-0000-0000-000000000105', 
    name: 'System Administrator', 
    email: 'vvbaraiya32@gmail.com', 
    phone: '+917046537550',
    password: 'Darshan@1234', 
    role: 'admin',
    avatar: 'SA',
    dashboard: '/admin/dashboard',
    isActive: true
  },
  { 
    id: '00000000-0000-0000-0000-000000000101', 
    name: 'Sales Representative', 
    email: 'baraiyavishalbhai32@gmail.com', 
    phone: '+917383359679',
    password: 'Darshan@1234', 
    role: 'rep',
    avatar: 'SR',
    dashboard: '/rep/dashboard',
    isActive: true
  },
  { 
    id: '00000000-0000-0000-0000-000000000102', 
    name: 'Sales Manager', 
    email: 'singhsaurabh43431@gmail.com', 
    phone: '+919508461241',
    password: 'Darshan@1234', 
    role: 'manager',
    avatar: 'SM',
    dashboard: '/manager/dashboard',
    isActive: true
  },
  { 
    id: '00000000-0000-0000-0000-000000000103', 
    name: 'Finance Operations', 
    email: 'baraiyavijaybhai32@gmail.com', 
    phone: '+919624994057',
    password: 'Darshan@1234', 
    role: 'finance',
    avatar: 'FO',
    dashboard: '/finance/dashboard',
    isActive: true
  },
  { 
    id: '00000000-0000-0000-0000-000000000104', 
    name: 'Demo Customer', 
    email: 'mayankpathar49@gmail.com', 
    phone: '+919274488638',
    password: 'Darshan@1234', 
    role: 'customer',
    avatar: 'DC',
    dashboard: '/customer/portal',
    isActive: true
  }
];

export const STATUS_COLORS = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', label: 'Draft' },
  pending_approval: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Pending Approval' },
  approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Approved' },
  confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Confirmed' },
  negotiation: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'Negotiation' },
  rejected: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Rejected' },
  returned: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'Returned for Revision' },
  active: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Active' },
  paused: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Paused' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', label: 'Cancelled' },
  paid: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Paid' },
  unpaid: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Unpaid' },
  partial: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', label: 'Partial' },
  ready: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Ready' },
};

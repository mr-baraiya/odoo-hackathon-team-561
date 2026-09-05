export const ROLES = {
  ADMIN: 'admin',
  REP: 'rep',
  MANAGER: 'manager',
  FINANCE: 'finance',
  CUSTOMER: 'customer',
};

export const SEED_USERS = [
  { email: 'admin@dealflow.com', password: 'admin123', role: 'admin', name: 'Admin User', avatar: 'AU' },
  { email: 'rep@dealflow.com', password: 'rep123', role: 'rep', name: 'Rahul Sharma', avatar: 'RS' },
  { email: 'manager@dealflow.com', password: 'manager123', role: 'manager', name: 'Priya Patel', avatar: 'PP' },
  { email: 'finance@dealflow.com', password: 'finance123', role: 'finance', name: 'Amit Kumar', avatar: 'AK' },
  { email: 'customer@dealflow.com', password: 'customer123', role: 'customer', name: 'ABC Company', avatar: 'ABC' }
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

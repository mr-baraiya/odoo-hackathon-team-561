import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SEED_USERS } from '../utils/constants';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';

const AdminUsers = () => {
  const { createUser, getAdminCreatedUsers } = useAuth();
  const [createdUsers, setCreatedUsers] = useState(() => getAdminCreatedUsers());

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('rep');
  const [password, setPassword] = useState('Darshan@1234');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Combine seed users and admin created users
  const allUsers = [...SEED_USERS, ...createdUsers];

  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = 
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone || '').includes(searchQuery);
    
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Full name is required.');
      return;
    }
    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }

    setLoading(true);
    try {
      const newUser = await createUser({
        name: fullName,
        email,
        phone,
        role,
        password
      });

      setCreatedUsers(prev => [...prev, newUser]);
      setIsModalOpen(false);
      // Reset form
      setFullName('');
      setEmail('');
      setPhone('');
      setRole('rep');
      setPassword('Darshan@1234');
    } catch (err) {
      setError(err.message || 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = (userId) => {
    setCreatedUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, isActive: !u.isActive };
      }
      return u;
    }));
  };

  const getRoleLabel = (r) => {
    switch (r) {
      case 'admin': return 'Administrator';
      case 'manager': return 'Sales Manager';
      case 'finance': return 'Finance Ops';
      case 'customer': return 'Customer';
      case 'rep':
      default: return 'Sales Rep';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Card */}
        <div className="bg-white border border-[#E8ECF1] rounded-xl p-6 shadow-card">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-[#2D6B8F] text-xs font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4" /> System Administration
              </div>
              <h1 className="text-2xl font-bold text-[#1A1D23]">User Management</h1>
              <p className="text-xs text-[#5A6B7C] mt-1">Provision enterprise seats, manage role access, and issue credentials.</p>
            </div>
            <Button variant="primary" icon={UserPlus} onClick={() => setIsModalOpen(true)}>
              + Create New User
            </Button>
          </div>
        </div>

        {/* User Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-[#E8ECF1] shadow-card">
            <span className="text-[#5A6B7C] text-xs font-medium">Total Enterprise Users</span>
            <p className="text-2xl font-bold text-[#1A1D23] mt-1">{allUsers.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#E8ECF1] shadow-card">
            <span className="text-[#5A6B7C] text-xs font-medium">Active Accounts</span>
            <p className="text-2xl font-bold text-[#2E7D5E] mt-1">
              {allUsers.filter(u => u.isActive !== false).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#E8ECF1] shadow-card">
            <span className="text-[#5A6B7C] text-xs font-medium">Sales Reps & Managers</span>
            <p className="text-2xl font-bold text-[#0284C7] mt-1">
              {allUsers.filter(u => u.role === 'rep' || u.role === 'manager').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#E8ECF1] shadow-card">
            <span className="text-[#5A6B7C] text-xs font-medium">Finance & Admin</span>
            <p className="text-2xl font-bold text-[#2D6B8F] mt-1">
              {allUsers.filter(u => u.role === 'finance' || u.role === 'admin').length}
            </p>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="bg-white p-4 rounded-xl border border-[#E8ECF1] shadow-card flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by name, email, or phone..."
              className="w-full pl-9 pr-3 py-2 text-xs text-[#1A1D23] bg-[#F7F8FA] border border-[#E8ECF1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6B8F]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-[#5A6B7C]" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs text-[#1A1D23] bg-white border border-[#E8ECF1] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2D6B8F]"
            >
              <option value="all">All Roles</option>
              <option value="rep">Sales Rep</option>
              <option value="manager">Sales Manager</option>
              <option value="finance">Finance Ops</option>
              <option value="admin">Administrator</option>
              <option value="customer">Customer</option>
            </select>
          </div>
        </div>

        {/* User Table */}
        <div className="bg-white border border-[#E8ECF1] rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#F7F8FA] border-b border-[#E8ECF1] text-[#5A6B7C] font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Phone Number</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8ECF1]">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#5A6B7C] text-sm">
                      No matching user accounts found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id || u.email} className="hover:bg-[#F7F8FA] transition-colors duration-150">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#2D6B8F] text-white text-xs font-bold flex items-center justify-center">
                            {u.avatar || u.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-[#1A1D23]">{u.name}</p>
                            <p className="text-[10px] text-[#94A3B8]">ID: {u.id?.slice(0, 12)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#5A6B7C]">{u.email}</td>
                      <td className="py-3.5 px-4 text-xs text-[#5A6B7C]">{u.phone || 'N/A'}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F0F7FA] text-[#2D6B8F] border border-[#2D6B8F]/20">
                          {getRoleLabel(u.role)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {u.isActive !== false ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#F0FDF4] text-[#2E7D5E] border border-[#DCFCE7]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#FEF2F2] text-[#D32F2F] border border-[#FCA5A5]">
                            <XCircle className="w-3.5 h-3.5" /> Deactivated
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => toggleUserStatus(u.id)}
                          className="text-xs font-medium text-[#2D6B8F] hover:underline"
                        >
                          {u.isActive !== false ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Create New User */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Provision New Enterprise User"
        >
          <form onSubmit={handleCreateUserSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] text-[#D32F2F] text-xs rounded-md font-medium">
                {error}
              </div>
            )}

            <Input
              label="Full Name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Vikram Mehta"
              required
            />

            <Input
              label="Work Email Address"
              type="email"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. vikram@company.com"
              required
            />

            <Input
              label="Phone Number"
              type="text"
              icon={Phone}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +919876543210"
            />

            <Select
              label="Assigned Enterprise Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              options={[
                { value: 'rep', label: 'Sales Representative (Rep)' },
                { value: 'manager', label: 'Sales Manager' },
                { value: 'finance', label: 'Finance Operations' },
                { value: 'admin', label: 'System Administrator' },
                { value: 'customer', label: 'Customer Portal Access' }
              ]}
            />

            <Input
              label="Temporary Password"
              type="password"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="pt-3 flex justify-end gap-3 border-t border-[#E8ECF1]">
              <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create User Seat'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default AdminUsers;

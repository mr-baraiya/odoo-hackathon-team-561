import React from 'react';
import { Eye, Edit, Key, Trash2 } from 'lucide-react';
import UserViewModal from './UserViewModal';
import UserFormModal from './UserFormModal';
import ResetPasswordModal from './ResetPasswordModal';

export default function UserManagementTab({
  users,
  filteredUsers,
  userSearch,
  setUserSearch,
  userRoleFilter,
  setUserRoleFilter,
  handleOpenUserModal,
  handleToggleUserStatus,
  handleViewUser,
  handleDeleteUser,
  showUserModal,
  setShowUserModal,
  editingUser,
  userForm,
  setUserForm,
  userFormErrors,
  setUserFormErrors,
  handleSaveUser,
  showViewUserModal,
  setShowViewUserModal,
  viewingUser,
  customersList = [],
  // Reset Password Modal Props
  showResetPasswordModal,
  setShowResetPasswordModal,
  resettingUser,
  handleOpenResetPasswordModal,
  handleConfirmResetPassword,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <span>Platform User Accounts</span>
            <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-md font-bold">
              {filteredUsers.length} Users
            </span>
          </h2>
          <p className="text-xs text-slate-600">
            Create users, edit profiles, assign roles, activate/deactivate accounts, reset passwords, and link customer users to companies.
          </p>
        </div>

        <button
          onClick={() => handleOpenUserModal(null)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-xs cursor-pointer shrink-0"
        >
          + Create New User
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <input
            type="text"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            placeholder="Search user by name, email, or company..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
          />
        </div>

        <div>
          <select
            value={userRoleFilter}
            onChange={(e) => setUserRoleFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="sales_rep">Sales Representative</option>
            <option value="sales_manager">Sales Manager</option>
            <option value="finance_ops">Finance Operations</option>
            <option value="admin">System Administrator</option>
            <option value="customer">Customer User</option>
          </select>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold">
            <tr>
              <th className="p-3">User Name</th>
              <th className="p-3">Email Address</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Assigned Role</th>
              <th className="p-3">Linked Company</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-700">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-slate-500">
                  No users found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-bold text-slate-900">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0 border border-indigo-100">
                        {u.name ? u.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'US'}
                      </div>
                      <span className="truncate max-w-[150px]">{u.name}</span>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-slate-600 truncate max-w-[180px]">
                    {u.email}
                  </td>
                  <td className="p-3 font-mono text-slate-500 whitespace-nowrap">
                    {u.phone || u.phone_number || <span className="text-slate-400">N/A</span>}
                  </td>
                  <td className="p-3 font-bold text-slate-800 uppercase text-[10px] tracking-wider whitespace-nowrap">
                    <span className={`inline-block px-2 py-0.5 rounded-md ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                      u.role === 'sales_manager' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                      u.role === 'finance_ops' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      u.role === 'customer' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {u.role ? u.role.replace('_', ' ') : 'sales_rep'}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-slate-700 whitespace-nowrap">
                    {u.company_name ? (
                      <span className="text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md text-[11px]">
                        {u.company_name}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Internal Staff</span>
                    )}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleToggleUserStatus(u.id)}
                      title={`Click to ${u.is_active ? 'Deactivate' : 'Activate'} user`}
                      className="inline-flex items-center focus:outline-none cursor-pointer"
                    >
                      <div
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          u.is_active ? 'bg-emerald-600' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                            u.is_active ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </div>
                      <span className={`ml-2 text-[11px] font-bold ${u.is_active ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </button>
                  </td>
                  <td className="p-3 text-right space-x-2 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleViewUser(u)}
                      title="View User Profile Details"
                      className="p-1 text-slate-500 hover:text-indigo-600 transition-colors inline-flex items-center justify-center cursor-pointer focus:outline-none"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenUserModal(u)}
                      title="Edit User Profile"
                      className="p-1 text-slate-500 hover:text-indigo-600 transition-colors inline-flex items-center justify-center cursor-pointer focus:outline-none"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenResetPasswordModal(u)}
                      title="Reset User Password"
                      className="p-1 text-slate-500 hover:text-amber-600 transition-colors inline-flex items-center justify-center cursor-pointer focus:outline-none"
                    >
                      <Key className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteUser && handleDeleteUser(u)}
                      title="Delete User Account"
                      className="p-1 text-slate-500 hover:text-rose-600 transition-colors inline-flex items-center justify-center cursor-pointer focus:outline-none"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* USER ADD/EDIT MODAL FORM */}
      {showUserModal && (
        <UserFormModal
          editingUser={editingUser}
          userForm={userForm}
          setUserForm={setUserForm}
          userFormErrors={userFormErrors}
          setUserFormErrors={setUserFormErrors}
          customersList={customersList}
          onSave={handleSaveUser}
          onClose={() => setShowUserModal(false)}
        />
      )}

      {/* VIEW USER PROFILE POPUP MODAL */}
      {showViewUserModal && viewingUser && (
        <UserViewModal
          viewingUser={viewingUser}
          onClose={() => setShowViewUserModal(false)}
          onEdit={handleOpenUserModal}
        />
      )}

      {/* RESET PASSWORD MODAL */}
      {showResetPasswordModal && resettingUser && (
        <ResetPasswordModal
          user={resettingUser}
          onClose={() => setShowResetPasswordModal(false)}
          onResetPassword={handleConfirmResetPassword}
        />
      )}
    </div>
  );
}

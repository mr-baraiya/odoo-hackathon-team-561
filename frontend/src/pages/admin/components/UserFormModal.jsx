import React from 'react';

export default function UserFormModal({
  editingUser,
  userForm,
  setUserForm,
  userFormErrors,
  setUserFormErrors,
  customersList = [],
  onSave,
  onClose,
}) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {editingUser ? 'Edit User Profile' : 'Create New System User'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {editingUser ? 'Update account details, role permissions, and company linkage.' : 'Add a new user, assign a role, and link to a customer company if needed.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSave} noValidate className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={userForm.name}
                onChange={(e) => {
                  setUserForm({ ...userForm, name: e.target.value });
                  if (userFormErrors.name) setUserFormErrors({ ...userFormErrors, name: '' });
                }}
                placeholder="e.g. Darshan Baraiya"
                className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none ${
                  userFormErrors.name ? 'border-rose-500 focus:border-rose-600 bg-rose-50/20' : 'border-slate-300 focus:border-indigo-600'
                }`}
              />
              {userFormErrors.name && (
                <p className="text-[11px] font-semibold text-rose-600 mt-1">{userFormErrors.name}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={userForm.email}
                onChange={(e) => {
                  setUserForm({ ...userForm, email: e.target.value });
                  if (userFormErrors.email) setUserFormErrors({ ...userFormErrors, email: '' });
                }}
                placeholder="user@dealflow360.com"
                className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none ${
                  userFormErrors.email ? 'border-rose-500 focus:border-rose-600 bg-rose-50/20' : 'border-slate-300 focus:border-indigo-600'
                }`}
              />
              {userFormErrors.email && (
                <p className="text-[11px] font-semibold text-rose-600 mt-1">{userFormErrors.email}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                value={userForm.phone}
                onChange={(e) => {
                  setUserForm({ ...userForm, phone: e.target.value });
                  if (userFormErrors.phone) setUserFormErrors({ ...userFormErrors, phone: '' });
                }}
                placeholder="+919876543210"
                className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none ${
                  userFormErrors.phone ? 'border-rose-500 focus:border-rose-600 bg-rose-50/20' : 'border-slate-300 focus:border-indigo-600'
                }`}
              />
              {userFormErrors.phone && (
                <p className="text-[11px] font-semibold text-rose-600 mt-1">{userFormErrors.phone}</p>
              )}
            </div>

            {/* Assigned Role */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Assigned Role *
              </label>
              <select
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer"
              >
                <option value="sales_rep">Sales Representative</option>
                <option value="sales_manager">Sales Manager</option>
                <option value="finance_ops">Finance Operations</option>
                <option value="admin">System Administrator</option>
                <option value="customer">Customer User</option>
              </select>
            </div>

            {/* Link Customer Company */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Link Customer Company
              </label>
              <select
                value={userForm.customer_id || ''}
                onChange={(e) => setUserForm({ ...userForm, customer_id: e.target.value || null })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer"
              >
                <option value="">-- No Linked Company --</option>
                {customersList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name || c.name} ({c.customer_code || 'Company'})
                  </option>
                ))}
              </select>
            </div>

            {/* Initial Password (only for new users) */}
            {!editingUser && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Initial Account Password
                </label>
                <input
                  type="password"
                  value={userForm.password || ''}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  placeholder="Default: Darshan@1234 (Leave blank for default)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  If empty, system assigns default initial password: <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700 font-mono">Darshan@1234</code>
                </p>
              </div>
            )}

            {/* Active Status Checkbox */}
            <div className="sm:col-span-2 flex items-center space-x-2 pt-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                id="is_active_check"
                checked={userForm.is_active}
                onChange={(e) => setUserForm({ ...userForm, is_active: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="is_active_check" className="text-xs font-semibold text-slate-800 cursor-pointer flex items-center space-x-1.5">
                <span>Account Status Active</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${userForm.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                  {userForm.is_active ? 'Active' : 'Inactive'}
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer"
            >
              Save User Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

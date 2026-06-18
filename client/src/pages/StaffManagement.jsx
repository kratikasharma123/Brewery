import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addAttendance,
  createStaff,
  deleteStaff,
  fetchStaff,
  updateStaff,
} from '../features/staff/staffSlice';
import {
  BadgeDollarSign,
  CalendarCheck,
  Edit2,
  Loader2,
  Plus,
  Search,
  Trash2,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import { EMAIL_PATTERN, EMAIL_VALIDATION_MESSAGE } from '../utils/emailValidation';
import { NAME_PATTERN, NAME_VALIDATION_MESSAGE, sanitizeNameInput } from '../utils/nameValidation';
import { DIGITS_PATTERN, DIGITS_VALIDATION_MESSAGE, sanitizeDecimalInput, sanitizeDigitsInput } from '../utils/numberValidation';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  role: 'Staff',
  employeeCode: '',
  department: 'Taproom',
  designation: '',
  shift: 'General',
  salaryAmount: 0,
  salaryCurrency: 'USD',
  payCycle: 'Monthly',
  emergencyContactName: '',
  emergencyContactPhone: '',
  isActive: true,
};

const StaffManagement = () => {
  const dispatch = useDispatch();
  const { staff, isLoading, isError, message } = useSelector((state) => state.staff);
  const [filters, setFilters] = useState({ search: '', role: '', department: '', shift: '', status: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [attendance, setAttendance] = useState({ memberId: '', date: '', status: 'Present', checkIn: '', checkOut: '', notes: '' });
  const [attendanceSearch, setAttendanceSearch] = useState('');

  useEffect(() => {
    dispatch(fetchStaff(filters));
  }, [dispatch, filters]);

  const totals = useMemo(() => {
    const active = staff.filter((member) => member.user?.isActive).length;
    const payroll = staff.reduce((sum, member) => sum + Number(member.salary?.amount || 0), 0);
    return { active, payroll };
  }, [staff]);

  const attendanceStaffResults = useMemo(() => {
    const query = attendanceSearch.trim().toLowerCase();
    if (!query) return staff;

    return staff.filter((member) => {
      const searchable = [
        member.user?.name,
        member.user?.email,
        member.employeeCode,
        member.department,
        member.shift,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [staff, attendanceSearch]);

  const selectedAttendanceMember = staff.find((member) => member._id === attendance.memberId);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
    window.setTimeout(() => setForm(emptyForm), 150);
  };

  const openEdit = (member) => {
    setEditingId(member._id);
    setForm({
      name: member.user?.name || '',
      email: member.user?.email || '',
      password: '',
      phone: member.user?.phone || '',
      role: member.user?.role || 'Staff',
      employeeCode: member.employeeCode || '',
      department: member.department || 'Taproom',
      designation: member.designation || '',
      shift: member.shift || 'General',
      salaryAmount: member.salary?.amount || 0,
      salaryCurrency: member.salary?.currency || 'USD',
      payCycle: member.salary?.payCycle || 'Monthly',
      emergencyContactName: member.emergencyContact?.name || '',
      emergencyContactPhone: member.emergencyContact?.phone || '',
      isActive: member.user?.isActive !== false,
    });
    setModalOpen(true);
  };

  const submitStaff = async (event) => {
    event.preventDefault();
    const payload = { ...form };
    if (editingId && !payload.password) delete payload.password;
    const action = editingId ? updateStaff({ id: editingId, staffData: payload }) : createStaff(payload);
    const result = await dispatch(action);
    if (!result.error) setModalOpen(false);
  };

  const submitAttendance = async (event) => {
    event.preventDefault();
    const { memberId, ...attendanceData } = attendance;
    const result = await dispatch(addAttendance({ id: memberId, attendanceData }));
    if (!result.error) {
      setAttendance({ memberId: '', date: '', status: 'Present', checkIn: '', checkOut: '', notes: '' });
      setAttendanceSearch('');
    }
  };

  const updateFilter = (event) => setFilters((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  const updateForm = (event) => {
    const nameFields = ['name', 'emergencyContactName'];
    const digitFields = ['phone', 'emergencyContactPhone'];
    const value = nameFields.includes(event.target.name)
      ? sanitizeNameInput(event.target.value)
      : digitFields.includes(event.target.name)
        ? sanitizeDigitsInput(event.target.value)
        : event.target.name === 'salaryAmount'
          ? Number(sanitizeDecimalInput(event.target.value))
      : event.target.type === 'checkbox'
        ? event.target.checked
          : event.target.value;
    setForm((prev) => ({ ...prev, [event.target.name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">Staff Management</h1>
          <p className="mt-1 text-sm text-slate-400">Manage roles, shifts, salary records, profiles, and attendance.</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-400">
          <Plus className="h-4 w-4" /> Add Staff
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="glass-panel rounded-lg border border-slate-800 p-5">
          <UsersRound className="mb-3 h-5 w-5 text-amber-400" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Staff</p>
          <p className="mt-1 text-3xl font-extrabold text-slate-100">{totals.active}</p>
        </div>
        <div className="glass-panel rounded-lg border border-slate-800 p-5">
          <BadgeDollarSign className="mb-3 h-5 w-5 text-emerald-400" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Payroll</p>
          <p className="mt-1 text-3xl font-extrabold text-slate-100">${totals.payroll.toLocaleString('en-US')}</p>
        </div>
        <form onSubmit={submitAttendance} className="glass-panel rounded-lg border border-slate-800 p-5">
          <div className="mb-3 flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-blue-400" />
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Attendance</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2 space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  value={attendanceSearch}
                  onChange={(event) => {
                    setAttendanceSearch(event.target.value);
                    setAttendance((prev) => ({ ...prev, memberId: '' }));
                  }}
                  className="w-full rounded-lg glass-input py-2 pl-9 pr-3 text-xs"
                  placeholder="Search staff for attendance..."
                />
              </div>

              {attendanceSearch && (
                <div className="max-h-28 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950/80 p-1">
                  {attendanceStaffResults.length > 0 ? (
                    attendanceStaffResults.slice(0, 6).map((member) => (
                      <button
                        key={member._id}
                        type="button"
                        onClick={() => {
                          setAttendance((prev) => ({ ...prev, memberId: member._id }));
                          setAttendanceSearch(member.user?.name || '');
                        }}
                        className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-xs text-slate-300 transition hover:bg-amber-500/10 hover:text-amber-200"
                      >
                        <span>
                          <span className="block font-bold">{member.user?.name}</span>
                          <span className="text-[10px] text-slate-500">{member.employeeCode} / {member.user?.email}</span>
                        </span>
                        <span className="shrink-0 text-[10px] font-semibold uppercase text-slate-500">{member.shift}</span>
                      </button>
                    ))
                  ) : (
                    <p className="px-3 py-3 text-xs text-slate-500">No staff found</p>
                  )}
                </div>
              )}

              <select
                required
                value={attendance.memberId}
                onChange={(e) => {
                  const member = staff.find((item) => item._id === e.target.value);
                  setAttendance((prev) => ({ ...prev, memberId: e.target.value }));
                  setAttendanceSearch(member?.user?.name || '');
                }}
                className="w-full rounded-lg glass-input px-3 py-2 text-xs"
              >
                <option value="">{selectedAttendanceMember ? selectedAttendanceMember.user?.name : 'Select staff'}</option>
                {attendanceStaffResults.map((member) => <option key={member._id} value={member._id}>{member.user?.name} - {member.employeeCode}</option>)}
              </select>
            </div>
            <input required type="date" value={attendance.date} onChange={(e) => setAttendance((prev) => ({ ...prev, date: e.target.value }))} className="rounded-lg glass-input px-3 py-2 text-xs" />
            <select value={attendance.status} onChange={(e) => setAttendance((prev) => ({ ...prev, status: e.target.value }))} className="rounded-lg glass-input px-3 py-2 text-xs">
              <option>Present</option><option>Absent</option><option>Late</option><option>Leave</option>
            </select>
            <button disabled={isLoading} className="col-span-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs font-bold text-blue-300 hover:bg-blue-500/20">Record Attendance</button>
          </div>
        </form>
      </div>

      <div className="glass-panel rounded-lg border border-slate-800 p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input name="search" value={filters.search} onChange={updateFilter} className="w-full rounded-lg glass-input py-2 pl-9 pr-3 text-xs" placeholder="Search staff..." />
          </div>
          <select name="role" value={filters.role} onChange={updateFilter} className="rounded-lg glass-input px-3 py-2 text-xs"><option value="">All roles</option><option>Admin</option><option>Staff</option></select>
          <select name="department" value={filters.department} onChange={updateFilter} className="rounded-lg glass-input px-3 py-2 text-xs"><option value="">All departments</option><option>Production</option><option>Taproom</option><option>Warehouse</option><option>Sales</option><option>Administration</option></select>
          <select name="shift" value={filters.shift} onChange={updateFilter} className="rounded-lg glass-input px-3 py-2 text-xs"><option value="">All shifts</option><option>Morning</option><option>Afternoon</option><option>Evening</option><option>Night</option><option>General</option></select>
        </div>
      </div>

      {isError && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{message}</div>}

      <div className="glass-panel overflow-hidden rounded-lg border border-slate-800">
        {isLoading ? (
          <div className="flex h-56 items-center justify-center gap-3 text-slate-400"><Loader2 className="h-5 w-5 animate-spin text-amber-400" /> Loading staff...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-900/40 text-[10px] uppercase tracking-widest text-slate-400">
                <tr><th className="px-5 py-4">Profile</th><th className="px-5 py-4">Role</th><th className="px-5 py-4">Shift</th><th className="px-5 py-4">Salary</th><th className="px-5 py-4">Attendance</th><th className="px-5 py-4 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {staff.map((member) => (
                  <tr key={member._id} className="hover:bg-slate-900/30">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10"><UserRound className="h-5 w-5 text-amber-300" /></div>
                        <div><p className="font-bold text-slate-100">{member.user?.name}</p><p className="text-xs text-slate-400">{member.employeeCode} · {member.user?.email}</p></div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><span className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-300">{member.user?.role}</span></td>
                    <td className="px-5 py-4 text-xs text-slate-300">{member.department}<br /><span className="text-slate-500">{member.shift}</span></td>
                    <td className="px-5 py-4 text-xs font-semibold text-slate-200">{member.salary?.currency} {Number(member.salary?.amount || 0).toLocaleString()}<br /><span className="text-slate-500">{member.salary?.payCycle}</span></td>
                    <td className="px-5 py-4 text-xs text-slate-400">{member.attendance?.[0]?.status || 'No record'}<br /><span className="text-slate-500">{member.attendance?.[0]?.date ? new Date(member.attendance[0].date).toLocaleDateString() : ''}</span></td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(member)} className="rounded-lg border border-slate-700 p-2 text-slate-300 hover:text-amber-300"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => window.confirm('Delete this staff profile?') && dispatch(deleteStaff(member._id))} className="rounded-lg border border-red-500/20 p-2 text-red-300 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <form onSubmit={submitStaff} className="glass-panel max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-100">{editingId ? 'Edit Staff Profile' : 'Add Staff Profile'}</h2>
              <button type="button" onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-200"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
              {!editingId && (
                <>
                  <input type="text" name="username" autoComplete="username" tabIndex={-1} className="hidden" aria-hidden="true" />
                  <input type="password" name="current-password" autoComplete="current-password" tabIndex={-1} className="hidden" aria-hidden="true" />
                </>
              )}
              {['name', 'email', 'phone', 'employeeCode', 'designation', 'salaryAmount', 'salaryCurrency', 'emergencyContactName', 'emergencyContactPhone'].map((field) => {
                const isEmail = field === 'email';
                const isName = ['name', 'emergencyContactName'].includes(field);
                const isDigits = ['phone', 'emergencyContactPhone'].includes(field);
                return (
                  <input
                    key={field}
                    name={field}
                    type={field === 'salaryAmount' ? 'number' : isEmail ? 'email' : 'text'}
                    value={form[field]}
                    onChange={updateForm}
                    required={['name', 'email', 'employeeCode', 'designation'].includes(field)}
                    pattern={isEmail ? EMAIL_PATTERN : isName ? NAME_PATTERN : isDigits ? DIGITS_PATTERN : undefined}
                    title={isEmail ? EMAIL_VALIDATION_MESSAGE : isName ? NAME_VALIDATION_MESSAGE : isDigits ? DIGITS_VALIDATION_MESSAGE : undefined}
                    inputMode={isDigits ? 'numeric' : undefined}
                    autoComplete={isEmail ? 'new-password' : 'off'}
                    className="rounded-lg glass-input px-3 py-2 text-sm"
                    placeholder={field.replace(/([A-Z])/g, ' $1')}
                  />
                );
              })}
              <input name="password" type="password" value={form.password} onChange={updateForm} required={!editingId} minLength={8} autoComplete="new-password" className="rounded-lg glass-input px-3 py-2 text-sm" placeholder={editingId ? 'New password optional' : 'Password'} />
              <select name="role" value={form.role} onChange={updateForm} className="rounded-lg glass-input px-3 py-2 text-sm"><option>Staff</option><option>Admin</option></select>
              <select name="department" value={form.department} onChange={updateForm} className="rounded-lg glass-input px-3 py-2 text-sm"><option>Production</option><option>Taproom</option><option>Warehouse</option><option>Sales</option><option>Administration</option></select>
              <select name="shift" value={form.shift} onChange={updateForm} className="rounded-lg glass-input px-3 py-2 text-sm"><option>Morning</option><option>Afternoon</option><option>Evening</option><option>Night</option><option>General</option></select>
              <select name="payCycle" value={form.payCycle} onChange={updateForm} className="rounded-lg glass-input px-3 py-2 text-sm"><option>Hourly</option><option>Weekly</option><option>Monthly</option></select>
              <label className="flex items-center gap-2 rounded-lg border border-slate-800 px-3 py-2 text-sm text-slate-300"><input name="isActive" type="checkbox" checked={form.isActive} onChange={updateForm} /> Active</label>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-800 px-6 py-4">
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300">Cancel</button>
              <button disabled={isLoading} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-amber-400">{editingId ? 'Save Changes' : 'Create Staff'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;

import User from '../models/User.js';
import StaffProfile from '../models/StaffProfile.js';
import asyncHandler from '../utils/asyncHandler.js';
import { cleanString, isEmail, isPersonName, requireFields, validateEnum, validateNumber } from '../utils/validators.js';
import { writeAuditLog } from '../utils/audit.js';

const STAFF_ROLES = ['Admin', 'Staff'];
const DEPARTMENTS = ['Production', 'Taproom', 'Warehouse', 'Sales', 'Administration'];
const SHIFTS = ['Morning', 'Afternoon', 'Evening', 'Night', 'General'];
const ATTENDANCE = ['Present', 'Absent', 'Late', 'Leave'];

export const getStaff = asyncHandler(async (req, res) => {
  const { search = '', role = '', department = '', shift = '', status = '' } = req.query;

  const userQuery = { role: { $in: STAFF_ROLES } };
  if (role) userQuery.role = role;
  if (status === 'active') userQuery.isActive = true;
  if (status === 'inactive') userQuery.isActive = false;
  if (search) {
    userQuery.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const profileQuery = {};
  if (department) profileQuery.department = department;
  if (shift) profileQuery.shift = shift;

  const profiles = await StaffProfile.find(profileQuery)
    .populate({ path: 'user', match: userQuery, select: 'name email role phone isActive createdAt' })
    .sort({ updatedAt: -1 });

  res.json(profiles.filter((profile) => profile.user));
});

export const getStaffById = asyncHandler(async (req, res) => {
  const profile = await StaffProfile.findById(req.params.id).populate('user', 'name email role phone isActive createdAt');
  if (!profile) {
    res.status(404);
    throw new Error('Staff profile not found');
  }
  res.json(profile);
});

export const createStaff = asyncHandler(async (req, res) => {
  requireFields(req.body, ['name', 'email', 'password', 'employeeCode', 'designation']);

  const email = cleanString(req.body.email).toLowerCase();
  if (!isEmail(email)) {
    res.status(400);
    throw new Error('Please provide a valid email address');
  }
  if (!isPersonName(req.body.name)) {
    res.status(400);
    throw new Error('Name can contain letters and spaces only');
  }
  if (req.body.emergencyContactName && !isPersonName(req.body.emergencyContactName)) {
    res.status(400);
    throw new Error('Emergency contact name can contain letters and spaces only');
  }

  const role = req.body.role || 'Staff';
  validateEnum(role, 'role', STAFF_ROLES);
  validateEnum(req.body.department || 'Taproom', 'department', DEPARTMENTS);
  validateEnum(req.body.shift || 'General', 'shift', SHIFTS);

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error('A user with this email already exists');
  }

  const existingEmployee = await StaffProfile.findOne({ employeeCode: cleanString(req.body.employeeCode).toUpperCase() });
  if (existingEmployee) {
    res.status(400);
    throw new Error('Employee code already exists');
  }

  const user = await User.create({
    name: cleanString(req.body.name),
    email,
    password: req.body.password,
    role,
    phone: cleanString(req.body.phone),
    isActive: req.body.isActive !== false,
  });

  const profile = await StaffProfile.create({
    user: user._id,
    employeeCode: cleanString(req.body.employeeCode).toUpperCase(),
    department: req.body.department || 'Taproom',
    designation: cleanString(req.body.designation),
    shift: req.body.shift || 'General',
    salary: {
      amount: validateNumber(req.body.salaryAmount || 0, 'salaryAmount', { min: 0 }),
      currency: cleanString(req.body.salaryCurrency || 'USD').toUpperCase(),
      payCycle: req.body.payCycle || 'Monthly',
    },
    emergencyContact: {
      name: cleanString(req.body.emergencyContactName),
      phone: cleanString(req.body.emergencyContactPhone),
    },
    createdBy: req.user._id,
  });

  await writeAuditLog({ req, action: 'staff.created', entity: 'StaffProfile', entityId: profile._id });
  const populated = await profile.populate('user', 'name email role phone isActive createdAt');
  res.status(201).json(populated);
});

export const updateStaff = asyncHandler(async (req, res) => {
  const profile = await StaffProfile.findById(req.params.id).populate('user');
  if (!profile) {
    res.status(404);
    throw new Error('Staff profile not found');
  }

  if (req.body.role) validateEnum(req.body.role, 'role', STAFF_ROLES);
  if (req.body.department) validateEnum(req.body.department, 'department', DEPARTMENTS);
  if (req.body.shift) validateEnum(req.body.shift, 'shift', SHIFTS);

  if (req.body.name !== undefined) {
    if (!isPersonName(req.body.name)) {
      res.status(400);
      throw new Error('Name can contain letters and spaces only');
    }
    profile.user.name = cleanString(req.body.name);
  }
  if (req.body.email !== undefined) {
    const email = cleanString(req.body.email).toLowerCase();
    if (!isEmail(email)) {
      res.status(400);
      throw new Error('Please provide a valid email address');
    }
    profile.user.email = email;
  }
  if (req.body.phone !== undefined) profile.user.phone = cleanString(req.body.phone);
  if (req.body.role !== undefined) profile.user.role = req.body.role;
  if (req.body.isActive !== undefined) profile.user.isActive = Boolean(req.body.isActive);
  if (req.body.password) profile.user.password = req.body.password;

  if (req.body.employeeCode !== undefined) profile.employeeCode = cleanString(req.body.employeeCode).toUpperCase();
  if (req.body.department !== undefined) profile.department = req.body.department;
  if (req.body.designation !== undefined) profile.designation = cleanString(req.body.designation);
  if (req.body.shift !== undefined) profile.shift = req.body.shift;
  if (req.body.salaryAmount !== undefined) profile.salary.amount = validateNumber(req.body.salaryAmount, 'salaryAmount', { min: 0 });
  if (req.body.salaryCurrency !== undefined) profile.salary.currency = cleanString(req.body.salaryCurrency).toUpperCase();
  if (req.body.payCycle !== undefined) profile.salary.payCycle = req.body.payCycle;
  if (req.body.emergencyContactName !== undefined) {
    if (req.body.emergencyContactName && !isPersonName(req.body.emergencyContactName)) {
      res.status(400);
      throw new Error('Emergency contact name can contain letters and spaces only');
    }
    profile.emergencyContact.name = cleanString(req.body.emergencyContactName);
  }
  if (req.body.emergencyContactPhone !== undefined) profile.emergencyContact.phone = cleanString(req.body.emergencyContactPhone);

  await profile.user.save();
  await profile.save();
  await writeAuditLog({ req, action: 'staff.updated', entity: 'StaffProfile', entityId: profile._id });

  const updated = await StaffProfile.findById(profile._id).populate('user', 'name email role phone isActive createdAt');
  res.json(updated);
});

export const deleteStaff = asyncHandler(async (req, res) => {
  const profile = await StaffProfile.findById(req.params.id);
  if (!profile) {
    res.status(404);
    throw new Error('Staff profile not found');
  }

  await User.findByIdAndUpdate(profile.user, { isActive: false });
  await profile.deleteOne();
  await writeAuditLog({ req, action: 'staff.deleted', entity: 'StaffProfile', entityId: profile._id });
  res.json({ message: 'Staff profile removed' });
});

export const addAttendance = asyncHandler(async (req, res) => {
  requireFields(req.body, ['date', 'status']);
  validateEnum(req.body.status, 'status', ATTENDANCE);

  const profile = await StaffProfile.findById(req.params.id);
  if (!profile) {
    res.status(404);
    throw new Error('Staff profile not found');
  }

  profile.attendance.unshift({
    date: new Date(req.body.date),
    status: req.body.status,
    checkIn: cleanString(req.body.checkIn),
    checkOut: cleanString(req.body.checkOut),
    notes: cleanString(req.body.notes),
  });

  await profile.save();
  await writeAuditLog({ req, action: 'staff.attendance_added', entity: 'StaffProfile', entityId: profile._id });
  const updated = await StaffProfile.findById(profile._id).populate('user', 'name email role phone isActive createdAt');
  res.status(201).json(updated);
});

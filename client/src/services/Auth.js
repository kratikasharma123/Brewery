import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import axios, { apiUrl } from '../utils/apiClient';
import { auth } from '../firebase';

const getFirebaseToken = async () => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    return null;
  }

  return currentUser.getIdToken(true);
};

export const syncUserWithBackend = async ({ name, role } = {}) => {
  const token = await getFirebaseToken();

  if (!token) {
    throw new Error('Firebase user is not authenticated');
  }

  const response = await axios.post(
    apiUrl('/api/auth/firebase-sync'),
    { name, role },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const appUser = { ...response.data, token };
  localStorage.setItem('user', JSON.stringify(appUser));
  return appUser;
};

export const registerUser = async ({ name, email, password, role }) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);

  if (name) {
    await updateProfile(credential.user, { displayName: name });
  }

  return syncUserWithBackend({ name, role });
};

export const loginUser = async ({ email, password }) => {
  await signInWithEmailAndPassword(auth, email, password);
  return syncUserWithBackend();
};

export const logoutUser = async () => {
  await signOut(auth);
  localStorage.removeItem('user');
};

export const sendRecoveryEmail = async (email) => {
  await sendPasswordResetEmail(auth, email);
};

export const watchAuthState = (callback) => onAuthStateChanged(auth, callback);
export const refreshFirebaseToken = getFirebaseToken;

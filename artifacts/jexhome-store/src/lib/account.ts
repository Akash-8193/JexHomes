import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Profile = {
  fullName: string; email: string; phone: string;
  address: string; apartment?: string; city: string; state: string; pincode: string;
};
type Account = Profile & { passwordHash: string };

type AccountState = {
  accounts: Account[];
  currentEmail: string | null;
  signUp: (profile: Pick<Profile, 'fullName' | 'email' | 'phone'>, password: string) => Promise<string | null>;
  logIn: (email: string, password: string) => Promise<string | null>;
  logOut: () => void;
  updateProfile: (profile: Profile) => string | null;
};

// No backend yet, so accounts live in this browser only; hash so passwords are never kept as plain text.
const hash = async (text: string) => {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
};
const normalise = (email: string) => email.trim().toLowerCase();

export const useAccount = create<AccountState>()(persist((set, get) => ({
  accounts: [],
  currentEmail: null,
  signUp: async ({ fullName, email, phone }, password) => {
    const key = normalise(email);
    if (get().accounts.some(a => a.email === key)) return 'An account with this email already exists. Please log in.';
    const account: Account = {
      fullName: fullName.trim(), email: key, phone: phone.trim(),
      address: '', apartment: '', city: '', state: '', pincode: '',
      passwordHash: await hash(password),
    };
    set(state => ({ accounts: [...state.accounts, account], currentEmail: key }));
    return null;
  },
  logIn: async (email, password) => {
    const key = normalise(email);
    const account = get().accounts.find(a => a.email === key);
    if (!account || account.passwordHash !== await hash(password)) return 'Incorrect email or password.';
    set({ currentEmail: key });
    return null;
  },
  logOut: () => set({ currentEmail: null }),
  updateProfile: profile => {
    const { accounts, currentEmail } = get();
    const key = normalise(profile.email);
    if (key !== currentEmail && accounts.some(a => a.email === key)) return 'Another account already uses this email.';
    set({
      accounts: accounts.map(a => a.email === currentEmail ? { ...a, ...profile, email: key } : a),
      currentEmail: key,
    });
    return null;
  },
}), { name: 'jexhome-account' }));

export const useCurrentUser = (): Profile | null =>
  useAccount(s => s.accounts.find(a => a.email === s.currentEmail) ?? null);

window.addEventListener('storage', e => {
  if (e.key === 'jexhome-account') useAccount.persist.rehydrate();
});

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { AUTH_KEY } from '@/lib/local-storage';
import { type ICredentionalsSchema, type IUser } from '@/shared/schema';
import { useLogin } from '@/lib/queries';

interface IAuthProvider {
	user: IUser | null;
	loginFn: (credentionals: ICredentionalsSchema) => Promise<void>;
	logoutFn: () => void;
	isLoading: boolean;
}

const AuthContext = createContext<IAuthProvider | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<IUser | null>(null);

	const navigate = useNavigate();

	const location = useLocation();

	const loginMutation = useLogin();

	useEffect(() => {
		const login = localStorage.getItem(AUTH_KEY);

		if (login) setUser({ login: login });
		else if (location.pathname !== '/auth') navigate('/auth');
	}, [navigate, location.pathname]);

	async function loginFn(credentionals: ICredentionalsSchema) {
		try {
			await loginMutation.mutateAsync(credentionals);

			setUser({ login: credentionals.login });

			localStorage.setItem(AUTH_KEY, credentionals.login);

			navigate('/');
		} catch (error) {
			console.error('Login error:', error);

			throw error;
		}
	}

	function logoutFn() {
		setUser(null);

		localStorage.removeItem(AUTH_KEY);

		navigate('/auth');
	}

	if (!user && location.pathname !== '/auth') return null;

	return (
		<AuthContext.Provider
			value={{ user, loginFn, logoutFn, isLoading: loginMutation.isPending }}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const ctx = useContext(AuthContext);

	if (!ctx) throw new Error('useAuth must be used within AuthProvider');

	return ctx;
}

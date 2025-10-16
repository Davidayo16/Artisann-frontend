import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, setAuthToken } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [token, setToken] = useState(() => localStorage.getItem('auth_token') || '');
	const [user, setUser] = useState(() => {
		const raw = localStorage.getItem('auth_user');
		return raw ? JSON.parse(raw) : null;
	});

	useEffect(() => {
		setAuthToken(token);
		if (token) localStorage.setItem('auth_token', token); else localStorage.removeItem('auth_token');
	}, [token]);

	useEffect(() => {
		if (user) localStorage.setItem('auth_user', JSON.stringify(user)); else localStorage.removeItem('auth_user');
	}, [user]);

	const value = useMemo(() => ({ token, user, setToken, setUser, logout: () => { setToken(''); setUser(null); } }), [token, user]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error('useAuth must be used within AuthProvider');
	return ctx;
}

export async function loginRequest(body) {
	const { data } = await api.post('/auth/login', body);
	return data;
}

export async function registerRequest(body) {
	const { data } = await api.post('/auth/register', body);
	return data;
}

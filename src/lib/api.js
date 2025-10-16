import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const api = axios.create({ baseURL });

export function setAuthToken(token) {
	if (token) {
		api.defaults.headers.common.Authorization = `Bearer ${token}`;
	} else {
		delete api.defaults.headers.common.Authorization;
	}
}

const apiOrigin = baseURL.replace(/\/api\/?$/, '');
export function mediaUrl(path) {
	if (!path) return '';
	if (/^https?:\/\//i.test(path)) return path;
	return `${apiOrigin}${path.startsWith('/') ? '' : '/'}${path}`;
}

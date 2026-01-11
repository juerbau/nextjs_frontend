// utils/fetchWithAuth.js
import { getCsrfToken } from '@/utils/csrf';

export async function fetchWithAuth(url, options = {}) {
    const method = options.method?.toUpperCase() ?? 'GET';

    const headers = {
        Accept: 'application/json',
        ...(options.headers ?? {}),
    };

    // CSRF nur für "unsafe" Methoden anhängen
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
        headers['X-XSRF-TOKEN'] = getCsrfToken();
    }

    const res = await fetch(url, {
        credentials: 'include',
        ...options,
        headers,
    });

    if (!res.ok) {
        let data = null;
        try {
            data = await res.json();
        } catch (_) {}

        throw {
            status: res.status,
            message: data?.message ?? `Request failed (${res.status})`,
            errors: data?.errors,
        };
    }

    return res;
}

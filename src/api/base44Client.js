const API_BASE = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = 'Request failed';
    try {
      const error = await response.json();
      message = error.message || message;
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

function entityApi(entityName) {
  return {
    list() {
      return request(`/api/entities/${entityName}`);
    },
    filter(filter = {}, sort) {
      const params = new URLSearchParams();
      if (filter && Object.keys(filter).length > 0) params.set('filter', JSON.stringify(filter));
      if (sort) params.set('sort', sort);
      const query = params.toString();
      return request(`/api/entities/${entityName}${query ? `?${query}` : ''}`);
    },
    get(id) {
      return request(`/api/entities/${entityName}/${id}`);
    },
    create(payload) {
      return request(`/api/entities/${entityName}`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    update(id, payload) {
      return request(`/api/entities/${entityName}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },
    delete(id) {
      return request(`/api/entities/${entityName}/${id}`, {
        method: 'DELETE',
      });
    },
  };
}

export const base44 = {
  entities: new Proxy({}, {
    get(_target, entityName) {
      return entityApi(entityName);
    },
  }),
  auth: {
    me() {
      return request('/api/auth/me');
    },
    logout() {
      return request('/api/auth/logout', { method: 'POST' });
    },
    redirectToLogin() {
      window.location.href = '/';
    },
  },
  users: {
    inviteUser(email, role) {
      return request('/api/users/invite', {
        method: 'POST',
        body: JSON.stringify({ email, role }),
      });
    },
  },
  integrations: {
    Core: {
      SendEmail(payload) {
        return request('/api/integrations/core/send-email', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      },
      InvokeLLM(payload) {
        return request('/api/integrations/core/invoke-llm', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      },
    },
  },
};

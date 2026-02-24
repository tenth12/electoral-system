const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

async function fetchWithAuth(endpoint: string, options: FetchOptions = {}) {
  const token = localStorage.getItem('accessToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/auth/login';
    throw new Error('Unauthorized');
  }

  return res;
}

export const adminService = {
  getUsers: async (role?: string) => {
    const query = role ? `?role=${role}` : '';
    const res = await fetchWithAuth(`/users${query}`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },
  
  getUser: async (id: string) => {
    const res = await fetchWithAuth(`/users/${id}`);
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },

  getVoteSummary: async () => {
    const res = await fetchWithAuth(`/votes/summary`);
    if (!res.ok) throw new Error('Failed to fetch vote summary');
    return res.json();
  },

  getCandidates: async () => {
     const res = await fetchWithAuth(`/candidates`);
     if (!res.ok) throw new Error('Failed to fetch candidates');
     return res.json();
  },
  
  getProfile: async () => {
      const res = await fetchWithAuth('/auth/profile');
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
  },

  updateUser: async (id: string, data: any) => {
    const res = await fetchWithAuth(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update user');
    return res.json();
  },

  deleteUser: async (id: string) => {
    const res = await fetchWithAuth(`/users/${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete user');
    return res.json();
  },

  deleteCandidate: async (id: string) => {
    const res = await fetchWithAuth(`/candidates/user/${id}`, {
        method: 'DELETE',
    });
    // This endpoint handles both candidate and user deletion
    if (!res.ok) throw new Error('Failed to delete candidate');
    return res.json();
  },

  getVotingStatus: async () => {
    const res = await fetchWithAuth('/settings/voting');
    if (!res.ok) throw new Error('Failed to fetch voting status');
    return res.json();
  },

  setVotingStatus: async (isVotingEnabled: boolean) => {
    const res = await fetchWithAuth('/settings/voting', {
      method: 'PATCH',
      body: JSON.stringify({ isVotingEnabled }),
    });
    if (!res.ok) throw new Error('Failed to update voting status');
    return res.json();
  }
};

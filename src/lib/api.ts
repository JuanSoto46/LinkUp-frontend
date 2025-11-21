/**
 * API service for backend communication
 * @module APIService
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

/**
 * Generic fetch wrapper with error handling
 * @param url - API endpoint
 * @param options - Fetch options
 * @returns Response data
 */
async function fetchAPI(url: string, options: RequestInit = {}) {
  try {
    console.log(`API Call: ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    console.log(`API Response:`, data);

    if (!response.ok) {
      const errorMessage = data.error || data.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error('API call failed:', error);
    
    // Re-throw with better error message
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Network error: Unable to connect to server');
    }
  }
}

/**
 * User profile data interface
 */
export interface UserProfile {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  password: string;
  uid?: string;
}

/**
 * Meeting data interface
 */
export interface MeetingData {
  title: string;
  scheduledAt?: string;
  description?: string;
}

/**
 * API methods for user and meeting operations
 */
export const api = {
  /**
   * Register user profile
   * @param profile - User profile data
   * @returns Registration result
   */
  async registerProfile(profile: UserProfile) {
    return await fetchAPI('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  },

  /**
   * Manual login
   * @param credentials - Email and password
   * @returns Login result with user data and token
   */
  async loginManual(credentials: { email: string; password: string }) {
    return await fetchAPI('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Get user profile
   * @param uid - User ID
   * @returns User profile data
   */
  async getUser(uid: string) {
    return await fetchAPI(`/api/users/${uid}`);
  },

  /**
   * Update user profile
   * @param uid - User ID
   * @param profile - Updated profile data
   * @returns Update result
   */
  async updateUser(uid: string, profile: Partial<UserProfile>) {
    return await fetchAPI(`/api/users/${uid}`, {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  },

  /**
   * Delete user account
   * @param uid - User ID
   * @returns Delete result
   */
  async deleteUser(uid: string) {
    return await fetchAPI(`/api/users/${uid}`, {
      method: 'DELETE',
    });
  },

  /**
   * Request password reset
   * @param email - User email
   * @returns Reset result
   */
  async forgotPassword(email: string) {
    return await fetchAPI('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Change user password
   * @param passwords - Current and new password
   * @returns Change result
   */
  async changePassword(passwords: { currentPassword: string; newPassword: string }) {
    return await fetchAPI('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwords),
    });
  },

  /**
   * Create a new meeting
   * @param meeting - Meeting data
   * @returns Created meeting data
   */
  async createMeeting(meeting: MeetingData) {
    return await fetchAPI('/api/meetings', {
      method: 'POST',
      body: JSON.stringify(meeting),
    });
  },

  /**
   * Get user's meetings
   * @returns List of meetings
   */
  async getMeetings() {
    return await fetchAPI('/api/meetings');
  },

  /**
   * OAuth login with Google
   * @param token - OAuth token
   * @param profile - User profile from Google
   * @returns Login result
   */
  async loginGoogle(token: string, profile: any) {
    return await fetchAPI('/api/oauth/google', {
      method: 'POST',
      body: JSON.stringify({ token, userProfile: profile }),
    });
  },

  /**
   * OAuth login with Facebook
   * @param token - OAuth token
   * @param profile - User profile from Facebook
   * @returns Login result
   */
  async loginFacebook(token: string, profile: any) {
    return await fetchAPI('/api/oauth/facebook', {
      method: 'POST',
      body: JSON.stringify({ token, userProfile: profile }),
    });
  },
};

export default api;
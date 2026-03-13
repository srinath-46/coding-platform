/**
 * API.js - Centralized API Client
 */
const API_BASE = '/api';

class APIClient {
    async request(endpoint, options = {}) {
        const url = `${API_BASE}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: data.message || 'Something went wrong',
                    error: data
                };
            }

            return data;
        } catch (error) {
            console.error('API Request Failed:', error);
            throw error;
        }
    }

    // Auth
    login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    register(username, email, password) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });
    }

    getProfile() {
        return this.request('/auth/me');
    }

    // Tournaments
    createTournament(tData) {
        return this.request('/tournaments', {
            method: 'POST',
            body: JSON.stringify(tData)
        });
    }

    getTournaments() {
        return this.request('/tournaments');
    }

    getTournament(id) {
        return this.request(`/tournaments/${id}`);
    }

    joinTournament(id) {
        return this.request(`/rooms/${id}/join`, { method: 'POST' });
    }

    // Submissions
    submitCode(problemId, roomId, code, language) {
        return this.request('/submissions', {
            method: 'POST',
            body: JSON.stringify({
                problem_id: problemId,
                room_id: roomId,
                source_code: code,
                language: language
            })
        });
    }

    // Leaderboard
    getGlobalLeaderboard() {
        return this.request('/leaderboard/global');
    }

    getRoomLeaderboard(roomId) {
        return this.request(`/leaderboard/room/${roomId}`);
    }

    // Admin
    createProblem(pData) {
        return this.request('/problems', {
            method: 'POST',
            body: JSON.stringify(pData)
        });
    }

    getAdminStats() {
        return this.request('/admin/stats');
    }

    updateProblem(id, problemData) {
        return this.request(`/problems/${id}`, {
            method: 'PUT',
            body: JSON.stringify(problemData)
        });
    }

    addTestCase(testCaseData) {
        return this.request('/problems/testcase', {
            method: 'POST',
            body: JSON.stringify(testCaseData)
        });
    }

    // Rooms
    getRooms() {
        return this.request('/rooms');
    }

    // Admin Extended
    getAdminSubmissions() {
        return this.request('/admin/submissions');
    }

    getAdminUsers() {
        return this.request('/admin/users');
    }

    updateUserRole(userId, isAdmin) {
        return this.request(`/admin/users/${userId}/role`, {
            method: 'PUT',
            body: JSON.stringify({ is_admin: isAdmin })
        });
    }

    updateTournament(id, data) {
        return this.request(`/tournaments/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    updateTournamentStatus(id, status) {
        return this.request(`/tournaments/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    distributeRewards(tournamentId) {
        return this.request('/rewards/distribute', {
            method: 'POST',
            body: JSON.stringify({ tournament_id: tournamentId })
        });
    }

    // Payments
    createPaymentOrder(tournamentId) {
        return this.request('/payments/create-order', {
            method: 'POST',
            body: JSON.stringify({ tournamentId })
        });
    }

    verifyPayment(paymentData) {
        return this.request('/payments/verify', {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });
    }
}

const api = new APIClient();

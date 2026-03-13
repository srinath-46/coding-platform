/**
 * App.js - Router and View Controller
 */
class AppController {
    constructor() {
        this.viewContainer = document.getElementById('viewContainer');
        this.viewTitle = document.getElementById('viewTitle');
        this.history = [];
        this.currentView = null;
        this.init();
    }

    async init() {
        // Wait for Auth to verify session
        await auth.initPromise;

        // Handle Sidebar Navigation
        document.querySelectorAll('.nav-item[data-view]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.getAttribute('data-view');
                this.switchView(view);
                
                // Update active state
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });

        // Theme Toggle
        document.getElementById('themeToggle').addEventListener('click', (e) => {
            e.preventDefault();
            const body = document.body;
            const isDark = body.getAttribute('data-theme') === 'dark';
            body.setAttribute('data-theme', isDark ? 'light' : 'dark');
            
            const icon = document.querySelector('#themeToggle i');
            icon.setAttribute('data-lucide', isDark ? 'moon' : 'sun');
            lucide.createIcons();
            
            document.querySelector('#themeToggle span').textContent = isDark ? 'Dark Mode' : 'Light Mode';
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            auth.logout();
        });

        // Back Button
        document.getElementById('backBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.goBack();
        });
        // Handle path on load
        const path = window.location.pathname;
        if (path === '/login' || path === '/register') {
            this.renderAuth(path.substring(1));
        } else {
            const initialView = (auth.user && auth.user.is_admin) ? 'admin-dashboard' : 'dashboard';
            this.switchView(initialView);
        }
    }

    async switchView(view, fromBack = false) {
        // Role-based dashboard redirection
        if (view === 'dashboard' && auth.user && auth.user.is_admin) {
            view = 'admin-dashboard';
        }

        if (!auth.isAuthenticated && view !== 'login' && view !== 'register') {
            this.renderAuth('login');
            return;
        }

        // Store history
        if (!fromBack && this.currentView && this.currentView !== view) {
            this.history.push(this.currentView);
        }
        this.currentView = view;

        // Update Back Button visibility
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.style.display = this.history.length > 0 ? 'flex' : 'none';
        }

        // Show Sidebar/Topbar if they were hidden by renderAuth
        document.querySelector('.sidebar').style.display = 'flex';
        document.querySelector('.topbar').style.display = 'flex';
        document.querySelector('.app-container').style.justifyContent = 'flex-start';
        document.querySelector('.app-container').style.alignItems = 'stretch';

        this.viewTitle.textContent = view.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
        
        switch(view) {
            case 'admin-dashboard':
                await this.renderAdminDashboard();
                break;
            case 'admin-tournaments':
                await this.renderAdminTournaments();
                break;
            case 'admin-rooms':
                await this.renderAdminRooms();
                break;
            case 'admin-submissions':
                await this.renderAdminSubmissions();
                break;
            case 'admin-rewards':
                await this.renderAdminRewards();
                break;
            case 'admin-users':
                await this.renderAdminUsers();
                break;
            case 'dashboard':
                await this.renderDashboard();
                break;
            case 'tournaments':
                await this.renderTournaments();
                break;
            case 'leaderboard':
                await this.renderLeaderboard();
                break;
            case 'problems':
                await this.renderAdminProblems();
                break;
        }
        lucide.createIcons();
    }

    goBack() {
        if (this.history.length > 0) {
            const prevView = this.history.pop();
            this.switchView(prevView, true);
            
            // Sync sidebar active state
            document.querySelectorAll('.nav-item').forEach(i => {
                i.classList.remove('active');
                if (i.getAttribute('data-view') === prevView) {
                    i.classList.add('active');
                }
            });
        }
    }

    renderAuth(type) {
        document.querySelector('.sidebar').style.display = 'none';
        document.querySelector('.topbar').style.display = 'none';
        document.querySelector('.app-container').style.justifyContent = 'center';
        document.querySelector('.app-container').style.alignItems = 'center';

        this.viewContainer.innerHTML = `
            <div class="card" style="width: 450px; padding: 3rem;">
                <div style="text-align: center; margin-bottom: 2.5rem;">
                    <div class="brand-icon" style="margin: 0 auto 1.5rem;"></div>
                    <h2 style="font-size: 1.8rem;">${type === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
                    <p style="color: var(--text-muted); margin-top: 0.5rem; font-size: 0.9rem;">Please select your role and enter details</p>
                </div>

                <div class="role-selector" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                    <button class="btn btn-ghost role-btn active" data-role="user" style="flex-direction: column; padding: 1.2rem; height: auto;">
                        <i data-lucide="user" style="margin-bottom: 0.5rem;"></i>
                        <span>User</span>
                    </button>
                    <button class="btn btn-ghost role-btn" data-role="admin" style="flex-direction: column; padding: 1.2rem; height: auto;">
                        <i data-lucide="shield-check" style="margin-bottom: 0.5rem;"></i>
                        <span>Admin</span>
                    </button>
                </div>

                <form id="authForm">
                    ${type === 'register' ? `
                    <div class="input-group">
                        <label>Username</label>
                        <input type="text" id="username" class="input-field" placeholder="Choose a username" required>
                    </div>` : ''}
                    <div class="input-group">
                        <label>Email Address</label>
                        <input type="email" id="email" class="input-field" placeholder="name@example.com" required>
                    </div>
                    <div class="input-group">
                        <label>Password</label>
                        <input type="password" id="password" class="input-field" placeholder="••••••••" required>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem; height: 50px; font-size: 1.1rem;">
                        ${type === 'login' ? 'Login' : 'Sign Up'}
                    </button>
                    <p style="text-align: center; margin-top: 2rem; color: var(--text-muted); font-size: 0.9rem;">
                        ${type === 'login' ? 'New here? <a href="#" id="toggleAuth" style="color: var(--primary); font-weight: 600;">Create account</a>' : 'Already have an account? <a href="#" id="toggleAuth" style="color: var(--primary); font-weight: 600;">Login</a>'}
                    </p>
                </form>
            </div>
        `;

        lucide.createIcons();
        let selectedRole = 'user';

        document.querySelectorAll('.role-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedRole = btn.getAttribute('data-role');
                
                // Visual feedback
                if (selectedRole === 'admin') {
                    btn.closest('.card').style.borderTop = '4px solid var(--secondary)';
                } else {
                    btn.closest('.card').style.borderTop = '4px solid var(--primary)';
                }
            });
        });

        document.getElementById('authForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                let res;
                if (type === 'login') {
                    res = await api.login(email, password);
                } else {
                    const username = document.getElementById('username').value;
                    res = await api.register(username, email, password);
                }
                
                // If user selected Admin but backend says they aren't, handle gracefully
                // For this implementation, we assume if they can login/register, we save the session
                auth.saveSession(res.token, res.user);
                
                if (selectedRole === 'admin' && !res.user.is_admin) {
                    alert('Note: You logged in as a standard User. Admin access requires elevated privileges.');
                }
                
                window.location.reload();
            } catch (err) {
                alert(err.message);
            }
        });

        document.getElementById('toggleAuth').addEventListener('click', (e) => {
            e.preventDefault();
            this.renderAuth(type === 'login' ? 'register' : 'login');
        });
    }

    async renderDashboard() {
        this.viewContainer.innerHTML = `
            <div class="dashboard-layout">
                <div class="dashboard-main">
                    <div class="card" style="background: linear-gradient(135deg, rgba(209, 77, 255, 0.08), transparent); margin-bottom: 1.5rem; padding: 2.5rem;">
                        <h2 style="font-size: 1.8rem;">Good morning, <span id="dashUsername">${auth.user?.username || 'Player'}</span></h2>
                        <p style="color: var(--text-muted); margin-top: 0.5rem;">Check your daily code challenges & tournament schedules.</p>
                        <div class="stats-grid" style="margin-top: 2rem;">
                            <div style="display: flex; gap: 1rem; align-items: center;">
                                <div style="width: 45px; height: 45px; background: rgba(209, 77, 255, 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                    <i data-lucide="zap" style="color: var(--primary); width: 22px;"></i>
                                </div>
                                <div><p style="font-size: 0.8rem; color: var(--text-muted);">Points</p><h4 style="font-size: 1.2rem;">${auth.user?.total_points || 0}</h4></div>
                            </div>
                            <div style="display: flex; gap: 1rem; align-items: center;">
                                <div style="width: 45px; height: 45px; background: rgba(58, 134, 255, 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                    <i data-lucide="check-circle-2" style="color: var(--accent); width: 22px;"></i>
                                </div>
                                <div><p style="font-size: 0.8rem; color: var(--text-muted);">Solved</p><h4 style="font-size: 1.2rem;">${auth.user?.problems_solved || 0}</h4></div>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                            <h3>Active Tournaments</h3>
                            <a href="#" class="btn btn-ghost btn-small" id="viewAllTournaments">View All</a>
                        </div>
                        <div id="activeTournamentsList" class="activity-list">Loading...</div>
                    </div>
                </div>

                <div class="dashboard-side">
                    <div class="card" style="padding: 1.5rem;">
                        <h3>My Profile</h3>
                        <div style="text-align: center; margin-top: 1.5rem;">
                            <div style="width: 80px; height: 80px; margin: 0 auto; background: linear-gradient(135deg, var(--primary), var(--secondary)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: bold; color: white; box-shadow: 0 10px 20px rgba(209, 77, 255, 0.2);">
                                ${auth.user?.username[0].toUpperCase()}
                            </div>
                            <h4 style="margin-top: 1rem; font-size: 1.1rem;">${auth.user?.username}</h4>
                            <p style="color: var(--text-muted); font-size: 0.85rem;">Member Since ${new Date(auth.user?.created_at).toLocaleDateString()}</p>
                            <button class="btn btn-ghost" style="width: 100%; margin-top: 1.5rem; font-size: 0.8rem;">Edit Profile</button>
                        </div>
                    </div>

                    <div class="card" style="margin-top: 1.5rem; padding: 1.5rem;">
                        <h3>Recent Activity</h3>
                        <div class="activity-list" id="activityList">
                            <p style="text-align: center; color: var(--text-muted); padding: 2rem; font-size: 0.85rem;">No recent activity yet.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        lucide.createIcons();
        document.getElementById('viewAllTournaments').onclick = (e) => {
            e.preventDefault();
            this.switchView('tournaments');
        };

        try {
            const res = await api.getTournaments();
            const tournaments = res.tournaments || [];
            const list = document.getElementById('activeTournamentsList');
            list.innerHTML = tournaments.length ? tournaments.slice(0, 3).map(t => `
                <div class="activity-item">
                    <div style="width: 40px; height: 40px; background: rgba(209, 77, 255, 0.05); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                        <i data-lucide="trophy" style="color: var(--primary); width: 18px;"></i>
                    </div>
                    <div style="flex: 1;">
                        <h4 style="font-size: 0.95rem;">${t.title}</h4>
                        <p style="font-size: 0.75rem; color: var(--text-muted);">₹${t.entry_fee} Entry</p>
                    </div>
                    <button class="btn btn-ghost btn-small join-tournament" data-id="${t.id}" data-fee="${t.entry_fee}" style="padding: 0.4rem 0.8rem; font-size: 0.75rem;">Join</button>
                </div>
            `).join('') : '<p>No active tournaments</p>';
            lucide.createIcons();

            document.querySelectorAll('.join-tournament').forEach(btn => {
                btn.onclick = () => {
                    const id = btn.getAttribute('data-id');
                    const fee = parseFloat(btn.getAttribute('data-fee')) || 0;
                    this.handleTournamentEntry(id, fee);
                };
            });
        } catch (err) { console.error(err); }
    }

    async renderTournaments() {
        this.viewContainer.innerHTML = `
            <div id="codingArena" class="arena-layout" style="display: none;">
                <div class="problem-pane card">
                    <div id="problemDetail">Select a problem to begin</div>
                </div>
                <div class="editor-pane">
                    <div class="editor-header card" style="padding: 0.8rem 1.5rem; border-radius: var(--radius-md); margin-bottom: 1rem; display: flex; justify-content: space-between;">
                        <select id="languageSelect" class="input-field" style="padding: 0.4rem 1rem; margin: 0;">
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                        </select>
                        <div class="editor-actions">
                            <button class="btn btn-ghost" id="runCode">Run</button>
                            <button class="btn btn-primary" id="submitCode">Submit</button>
                        </div>
                    </div>
                    <div id="editorContainer" class="card" style="height: 500px; padding: 0; overflow: hidden;"></div>
                    <div id="resultPanel" class="card" style="margin-top: 1rem; height: 150px; display: none;">
                        <h4 style="margin-bottom: 0.5rem;">Result</h4>
                        <div id="resultContent" style="font-family: monospace; font-size: 0.9rem;"></div>
                    </div>
                </div>
            </div>
            <div id="tournamentsList" class="stats-grid">Loading...</div>
        `;

        try {
            const res = await api.getTournaments();
            const tournaments = res.tournaments || [];
            const list = document.getElementById('tournamentsList');
            list.innerHTML = tournaments.length ? tournaments.map(t => `
                <div class="card tournament-card">
                    <div class="status-badge">Live</div>
                    <div style="flex: 1;">
                        <div class="badge badge-purple" style="margin-bottom: 1rem;">Tournament</div>
                        <h3>${t.title}</h3>
                        <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.5rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                            ${t.description}
                        </p>
                    </div>
                    
                    <div class="tournament-info">
                        <div class="info-row">
                            <i data-lucide="banknote" style="color: #00ff88;"></i>
                            <span>Entry Fee: <strong>₹${t.entry_fee}</strong></span>
                        </div>
                        <div class="info-row">
                            <i data-lucide="award" style="color: var(--secondary);"></i>
                            <span>Prize Pool: <strong>₹${t.prize_pool}</strong></span>
                        </div>
                        <div class="info-row">
                            <i data-lucide="calendar" style="color: var(--accent);"></i>
                            <span>Starts: ${new Date(t.start_time).toLocaleDateString()}</span>
                        </div>
                        
                        <button class="btn btn-primary enter-arena" data-id="${t.id}" data-fee="${t.entry_fee}" style="width: 100%; margin-top: 1rem; border-radius: 50px;">
                            Enter Arena
                        </button>
                    </div>
                </div>
            `).join('') : '<p>No tournaments available</p>';
            lucide.createIcons();

            document.querySelectorAll('.enter-arena').forEach(btn => {
                btn.onclick = () => {
                    const id = btn.getAttribute('data-id');
                    const fee = parseFloat(btn.getAttribute('data-fee')) || 0;
                    this.handleTournamentEntry(id, fee);
                };
            });
        } catch (err) { console.error(err); }
    }

    async handleTournamentEntry(tournamentId, fee) {
        if (fee > 0) {
            try {
                // Initialize Razorpay Order
                const orderData = await api.createPaymentOrder(tournamentId);
                
                const options = {
                    key: orderData.key,
                    amount: orderData.amount,
                    currency: orderData.currency,
                    name: 'CodeBattle Arena',
                    description: 'Tournament Entry Fee',
                    order_id: orderData.orderId,
                    handler: async (response) => {
                        try {
                            // Verify Payment
                            await api.verifyPayment(response);
                            alert('Payment Successful! Welcome to the Arena.');
                            this.enterArena(tournamentId);
                        } catch (err) {
                            alert('Payment Verification Failed!');
                        }
                    },
                    prefill: {
                        name: auth.user.username,
                        email: auth.user.email
                    },
                    theme: { color: '#d14dff' }
                };
                
                const rzp = new Razorpay(options);
                rzp.open();
            } catch (err) {
                alert(err.message || 'Payment Initialization Failed');
            }
        } else {
            // Free tournament
            this.enterArena(tournamentId);
        }
    }

    async enterArena(tournamentId) {
        document.getElementById('tournamentsList').style.display = 'none';
        const arena = document.getElementById('codingArena');
        arena.style.display = 'grid';
        arena.style.gridTemplateColumns = '1fr 2fr';
        arena.style.gap = '1.5rem';

        try {
            const res = await api.getTournament(tournamentId);
            const tournament = res.tournament;
            const problems = res.problems || [];
            
            const problemPane = document.getElementById('problemDetail');
            problemPane.innerHTML = `
                <h2>${tournament.title}</h2>
                <div style="margin-top: 1.5rem;">
                    ${problems.map((p, i) => `
                        <div class="problem-item" data-idx="${i}" style="padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border); margin-bottom: 0.8rem; cursor: pointer;">
                            <h4 style="margin-bottom: 0.3rem;">${p.title}</h4>
                            <span class="badge badge-purple">${p.difficulty}</span>
                        </div>
                    `).join('')}
                </div>
            `;

            // Initialize Monaco
            require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' } });
            require(['vs/editor/editor.main'], () => {
                this.editor = monaco.editor.create(document.getElementById('editorContainer'), {
                    value: '// Start coding here...',
                    language: 'javascript',
                    theme: document.body.getAttribute('data-theme') === 'dark' ? 'vs-dark' : 'vs-light',
                    automaticLayout: true,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 14,
                    roundedSelection: true,
                    scrollBeyondLastLine: false,
                    minimap: { enabled: false }
                });
            });

            document.querySelectorAll('.problem-item').forEach(item => {
                item.addEventListener('click', () => {
                    const prob = problems[item.getAttribute('data-idx')];
                    this.currentProblem = prob;
                    problemPane.innerHTML = `
                        <button class="btn btn-ghost" id="backToArena" style="margin-bottom: 1rem; padding: 0.4rem 0.8rem;">← Back</button>
                        <h2>${prob.title}</h2>
                        <span class="badge badge-purple" style="margin-top: 0.5rem; display: inline-block;">${prob.difficulty}</span>
                        <div style="margin-top: 1.5rem; line-height: 1.6; color: var(--text-muted);">
                            ${prob.description}
                        </div>
                    `;
                    document.getElementById('backToArena').addEventListener('click', () => this.enterArena(tournamentId));
                });
            });

            document.getElementById('submitCode').onclick = async () => {
                if (!this.currentProblem) return alert('Select a problem first');
                const btn = document.getElementById('submitCode');
                btn.disabled = true;
                btn.textContent = 'Submitting...';

                try {
                    const res = await api.submitCode(
                        this.currentProblem.id, 
                        tournamentId, 
                        this.editor.getValue(),
                        document.getElementById('languageSelect').value
                    );
                    const panel = document.getElementById('resultPanel');
                    const content = document.getElementById('resultContent');
                    panel.style.display = 'block';
                    content.innerHTML = `<span style="color: ${res.status === 'accepted' ? '#00ff88' : '#ff4d94'}">${res.status.toUpperCase()}</span><br>${res.message || ''}`;
                } catch (err) {
                    alert(err.message);
                } finally {
                    btn.disabled = false;
                    btn.textContent = 'Submit';
                }
            };
        } catch (err) { console.error(err); }
    }

    async renderLeaderboard() {
        this.viewContainer.innerHTML = `
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h3>Global Leaderboard</h3>
                    <div class="badge badge-pink">Top Players</div>
                </div>
                <div class="leaderboard-table-container">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="text-align: left; border-bottom: 1px solid var(--border);">
                                <th style="padding: 1rem;">Rank</th>
                                <th style="padding: 1rem;">User</th>
                                <th style="padding: 1rem;">Points</th>
                                <th style="padding: 1rem;">Solved</th>
                            </tr>
                        </thead>
                        <tbody id="leaderboardBody">
                            <tr><td colspan="4" style="text-align: center; padding: 2rem;">Loading...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        try {
            const res = await api.getGlobalLeaderboard();
            const leaderboard = res.leaderboard || [];
            const body = document.getElementById('leaderboardBody');
            body.innerHTML = leaderboard.length ? leaderboard.map((entry, i) => `
                <tr style="border-bottom: 1px solid var(--border);">
                    <td style="padding: 1rem;">
                        <span class="badge ${i < 3 ? 'badge-pink' : 'badge-purple'}">#${i + 1}</span>
                    </td>
                    <td style="padding: 1rem; display: flex; align-items: center; gap: 0.8rem;">
                        <div style="width: 32px; height: 32px; background: var(--border); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem;">
                            ${entry.username[0].toUpperCase()}
                        </div>
                        ${entry.username}
                        ${entry.user_id === auth.user?.id ? '<span class="badge badge-purple" style="font-size: 0.6rem;">YOU</span>' : ''}
                    </td>
                    <td style="padding: 1rem; font-weight: 600;">${entry.total_points || 0}</td>
                    <td style="padding: 1rem;">${entry.problems_solved || 0}</td>
                </tr>
            `).join('') : '<tr><td colspan="4" style="text-align: center; padding: 2rem;">No data found</td></tr>';
        } catch (err) { console.error(err); }
    }

    async renderAdminProblems() {
        this.viewContainer.innerHTML = `
            <div class="content-grid">
                <div class="card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                        <h3>Active Problems</h3>
                        <button class="btn btn-primary" id="openNewProblemModal">Create New</button>
                    </div>
                    <div id="adminProblemsList">Loading...</div>
                </div>
                <div id="problemFormArea" class="card" style="display: none;">
                    <h3>New Problem</h3>
                    <form id="newProblemForm" style="margin-top: 1.5rem;">
                        <div class="input-group">
                            <label>Associate with Tournament</label>
                            <select id="pTournamentId" class="input-field" required>
                                <option value="">Select Tournament...</option>
                            </select>
                        </div>
                        <div class="input-group">
                            <label>Title</label>
                            <input type="text" id="pTitle" class="input-field" required>
                        </div>
                        <div class="input-group">
                            <label>Description</label>
                            <textarea id="pDesc" class="input-field" style="height: 151px;" required></textarea>
                        </div>
                        <div class="input-group">
                            <label>Difficulty</label>
                            <select id="pDifficulty" class="input-field">
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                        <div class="input-group">
                            <label>Points</label>
                            <input type="number" id="pPoints" class="input-field" value="100">
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%;">Create Problem</button>
                        <button type="button" class="btn btn-ghost" style="width: 100%; margin-top: 0.8rem;" id="cancelProblem">Cancel</button>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('openNewProblemModal').onclick = () => {
            document.getElementById('problemFormArea').style.display = 'block';
        };

        document.getElementById('cancelProblem').onclick = () => {
            document.getElementById('problemFormArea').style.display = 'none';
        };

        document.getElementById('newProblemForm').onsubmit = async (e) => {
            e.preventDefault();
            const data = {
                tournament_id: document.getElementById('pTournamentId').value,
                title: document.getElementById('pTitle').value,
                description: document.getElementById('pDesc').value,
                difficulty: document.getElementById('pDifficulty').value,
                points: document.getElementById('pPoints').value
            };

            try {
                await api.createProblem(data);
                alert('Problem created successfully!');
                this.renderAdminProblems();
            } catch (err) { alert(err.message); }
        };

        // Load tournaments for dropdown
        try {
            const res = await api.getTournaments();
            const tournaments = res.tournaments || [];
            const select = document.getElementById('pTournamentId');
            tournaments.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t.id;
                opt.textContent = t.title;
                select.appendChild(opt);
            });
        } catch (err) { console.error(err); }

        document.getElementById('adminProblemsList').innerHTML = '<p style="color: var(--text-muted);">Syncing problems...</p>';
    }

    async renderAdminDashboard() {
        this.viewContainer.innerHTML = `
            <div class="stats-grid">
                <div class="card" style="border-left: 5px solid var(--primary);">
                    <div style="display: flex; justify-content: space-between;">
                        <div>
                            <p style="color: var(--text-muted); font-size: 0.85rem;">Total Users</p>
                            <h2 id="totalUsers" style="font-size: 2rem; margin-top: 0.5rem;">0</h2>
                        </div>
                        <div class="badge badge-purple"><i data-lucide="users" style="width: 14px;"></i></div>
                    </div>
                </div>
                <div class="card" style="border-left: 5px solid var(--secondary);">
                    <p style="color: var(--text-muted); font-size: 0.85rem;">Tournament Revenue</p>
                    <h2 id="totalRevenue" style="font-size: 2rem; margin-top: 0.5rem;">₹0</h2>
                </div>
                <div class="card" style="border-left: 5px solid var(--accent);">
                    <p style="color: var(--text-muted); font-size: 0.85rem;">Platform Health</p>
                    <h2 style="font-size: 2rem; margin-top: 0.5rem; color: #00ff88;">Excellent</h2>
                </div>
            </div>

            <div class="dashboard-layout" style="margin-top: 1.5rem;">
                <div class="dashboard-main">
                    <div class="card">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                            <h3>Recent Signups</h3>
                            <button class="btn btn-ghost btn-small" onclick="app.switchView('admin-users')">View All Users</button>
                        </div>
                        <div id="recentUsersList" class="activity-list">
                            <p style="text-align: center; color: var(--text-muted); padding: 2rem;">Fetching user data...</p>
                        </div>
                    </div>
                </div>
                <div class="dashboard-side">
                    <div class="card">
                        <h3>Admin Workflow</h3>
                        <div style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 0.8rem;">
                            <button class="btn btn-primary" style="width: 100%;" onclick="app.switchView('admin-tournaments')">
                                <i data-lucide="trophy" style="width: 18px;"></i>
                                Manage Tournaments
                            </button>
                            <button class="btn btn-ghost" style="width: 100%;" onclick="app.switchView('problems')">
                                <i data-lucide="code-2" style="width: 18px;"></i>
                                Manage Problems
                            </button>
                            <button class="btn btn-ghost" style="width: 100%;" onclick="app.switchView('admin-submissions')">
                                <i data-lucide="scroll-text" style="width: 18px;"></i>
                                Monitor Submissions
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();

        try {
            const res = await api.getAdminStats();
            const stats = res.stats || {};
            document.getElementById('totalUsers').textContent = stats.users || 0;
            document.getElementById('totalRevenue').textContent = `₹${stats.revenue || 0}`;
            
            // Re-using stats for recent users if backend provides them
            const users = stats.recentUsers || [];
            const list = document.getElementById('recentUsersList');
            if (users.length) {
                list.innerHTML = users.map(u => `
                    <div class="activity-item">
                        <div style="width: 35px; height: 35px; background: var(--border); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem;">
                            ${(u.username || 'U')[0].toUpperCase()}
                        </div>
                        <div style="flex: 1;">
                            <h4 style="font-size: 0.9rem;">${u.username}</h4>
                            <p style="font-size: 0.7rem; color: var(--text-muted);">${u.email}</p>
                        </div>
                        <span class="badge ${u.is_admin ? 'badge-pink' : 'badge-purple'}">${u.is_admin ? 'Admin' : 'User'}</span>
                    </div>
                `).join('');
            } else {
                list.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No recent users</p>';
            }
            lucide.createIcons();
        } catch (err) { console.error(err); }
    }

    async renderAdminTournaments() {
        this.viewContainer.innerHTML = `
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h3>Manage Tournaments</h3>
                    <button class="btn btn-primary" id="openTournamentModal">Create Tournament</button>
                </div>
                <div id="adminTournamentsList" class="activity-list">Loading...</div>
            </div>
            <div id="tournamentModal" class="card" style="display: none; margin-top: 1.5rem;">
                <h3 id="modalTitle">New Tournament</h3>
                <form id="tournamentForm" style="margin-top: 1.5rem;">
                    <div class="input-group"><label>Title</label><input type="text" id="tTitle" class="input-field" required></div>
                    <div class="input-group"><label>Description</label><textarea id="tDesc" class="input-field" required></textarea></div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="input-group"><label>Entry Fee (₹)</label><input type="number" id="tFee" class="input-field" value="0"></div>
                        <div class="input-group"><label>Prize Pool (₹)</label><input type="number" id="tPrize" class="input-field" value="0"></div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="input-group"><label>Start Time</label><input type="datetime-local" id="tStart" class="input-field" required></div>
                        <div class="input-group"><label>End Time</label><input type="datetime-local" id="tEnd" class="input-field" required></div>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Save Tournament</button>
                    <button type="button" class="btn btn-ghost" style="width: 100%; margin-top: 0.8rem;" id="closeTModal">Cancel</button>
                </form>
            </div>
        `;

        try {
            const res = await api.getTournaments();
            const tournaments = res.tournaments || [];
            const list = document.getElementById('adminTournamentsList');
            list.innerHTML = tournaments.length ? tournaments.map(t => `
                <div class="activity-item">
                    <div style="flex: 1;">
                        <h4>${t.title}</h4>
                        <p style="font-size: 0.8rem; color: var(--text-muted);">Status: <span class="badge ${t.status === 'upcoming' ? 'badge-purple' : 'badge-pink'}">${t.status}</span></p>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        ${t.status === 'upcoming' ? `<button class="btn btn-primary btn-small start-t" data-id="${t.id}">Start</button>` : ''}
                        <button class="btn btn-ghost btn-small edit-t" data-id="${t.id}">Edit</button>
                    </div>
                </div>
            `).join('') : '<p>No tournaments</p>';

            document.querySelectorAll('.start-t').forEach(btn => {
                btn.onclick = async () => {
                    if (confirm('Start this tournament? Participants will be able to join rooms.')) {
                        await api.updateTournamentStatus(btn.getAttribute('data-id'), 'active');
                        this.renderAdminTournaments();
                    }
                };
            });
        } catch (err) { console.error(err); }

        document.getElementById('tournamentForm').onsubmit = async (e) => {
            e.preventDefault();
            const data = {
                title: document.getElementById('tTitle').value,
                description: document.getElementById('tDesc').value,
                entry_fee: parseFloat(document.getElementById('tFee').value) || 0,
                prize_pool: parseFloat(document.getElementById('tPrize').value) || 0,
                start_time: document.getElementById('tStart').value.replace('T', ' '),
                end_time: document.getElementById('tEnd').value.replace('T', ' ')
            };
            try {
                await api.createTournament(data);
                alert('Tournament created successfully!');
                document.getElementById('tournamentModal').style.display = 'none';
                this.renderAdminTournaments();
            } catch (err) { alert(err.message); }
        };

        document.getElementById('openTournamentModal').onclick = () => document.getElementById('tournamentModal').style.display = 'block';
        document.getElementById('closeTModal').onclick = () => document.getElementById('tournamentModal').style.display = 'none';
    }

    async renderAdminRooms() {
        this.viewContainer.innerHTML = `
            <div class="card">
                <h3>Multiplayer Room Monitoring</h3>
                <div id="adminRoomsList" class="activity-list" style="margin-top: 2rem;">Loading...</div>
            </div>
        `;
        try {
            const res = await api.getRooms();
            const rooms = res.rooms || [];
            const list = document.getElementById('adminRoomsList');
            list.innerHTML = rooms.length ? rooms.map(r => `
                <div class="activity-item">
                    <div style="flex: 1;">
                        <h4>Room #${r.id}</h4>
                        <p style="font-size: 0.8rem; color: var(--text-muted);">Players: ${r.player_count}/${r.max_players} | Status: ${r.status}</p>
                    </div>
                    <span class="badge badge-purple">${r.status}</span>
                </div>
            `).join('') : '<p>No active rooms</p>';
        } catch (err) { console.error(err); }
    }

    async renderAdminSubmissions() {
        this.viewContainer.innerHTML = `
            <div class="card">
                <h3>Global Submission Feed</h3>
                <div class="leaderboard-table-container" style="margin-top: 2rem;">
                    <table style="width: 100%; text-align: left;">
                        <thead><tr style="border-bottom: 1px solid var(--border);"><th style="padding: 1rem;">User</th><th style="padding: 1rem;">Problem</th><th style="padding: 1rem;">Status</th><th style="padding: 1rem;">Time</th></tr></thead>
                        <tbody id="subListBody"></tbody>
                    </table>
                </div>
            </div>
        `;
        try {
            const res = await api.getAdminSubmissions();
            const subs = res.submissions || [];
            const body = document.getElementById('subListBody');
            body.innerHTML = subs.map(s => `
                <tr style="border-bottom: 1px solid var(--border);">
                    <td style="padding: 1rem;">${s.username}</td>
                    <td style="padding: 1rem;">${s.problem_title}</td>
                    <td style="padding: 1rem;"><span class="badge ${s.status === 'accepted' ? 'badge-purple' : 'badge-pink'}">${s.status}</span></td>
                    <td style="padding: 1rem; font-size: 0.8rem;">${new Date(s.created_at).toLocaleString()}</td>
                </tr>
            `).join('');
        } catch (err) { console.error(err); }
    }

    async renderAdminRewards() {
        this.viewContainer.innerHTML = `
            <div class="card">
                <h3>Prize Distribution</h3>
                <p style="color: var(--text-muted); margin-top: 1rem;">Distribute rewards for completed tournaments.</p>
                <div id="rewardTournamentList" class="activity-list" style="margin-top: 2rem;">Loading...</div>
            </div>
        `;
        try {
            const res = await api.getTournaments();
            const tournaments = res.tournaments || [];
            const list = document.getElementById('rewardTournamentList');
            list.innerHTML = tournaments.filter(t => t.status === 'active' || t.status === 'ended').map(t => `
                <div class="activity-item">
                    <div style="flex: 1;">
                        <h4>${t.title}</h4>
                        <p style="font-size: 0.8rem; color: var(--text-muted);">Prize Pool: ₹${t.prize_pool}</p>
                    </div>
                    <button class="btn btn-primary btn-small distribute-btn" data-id="${t.id}">Distribute Rewards</button>
                </div>
            `).join('') || '<p>No tournaments ready for distribution</p>';

            document.querySelectorAll('.distribute-btn').forEach(btn => {
                btn.onclick = async () => {
                    if (confirm('Distribute prizes and close this tournament?')) {
                        await api.distributeRewards(btn.getAttribute('data-id'));
                        alert('Rewards distributed successfully!');
                        this.renderAdminRewards();
                    }
                };
            });
        } catch (err) { console.error(err); }
    }

    async renderAdminUsers() {
        this.viewContainer.innerHTML = `
            <div class="card">
                <h3>Manage Players</h3>
                <div id="adminUsersList" class="activity-list" style="margin-top: 2rem;">Loading...</div>
            </div>
        `;
        try {
            const res = await api.getAdminUsers();
            const users = res.users || [];
            const list = document.getElementById('adminUsersList');
            list.innerHTML = users.map(u => `
                <div class="activity-item">
                    <div style="flex: 1;">
                        <h4>${u.username}</h4>
                        <p style="font-size: 0.8rem; color: var(--text-muted);">${u.email}</p>
                    </div>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <span class="badge ${u.is_admin ? 'badge-pink' : 'badge-purple'}">${u.is_admin ? 'Admin' : 'User'}</span>
                        <button class="btn btn-ghost btn-small toggle-role" data-id="${u.id}" data-admin="${u.is_admin}">
                            ${u.is_admin ? 'Make User' : 'Promote Admin'}
                        </button>
                    </div>
                </div>
            `).join('');

            document.querySelectorAll('.toggle-role').forEach(btn => {
                btn.onclick = async () => {
                    const id = btn.getAttribute('data-id');
                    const currentAdmin = btn.getAttribute('data-admin') === '1';
                    await api.updateUserRole(id, !currentAdmin);
                    this.renderAdminUsers();
                };
            });
        } catch (err) { console.error(err); }
    }
}

const app = new AppController();

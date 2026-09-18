/* ═══════════════════════════════════════
   CLOSIWER AI v5.0 - Core Logic
   Developed by PANN
═══════════════════════════════════════ */

var state = {
    sessions: [],
    currentSessionId: null,
    currentTool: 'chat',
    currentPersonality: 'default',
    currentLang: 'id',
    isTyping: false,
    abortController: null,
    uploadedFile: null,
    isRecording: false,
    recognition: null,
    stats: {
        totalMessages: 0,
        imagesGenerated: 0,
        searches: 0,
        sessionStart: Date.now()
    }
};

var config = {
    apiKey: localStorage.getItem('closiwer_key') || '',
    provider: localStorage.getItem('closiwer_provider') || 'groq',
    model: localStorage.getItem('closiwer_model') || 'llama-3.1-8b-instant'
};

/* ═══ SYSTEM PROMPT (Anti-Halusinasi) ═══ */
var personalities = {
    default: 'Kamu adalah CLOSIWER AI, asisten AI cerdas yang dibuat oleh developer bernama PANN. Jawab dengan detail, ramah, dan informatif dalam Bahasa Indonesia.\n\nINFO PENTING TENTANG CLOSIWER AI:\n- Dibuat oleh: PANN (developer Indonesia)\n- Versi saat ini: v5.0\n- Status: Aktif dan terus dikembangkan\n- Platform: Website AI berbasis browser\n- Harga: 100% GRATIS, unlimited, tanpa batasan\n- Fitur: Chat AI, Generate Gambar, Web Search, Chart, Code Playground, Music Player, Notes, Tasks, Calendar, Mini Games, Analytics\n- Model AI: Bisa pakai Groq (Llama), OpenAI (GPT), atau mode simulasi\n\nATURAN PENTING:\n- Kalau ditanya tentang CLOSIWER AI atau PANN, jawab sesuai info di atas\n- JANGAN mengarang tanggal, versi, atau URL yang tidak kamu yakini\n- Kalau tidak tahu jawabannya, katakan "saya tidak yakin" atau "saya kurang tahu" daripada mengarang\n- Jangan sebut tanggal spesifik kecuali benar-benar yakin\n- Jujur lebih baik daripada mengarang',
    coder: 'Kamu adalah CLOSIWER AI mode CODER, dibuat oleh PANN. Fokus pada coding, debugging, dan best practices. Kasih kode lengkap dengan komentar. Prioritaskan: clean code, performance, security. Jawab dalam Bahasa Indonesia. Kalau tidak tahu, bilang tidak tahu.',
    teacher: 'Kamu adalah CLOSIWER AI mode TEACHER, dibuat oleh PANN. Jelaskan dengan sabar, step-by-step, analogi sederhana. Kasih contoh konkret & latihan. Jawab dalam Bahasa Indonesia. Kalau tidak tahu, bilang tidak tahu.',
    creative: 'Kamu adalah CLOSIWER AI mode CREATIVE, dibuat oleh PANN. Bersikaplah imajinatif, ekspresif, inspiring. Gunakan bahasa indah & puitis. Jawab dalam Bahasa Indonesia.',
    math: 'Kamu adalah CLOSIWER AI mode MATH EXPERT, dibuat oleh PANN. Selesaikan soal matematika step-by-step. Jelaskan rumus yang digunakan. Kasih verifikasi jawaban. Jawab dalam Bahasa Indonesia. Kalau tidak yakin, bilang tidak yakin.'
};

/* ═══ PARTICLE BACKGROUND ═══ */
function initParticles() {
    var canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W, H, particles = [];
    var COUNT = 70;
    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    function create() { return { x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5, r: Math.random() * 2 + 0.5 }; }
    resize();
    for (var i = 0; i < COUNT; i++) particles.push(create());
    window.addEventListener('resize', resize);
    function animate() {
        ctx.clearRect(0, 0, W, H);
        var primary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#d97757';
        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > W) p.vx *= -1;
            if (p.y < 0 || p.y > H) p.vy *= -1;
            var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
            grad.addColorStop(0, primary + '80');
            grad.addColorStop(1, primary + '00');
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2); ctx.fill();
            for (var j = i + 1; j < particles.length; j++) {
                var p2 = particles[j];
                var dx = p.x - p2.x, dy = p.y - p2.y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 130) {
                    ctx.strokeStyle = primary + Math.floor(0.2 * (1 - dist / 130) * 255).toString(16).padStart(2, '0');
                    ctx.lineWidth = 0.5;
                    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
}

/* ═══ MATRIX RAIN ═══ */
var matrixInterval = null;
function initMatrix() {
    var canvas = document.getElementById('matrixCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.width = window.innerWidth;
    var H = canvas.height = window.innerHeight;
    var cols = Math.floor(W / 14) + 1;
    var drops = [];
    for (var i = 0; i < cols; i++) drops[i] = Math.random() * H;
    var chars = 'CLOSIWER01アカサタナハマヤラワ∞∆∑∫';
    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#d97757';
        ctx.font = '14px monospace';
        for (var i = 0; i < drops.length; i++) {
            var text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * 14, drops[i]);
            if (drops[i] > H && Math.random() > 0.975) drops[i] = 0;
            drops[i] += 14;
        }
    }
    window.addEventListener('resize', function() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; });
    if (matrixInterval) clearInterval(matrixInterval);
    matrixInterval = setInterval(draw, 50);
}

/* ═══ INIT ═══ */
window.addEventListener('load', function() {
    initParticles();
    initMatrix();
    loadSessions();
    updateStatus();
    loadConfigToUI();
    initVoiceRecognition();
    loadTheme();
    loadBgMode();
    loadColor();
    loadLang();
    setupKeyboardShortcuts();
    console.log('CLOSIWER AI v5.0 by PANN ready! ✅');
});

function loadTheme() {
    var theme = localStorage.getItem('closiwer_theme');
    if (theme) {
        document.documentElement.setAttribute('data-theme', theme);
        var btn = document.getElementById('themeBtn');
        if (btn) btn.textContent = theme === 'light' ? '☀️' : '🌙';
    }
}

function loadColor() {
    var color = localStorage.getItem('closiwer_color');
    if (color) {
        document.documentElement.setAttribute('data-color', color);
        var el = document.querySelector('.color-opt.' + color);
        if (el) {
            document.querySelectorAll('.color-opt').forEach(function(c) { c.classList.remove('active'); });
            el.classList.add('active');
        }
    }
}

function loadBgMode() {
    var mode = localStorage.getItem('closiwer_bg_mode') || 'png';
    document.body.setAttribute('data-bg-mode', mode);
    var el = document.querySelector('.bg-mode-opt[onclick*="' + mode + '"]');
    if (el) {
        document.querySelectorAll('.bg-mode-opt').forEach(function(c) { c.classList.remove('active'); });
        el.classList.add('active');
    }
}

function loadLang() {
    var lang = localStorage.getItem('closiwer_lang') || 'id';
    state.currentLang = lang;
    var el = document.getElementById('langSelect');
    if (el) el.value = lang;
}

/* ═══ SIDEBAR ═══ */
function toggleSidebar() { document.getElementById('sidebar').classList.toggle('open'); }

/* ═══ SESSIONS ═══ */
function loadSessions() {
    try {
        var saved = localStorage.getItem('closiwer_sessions');
        if (saved) state.sessions = JSON.parse(saved);
    } catch(e) { state.sessions = []; }
    if (state.sessions.length === 0) newSession();
    else {
        state.currentSessionId = state.sessions[0].id;
        loadCurrentSession();
    }
    renderSessions();
}

function saveSessions() {
    try { localStorage.setItem('closiwer_sessions', JSON.stringify(state.sessions)); } catch(e) {}
}

function newSession() {
    var id = 'session_' + Date.now();
    state.sessions.unshift({ id: id, title: 'Chat Baru', messages: [], timestamp: Date.now() });
    state.currentSessionId = id;
    saveSessions();
    renderSessions();
    document.getElementById('messages').innerHTML = '';
    document.getElementById('welcome').style.display = 'flex';
    document.getElementById('panelContainer').innerHTML = '';
    document.getElementById('sidebar').classList.remove('open');
    showToast('✨ Sesi baru');
}

function loadCurrentSession() {
    var s = state.sessions.find(function(x) { return x.id === state.currentSessionId; });
    if (!s) return;
    if (s.messages.length > 0) {
        document.getElementById('welcome').style.display = 'none';
        renderMessages();
    } else {
        document.getElementById('welcome').style.display = 'flex';
        document.getElementById('messages').innerHTML = '';
    }
    renderSessions();
}

function switchSession(id) {
    state.currentSessionId = id;
    loadCurrentSession();
    document.getElementById('sidebar').classList.remove('open');
    scrollBottom();
}

function renderSessions() {
    var list = document.getElementById('sessionList');
    if (state.sessions.length === 0) { list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-dim);font-size:11px;">Belum ada sesi</div>'; return; }
    var html = '';
    for (var i = 0; i < state.sessions.length; i++) {
        var s = state.sessions[i];
        var active = s.id === state.currentSessionId ? ' active' : '';
        html += '<div class="session-item' + active + '" onclick="switchSession(\'' + s.id + '\')">' + escapeHtml(s.title) + '</div>';
    }
    list.innerHTML = html;
}

function updateCurrentSession(messages) {
    var s = state.sessions.find(function(x) { return x.id === state.currentSessionId; });
    if (!s) return;
    s.messages = messages;
    if (s.title === 'Chat Baru') {
        for (var i = 0; i < messages.length; i++) {
            if (messages[i].role === 'user') { s.title = messages[i].content.slice(0, 40); break; }
        }
    }
    saveSessions();
    renderSessions();
}

function clearAllSessions() {
    if (!confirm('Hapus SEMUA sesi?')) return;
    state.sessions = [];
    localStorage.removeItem('closiwer_sessions');
    newSession();
    showToast('🗑️ Semua dihapus');
    closeModal('settingsModal');
}

function getCurrentMessages() {
    var s = state.sessions.find(function(x) { return x.id === state.currentSessionId; });
    return s ? s.messages : [];
}

/* ═══ TOOLS ═══ */
function setTool(tool, el) {
    state.currentTool = tool;
    document.querySelectorAll('.tool-chip').forEach(function(c) { c.classList.remove('active'); });
    if (el) el.classList.add('active');
    var ph = { chat: 'Tanya apa saja...', image: '🖼️ Deskripsi gambar...', search: '🌐 Cari apa?', chart: '📊 Minta chart...', playground: '🎮 Deskripsi aplikasi...' };
    document.getElementById('input').placeholder = ph[tool] || ph.chat;
    
    // Show panel for non-chat tools
    var panelContainer = document.getElementById('panelContainer');
    panelContainer.innerHTML = '';
    
    if (tool === 'music') renderMusicPanel();
    else if (tool === 'notes') renderNotesPanel();
    else if (tool === 'tasks') renderTasksPanel();
    else if (tool === 'calendar') renderCalendarPanel();
    else if (tool === 'games') renderGamesPanel();
    else if (tool === 'stats') renderStatsPanel();
    
    if (tool === 'chat' || tool === 'image' || tool === 'search' || tool === 'chart' || tool === 'playground') {
        showToast('🛠️ ' + tool);
    }
}

/* ═══ THEME ═══ */
function toggleTheme() {
    var cur = document.documentElement.getAttribute('data-theme') || 'dark';
    var next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    document.getElementById('themeBtn').textContent = next === 'dark' ? '🌙' : '☀️';
    localStorage.setItem('closiwer_theme', next);
}

function setColor(color, el) {
    document.documentElement.setAttribute('data-color', color);
    document.querySelectorAll('.color-opt').forEach(function(c) { c.classList.remove('active'); });
    el.classList.add('active');
    localStorage.setItem('closiwer_color', color);
    showToast('🎨 ' + color);
}

function setBgMode(mode, el) {
    document.body.setAttribute('data-bg-mode', mode);
    document.querySelectorAll('.bg-mode-opt').forEach(function(c) { c.classList.remove('active'); });
    el.classList.add('active');
    localStorage.setItem('closiwer_bg_mode', mode);
    showToast('🖼️ BG: ' + mode);
}

function setPersonality(p) {
    state.currentPersonality = p;
    localStorage.setItem('closiwer_personality', p);
    showToast('🎭 ' + p);
}

function setLanguage(lang) {
    state.currentLang = lang;
    localStorage.setItem('closiwer_lang', lang);
    showToast('🌐 ' + lang.toUpperCase());
}

var savedP = localStorage.getItem('closiwer_personality');
if (savedP) state.currentPersonality = savedP;

/* ═══ MODALS ═══ */
function openDev() {
    document.getElementById('devModal').classList.add('show');
    loadConfigToUI();
}

function openSettings() {
    document.getElementById('settingsModal').classList.add('show');
    document.getElementById('personalitySelect').value = state.currentPersonality;
}

function closeModal(id) { document.getElementById(id).classList.remove('show'); }

document.querySelectorAll('.modal').forEach(function(m) {
    m.addEventListener('click', function(e) { if (e.target === m) m.classList.remove('show'); });
});

/* ═══ CONFIG ═══ */
function loadConfigToUI() {
    document.getElementById('provider').value = config.provider;
    document.getElementById('apiKey').value = config.apiKey;
    document.getElementById('model').value = config.model;
    updateStatus();
}

function saveConfig() {
    config.provider = document.getElementById('provider').value;
    config.apiKey = document.getElementById('apiKey').value.trim();
    config.model = document.getElementById('model').value.trim() || 'llama-3.1-8b-instant';
    localStorage.setItem('closiwer_provider', config.provider);
    localStorage.setItem('closiwer_key', config.apiKey);
    localStorage.setItem('closiwer_model', config.model);
    updateStatus();
    showToast('✅ Tersimpan!');
    closeModal('devModal');
}

function updateStatus() {
    var st = document.getElementById('statusText');
    var sb = document.getElementById('statusBox');
    if (config.apiKey && config.apiKey.length > 10) {
        st.textContent = 'API ACTIVE';
        st.style.color = '#4ade80';
        sb.textContent = '✓ Active (' + config.provider + ' · ' + config.model + ')';
        sb.className = 'status-box active';
    } else {
        st.textContent = 'SIMULATION';
        st.style.color = '#fbbf24';
        sb.textContent = 'Mode: Simulasi';
        sb.className = 'status-box';
    }
}

/* ═══ INPUT ═══ */
function onInput() {
    var input = document.getElementById('input');
    var btn = document.getElementById('sendBtn');
    btn.disabled = !input.value.trim() && !state.uploadedFile;
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 140) + 'px';
}

document.getElementById('input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!document.getElementById('sendBtn').disabled && !state.isTyping) sendMessage();
    }
});

/* ═══ SEND ═══ */
function handleSendClick() { if (state.isTyping) stopGeneration(); else sendMessage(); }

function stopGeneration() {
    if (state.abortController) { state.abortController.abort(); state.abortController = null; }
    state.isTyping = false;
    removeTyping();
    updateSendBtn();
    showToast('⏹ Stop');
}

function updateSendBtn() {
    var btn = document.getElementById('sendBtn');
    if (state.isTyping) {
        btn.classList.add('stop-mode');
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>';
        btn.disabled = false;
    } else {
        btn.classList.remove('stop-mode');
        btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>';
        btn.disabled = !document.getElementById('input').value.trim() && !state.uploadedFile;
    }
}

function quickAsk(text) {
    document.getElementById('input').value = text;
    onInput();
    sendMessage();
}

/* ═══ FILE ═══ */
function triggerUpload() { document.getElementById('fileInput').click(); }

function handleFile(e) {
    var file = e.target.files[0];
    if (!file) return;
    state.uploadedFile = file;
    document.getElementById('fileName').textContent = file.name + ' (' + (file.size / 1024).toFixed(1) + ' KB)';
    document.getElementById('uploadPreview').classList.add('show');
    if (file.type.startsWith('text/') || file.name.match(/\.(txt|md|js|py|html|css|json|xml|csv|log)$/i)) {
        var reader = new FileReader();
        reader.onload = function(ev) { state.uploadedFile.content = ev.target.result.slice(0, 10000); };
        reader.readAsText(file);
    }
    updateSendBtn();
}

function removeFile() {
    state.uploadedFile = null;
    document.getElementById('fileInput').value = '';
    document.getElementById('uploadPreview').classList.remove('show');
    updateSendBtn();
}

/* ═══ VOICE ═══ */
function initVoiceRecognition() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { document.getElementById('micBtn').style.opacity = '0.3'; return; }
    state.recognition = new SR();
    state.recognition.lang = 'id-ID';
    state.recognition.onresult = function(e) {
        document.getElementById('input').value = e.results[0][0].transcript;
        onInput();
    };
    state.recognition.onend = function() {
        state.isRecording = false;
        document.getElementById('micBtn').classList.remove('recording');
    };
}

function toggleVoice() {
    if (!state.recognition) { showToast('❌ Voice tidak didukung'); return; }
    if (state.isRecording) state.recognition.stop();
    else {
        try {
            state.recognition.start();
            state.isRecording = true;
            document.getElementById('micBtn').classList.add('recording');
            showToast('🎤 Listening...');
        } catch(e) {}
    }
}

/* ═══ SEND MESSAGE ═══ */
function sendMessage() {
    var input = document.getElementById('input');
    var text = input.value.trim();
    if ((!text && !state.uploadedFile) || state.isTyping) return;
    
    if (state.currentTool === 'image' && text) {
        input.value = ''; input.style.height = 'auto';
        document.getElementById('welcome').style.display = 'none';
        addMessage('user', '🖼️ ' + text);
        generateImage(text);
        return;
    }
    if (state.currentTool === 'search' && text) {
        input.value = ''; input.style.height = 'auto';
        document.getElementById('welcome').style.display = 'none';
        addMessage('user', '🌐 ' + text);
        webSearch(text);
        return;
    }
    if (state.currentTool === 'chart' && text) {
        input.value = ''; input.style.height = 'auto';
        document.getElementById('welcome').style.display = 'none';
        addMessage('user', '📊 ' + text);
        generateChart(text);
        return;
    }
    if (state.currentTool === 'playground' && text) {
        input.value = ''; input.style.height = 'auto';
        document.getElementById('welcome').style.display = 'none';
        addMessage('user', '🎮 ' + text);
        generatePlayground(text);
        return;
    }
    
    var fullText = text;
    if (state.uploadedFile && state.uploadedFile.content) {
        fullText = text + '\n\n[File: ' + state.uploadedFile.name + ']\n```\n' + state.uploadedFile.content + '\n```';
    }
    
    addMessage('user', text || '[File]');
    input.value = '';
    input.style.height = 'auto';
    removeFile();
    document.getElementById('welcome').style.display = 'none';
    updateCurrentSession(getCurrentMessages());
    
    state.isTyping = true;
    updateSendBtn();
    showTyping();
    getAIResponse(fullText, state.abortController = new AbortController());
}

function addMessage(role, content, isHtml) {
    var s = state.sessions.find(function(x) { return x.id === state.currentSessionId; });
    if (!s) return;
    s.messages.push({ role: role, content: content, timestamp: Date.now(), isHtml: isHtml });
    updateCurrentSession(s.messages);
    renderMessages();
    scrollBottom();
}

/* ═══ IMAGE GEN ═══ */
function generateImage(prompt) {
    state.isTyping = true;
    updateSendBtn();
    showTyping();
    state.stats.imagesGenerated++;
    var seed = Math.floor(Math.random() * 1000000);
    var url = 'https://image.pollinations.ai/prompt/' + encodeURIComponent(prompt) + '?width=768&height=768&seed=' + seed + '&nologo=true';
    setTimeout(function() {
        removeTyping();
        var c = '## 🖼️ "' + escapeHtml(prompt) + '"\n\n<img src="' + url + '" alt="' + escapeHtml(prompt) + '" onclick="window.open(this.src)">\n\n*Klik gambar untuk buka full* · Powered by Pollinations AI';
        addMessage('assistant', c, true);
        state.isTyping = false;
        updateSendBtn();
        showToast('✅ Gambar dibuat!');
    }, 100);
}

/* ═══ WEB SEARCH ═══ */
function webSearch(query) {
    state.isTyping = true;
    updateSendBtn();
    showTyping();
    state.stats.searches++;
    fetch('https://api.duckduckgo.com/?q=' + encodeURIComponent(query) + '&format=json&no_html=1')
        .then(function(r) { return r.json(); })
        .then(function(data) {
            removeTyping();
            var c = '## 🌐 "' + escapeHtml(query) + '"\n\n';
            if (data.AbstractText) {
                c += '### 📖 Ringkasan\n' + escapeHtml(data.AbstractText) + '\n\n';
                if (data.AbstractURL) c += '🔗 [Sumber](' + data.AbstractURL + ')\n\n';
            }
            if (data.RelatedTopics && data.RelatedTopics.length > 0) {
                c += '### 📚 Terkait\n';
                for (var i = 0; i < Math.min(5, data.RelatedTopics.length); i++) {
                    if (data.RelatedTopics[i].Text) c += '• ' + escapeHtml(data.RelatedTopics[i].Text) + '\n';
                }
            }
            if (!data.AbstractText && (!data.RelatedTopics || data.RelatedTopics.length === 0)) {
                c += '⚠️ Tidak ada hasil langsung.\n\n• [Google](https://google.com/search?q=' + encodeURIComponent(query) + ')\n• [Wikipedia](https://id.wikipedia.org/w/index.php?search=' + encodeURIComponent(query) + ')';
            }
            addMessage('assistant', c, true);
            state.isTyping = false;
            updateSendBtn();
        })
        .catch(function(err) {
            removeTyping();
            addMessage('assistant', '❌ ' + err.message);
            state.isTyping = false;
            updateSendBtn();
        });
}

/* ═══ CHART ═══ */
function generateChart(prompt) {
    state.isTyping = true;
    updateSendBtn();
    showTyping();
    setTimeout(function() {
        removeTyping();
        var labels = ['2020', '2021', '2022', '2023', '2024', '2025'];
        var values = [];
        for (var i = 0; i < labels.length; i++) values.push(Math.floor(Math.random() * 80) + 20);
        var maxV = Math.max.apply(null, values);
        var c = '## 📊 "' + escapeHtml(prompt) + '"\n\n<div class="chart-container"><div class="chart-bars">';
        for (var i = 0; i < labels.length; i++) {
            var h = (values[i] / maxV) * 100;
            c += '<div class="chart-bar-wrap"><div class="chart-value">' + values[i] + '</div><div class="chart-bar" style="height:' + h + '%;"></div><div class="chart-label">' + labels[i] + '</div></div>';
        }
        c += '</div></div>\n\n> ⚠️ Demo dengan data random';
        addMessage('assistant', c, true);
        state.isTyping = false;
        updateSendBtn();
    }, 500);
}

/* ═══ PLAYGROUND ═══ */
function generatePlayground(prompt) {
    state.isTyping = true;
    updateSendBtn();
    showTyping();
    setTimeout(function() {
        removeTyping();
        var html = '<!DOCTYPE html><html><head><style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:linear-gradient(135deg,#d97757,#a85433);color:white;}h1{font-size:2.5em;text-align:center;}</style></head><body><h1>👋 Hello!<br><small style="font-size:0.5em;">' + escapeHtml(prompt) + '</small></h1></body></html>';
        var c = '## 🎮 "' + escapeHtml(prompt) + '"\n\n<div style="background:white;border-radius:10px;overflow:hidden;margin:10px 0;"><iframe srcdoc="' + escapeHtml(html) + '" style="width:100%;height:200px;border:none;"></iframe></div>\n\n> 💡 Demo preview';
        addMessage('assistant', c, true);
        state.isTyping = false;
        updateSendBtn();
    }, 500);
}

/* ═══ AI ═══ */
function getAIResponse(text, controller) {
    state.stats.totalMessages++;
    if (config.apiKey && config.apiKey.length > 10) callAPI(text, controller);
    else simulate(text);
}

function callAPI(text, controller) {
    var url = config.provider === 'groq' ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions';
    var apiMsgs = [{ role: 'system', content: personalities[state.currentPersonality] }];
    var hist = getCurrentMessages().slice(-10);
    for (var i = 0; i < hist.length; i++) {
        if (hist[i].role === 'user' || hist[i].role === 'assistant') {
            apiMsgs.push({ role: hist[i].role, content: hist[i].content });
        }
    }
    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + config.apiKey },
        body: JSON.stringify({ model: config.model, messages: apiMsgs, temperature: 0.7, max_tokens: 4096 }),
        signal: controller ? controller.signal : undefined
    })
    .then(function(res) {
        if (!res.ok) return res.json().catch(function() { return {}; }).then(function(d) { throw new Error((d.error && d.error.message) || 'HTTP ' + res.status); });
        return res.json();
    })
    .then(function(data) {
        removeTyping();
        addMessage('assistant', data.choices[0].message.content);
        state.isTyping = false;
        updateSendBtn();
        state.abortController = null;
    })
    .catch(function(err) {
        removeTyping();
        if (err.name === 'AbortError') { state.isTyping = false; updateSendBtn(); return; }
        addMessage('assistant', '⚠️ ' + err.message);
        state.isTyping = false;
        updateSendBtn();
        state.abortController = null;
    });
}

function simulate(text) {
    setTimeout(function() {
        removeTyping();
        addMessage('assistant', getSimResponse(text));
        state.isTyping = false;
        updateSendBtn();
    }, 800);
}

function getSimResponse(text) {
    var p = text.toLowerCase();
    if (/^(halo|hai|hello|hi|hey|pagi|siang|sore|malam)/.test(p)) {
        return 'Halo! 👋 Saya **CLOSIWER AI v5.0** — dibuat oleh **PANN**!\n\n### 🎯 Fitur Baru v5.0:\n• 🎵 **Music Player** — Spotify-like\n• 📝 **Notes** — Markdown editor\n• ✅ **Tasks** — Task manager\n• 📅 **Calendar** — Event & reminder\n• 🎮 **Mini Games** — Snake, 2048\n• 📊 **Analytics** — Stats penggunaan\n• 🌐 **Multi-Bahasa** — ID/EN/JP\n• ⌘ **Command Palette** — Ctrl+K\n• 🟢 **Matrix Rain** bg\n\n💡 **Aktifkan AI asli:**\n1. Klik **DEV**\n2. Daftar di [console.groq.com/keys](https://console.groq.com/keys)\n3. Paste → Simpan';
    }
    if (p.indexOf('pann') !== -1 || p.indexOf('pembuat') !== -1 || p.indexOf('creator') !== -1) {
        return '## 👨💻 Tentang Developer\n\n**PANN** adalah developer di balik **CLOSIWER AI v5.0**.\n\n### 🎯 Visi:\nAI **GRATIS 100%** untuk semua orang — tanpa batasan, tanpa paywall.\n\n### ✨ Fitur yang udah dibuat PANN:\n• ✅ Chat AI unlimited\n• ✅ Image generation gratis\n• ✅ Web search gratis\n• ✅ Multi-session\n• ✅ 5 tema warna\n• ✅ Animasi background (3 mode)\n• ✅ Music Player\n• ✅ Notes & Tasks\n• ✅ Calendar\n• ✅ Mini Games\n\n**Semua GRATIS, selamanya!** 🔥';
    }
    if (p.indexOf('integral') !== -1) {
        return '## 📐 Integral Solver\n\n**Soal:** ∫ (2x³ + 3x² - 5x + 7) dx\n\n### Step-by-step:\n```\n∫ 2x³ dx = x⁴/2\n∫ 3x² dx = x³\n∫ 5x dx  = 5x²/2\n∫ 7 dx   = 7x\n```\n\n✅ **Hasil: x⁴/2 + x³ - 5x²/2 + 7x + C**';
    }
    if (p.indexOf('react') !== -1 || p.indexOf('todo') !== -1) {
        return '## 💻 React Todo List\n\n```jsx\nimport { useState, useEffect } from "react";\n\nfunction TodoApp() {\n  const [todos, setTodos] = useState([]);\n  const [input, setInput] = useState("");\n\n  useEffect(() => {\n    const saved = localStorage.getItem("todos");\n    if (saved) setTodos(JSON.parse(saved));\n  }, []);\n\n  useEffect(() => {\n    localStorage.setItem("todos", JSON.stringify(todos));\n  }, [todos]);\n\n  return (\n    <div>\n      <input value={input} onChange={e => setInput(e.target.value)} />\n      <ul>{todos.map(t => <li key={t.id}>{t.text}</li>)}</ul>\n    </div>\n  );\n}\n```';
    }
    return '📝 **"' + escapeHtml(text) + '"**\n\nMode simulasi — untuk AI asli:\n\n1. Klik **DEV**\n2. Dapatkan key GRATIS di [console.groq.com/keys](https://console.groq.com/keys)\n3. Paste → Simpan\n\n### 🎯 Fitur baru v5.0:\n• 🎵 Music Player\n• 📝 Notes\n• ✅ Tasks\n• 📅 Calendar\n• 🎮 Games\n• 📊 Stats\n• ⌘ Command Palette (Ctrl+K)\n\n**Built by PANN** 💪';
}

/* ═══ RENDER MESSAGES ═══ */
function renderMessages() {
    var msgs = getCurrentMessages();
    var html = '';
    for (var i = 0; i < msgs.length; i++) html += renderMessage(msgs[i], i);
    document.getElementById('messages').innerHTML = html;
}

function renderMessage(msg, index) {
    var isUser = msg.role === 'user';
    var content = msg.isHtml ? msg.content : formatText(msg.content);
    var html = '<div class="message ' + (isUser ? 'user' : 'ai') + '">';
    html += '<div class="avatar">' + (isUser ? 'U' : '✦') + '</div>';
    html += '<div class="bubble">';
    html += '<div class="role">' + (isUser ? 'ANDA' : 'CLOSIWER') + '</div>';
    html += '<div class="content">' + content + '</div>';
    if (!isUser) {
        html += '<div class="msg-actions">';
        html += '<button class="msg-btn" onclick="copyMessage(' + index + ')">📋 Copy</button>';
        html += '<button class="msg-btn" onclick="speakMessage(' + index + ')">🔊 Dengar</button>';
        html += '<button class="msg-btn" onclick="regenMessage()">🔄 Ulang</button>';
        html += '</div>';
    }
    html += '</div></div>';
    return html;
}

function formatText(text) {
    var html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, function(m, lang, code) {
        return '<pre><div class="code-header"><span>' + (lang || 'code') + '</span><div class="code-actions"><button class="code-btn" onclick="copyCode(this)">📋 COPY</button><button class="code-btn" onclick="runPlayground(this)">▶️ RUN</button></div></div><code>' + code.trim() + '</code></pre>';
    });
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color:var(--primary);text-decoration:underline;">$1</a>');
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*?<\/li>)(?:\n|$)+/gs, function(m) { return '<ul>' + m + '</ul>'; });
    var blocks = html.split('\n\n');
    var result = '';
    for (var i = 0; i < blocks.length; i++) {
        var b = blocks[i].trim();
        if (!b) continue;
        if (/^<(pre|ul|ol|h1|h2|h3|blockquote|div|img|p)/.test(b)) result += b;
        else result += '<p>' + b.replace(/\n/g, '<br>') + '</p>';
    }
    return result;
}

function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function copyCode(btn) {
    var code = btn.closest('pre').querySelector('code').textContent;
    copyToClipboard(code, 'Kode disalin!');
}

function runPlayground(btn) {
    var code = btn.closest('pre').querySelector('code').textContent;
    if (code.match(/<!DOCTYPE|<html|<body|<div/i)) {
        var w = window.open('', '_blank');
        w.document.write(code);
        w.document.close();
        showToast('▶️ Preview');
    } else showToast('⚠️ Hanya HTML');
}

function copyMessage(i) {
    copyToClipboard(getCurrentMessages()[i].content, 'Disalin!');
}

function speakMessage(i) {
    if (!('speechSynthesis' in window)) { showToast('❌ TTS tidak support'); return; }
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(getCurrentMessages()[i].content.slice(0, 500).replace(/[#*`]/g, ''));
    u.lang = 'id-ID';
    speechSynthesis.speak(u);
    showToast('🔊 Membaca');
}

function regenMessage() {
    var msgs = getCurrentMessages();
    if (msgs.length < 2) return;
    msgs.pop();
    var last = msgs[msgs.length - 1];
    msgs.pop();
    document.getElementById('input').value = last.content;
    onInput();
    renderMessages();
    updateCurrentSession(msgs);
    sendMessage();
}

function copyToClipboard(text, msg) {
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(function() { showToast('✅ ' + msg); }).catch(function() { fallbackCopy(text, msg); });
    else fallbackCopy(text, msg);
}

function fallbackCopy(text, msg) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); showToast('✅ ' + msg); } catch(e) { showToast('❌ Gagal'); }
    document.body.removeChild(ta);
}

function showTyping() {
    var el = document.createElement('div');
    el.className = 'message ai';
    el.id = 'typing';
    el.innerHTML = '<div class="avatar">✦</div><div class="bubble"><div class="role">CLOSIWER</div><div class="typing"><span></span><span></span><span></span></div></div>';
    document.getElementById('messages').appendChild(el);
    scrollBottom();
}

function removeTyping() {
    var el = document.getElementById('typing');
    if (el) el.remove();
}

function scrollBottom() {
    var area = document.getElementById('chatArea');
    setTimeout(function() { area.scrollTop = area.scrollHeight; }, 50);
}

/* ═══ EXPORT ═══ */
function exportChat() {
    var all = [];
    for (var i = 0; i < state.sessions.length; i++) {
        all.push('## 📁 ' + state.sessions[i].title + '\n');
        for (var j = 0; j < state.sessions[i].messages.length; j++) {
            var m = state.sessions[i].messages[j];
            all.push('### ' + (m.role === 'user' ? '👤' : '🤖') + '\n\n' + m.content + '\n');
        }
        all.push('---\n');
    }
    var text = '# CLOSIWER AI v5.0 by PANN\n\n' + new Date().toLocaleString('id-ID') + '\n\n---\n\n' + all.join('\n');
    var blob = new Blob([text], { type: 'text/markdown' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'closiwer-' + Date.now() + '.md';
    a.click(); URL.revokeObjectURL(url);
    showToast('📥 Exported!');
}

/* ═══ TOAST ═══ */
var toastTimeout;
function showToast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(function() { t.classList.remove('show'); }, 2000);
}

/* ═══ PANELS ═══ */
function renderMusicPanel() {
    var tracks = [
        { title: 'Chill Vibes', artist: 'Lo-Fi Beats', duration: '3:24', emoji: '🎧' },
        { title: 'Coding Mode', artist: 'Synthwave', duration: '4:12', emoji: '💻' },
        { title: 'Focus Flow', artist: 'Ambient', duration: '5:30', emoji: '🧘' },
        { title: 'Night Drive', artist: 'Retrowave', duration: '3:58', emoji: '🌃' },
        { title: 'Morning Coffee', artist: 'Jazz', duration: '4:45', emoji: '☕' },
        { title: 'Rain & Piano', artist: 'Relaxing', duration: '6:15', emoji: '🌧️' }
    ];
    var html = '<div class="panel"><div class="panel-header"><div class="panel-icon">🎵</div><div><div class="panel-title">Music Player</div><div class="panel-subtitle">Curated playlist untuk coding</div></div></div>';
    html += '<div class="music-player">';
    html += '<div class="now-playing"><div class="album-art">🎵</div><div class="now-info"><div class="now-title">Pilih lagu untuk mulai</div><div class="now-artist">Music Player v1.0</div></div></div>';
    html += '<div class="music-progress"><div class="music-progress-fill" id="musicProgress"></div></div>';
    html += '<div class="music-controls">';
    html += '<button class="music-btn" onclick="musicAction(\'prev\')">⏮️</button>';
    html += '<button class="music-btn play" onclick="musicAction(\'play\')">▶️</button>';
    html += '<button class="music-btn" onclick="musicAction(\'next\')">⏭️</button>';
    html += '</div>';
    html += '<div class="playlist">';
    for (var i = 0; i < tracks.length; i++) {
        html += '<div class="playlist-item" onclick="playTrack(' + i + ')"><span class="playlist-num">' + (i+1) + '</span><div class="playlist-info"><div class="playlist-title">' + tracks[i].emoji + ' ' + tracks[i].title + '</div><div class="playlist-artist">' + tracks[i].artist + '</div></div><span class="playlist-duration">' + tracks[i].duration + '</span></div>';
    }
    html += '</div>';
    html += '<div style="text-align:center;font-size:11px;color:var(--text-muted);">⚠️ Demo playlist — tidak memutar audio real (biar hemat bandwidth)</div>';
    html += '</div></div>';
    document.getElementById('panelContainer').innerHTML = html;
}

var musicPlaying = false;
var musicInterval = null;
function playTrack(i) {
    showToast('🎵 Track ' + (i+1) + ' dipilih');
    musicPlaying = true;
    var btn = document.querySelector('.music-btn.play');
    if (btn) btn.textContent = '⏸️';
    if (musicInterval) clearInterval(musicInterval);
    var progress = 0;
    musicInterval = setInterval(function() {
        if (!musicPlaying) return;
        progress += 0.5;
        if (progress > 100) { progress = 0; musicPlaying = false; if (btn) btn.textContent = '▶️'; }
        var el = document.getElementById('musicProgress');
        if (el) el.style.width = progress + '%';
    }, 100);
}

function musicAction(action) {
    if (action === 'play') {
        musicPlaying = !musicPlaying;
        var btn = document.querySelector('.music-btn.play');
        if (btn) btn.textContent = musicPlaying ? '⏸️' : '▶️';
        showToast(musicPlaying ? '▶️ Play' : '⏸️ Pause');
    } else showToast('⏭️ ' + action);
}

function renderNotesPanel() {
    var saved = localStorage.getItem('closiwer_notes') || '';
    var html = '<div class="panel"><div class="panel-header"><div class="panel-icon">📝</div><div><div class="panel-title">Notes Editor</div><div class="panel-subtitle">Markdown • Auto-save</div></div></div>';
    html += '<div class="notes-editor">';
    html += '<div class="notes-toolbar">';
    html += '<button class="notes-tool" onclick="insertNote(\'**bold**\')"><b>B</b></button>';
    html += '<button class="notes-tool" onclick="insertNote(\'*italic*\')"><i>I</i></button>';
    html += '<button class="notes-tool" onclick="insertNote(\'# Heading\\n\')">H1</button>';
    html += '<button class="notes-tool" onclick="insertNote(\'- item\\n\')">List</button>';
    html += '<button class="notes-tool" onclick="insertNote(\'`code`\')">Code</button>';
    html += '<button class="notes-tool" onclick="insertNote(\'[link](url)\')">Link</button>';
    html += '<button class="notes-tool" onclick="clearNotes()">🗑️</button>';
    html += '</div>';
    html += '<textarea class="notes-textarea" id="notesTextarea" placeholder="# Catatan saya...\n\nTulis apapun di sini. Auto-save." oninput="saveNotes(this.value)">' + escapeHtml(saved) + '</textarea>';
    html += '<div class="notes-status" id="notesStatus">' + (saved ? '✓ Tersimpan (' + saved.length + ' karakter)' : 'Belum ada catatan') + '</div>';
    html += '</div></div>';
    document.getElementById('panelContainer').innerHTML = html;
}

function saveNotes(text) {
    localStorage.setItem('closiwer_notes', text);
    var el = document.getElementById('notesStatus');
    if (el) el.textContent = '✓ Tersimpan (' + text.length + ' karakter)';
}

function insertNote(text) {
    var ta = document.getElementById('notesTextarea');
    if (!ta) return;
    var start = ta.selectionStart;
    var end = ta.selectionEnd;
    ta.value = ta.value.slice(0, start) + text + ta.value.slice(end);
    ta.selectionStart = ta.selectionEnd = start + text.length;
    ta.focus();
    saveNotes(ta.value);
}

function clearNotes() {
    if (!confirm('Hapus semua catatan?')) return;
    var ta = document.getElementById('notesTextarea');
    if (ta) ta.value = '';
    saveNotes('');
    showToast('🗑️ Catatan dihapus');
}

function renderTasksPanel() {
    var tasks = JSON.parse(localStorage.getItem('closiwer_tasks') || '[]');
    var html = '<div class="panel"><div class="panel-header"><div class="panel-icon">✅</div><div><div class="panel-title">Task Manager</div><div class="panel-subtitle">' + tasks.filter(function(t) { return !t.done; }).length + ' aktif · ' + tasks.filter(function(t) { return t.done; }).length + ' selesai</div></div></div>';
    html += '<div class="tasks-container">';
    html += '<div class="task-input-wrap"><input class="task-input" id="taskInput" placeholder="Tambah task baru..." onkeydown="if(event.key===\'Enter\')addTask()"><button class="task-add-btn" onclick="addTask()">+ Tambah</button></div>';
    html += '<div class="task-list" id="taskList">';
    for (var i = 0; i < tasks.length; i++) {
        html += '<div class="task-item' + (tasks[i].done ? ' done' : '') + '">';
        html += '<div class="task-checkbox' + (tasks[i].done ? ' checked' : '') + '" onclick="toggleTask(' + i + ')">' + (tasks[i].done ? '✓' : '') + '</div>';
        html += '<div class="task-text">' + escapeHtml(tasks[i].text) + '</div>';
        html += '<button class="task-delete" onclick="deleteTask(' + i + ')">🗑️</button>';
        html += '</div>';
    }
    if (tasks.length === 0) html += '<div style="text-align:center;padding:30px;color:var(--text-muted);font-size:12px;">Belum ada task. Tambah di atas! 👆</div>';
    html += '</div>';
    html += '<div class="task-stats"><span>Total: <strong>' + tasks.length + '</strong></span><span>Aktif: <strong>' + tasks.filter(function(t){return !t.done;}).length + '</strong></span><span>Selesai: <strong>' + tasks.filter(function(t){return t.done;}).length + '</strong></span></div>';
    html += '</div></div>';
    document.getElementById('panelContainer').innerHTML = html;
}

function addTask() {
    var input = document.getElementById('taskInput');
    if (!input || !input.value.trim()) return;
    var tasks = JSON.parse(localStorage.getItem('closiwer_tasks') || '[]');
    tasks.push({ text: input.value.trim(), done: false, created: Date.now() });
    localStorage.setItem('closiwer_tasks', JSON.stringify(tasks));
    renderTasksPanel();
    showToast('✅ Task ditambahkan');
}

function toggleTask(i) {
    var tasks = JSON.parse(localStorage.getItem('closiwer_tasks') || '[]');
    tasks[i].done = !tasks[i].done;
    localStorage.setItem('closiwer_tasks', JSON.stringify(tasks));
    renderTasksPanel();
}

function deleteTask(i) {
    var tasks = JSON.parse(localStorage.getItem('closiwer_tasks') || '[]');
    tasks.splice(i, 1);
    localStorage.setItem('closiwer_tasks', JSON.stringify(tasks));
    renderTasksPanel();
}

function renderCalendarPanel() {
    var now = new Date();
    var month = now.getMonth();
    var year = now.getFullYear();
    var monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    var dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    
    var firstDay = new Date(year, month, 1).getDay();
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var today = now.getDate();
    
    var html = '<div class="panel"><div class="panel-header"><div class="panel-icon">📅</div><div><div class="panel-title">Kalender</div><div class="panel-subtitle">' + monthNames[month] + ' ' + year + '</div></div></div>';
    html += '<div class="calendar">';
    html += '<div class="cal-header"><div class="cal-title">' + monthNames[month] + ' ' + year + '</div><div class="cal-nav"><button class="cal-nav-btn" onclick="showToast(\'Prev month\')">‹</button><button class="cal-nav-btn" onclick="showToast(\'Next month\')">›</button></div></div>';
    html += '<div class="cal-grid">';
    for (var d = 0; d < 7; d++) html += '<div class="cal-day-name">' + dayNames[d] + '</div>';
    for (var i = 0; i < firstDay; i++) html += '<div class="cal-day other-month"></div>';
    for (var day = 1; day <= daysInMonth; day++) {
        var cls = 'cal-day' + (day === today ? ' today' : '');
        html += '<div class="' + cls + '" onclick="showToast(\'📅 ' + day + ' ' + monthNames[month] + '\')">' + day + '</div>';
    }
    html += '</div></div></div>';
    document.getElementById('panelContainer').innerHTML = html;
}

function renderGamesPanel() {
    var html = '<div class="panel"><div class="panel-header"><div class="panel-icon">🎮</div><div><div class="panel-title">Mini Games</div><div class="panel-subtitle">Break time! Main game dulu 🎯</div></div></div>';
    html += '<div class="games-grid">';
    html += '<div class="game-card" onclick="startSnake()"><div class="game-icon">🐍</div><div class="game-name">Snake</div><div class="game-desc">Klasik & seru</div></div>';
    html += '<div class="game-card" onclick="start2048()"><div class="game-icon">🔢</div><div class="game-name">2048</div><div class="game-desc">Puzzle angka</div></div>';
    html += '<div class="game-card" onclick="showToast(\'🚧 Coming soon!\')"><div class="game-icon">🧩</div><div class="game-name">Tetris</div><div class="game-desc">Coming soon</div></div>';
    html += '<div class="game-card" onclick="showToast(\'🚧 Coming soon!\')"><div class="game-icon">🎯</div><div class="game-name">Aim Trainer</div><div class="game-desc">Coming soon</div></div>';
    html += '</div></div>';
    document.getElementById('panelContainer').innerHTML = html;
}

var snakeGame = null;
function startSnake() {
    var html = '<div class="panel"><div class="panel-header"><div class="panel-icon">🐍</div><div><div class="panel-title">Snake Game</div><div class="panel-subtitle">Pakai arrow keys / swipe</div></div><button class="notes-tool" onclick="renderGamesPanel()">← Kembali</button></div>';
    html += '<div class="game-score">Score: <span id="snakeScore">0</span></div>';
    html += '<canvas class="snake-canvas" id="snakeCanvas" width="300" height="300"></canvas>';
    html += '<div class="game-controls">';
    html += '<button class="game-btn" onclick="changeDir(\'up\')">⬆️</button>';
    html += '<button class="game-btn" onclick="changeDir(\'left\')">⬅️</button>';
    html += '<button class="game-btn" onclick="changeDir(\'down\')">⬇️</button>';
    html += '<button class="game-btn" onclick="changeDir(\'right\')">➡️</button>';
    html += '</div>';
    html += '<div style="text-align:center;margin-top:12px;"><button class="task-add-btn" onclick="startSnake()">🔄 Restart</button></div>';
    html += '</div>';
    document.getElementById('panelContainer').innerHTML = html;
    
    var canvas = document.getElementById('snakeCanvas');
    var ctx = canvas.getContext('2d');
    var gridSize = 15;
    var cellSize = 20;
    var snake = [{x: 7, y: 7}];
    var dir = {x: 1, y: 0};
    var nextDir = {x: 1, y: 0};
    var food = {x: 10, y: 10};
    var score = 0;
    
    window.changeDir = function(d) {
        if (d === 'up' && dir.y !== 1) nextDir = {x: 0, y: -1};
        else if (d === 'down' && dir.y !== -1) nextDir = {x: 0, y: 1};
        else if (d === 'left' && dir.x !== 1) nextDir = {x: -1, y: 0};
        else if (d === 'right' && dir.x !== -1) nextDir = {x: 1, y: 0};
    };
    
    function draw() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 300, 300);
        ctx.fillStyle = '#d97757';
        ctx.fillRect(food.x * cellSize + 2, food.y * cellSize + 2, cellSize - 4, cellSize - 4);
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#d97757';
        for (var i = 0; i < snake.length; i++) {
            ctx.fillStyle = i === 0 ? '#fff' : (getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#d97757');
            ctx.fillRect(snake[i].x * cellSize + 2, snake[i].y * cellSize + 2, cellSize - 4, cellSize - 4);
        }
    }
    
    function update() {
        dir = nextDir;
        var head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};
        if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) { gameOver(); return; }
        for (var i = 0; i < snake.length; i++) {
            if (snake[i].x === head.x && snake[i].y === head.y) { gameOver(); return; }
        }
        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            document.getElementById('snakeScore').textContent = score;
            food = {x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize)};
        } else snake.pop();
        draw();
    }
    
    function gameOver() {
        if (snakeGame) clearInterval(snakeGame);
        showToast('🎮 Game Over! Score: ' + score);
    }
    
    if (snakeGame) clearInterval(snakeGame);
    snakeGame = setInterval(update, 150);
    draw();
}

function start2048() {
    showToast('🚧 2048 coming soon!');
}

function renderStatsPanel() {
    var uptime = Math.floor((Date.now() - state.stats.sessionStart) / 1000);
    var mins = Math.floor(uptime / 60);
    var html = '<div class="panel"><div class="panel-header"><div class="panel-icon">📊</div><div><div class="panel-title">Analytics Dashboard</div><div class="panel-subtitle">Statistik penggunaan CLOSIWER</div></div></div>';
    html += '<div class="stats-grid">';
    html += '<div class="stat-card"><div class="stat-val">' + state.stats.totalMessages + '</div><div class="stat-label">Total Pesan</div></div>';
    html += '<div class="stat-card"><div class="stat-val">' + state.stats.imagesGenerated + '</div><div class="stat-label">Gambar</div></div>';
    html += '<div class="stat-card"><div class="stat-val">' + state.stats.searches + '</div><div class="stat-label">Pencarian</div></div>';
    html += '<div class="stat-card"><div class="stat-val">' + mins + 'm</div><div class="stat-label">Uptime</div></div>';
    html += '</div>';
    html += '<div style="background:var(--bg-base);padding:16px;border-radius:12px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:12px;text-transform:uppercase;letter-spacing:1px;">Aktivitas 7 hari</div>';
    html += '<div class="stats-bar-chart">';
    for (var i = 0; i < 7; i++) {
        var h = Math.floor(Math.random() * 80) + 20;
        html += '<div class="stat-bar" style="height:' + h + '%"></div>';
    }
    html += '</div></div>';
    html += '<div style="margin-top:12px;font-size:11px;color:var(--text-muted);text-align:center;">Powered by CLOSIWER Analytics™</div>';
    html += '</div>';
    document.getElementById('panelContainer').innerHTML = html;
}

/* ═══ COMMAND PALETTE ═══ */
var commands = [
    { icon: '💬', label: 'Buka Chat', action: function() { setTool('chat', document.querySelectorAll('.tool-chip')[0]); } },
    { icon: '🖼️', label: 'Generate Gambar', action: function() { setTool('image', document.querySelectorAll('.tool-chip')[1]); } },
    { icon: '🌐', label: 'Web Search', action: function() { setTool('search', document.querySelectorAll('.tool-chip')[2]); } },
    { icon: '📊', label: 'Chart Generator', action: function() { setTool('chart', document.querySelectorAll('.tool-chip')[3]); } },
    { icon: '🎮', label: 'Code Playground', action: function() { setTool('playground', document.querySelectorAll('.tool-chip')[4]); } },
    { icon: '🎵', label: 'Music Player', action: function() { setTool('music', document.querySelectorAll('.tool-chip')[5]); } },
    { icon: '📝', label: 'Notes Editor', action: function() { setTool('notes', document.querySelectorAll('.tool-chip')[6]); } },
    { icon: '✅', label: 'Task Manager', action: function() { setTool('tasks', document.querySelectorAll('.tool-chip')[7]); } },
    { icon: '📅', label: 'Calendar', action: function() { setTool('calendar', document.querySelectorAll('.tool-chip')[8]); } },
    { icon: '🎮', label: 'Mini Games', action: function() { setTool('games', document.querySelectorAll('.tool-chip')[9]); } },
    { icon: '📊', label: 'Statistics', action: function() { setTool('stats', document.querySelectorAll('.tool-chip')[10]); } },
    { icon: '🌙', label: 'Toggle Theme', action: toggleTheme },
    { icon: '⚙️', label: 'Settings', action: openSettings },
    { icon: '🔧', label: 'Dev Settings', action: openDev },
    { icon: '✨', label: 'Chat Baru', action: newSession },
    { icon: '📥', label: 'Export Chat', action: exportChat }
];

function openCommandPalette() {
    document.getElementById('commandModal').classList.add('show');
    var input = document.getElementById('commandInput');
    input.value = '';
    input.focus();
    renderCommands(commands);
}

function renderCommands(list) {
    var html = '';
    for (var i = 0; i < list.length; i++) {
        html += '<div class="command-item" onclick="executeCommand(' + commands.indexOf(list[i]) + ')"><span class="command-icon">' + list[i].icon + '</span><span class="command-label">' + list[i].label + '</span></div>';
    }
    document.getElementById('commandList').innerHTML = html;
}

function filterCommands(query) {
    if (!query) { renderCommands(commands); return; }
    var q = query.toLowerCase();
    var filtered = commands.filter(function(c) { return c.label.toLowerCase().indexOf(q) !== -1; });
    renderCommands(filtered);
}

function executeCommand(idx) {
    var cmd = commands[idx];
    if (cmd && cmd.action) {
        closeModal('commandModal');
        setTimeout(cmd.action, 100);
    }
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); openCommandPalette(); }
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); toggleSidebar(); }
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(function(m) { m.classList.remove('show'); });
            document.getElementById('sidebar').classList.remove('open');
        }
    });
}

console.log('CLOSIWER AI v5.0 by PANN ready! ✅');

/* ═══════════════════════════════════════
   FITUR #1: COLOR PALETTE GENERATOR
═══════════════════════════════════════ */

var cpCurrentPalette = [];

function cpSetTab(tab, el) {
    document.querySelectorAll('.cp-tab').forEach(function(t) { t.classList.remove('active'); });
    document.querySelectorAll('.cp-content').forEach(function(c) { c.classList.remove('active'); });
    el.classList.add('active');
    var content = document.querySelector('.cp-content[data-tab="' + tab + '"]');
    if (content) content.classList.add('active');
}

/* Color conversion helpers */
function cpHexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(function(c) { return c + c; }).join('');
    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);
    return { r: r, g: g, b: b };
}

function cpRgbToHex(r, g, b) {
    return '#' + [r, g, b].map(function(x) {
        var h = Math.max(0, Math.min(255, Math.round(x))).toString(16);
        return h.length === 1 ? '0' + h : h;
    }).join('');
}

function cpRgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function cpHslToHex(h, s, l) {
    s /= 100; l /= 100;
    var c = (1 - Math.abs(2 * l - 1)) * s;
    var x = c * (1 - Math.abs((h / 60) % 2 - 1));
    var m = l - c / 2;
    var r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    return cpRgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
}

function cpRelativeLuminance(hex) {
    var rgb = cpHexToRgb(hex);
    var a = [rgb.r, rgb.g, rgb.b].map(function(v) {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function cpContrastRatio(hex1, hex2) {
    var l1 = cpRelativeLuminance(hex1);
    var l2 = cpRelativeLuminance(hex2);
    var lighter = Math.max(l1, l2);
    var darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

/* Palette generators */
function cpGenerateMonochromatic(baseHex) {
    var hsl = cpRgbToHsl(cpHexToRgb(baseHex).r, cpHexToRgb(baseHex).g, cpHexToRgb(baseHex).b);
    return [
        cpHslToHex(hsl.h, hsl.s, 20),
        cpHslToHex(hsl.h, hsl.s, 40),
        cpHslToHex(hsl.h, hsl.s, 60),
        cpHslToHex(hsl.h, hsl.s, 80),
        cpHslToHex(hsl.h, hsl.s, 95)
    ];
}

function cpGenerateComplementary(baseHex) {
    var rgb = cpHexToRgb(baseHex);
    var hsl = cpRgbToHsl(rgb.r, rgb.g, rgb.b);
    return [
        baseHex,
        cpHslToHex((hsl.h + 180) % 360, hsl.s, hsl.l),
        cpHslToHex(hsl.h, hsl.s, Math.min(100, hsl.l + 20)),
        cpHslToHex((hsl.h + 180) % 360, hsl.s, Math.min(100, hsl.l + 20)),
        cpHslToHex(hsl.h, hsl.s, Math.max(0, hsl.l - 20))
    ];
}

function cpGenerateTriadic(baseHex) {
    var rgb = cpHexToRgb(baseHex);
    var hsl = cpRgbToHsl(rgb.r, rgb.g, rgb.b);
    return [
        baseHex,
        cpHslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
        cpHslToHex((hsl.h + 240) % 360, hsl.s, hsl.l),
        cpHslToHex(hsl.h, hsl.s, Math.min(100, hsl.l + 25)),
        cpHslToHex((hsl.h + 120) % 360, hsl.s, Math.min(100, hsl.l + 25))
    ];
}

function cpGenerateAnalogous(baseHex) {
    var rgb = cpHexToRgb(baseHex);
    var hsl = cpRgbToHsl(rgb.r, rgb.g, rgb.b);
    return [
        cpHslToHex((hsl.h - 40 + 360) % 360, hsl.s, hsl.l),
        cpHslToHex((hsl.h - 20 + 360) % 360, hsl.s, hsl.l),
        baseHex,
        cpHslToHex((hsl.h + 20) % 360, hsl.s, hsl.l),
        cpHslToHex((hsl.h + 40) % 360, hsl.s, hsl.l)
    ];
}

function cpGenerateTetradic(baseHex) {
    var rgb = cpHexToRgb(baseHex);
    var hsl = cpRgbToHsl(rgb.r, rgb.g, rgb.b);
    return [
        baseHex,
        cpHslToHex((hsl.h + 90) % 360, hsl.s, hsl.l),
        cpHslToHex((hsl.h + 180) % 360, hsl.s, hsl.l),
        cpHslToHex((hsl.h + 270) % 360, hsl.s, hsl.l),
        cpHslToHex(hsl.h, hsl.s, Math.min(100, hsl.l + 25))
    ];
}

function cpGenerateRandom(baseHex) {
    var rgb = cpHexToRgb(baseHex);
    var hsl = cpRgbToHsl(rgb.r, rgb.g, rgb.b);
    var colors = [baseHex];
    for (var i = 0; i < 4; i++) {
        colors.push(cpHslToHex(Math.floor(Math.random() * 360), 40 + Math.random() * 50, 30 + Math.random() * 50));
    }
    return colors;
}

function cpShowPalette(colors, source) {
    cpCurrentPalette = colors;
    document.getElementById('cpResult').style.display = 'block';
    var html = '';
    for (var i = 0; i < colors.length; i++) {
        var hex = colors[i];
        var rgb = cpHexToRgb(hex);
        var hsl = cpRgbToHsl(rgb.r, rgb.g, rgb.b);
        var textColor = cpRelativeLuminance(hex) > 0.5 ? '#000' : '#fff';
        html += '<div class="cp-color" style="background: ' + hex + ';" onclick="cpCopyColor(\'' + hex + '\')">';
        html += '<div class="cp-color-info" style="color: ' + textColor + ';">';
        html += '<div>' + hex.toUpperCase() + '</div>';
        html += '<div style="opacity: 0.8;">RGB(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ')</div>';
        html += '<div style="opacity: 0.8;">HSL(' + hsl.h + ',' + hsl.s + '%,' + hsl.l + '%)</div>';
        html += '</div></div>';
    }
    document.getElementById('cpPalette').innerHTML = html;

    /* Contrast checker */
    var contrastHtml = '';
    for (var i = 0; i < colors.length; i++) {
        var cRatio = cpContrastRatio(colors[i], '#ffffff');
        var cRatioDark = cpContrastRatio(colors[i], '#000000');
        var best = cRatio > cRatioDark ? cRatio : cRatioDark;
        var bgLabel = cRatio > cRatioDark ? 'putih' : 'hitam';
        var badge = best >= 7 ? 'aaa' : (best >= 4.5 ? 'aa' : 'fail');
        var badgeText = best >= 7 ? 'AAA ✓' : (best >= 4.5 ? 'AA ✓' : 'FAIL ✗');
        contrastHtml += '<div class="cp-contrast-row">';
        contrastHtml += '<div style="width: 24px; height: 24px; border-radius: 6px; background: ' + colors[i] + '; border: 1px solid var(--border);"></div>';
        contrastHtml += '<span style="flex: 1; font-family: monospace;">' + colors[i].toUpperCase() + '</span>';
        contrastHtml += '<span style="font-size: 10px; color: var(--text-muted);">vs ' + bgLabel + ': ' + best.toFixed(2) + ':1</span>';
        contrastHtml += '<span class="cp-contrast-badge ' + badge + '">' + badgeText + '</span>';
        contrastHtml += '</div>';
    }
    document.getElementById('cpContrastResults').innerHTML = contrastHtml;

    showToast('🎨 Palette dari: ' + source);
    closeModal('colorPaletteModal');
}

function cpFromText() {
    var text = document.getElementById('cpTextInput').value.trim();
    if (!text) { showToast('⚠️ Isi deskripsi dulu'); return; }
    /* Simple keyword mapping - bisa upgrade pakai AI nanti */
    var keywordMap = {
        sunset: ['#ff6b35', '#f7931e', '#ffd23f', '#c73e1d', '#3d1e1e'],
        ocean: ['#0077b6', '#00b4d8', '#90e0ef', '#caf0f8', '#03045e'],
        forest: ['#2d6a4f', '#40916c', '#74c69d', '#b7e4c7', '#d8f3dc'],
        cyberpunk: ['#ff006e', '#8338ec', '#3a86ff', '#fb5607', '#ffbe0b'],
        pastel: ['#ffb3ba', '#ffdfba', '#ffffba', '#baffc9', '#bae1ff'],
        neon: ['#ff073a', '#00ff88', '#00d4ff', '#ff00ff', '#ffff00'],
        coffee: ['#3e2723', '#5d4037', '#8d6e63', '#bcaaa4', '#d7ccc8'],
        sakura: ['#ffb7c5', '#ffc9d4', '#ffdae0', '#ffe8ec', '#fff0f3'],
        dark: ['#0a0a0f', '#1a1a24', '#2a2a38', '#3a3a4a', '#4a4a5a'],
        gradien: ['#ff8c5a', '#a855f7', '#6366f1', '#0ea5e9', '#10b981'],
        malam: ['#0f172a', '#1e293b', '#334155', '#64748b', '#94a3b8'],
        pagi: ['#fef3c7', '#fde68a', '#fbbf24', '#f59e0b', '#d97706'],
        bali: ['#f59e0b', '#dc2626', '#7c2d12', '#0891b2', '#0e7490'],
        gunung: ['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'],
        api: ['#7f1d1d', '#dc2626', '#f59e0b', '#fbbf24', '#fef3c7'],
        es: ['#0c4a6e', '#0ea5e9', '#38bdf8', '#7dd3fc', '#e0f2fe']
    };
    var lowerText = text.toLowerCase();
    for (var keyword in keywordMap) {
        if (lowerText.indexOf(keyword) !== -1) {
            cpShowPalette(keywordMap[keyword], '"' + keyword + '"');
            return;
        }
    }
    /* Fallback: hash text jadi warna */
    var hash = 0;
    for (var i = 0; i < text.length; i++) hash = text.charCodeAt(i) + ((hash << 5) - hash);
    var h = Math.abs(hash) % 360;
    var generated = [];
    for (var i = 0; i < 5; i++) {
        generated.push(cpHslToHex((h + i * 25) % 360, 60 + Math.random() * 20, 30 + i * 12));
    }
    cpShowPalette(generated, '"' + text + '"');
}

function cpFromImage(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
        var img = new Image();
        img.onload = function() {
            var previewWrap = document.getElementById('cpImagePreview');
            previewWrap.innerHTML = '<img src="' + ev.target.result + '" alt="preview">';
            
            /* Extract colors via canvas */
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            var w = canvas.width = 100;
            var h = canvas.height = 100 * (img.height / img.width);
            ctx.drawImage(img, 0, 0, w, h);
            var imageData = ctx.getImageData(0, 0, w, h).data;
            
            /* Quantize colors */
            var colorBuckets = {};
            for (var i = 0; i < imageData.length; i += 16) {
                var r = Math.round(imageData[i] / 32) * 32;
                var g = Math.round(imageData[i + 1] / 32) * 32;
                var b = Math.round(imageData[i + 2] / 32) * 32;
                var key = r + ',' + g + ',' + b;
                colorBuckets[key] = (colorBuckets[key] || 0) + 1;
            }
            
            var sortedColors = Object.keys(colorBuckets).sort(function(a, b) {
                return colorBuckets[b] - colorBuckets[a];
            }).slice(0, 5);
            
            var palette = sortedColors.map(function(key) {
                var parts = key.split(',');
                return cpRgbToHex(parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]));
            });
            
            while (palette.length < 5) palette.push(cpRgbToHex(100, 100, 100));
            
            cpShowPalette(palette, 'Gambar: ' + file.name);
        };
        img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
}

function cpFromBase() {
    var base = document.getElementById('cpBaseColor').value;
    var harmony = document.getElementById('cpHarmony').value;
    var palette;
    switch (harmony) {
        case 'monochromatic': palette = cpGenerateMonochromatic(base); break;
        case 'complementary': palette = cpGenerateComplementary(base); break;
        case 'triadic': palette = cpGenerateTriadic(base); break;
        case 'analogous': palette = cpGenerateAnalogous(base); break;
        case 'tetradic': palette = cpGenerateTetradic(base); break;
        case 'random': palette = cpGenerateRandom(base); break;
        default: palette = cpGenerateComplementary(base);
    }
    cpShowPalette(palette, 'Base: ' + base);
}

function cpCopyColor(hex) {
    copyToClipboard(hex, 'Warna ' + hex + ' disalin!');
}

function cpCopyAll() {
    var text = cpCurrentPalette.map(function(c, i) { return 'Color ' + (i + 1) + ': ' + c; }).join('\n');
    copyToClipboard(text, 'Semua warna disalin!');
}

function cpExport(format) {
    if (cpCurrentPalette.length === 0) { showToast('⚠️ Generate palette dulu'); return; }
    var content = '';
    var filename = '';
    var mime = 'text/plain';
    
    switch (format) {
        case 'css':
            content = ':root {\n';
            cpCurrentPalette.forEach(function(c, i) { content += '  --color-' + (i + 1) + ': ' + c + ';\n'; });
            content += '}';
            filename = 'palette.css';
            mime = 'text/css';
            break;
        case 'tailwind':
            content = 'module.exports = {\n  theme: {\n    extend: {\n      colors: {\n';
            cpCurrentPalette.forEach(function(c, i) { content += '        custom' + (i + 1) + ": '" + c + "',\n"; });
            content += '      }\n    }\n  }\n}';
            filename = 'tailwind.config.js';
            mime = 'text/javascript';
            break;
        case 'json':
            content = JSON.stringify({ palette: cpCurrentPalette, generated: new Date().toISOString() }, null, 2);
            filename = 'palette.json';
            mime = 'application/json';
            break;
        case 'svg':
            content = '<svg xmlns="http://www.w3.org/2000/svg" width="500" height="100" viewBox="0 0 500 100">\n';
            cpCurrentPalette.forEach(function(c, i) {
                content += '  <rect x="' + (i * 100) + '" y="0" width="100" height="100" fill="' + c + '"/>\n';
            });
            content += '</svg>';
            filename = 'palette.svg';
            mime = 'image/svg+xml';
            break;
    }
    
    var blob = new Blob([content], { type: mime });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📥 ' + filename + ' didownload!');
}

/* ═══════════════════════════════════════
   FITUR #2: AVATAR GENERATOR
═══════════════════════════════════════ */

var avatarGallery = JSON.parse(localStorage.getItem('closiwer_avatars') || '[]');

function generateAvatars() {
    var desc = document.getElementById('avatarDesc').value.trim();
    if (!desc) { showToast('⚠️ Isi deskripsi dulu'); return; }
    
    var style = document.getElementById('avatarStyle').value;
    var count = parseInt(document.getElementById('avatarCount').value);
    var size = document.getElementById('avatarSize').value;
    
    var styleMap = {
        anime: 'anime style, high quality, detailed, vibrant colors',
        realistic: 'realistic photo, professional portrait, detailed',
        pixel: 'pixel art, 8-bit style, retro game aesthetic',
        '3d': '3D render, octane render, cinematic lighting, detailed',
        cartoon: 'cartoon style, flat design, colorful, cute',
        cyberpunk: 'cyberpunk style, neon lights, futuristic, high tech',
        fantasy: 'fantasy art, magical, ethereal, detailed illustration',
        chibi: 'chibi style, cute, kawaii, small body, big head'
    };
    
    var galleryWrap = document.getElementById('avGalleryWrap');
    var gallery = document.getElementById('avGallery');
    galleryWrap.style.display = 'block';
    
    /* Show loading for new batch */
    var loadingHtml = '<div class="av-loading" id="avLoading"><div class="av-spinner"></div><div style="font-size: 12px; color: var(--text-muted);">Generating ' + count + ' avatars...</div></div>';
    gallery.innerHTML = loadingHtml + gallery.innerHTML;
    
    var completed = 0;
    var newAvatars = [];
    
    for (var i = 0; i < count; i++) {
        (function(idx) {
            var seed = Math.floor(Math.random() * 1000000);
            var prompt = desc + ', ' + styleMap[style] + ', avatar, profile picture';
            var url = 'https://image.pollinations.ai/prompt/' + encodeURIComponent(prompt) + '?width=' + size + '&height=' + size + '&seed=' + seed + '&nologo=true&model=flux&enhance=true&private=true';
            
            /* Preload image */
            var img = new Image();
            img.onload = function() {
                completed++;
                newAvatars.push({ url: url, prompt: desc, style: style, timestamp: Date.now() });
                avatarGallery.unshift({ url: url, prompt: desc, style: style, timestamp: Date.now() });
                avatarGallery = avatarGallery.slice(0, 50);
                localStorage.setItem('closiwer_avatars', JSON.stringify(avatarGallery));
                
                /* Add to gallery */
                var loading = document.getElementById('avLoading');
                if (loading && completed === 1) loading.remove();
                
                var itemHtml = '<div class="av-item" data-url="' + url + '">' +
                    '<img src="' + url + '" alt="avatar" onclick="avOpenFull(\'' + url + '\')">' +
                    '<div class="av-item-actions">' +
                    '<button class="av-action-btn" onclick="event.stopPropagation(); avDownload(\'' + url + '\')">📥</button>' +
                    '<button class="av-action-btn" onclick="event.stopPropagation(); avSetProfile(\'' + url + '\')">👤</button>' +
                    '<button class="av-action-btn" onclick="event.stopPropagation(); avCopyUrl(\'' + url + '\')">📋</button>' +
                    '</div></div>';
                
                var loadingEl = document.getElementById('avLoading');
                if (loadingEl) loadingEl.insertAdjacentHTML('afterend', itemHtml);
                else gallery.insertAdjacentHTML('afterbegin', itemHtml);
                
                if (completed === count) {
                    var l = document.getElementById('avLoading');
                    if (l) l.remove();
                    showToast('✅ ' + count + ' avatar berhasil dibuat!');
                }
            };
            img.onerror = function() {
                completed++;
                showToast('⚠️ Gagal load avatar #' + (idx + 1));
                if (completed === count) {
                    var l = document.getElementById('avLoading');
                    if (l) l.remove();
                }
            };
            img.src = url;
        })(i);
    }
}

function loadAvatarGallery() {
    if (avatarGallery.length === 0) return;
    document.getElementById('avGalleryWrap').style.display = 'block';
    var html = '';
    for (var i = 0; i < avatarGallery.length; i++) {
        var av = avatarGallery[i];
        html += '<div class="av-item">' +
            '<img src="' + av.url + '" alt="avatar" onclick="avOpenFull(\'' + av.url + '\')">' +
            '<div class="av-item-actions">' +
            '<button class="av-action-btn" onclick="event.stopPropagation(); avDownload(\'' + av.url + '\')">📥</button>' +
            '<button class="av-action-btn" onclick="event.stopPropagation(); avSetProfile(\'' + av.url + '\')">👤</button>' +
            '<button class="av-action-btn" onclick="event.stopPropagation(); avCopyUrl(\'' + av.url + '\')">📋</button>' +
            '</div></div>';
    }
    document.getElementById('avGallery').innerHTML = html;
}

function avOpenFull(url) {
    window.open(url, '_blank');
}

function avDownload(url) {
    fetch(url).then(function(r) { return r.blob(); }).then(function(blob) {
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'closiwer-avatar-' + Date.now() + '.png';
        a.click();
        showToast('📥 Download dimulai');
    }).catch(function() {
        window.open(url, '_blank');
        showToast('💡 Tap & hold untuk save');
    });
}

function avSetProfile(url) {
    localStorage.setItem('closiwer_profile_pic', url);
    showToast('👤 Avatar diset sebagai profile!');
    /* Update header avatar if exist */
    var profileEls = document.querySelectorAll('[data-profile-pic]');
    profileEls.forEach(function(el) {
        el.style.backgroundImage = 'url(' + url + ')';
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = 'center';
    });
}

function avCopyUrl(url) {
    copyToClipboard(url, 'URL avatar disalin!');
}

function clearAvGallery() {
    if (!confirm('Hapus semua avatar di gallery?')) return;
    avatarGallery = [];
    localStorage.removeItem('closiwer_avatars');
    document.getElementById('avGallery').innerHTML = '';
    document.getElementById('avGalleryWrap').style.display = 'none';
    showToast('🗑️ Gallery dihapus');
}

/* Auto-load gallery saat modal dibuka */
var originalOpenCommandPalette = openCommandPalette;
function extendAvatarLoad() {
    /* Hook saat command palette ada - safe way */
}

/* ═══════════════════════════════════════
   REGISTER COMMANDS UNTUK COMMAND PALETTE
═══════════════════════════════════════ */
setTimeout(function() {
    if (typeof commands !== 'undefined' && Array.isArray(commands)) {
        commands.push({
            icon: '🎨',
            label: 'Color Palette Generator',
            action: function() { document.getElementById('colorPaletteModal').classList.add('show'); }
        });
        commands.push({
            icon: '👤',
            label: 'Avatar Generator',
            action: function() {
                document.getElementById('avatarModal').classList.add('show');
                loadAvatarGallery();
            }
        });
    }
}, 500);

/* Load gallery saat modal avatar dibuka */
document.addEventListener('DOMContentLoaded', function() {
    var avatarModal = document.getElementById('avatarModal');
    if (avatarModal) {
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(m) {
                if (m.attributeName === 'class' && avatarModal.classList.contains('show')) {
                    loadAvatarGallery();
                }
            });
        });
        observer.observe(avatarModal, { attributes: true });
    }
});

console.log('🎨 FITUR v5.1: Color Palette + Avatar Generator loaded!');

/* ═══ QUICK ACCESS FUNCTIONS ═══ */
function openColorPalette() {
    var modal = document.getElementById('colorPaletteModal');
    if (modal) {
        modal.classList.add('show');
        // Reset tabs ke default
        var textTab = document.querySelector('.cp-tab');
        if (textTab) cpSetTab('text', textTab);
    } else {
        alert('❌ Color Palette modal tidak ditemukan');
    }
}

function openAvatarGen() {
    var modal = document.getElementById('avatarModal');
    if (modal) {
        modal.classList.add('show');
        if (typeof loadAvatarGallery === 'function') loadAvatarGallery();
    } else {
        alert('❌ Avatar modal tidak ditemukan');
    }
}

/* ═══════════════════════════════════════
   FITUR #3: AI RECIPE GENERATOR
═══════════════════════════════════════ */

var rcSelectedDiets = [];
var rcFavorites = JSON.parse(localStorage.getItem('closiwer_recipes') || '[]');
var rcActiveTimer = null;
var rcTimerSeconds = 0;

function rcSetTab(tab, el) {
    document.querySelectorAll('.rc-tab').forEach(function(t) { t.classList.remove('active'); });
    document.querySelectorAll('.rc-content').forEach(function(c) { c.classList.remove('active'); });
    el.classList.add('active');
    var content = document.querySelector('.rc-content[data-rc-tab="' + tab + '"]');
    if (content) content.classList.add('active');
    if (tab === 'favorites') rcRenderFavorites();
}

function rcToggleDiet(el, diet) {
    var idx = rcSelectedDiets.indexOf(diet);
    if (idx !== -1) {
        rcSelectedDiets.splice(idx, 1);
        el.classList.remove('active');
    } else {
        rcSelectedDiets.push(diet);
        el.classList.add('active');
    }
}

/* ═══ AI GENERATE ═══ */
function rcGenerate() {
    var ingredients = document.getElementById('rcIngredients').value.trim();
    if (!ingredients) { showToast('⚠️ Isi bahan dulu'); return; }
    
    var cuisine = document.getElementById('rcCuisine').value;
    var time = document.getElementById('rcTime').value;
    var difficulty = document.getElementById('rcDifficulty').value;
    var servings = document.getElementById('rcServings').value;
    var diets = rcSelectedDiets.length > 0 ? rcSelectedDiets.join(', ') : 'none';
    
    var result = document.getElementById('rcResult');
    result.style.display = 'block';
    result.innerHTML = '<div class="rc-loading"><div class="rc-spinner"></div><div style="font-size: 12px; color: var(--text-muted);">Chef AI sedang meracik resep... 👨‍🍳</div></div>';
    
    var prompt = 'Buatkan resep masakan ' + cuisine + ' dengan bahan-bahan ini: ' + ingredients + '.\n\n' +
        'Persyaratan:\n' +
        '- Waktu masak: ' + time + '\n' +
        '- Tingkat kesulitan: ' + difficulty + '\n' +
        '- Porsi: ' + servings + ' orang\n' +
        (diets !== 'none' ? '- Harus sesuai diet: ' + diets + '\n' : '') +
        '\nFormat jawaban dalam JSON VALID (jangan ada teks lain di luar JSON):\n' +
        '{\n' +
        '  "title": "Nama resep",\n' +
        '  "emoji": "emoji yang cocok",\n' +
        '  "description": "Deskripsi singkat 1 kalimat",\n' +
        '  "time": "15 menit",\n' +
        '  "difficulty": "Mudah",\n' +
        '  "servings": "2 orang",\n' +
        '  "calories": "350 kalori per porsi",\n' +
        '  "ingredients": ["bahan 1 dengan jumlah", "bahan 2 dengan jumlah"],\n' +
        '  "steps": ["step 1 yang jelas", "step 2", "step 3"],\n' +
        '  "tips": "tips memasak singkat"\n' +
        '}';
    
    var apiKey = (typeof config !== 'undefined' && config.apiKey) ? config.apiKey : '';
    
    if (!apiKey || apiKey.length < 10) {
        /* Fallback: generate dummy recipe tanpa AI */
        setTimeout(function() {
            var dummyRecipe = rcGenerateDummyRecipe(ingredients, cuisine, time, servings);
            rcDisplayRecipe(dummyRecipe);
            showToast('💡 Demo resep — isi API key di DEV untuk AI asli');
        }, 1500);
        return;
    }
    
    /* Call Groq API */
    fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
            model: config.model || 'llama-3.1-8b-instant',
            messages: [
                { role: 'system', content: 'Kamu adalah chef profesional Indonesia. Jawab HANYA dengan JSON valid tanpa teks pembuka/penutup. Jangan pakai markdown code block.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.8,
            max_tokens: 2000,
            response_format: { type: 'json_object' }
        })
    })
    .then(function(res) {
        if (!res.ok) return res.json().catch(function() { return {}; }).then(function(d) {
            throw new Error((d.error && d.error.message) || 'HTTP ' + res.status);
        });
        return res.json();
    })
    .then(function(data) {
        var content = data.choices[0].message.content;
        /* Clean content */
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        var recipe = JSON.parse(content);
        rcDisplayRecipe(recipe);
    })
    .catch(function(err) {
        console.error('[Recipe] Error:', err);
        /* Fallback dummy */
        var dummyRecipe = rcGenerateDummyRecipe(ingredients, cuisine, time, servings);
        rcDisplayRecipe(dummyRecipe);
        showToast('⚠️ AI gagal, pakai demo resep');
    });
}

function rcDisplayRecipe(recipe) {
    var result = document.getElementById('rcResult');
    result.style.display = 'block';
    
    var ingredientsHtml = '';
    if (recipe.ingredients && recipe.ingredients.length) {
        for (var i = 0; i < recipe.ingredients.length; i++) {
            ingredientsHtml += '<li>' + escapeHtml(recipe.ingredients[i]) + '</li>';
        }
    }
    
    var stepsHtml = '';
    if (recipe.steps && recipe.steps.length) {
        for (var i = 0; i < recipe.steps.length; i++) {
            stepsHtml += '<li>' + escapeHtml(recipe.steps[i]) + '</li>';
        }
    }
    
    var isFav = rcFavorites.some(function(f) { return f.title === recipe.title; });
    
    var html = '<div class="recipe-card" data-recipe=\'' + JSON.stringify(recipe).replace(/'/g, '&#39;') + '\'>';
    html += '<div class="recipe-card-header">';
    html += '<div style="flex: 1;">';
    html += '<div class="recipe-title">' + (recipe.emoji || '🍽️') + ' ' + escapeHtml(recipe.title || 'Resep Spesial') + '</div>';
    if (recipe.description) html += '<div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">' + escapeHtml(recipe.description) + '</div>';
    html += '<div class="recipe-meta">';
    if (recipe.time) html += '<span>⏱️ ' + escapeHtml(recipe.time) + '</span>';
    if (recipe.difficulty) html += '<span>🎚️ ' + escapeHtml(recipe.difficulty) + '</span>';
    if (recipe.servings) html += '<span>🍴 ' + escapeHtml(recipe.servings) + '</span>';
    if (recipe.calories) html += '<span>🔥 ' + escapeHtml(recipe.calories) + '</span>';
    html += '</div></div>';
    html += '<button class="recipe-save-btn' + (isFav ? ' saved' : '') + '" onclick="rcToggleFavorite(this)">' + (isFav ? '⭐' : '☆') + '</button>';
    html += '</div>';
    
    if (ingredientsHtml) {
        html += '<div class="recipe-section"><div class="recipe-section-title">🥕 Bahan-bahan</div><ul class="recipe-ingredients">' + ingredientsHtml + '</ul></div>';
    }
    
    if (stepsHtml) {
        html += '<div class="recipe-section"><div class="recipe-section-title">👨‍🍳 Cara Memasak</div><ol class="recipe-steps">' + stepsHtml + '</ol></div>';
    }
    
    if (recipe.tips) {
        html += '<div class="recipe-section"><div class="recipe-tips"><strong>💡 Tips:</strong> ' + escapeHtml(recipe.tips) + '</div></div>';
    }
    
    /* Actions */
    html += '<div class="recipe-actions">';
    html += '<button class="recipe-action" onclick="rcStartTimer(15)">⏱️ Timer 15m</button>';
    html += '<button class="recipe-action" onclick="rcStartTimer(30)">⏱️ Timer 30m</button>';
    html += '<button class="recipe-action" onclick="rcExportRecipe()">📥 Export</button>';
    html += '<button class="recipe-action" onclick="rcShareRecipe()">🔗 Share</button>';
    html += '</div>';
    
    /* Timer */
    html += '<div class="recipe-timer" id="rcTimer"><span id="rcTimerDisplay" class="timer-display">00:00</span><button class="timer-btn timer-stop" onclick="rcStopTimer()">⏹ Stop</button></div>';
    
    html += '</div>';
    
    result.innerHTML = html;
    showToast('✅ Resep berhasil dibuat!');
}

function rcGenerateDummyRecipe(ingredients, cuisine, time, servings) {
    var ingredientList = ingredients.split(/[,\n]/).map(function(s) { return s.trim(); }).filter(function(s) { return s.length > 0; });
    
    var cuisineNames = {
        indonesia: { emoji: '🇮🇩', title: 'Tumis Spesial Nusantara', steps: ['Panaskan minyak di wajan', 'Tumis bumbu hingga harum', 'Masukkan bahan utama', 'Tambahkan bumbu & kecap', 'Masak hingga matang, sajikan'] },
        asia: { emoji: '🍜', title: 'Stir-Fry Asia Spesial', steps: ['Siapkan semua bahan', 'Panaskan wajan dengan api besar', 'Tumis bumbu dasar', 'Masukkan bahan utama', 'Tambahkan saus, aduk rata', 'Sajikan panas'] },
        western: { emoji: '🍔', title: 'Western Delight', steps: ['Siapkan bahan-bahan', 'Panaskan pan dengan butter', 'Cook protein hingga golden', 'Tambahkan sayuran', 'Seasoning & plating'] },
        italia: { emoji: '🍝', title: 'Pasta Italia Homemade', steps: ['Rebus pasta hingga al dente', 'Buat saus tomat segar', 'Tumis bawang & bumbu', 'Campur pasta dengan saus', 'Taburi keju parmesan'] },
        'timur-tengah': { emoji: '🥙', title: 'Middle Eastern Bowl', steps: ['Marinasi bahan dengan rempah', 'Panaskan minyak zaitun', 'Panggang hingga matang', 'Sajikan dengan nasi/tortilla', 'Tambahkan saus yogurt'] },
        dessert: { emoji: '🍰', title: 'Sweet Dessert Homemade', steps: ['Campur bahan kering', 'Campur bahan basah', 'Aduk hingga rata', 'Panggang/kukus hingga matang', 'Hias dan sajikan'] },
        sehat: { emoji: '🥗', title: 'Healthy Bowl Anti Ribet', steps: ['Cuci bersih semua bahan', 'Potong sesuai selera', 'Campur dalam mangkuk', 'Tambahkan dressing', 'Sajikan segar'] }
    };
    
    var c = cuisineNames[cuisine] || cuisineNames.indonesia;
    var portions = ingredientList.length > 0 ? ingredientList.map(function(i) { return i + ' secukupnya'; }) : ['Bahan utama', 'Bumbu dasar', 'Garam & gula'];
    
    return {
        title: c.title,
        emoji: c.emoji,
        description: 'Resep otentik dengan bahan ' + ingredientList.slice(0, 3).join(', ') + (ingredientList.length > 3 ? ', dll' : ''),
        time: time === 'cepat' ? '10-15 menit' : (time === 'sedang' ? '15-30 menit' : '30-45 menit'),
        difficulty: 'Mudah',
        servings: servings + ' orang',
        calories: '~' + (250 + Math.floor(Math.random() * 200)) + ' kalori/porsi',
        ingredients: portions,
        steps: c.steps,
        tips: 'Cicipi sebelum disajikan. Sesuaikan bumbu sesuai selera. Gunakan bahan segar untuk hasil terbaik!'
    };
}

function rcToggleFavorite(btn) {
    var card = btn.closest('.recipe-card');
    var recipeData = card.getAttribute('data-recipe');
    try {
        var recipe = JSON.parse(recipeData);
        var idx = -1;
        for (var i = 0; i < rcFavorites.length; i++) {
            if (rcFavorites[i].title === recipe.title) { idx = i; break; }
        }
        if (idx === -1) {
            rcFavorites.unshift(recipe);
            btn.classList.add('saved');
            btn.textContent = '⭐';
            showToast('⭐ Disimpan ke favorit!');
        } else {
            rcFavorites.splice(idx, 1);
            btn.classList.remove('saved');
            btn.textContent = '☆';
            showToast('🗑️ Dihapus dari favorit');
        }
        localStorage.setItem('closiwer_recipes', JSON.stringify(rcFavorites));
    } catch(e) {
        console.error('Parse recipe error:', e);
    }
}

function rcRenderFavorites() {
    var list = document.getElementById('rcFavoritesList');
    if (rcFavorites.length === 0) {
        list.innerHTML = '<div class="rc-empty"><div class="rc-empty-icon">🍽️</div>Belum ada resep tersimpan.<br><br>Generate resep dulu, terus tap ⭐ untuk simpan!</div>';
        return;
    }
    var html = '';
    for (var i = 0; i < rcFavorites.length; i++) {
        var r = rcFavorites[i];
        html += '<div class="rc-fav-item" onclick="rcShowFavorite(' + i + ')">';
        html += '<div class="rc-fav-emoji">' + (r.emoji || '🍽️') + '</div>';
        html += '<div class="rc-fav-info">';
        html += '<div class="rc-fav-title">' + escapeHtml(r.title || 'Resep') + '</div>';
        html += '<div class="rc-fav-meta">⏱️ ' + escapeHtml(r.time || '-') + ' · 🍴 ' + escapeHtml(r.servings || '-') + '</div>';
        html += '</div>';
        html += '<button class="rc-fav-delete" onclick="event.stopPropagation(); rcDeleteFavorite(' + i + ')">🗑️</button>';
        html += '</div>';
    }
    list.innerHTML = html;
}

function rcShowFavorite(idx) {
    var recipe = rcFavorites[idx];
    if (!recipe) return;
    rcDisplayRecipe(recipe);
    rcSetTab('generate', document.querySelector('.rc-tab'));
    showToast('📖 Menampilkan: ' + recipe.title);
}

function rcDeleteFavorite(idx) {
    if (!confirm('Hapus resep ini?')) return;
    rcFavorites.splice(idx, 1);
    localStorage.setItem('closiwer_recipes', JSON.stringify(rcFavorites));
    rcRenderFavorites();
    showToast('🗑️ Resep dihapus');
}

function rcClearFavorites() {
    if (!confirm('Hapus SEMUA resep favorit?')) return;
    rcFavorites = [];
    localStorage.removeItem('closiwer_recipes');
    rcRenderFavorites();
    showToast('🗑️ Semua resep dihapus');
}

function rcRandom() {
    var bahanUmum = ['ayam', 'telur', 'nasi', 'mie', 'tahu', 'tempe', 'sayur', 'ikan', 'daging', 'kentang', 'wortel', 'bawang', 'cabai', 'tomat', 'keju', 'susu', 'tepung'];
    var randomBahan = [];
    var count = 3 + Math.floor(Math.random() * 4);
    var shuffled = bahanUmum.slice().sort(function() { return 0.5 - Math.random(); });
    for (var i = 0; i < count; i++) randomBahan.push(shuffled[i]);
    document.getElementById('rcIngredients').value = randomBahan.join(', ');
    rcGenerate();
}

/* ═══ TIMER ═══ */
function rcStartTimer(minutes) {
    rcStopTimer();
    rcTimerSeconds = minutes * 60;
    document.getElementById('rcTimer').classList.add('show');
    rcUpdateTimerDisplay();
    
    rcActiveTimer = setInterval(function() {
        rcTimerSeconds--;
        rcUpdateTimerDisplay();
        if (rcTimerSeconds <= 0) {
            rcStopTimer();
            showToast('⏰ WAKTU HABIS! Cek masakan lu!');
            /* Play sound */
            try {
                var ctx = new (window.AudioContext || window.webkitAudioContext)();
                var osc = ctx.createOscillator();
                var gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = 880;
                gain.gain.setValueAtTime(0.2, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
                osc.start();
                osc.stop(ctx.currentTime + 1);
            } catch(e) {}
        }
    }, 1000);
    showToast('⏱️ Timer ' + minutes + ' menit dimulai!');
}

function rcStopTimer() {
    if (rcActiveTimer) {
        clearInterval(rcActiveTimer);
        rcActiveTimer = null;
    }
    var el = document.getElementById('rcTimer');
    if (el) el.classList.remove('show');
}

function rcUpdateTimerDisplay() {
    var el = document.getElementById('rcTimerDisplay');
    if (!el) return;
    var m = Math.floor(rcTimerSeconds / 60);
    var s = rcTimerSeconds % 60;
    el.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
}

/* ═══ EXPORT & SHARE ═══ */
function rcExportRecipe() {
    var card = document.querySelector('.recipe-card');
    if (!card) { showToast('⚠️ Generate resep dulu'); return; }
    var recipeData = card.getAttribute('data-recipe');
    try {
        var recipe = JSON.parse(recipeData);
        var text = '🍽️ ' + (recipe.emoji || '') + ' ' + (recipe.title || 'Resep') + '\n';
        text += '='.repeat(40) + '\n\n';
        if (recipe.description) text += recipe.description + '\n\n';
        text += '⏱️ Waktu: ' + (recipe.time || '-') + '\n';
        text += '🎚️ Kesulitan: ' + (recipe.difficulty || '-') + '\n';
        text += '🍴 Porsi: ' + (recipe.servings || '-') + '\n';
        text += '🔥 Kalori: ' + (recipe.calories || '-') + '\n\n';
        text += '🥕 BAHAN-BAHAN:\n';
        (recipe.ingredients || []).forEach(function(i) { text += '  • ' + i + '\n'; });
        text += '\n👨‍🍳 CARA MEMASAK:\n';
        (recipe.steps || []).forEach(function(s, i) { text += '  ' + (i + 1) + '. ' + s + '\n'; });
        if (recipe.tips) text += '\n💡 TIPS: ' + recipe.tips + '\n';
        text += '\n---\nGenerated by CLOSIWER AI by PANN\n';
        
        var blob = new Blob([text], { type: 'text/plain' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = (recipe.title || 'resep').replace(/[^a-z0-9]/gi, '-').toLowerCase() + '.txt';
        a.click();
        URL.revokeObjectURL(url);
        showToast('📥 Resep di-export!');
    } catch(e) {
        showToast('⚠️ Gagal export');
    }
}

function rcShareRecipe() {
    var card = document.querySelector('.recipe-card');
    if (!card) { showToast('⚠️ Generate resep dulu'); return; }
    var recipeData = card.getAttribute('data-recipe');
    try {
        var recipe = JSON.parse(recipeData);
        var text = '🍽️ ' + (recipe.emoji || '') + ' ' + (recipe.title || 'Resep') + '\n\n';
        text += (recipe.description || '') + '\n\n';
        text += '⏱️ ' + (recipe.time || '-') + ' · 🍴 ' + (recipe.servings || '-') + '\n\n';
        text += 'Bahan:\n';
        (recipe.ingredients || []).slice(0, 5).forEach(function(i) { text += '• ' + i + '\n'; });
        text += '\nDibuat dengan CLOSIWER AI 🚀';
        
        if (navigator.share) {
            navigator.share({ title: recipe.title, text: text });
        } else {
            copyToClipboard(text, 'Resep disalin!');
        }
    } catch(e) {
        showToast('⚠️ Gagal share');
    }
}

/* ═══ QUICK ACCESS ═══ */
function openRecipeGenerator() {
    var modal = document.getElementById('recipeModal');
    if (modal) {
        modal.classList.add('show');
        rcRenderFavorites();
    }
}

/* ═══ AUTO-LOAD FAVORITES ═══ */
setTimeout(function() {
    rcRenderFavorites();
}, 1000);

console.log('🍳 FITUR v5.1: Recipe Generator loaded!');
/* ═══════════════════════════════════════
   FITUR #4: AI FINANCE TRACKER
═══════════════════════════════════════ */

var finTransactions = JSON.parse(localStorage.getItem('closiwer_finance') || '[]');
var finBudgets = JSON.parse(localStorage.getItem('closiwer_budgets') || '{}');
var finCurrentType = 'expense';

function finSetTab(tab, el) {
    document.querySelectorAll('.fin-tab').forEach(function(t) { t.classList.remove('active'); });
    document.querySelectorAll('.fin-content').forEach(function(c) { c.classList.remove('active'); });
    el.classList.add('active');
    var content = document.querySelector('.fin-content[data-fin-tab="' + tab + '"]');
    if (content) content.classList.add('active');
    if (tab === 'history') finRenderHistory();
    if (tab === 'stats') finRenderStats();
    if (tab === 'budget') finRenderBudget();
}

function finSetType(type, el) {
    finCurrentType = type;
    document.querySelectorAll('.fin-type-btn').forEach(function(b) { b.classList.remove('active'); });
    el.classList.add('active');
}

function finSetAmount(amount) {
    document.getElementById('finAmount').value = amount;
}

/* ═══ INIT ═══ */
function finInit() {
    /* Set today's date default */
    var dateInput = document.getElementById('finDate');
    if (dateInput && !dateInput.value) {
        var today = new Date();
        var yyyy = today.getFullYear();
        var mm = String(today.getMonth() + 1).padStart(2, '0');
        var dd = String(today.getDate()).padStart(2, '0');
        dateInput.value = yyyy + '-' + mm + '-' + dd;
    }
    finUpdateSummary();
}

/* ═══ FORMAT ═══ */
function finFormatRp(num) {
    if (num >= 1000000) return 'Rp ' + (num / 1000000).toFixed(1) + 'Jt';
    if (num >= 1000) return 'Rp ' + (num / 1000).toFixed(0) + 'K';
    return 'Rp ' + num.toLocaleString('id-ID');
}

function finFormatRpFull(num) {
    return 'Rp ' + num.toLocaleString('id-ID');
}

/* ═══ ADD TRANSACTION ═══ */
function finAddTransaction() {
    var amount = parseFloat(document.getElementById('finAmount').value);
    var category = document.getElementById('finCategory').value;
    var date = document.getElementById('finDate').value;
    var note = document.getElementById('finNote').value.trim();
    
    if (!amount || amount <= 0) { showToast('⚠️ Masukkan jumlah yang valid'); return; }
    if (!date) { showToast('⚠️ Pilih tanggal'); return; }
    
    var trans = {
        id: 'fin_' + Date.now(),
        type: finCurrentType,
        amount: amount,
        category: category,
        date: date,
        note: note,
        timestamp: Date.now()
    };
    
    finTransactions.unshift(trans);
    finSave();
    
    /* Reset form */
    document.getElementById('finAmount').value = '';
    document.getElementById('finNote').value = '';
    
    finUpdateSummary();
    showToast((finCurrentType === 'expense' ? '📉' : '📈') + ' Transaksi disimpan!');
    
    /* Check budget if expense */
    if (finCurrentType === 'expense') finCheckBudget(category);
}

function finSave() {
    localStorage.setItem('closiwer_finance', JSON.stringify(finTransactions));
    localStorage.setItem('closiwer_budgets', JSON.stringify(finBudgets));
}

/* ═══ SUMMARY ═══ */
function finUpdateSummary() {
    var now = new Date();
    var monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    
    var balance = 0;
    var monthIncome = 0;
    var monthExpense = 0;
    
    for (var i = 0; i < finTransactions.length; i++) {
        var t = finTransactions[i];
        var tTime = new Date(t.date).getTime();
        if (t.type === 'income') {
            balance += t.amount;
            if (tTime >= monthStart) monthIncome += t.amount;
        } else {
            balance -= t.amount;
            if (tTime >= monthStart) monthExpense += t.amount;
        }
    }
    
    var elB = document.getElementById('finBalance');
    var elI = document.getElementById('finIncome');
    var elE = document.getElementById('finExpense');
    if (elB) elB.textContent = finFormatRp(balance);
    if (elI) elI.textContent = finFormatRp(monthIncome);
    if (elE) elE.textContent = finFormatRp(monthExpense);
    
    var elBs = document.getElementById('finBalanceSub');
    if (elBs) elBs.textContent = finTransactions.length + ' transaksi';
    var elIs = document.getElementById('finIncomeSub');
    if (elIs) elIs.textContent = now.toLocaleString('id-ID', { month: 'long' });
    var elEs = document.getElementById('finExpenseSub');
    if (elEs) elEs.textContent = now.toLocaleString('id-ID', { month: 'long' });
}

/* ═══ HISTORY ═══ */
function finRenderHistory() {
    var range = document.getElementById('finFilterRange').value;
    var typeFilter = document.getElementById('finFilterType').value;
    var list = document.getElementById('finHistoryList');
    
    var now = new Date();
    var startTime = 0;
    
    if (range === 'today') {
        startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    } else if (range === 'week') {
        startTime = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    } else if (range === 'month') {
        startTime = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    }
    
    var filtered = finTransactions.filter(function(t) {
        var tTime = new Date(t.date).getTime();
        if (tTime < startTime) return false;
        if (typeFilter !== 'all' && t.type !== typeFilter) return false;
        return true;
    });
    
    if (filtered.length === 0) {
        list.innerHTML = '<div class="rc-empty"><div class="rc-empty-icon">📜</div>Belum ada transaksi.<br><br>Tambah transaksi dulu di tab ➕ Tambah!</div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < filtered.length; i++) {
        var t = filtered[i];
        var dateObj = new Date(t.date);
        var dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        var icon = t.category.split(' ')[0] || '💵';
        var categoryText = t.category.replace(/^[^\s]+\s/, '') || 'Lainnya';
        
        html += '<div class="fin-trans">';
        html += '<div class="fin-trans-icon ' + t.type + '">' + icon + '</div>';
        html += '<div class="fin-trans-info">';
        html += '<div class="fin-trans-cat">' + escapeHtml(categoryText) + '</div>';
        if (t.note) html += '<div class="fin-trans-note">' + escapeHtml(t.note) + '</div>';
        html += '<div class="fin-trans-date">' + dateStr + '</div>';
        html += '</div>';
        html += '<div class="fin-trans-amount ' + t.type + '">' + (t.type === 'income' ? '+' : '-') + finFormatRp(t.amount) + '</div>';
        html += '<div class="fin-trans-actions">';
        html += '<button class="fin-trans-btn" onclick="finEditTrans(\'' + t.id + '\')">✏️</button>';
        html += '<button class="fin-trans-btn" onclick="finDeleteTrans(\'' + t.id + '\')">🗑️</button>';
        html += '</div>';
        html += '</div>';
    }
    list.innerHTML = html;
}

function finDeleteTrans(id) {
    if (!confirm('Hapus transaksi ini?')) return;
    finTransactions = finTransactions.filter(function(t) { return t.id !== id; });
    finSave();
    finUpdateSummary();
    finRenderHistory();
    showToast('🗑️ Transaksi dihapus');
}

function finEditTrans(id) {
    var t = finTransactions.find(function(x) { return x.id === id; });
    if (!t) return;
    document.getElementById('finEditId').value = id;
    document.getElementById('finEditAmount').value = t.amount;
    document.getElementById('finEditCategory').value = t.category;
    document.getElementById('finEditNote').value = t.note || '';
    document.getElementById('finEditModal').classList.add('show');
}

function finSaveEdit() {
    var id = document.getElementById('finEditId').value;
    var amount = parseFloat(document.getElementById('finEditAmount').value);
    if (!amount || amount <= 0) { showToast('⚠️ Jumlah invalid'); return; }
    
    var t = finTransactions.find(function(x) { return x.id === id; });
    if (t) {
        t.amount = amount;
        t.category = document.getElementById('finEditCategory').value;
        t.note = document.getElementById('finEditNote').value;
        finSave();
        finUpdateSummary();
        finRenderHistory();
        closeModal('finEditModal');
        showToast('✅ Transaksi diupdate');
    }
}

/* ═══ STATS ═══ */
function finRenderStats() {
    var now = new Date();
    var monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    
    var monthTrans = finTransactions.filter(function(t) {
        return new Date(t.date).getTime() >= monthStart;
    });
    
    var expenses = monthTrans.filter(function(t) { return t.type === 'expense'; });
    var incomes = monthTrans.filter(function(t) { return t.type === 'income'; });
    
    var totalExp = expenses.reduce(function(s, t) { return s + t.amount; }, 0);
    var totalInc = incomes.reduce(function(s, t) { return s + t.amount; }, 0);
    var avgExp = expenses.length > 0 ? totalExp / expenses.length : 0;
    var biggestExp = expenses.length > 0 ? Math.max.apply(null, expenses.map(function(t) { return t.amount; })) : 0;
    
    var grid = document.getElementById('finStatsGrid');
    grid.innerHTML = 
        '<div class="fin-stat-card"><div class="fin-stat-val">' + expenses.length + '</div><div class="fin-stat-label">Transaksi</div></div>' +
        '<div class="fin-stat-card"><div class="fin-stat-val">' + finFormatRp(avgExp) + '</div><div class="fin-stat-label">Rata-rata</div></div>' +
        '<div class="fin-stat-card"><div class="fin-stat-val">' + finFormatRp(biggestExp) + '</div><div class="fin-stat-label">Terbesar</div></div>' +
        '<div class="fin-stat-card"><div class="fin-stat-val">' + finFormatRp(totalInc - totalExp) + '</div><div class="fin-stat-label">Selisih</div></div>';
    
    /* Chart 7 hari */
    var chart = document.getElementById('finChart');
    var days = [];
    var dayLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    for (var i = 6; i >= 0; i--) {
        var d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        var dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        var dEnd = dStart + 24 * 60 * 60 * 1000;
        var dayTotal = expenses.filter(function(t) {
            var tTime = new Date(t.date).getTime();
            return tTime >= dStart && tTime < dEnd;
        }).reduce(function(s, t) { return s + t.amount; }, 0);
        days.push({ label: dayLabels[d.getDay()], amount: dayTotal });
    }
    
    var maxAmount = Math.max.apply(null, days.map(function(d) { return d.amount; })) || 1;
    var chartHtml = '';
    for (var i = 0; i < days.length; i++) {
        var h = (days[i].amount / maxAmount) * 100;
        chartHtml += '<div class="fin-chart-bar-wrap">';
        chartHtml += '<div class="fin-chart-bar" style="height: ' + h + '%;"></div>';
        chartHtml += '<div class="fin-chart-label">' + days[i].label + '</div>';
        chartHtml += '</div>';
    }
    chart.innerHTML = chartHtml;
    
    /* Top categories */
    var catTotals = {};
    for (var i = 0; i < expenses.length; i++) {
        var cat = expenses[i].category;
        catTotals[cat] = (catTotals[cat] || 0) + expenses[i].amount;
    }
    
    var sorted = Object.keys(catTotals).sort(function(a, b) { return catTotals[b] - catTotals[a]; }).slice(0, 5);
    var topCatHtml = '';
    if (sorted.length === 0) {
        topCatHtml = '<div class="rc-empty" style="padding: 20px;"><div style="font-size: 12px;">Belum ada pengeluaran bulan ini</div></div>';
    } else {
        for (var i = 0; i < sorted.length; i++) {
            var cat = sorted[i];
            var amount = catTotals[cat];
            var pct = (amount / totalExp) * 100;
            topCatHtml += '<div class="fin-top-cat">';
            topCatHtml += '<div class="fin-top-cat-rank">' + (i + 1) + '</div>';
            topCatHtml += '<div style="flex: 1;"><div class="fin-top-cat-name">' + escapeHtml(cat) + '</div>';
            topCatHtml += '<div class="fin-top-cat-bar" style="width: ' + pct + '%;"></div></div>';
            topCatHtml += '<div class="fin-top-cat-amount">' + finFormatRp(amount) + '</div>';
            topCatHtml += '</div>';
        }
    }
    document.getElementById('finTopCategories').innerHTML = topCatHtml;
}

/* ═══ BUDGET ═══ */
function finRenderBudget() {
    var categories = ['🍔 Makanan', '🚗 Transport', '🛍️ Belanja', '🎮 Hiburan', '📱 Pulsa/Internet', '💡 Tagihan', '💊 Kesehatan', '📚 Pendidikan', '🏠 Rumah', '🎁 Hadiah', '💵 Lainnya'];
    
    var now = new Date();
    var monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    
    var html = '';
    for (var i = 0; i < categories.length; i++) {
        var cat = categories[i];
        var budget = finBudgets[cat] || 0;
        var spent = finTransactions.filter(function(t) {
            return t.type === 'expense' && t.category === cat && new Date(t.date).getTime() >= monthStart;
        }).reduce(function(s, t) { return s + t.amount; }, 0);
        
        var pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
        var statusClass = pct >= 90 ? 'danger' : (pct >= 70 ? 'warning' : '');
        
        html += '<div class="fin-budget-item">';
        html += '<div class="fin-budget-header">';
        html += '<div class="fin-budget-name">' + escapeHtml(cat) + '</div>';
        html += '<input type="number" class="fin-budget-input" placeholder="0" value="' + (budget || '') + '" onchange="finSetBudget(\'' + cat.replace(/'/g, "\\'") + '\', this.value)">';
        html += '</div>';
        if (budget > 0) {
            html += '<div class="fin-budget-bar"><div class="fin-budget-fill ' + statusClass + '" style="width: ' + pct + '%"></div></div>';
            html += '<div class="fin-budget-status"><span>' + finFormatRp(spent) + ' / ' + finFormatRp(budget) + '</span><span>' + pct.toFixed(0) + '%</span></div>';
        } else {
            html += '<div class="fin-budget-status"><span>Belum di-set</span><span>' + finFormatRp(spent) + ' terpakai</span></div>';
        }
        html += '</div>';
    }
    document.getElementById('finBudgetList').innerHTML = html;
}

function finSetBudget(category, value) {
    var num = parseFloat(value) || 0;
    if (num <= 0) delete finBudgets[category];
    else finBudgets[category] = num;
    finSave();
    finRenderBudget();
    showToast('💾 Budget disimpan');
}

function finCheckBudget(category) {
    var budget = finBudgets[category];
    if (!budget) return;
    
    var now = new Date();
    var monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    var spent = finTransactions.filter(function(t) {
        return t.type === 'expense' && t.category === category && new Date(t.date).getTime() >= monthStart;
    }).reduce(function(s, t) { return s + t.amount; }, 0);
    
    var pct = (spent / budget) * 100;
    if (pct >= 100) showToast('🚨 BUDGET OVER! ' + category + ' udah ' + pct.toFixed(0) + '% dari limit!');
    else if (pct >= 80) showToast('⚠️ Warning: ' + category + ' udah ' + pct.toFixed(0) + '% dari budget!');
}

/* ═══ AI INSIGHTS ═══ */
function finGenerateAIInsight() {
    var result = document.getElementById('finAIResult');
    
    if (finTransactions.length < 3) {
        result.innerHTML = '<div class="rc-empty"><div class="rc-empty-icon">📊</div>Butuh minimal 3 transaksi untuk AI analisis.<br><br>Tambah transaksi dulu!</div>';
        return;
    }
    
    result.innerHTML = '<div class="rc-loading"><div class="rc-spinner"></div><div style="font-size: 12px; color: var(--text-muted);">AI menganalisis keuangan lu... 🤖</div></div>';
    
    var now = new Date();
    var monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    var monthTrans = finTransactions.filter(function(t) { return new Date(t.date).getTime() >= monthStart; });
    
    var totalIncome = monthTrans.filter(function(t) { return t.type === 'income'; }).reduce(function(s, t) { return s + t.amount; }, 0);
    var totalExpense = monthTrans.filter(function(t) { return t.type === 'expense'; }).reduce(function(s, t) { return s + t.amount; }, 0);
    
    var catTotals = {};
    monthTrans.filter(function(t) { return t.type === 'expense'; }).forEach(function(t) {
        catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
    });
    
    var summary = 'Total pemasukan bulan ini: Rp ' + totalIncome + '\n';
    summary += 'Total pengeluaran bulan ini: Rp ' + totalExpense + '\n';
    summary += 'Saldo: Rp ' + (totalIncome - totalExpense) + '\n\n';
    summary += 'Pengeluaran per kategori:\n';
    for (var cat in catTotals) {
        summary += '- ' + cat + ': Rp ' + catTotals[cat] + '\n';
    }
    summary += '\nTotal transaksi: ' + monthTrans.length;
    
    var apiKey = (typeof config !== 'undefined' && config.apiKey) ? config.apiKey : '';
    
    if (!apiKey || apiKey.length < 10) {
        /* Fallback: local insight */
        setTimeout(function() {
            result.innerHTML = finLocalInsight(totalIncome, totalExpense, catTotals);
        }, 1200);
        return;
    }
    
    fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
            model: config.model || 'llama-3.1-8b-instant',
            messages: [
                { role: 'system', content: 'Kamu adalah financial advisor profesional Indonesia. Analisis keuangan dengan ramah, kasih 3-4 insight actionable dalam Bahasa Indonesia. Format pakai HTML sederhana dengan <h4>, <ul>, <li>, <strong>. Jangan pakai markdown.' },
                { role: 'user', content: 'Analisis keuangan saya:\n\n' + summary + '\n\nKasih insight: 1) Kondisi keuangan, 2) Yang perlu diperbaiki, 3) Tips hemat, 4) Target yang realistis.' }
            ],
            temperature: 0.7,
            max_tokens: 1000
        })
    })
    .then(function(res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
    })
    .then(function(data) {
        result.innerHTML = data.choices[0].message.content;
    })
    .catch(function(err) {
        console.error('[AI Insight]', err);
        result.innerHTML = finLocalInsight(totalIncome, totalExpense, catTotals);
    });
}

function finLocalInsight(income, expense, catTotals) {
    var balance = income - expense;
    var rate = income > 0 ? (expense / income) * 100 : 0;
    
    var topCat = '';
    var topAmount = 0;
    for (var cat in catTotals) {
        if (catTotals[cat] > topAmount) { topAmount = catTotals[cat]; topCat = cat; }
    }
    
    var html = '<h4>📊 Analisis Keuangan</h4>';
    
    if (balance > 0) {
        html += '<p>✅ <strong>Good!</strong> Keuangan lu surplus <strong>Rp ' + balance.toLocaleString('id-ID') + '</strong> bulan ini. Pertahankan!</p>';
    } else if (balance < 0) {
        html += '<p>🚨 <strong>Warning!</strong> Lu deficit <strong>Rp ' + Math.abs(balance).toLocaleString('id-ID') + '</strong>. Perlu kurangi pengeluaran!</p>';
    } else {
        html += '<p>⚖️ Pas-pasan, income = expense.</p>';
    }
    
    if (rate > 0) {
        html += '<h4>💡 Yang Perlu Diperbaiki</h4>';
        html += '<ul>';
        if (rate > 90) html += '<li>Rasio pengeluaran/income lu <strong>' + rate.toFixed(0) + '%</strong> — terlalu tinggi! Target ideal: 70-80%</li>';
        else if (rate > 70) html += '<li>Rasio lu <strong>' + rate.toFixed(0) + '%</strong> — lumayan, tapi bisa lebih baik. Target: 70%</li>';
        else html += '<li>Rasio lu <strong>' + rate.toFixed(0) + '%</strong> — mantap! 👍</li>';
        if (topCat) html += '<li>Kategori paling boros: <strong>' + topCat + '</strong> (Rp ' + topAmount.toLocaleString('id-ID') + ')</li>';
        html += '</ul>';
    }
    
    html += '<h4>💰 Tips Hemat</h4>';
    html += '<ul>';
    html += '<li>Terapkan <strong>aturan 50/30/20</strong>: 50% kebutuhan, 30% keinginan, 20% tabungan</li>';
    html += '<li>Sebelum beli, tunggu <strong>24 jam</strong> untuk barang non-urgent</li>';
    html += '<li>Catat pengeluaran <strong>real-time</strong> biar aware</li>';
    if (topCat && topAmount > 50000) html += '<li>Kurangi ' + topCat + ' minggu depan, coba hemat Rp ' + Math.round(topAmount * 0.2).toLocaleString('id-ID') + '</li>';
    html += '</ul>';
    
    html += '<h4>🎯 Target Realistis</h4>';
    html += '<ul>';
    html += '<li>Target tabungan: <strong>Rp ' + Math.round(income * 0.2).toLocaleString('id-ID') + '</strong> (20% dari income)</li>';
    html += '<li>Set budget kategori <strong>' + (topCat || 'terbesar') + '</strong> maksimal Rp ' + Math.round((catTotals[topCat] || 100000) * 0.8).toLocaleString('id-ID') + '</li>';
    html += '<li>Review keuangan tiap <strong>minggu</strong></li>';
    html += '</ul>';
    
    html += '<p style="font-size: 11px; color: var(--text-muted); margin-top: 12px;">💡 Isi API key di DEV untuk AI insight yang lebih mendalam</p>';
    
    return html;
}

/* ═══ QUICK ACCESS ═══ */
function openFinanceTracker() {
    var modal = document.getElementById('financeModal');
    if (modal) {
        modal.classList.add('show');
        finInit();
        finUpdateSummary();
        finRenderHistory();
    }
}

/* ═══ AUTO-LOAD ═══ */
setTimeout(function() {
    finInit();
    finUpdateSummary();
}, 1200);

/* ═══ RENDER ULANG saat modal dibuka ═══ */
document.addEventListener('DOMContentLoaded', function() {
    var finModal = document.getElementById('financeModal');
    if (finModal) {
        var observer = new MutationObserver(function() {
            if (finModal.classList.contains('show')) {
                finUpdateSummary();
            }
        });
        observer.observe(finModal, { attributes: true });
    }
});

console.log('💰 FITUR v5.1: Finance Tracker loaded!');
/* ═══════════════════════════════════════
   FITUR #5: AI CODE REVIEWER
═══════════════════════════════════════ */

function crUpdateLineNumbers() {
    var code = document.getElementById('crCodeInput').value;
    var lines = code.split('\n').length;
    var nums = '';
    for (var i = 1; i <= Math.max(lines, 20); i++) nums += i + '\n';
    document.getElementById('crLineNumbers').textContent = nums;
}

function crSyncScroll() {
    var editor = document.getElementById('crCodeInput');
    var lineNums = document.getElementById('crLineNumbers');
    if (lineNums) lineNums.scrollTop = editor.scrollTop;
}

function crClear() {
    if (!confirm('Bersihkan kode?')) return;
    document.getElementById('crCodeInput').value = '';
    document.getElementById('crResult').style.display = 'none';
    crUpdateLineNumbers();
    showToast('🗑️ Kode dibersihkan');
}

function crUpload() {
    document.getElementById('crFileInput').click();
}

function crHandleUpload(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
        document.getElementById('crCodeInput').value = ev.target.result;
        /* Auto-detect language from extension */
        var ext = file.name.split('.').pop().toLowerCase();
        var langMap = { js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript', py: 'python', php: 'php', java: 'java', go: 'go', rs: 'rust', cpp: 'cpp', cc: 'cpp', cxx: 'cpp', cs: 'csharp', html: 'html', css: 'css', sql: 'sql', sh: 'bash', bash: 'bash' };
        if (langMap[ext]) document.getElementById('crLanguage').value = langMap[ext];
        crUpdateLineNumbers();
        showToast('📎 ' + file.name + ' loaded');
    };
    reader.readAsText(file);
}

function crLoadSample() {
    var lang = document.getElementById('crLanguage').value;
    var samples = {
        javascript: 'function getUserData(id) {\n  var user = database.query("SELECT * FROM users WHERE id = " + id);\n  if (user) {\n    var pass = user.password;\n    console.log("Password: " + pass);\n    return user;\n  }\n}\n\nfunction sum(arr) {\n  var total = 0;\n  for (var i = 0; i < arr.length; i++) {\n    total = total + arr[i];\n  }\n  return total;\n}',
        python: 'def get_user(user_id):\n    query = f"SELECT * FROM users WHERE id = {user_id}"\n    user = db.execute(query)\n    password = user["password"]\n    print(f"Password: {password}")\n    return user\n\ndef calculate(numbers):\n    result = 0\n    for i in range(len(numbers)):\n        result = result + numbers[i]\n    return result',
        php: '<?php\n$id = $_GET["id"];\n$query = "SELECT * FROM users WHERE id = $id";\n$result = mysqli_query($conn, $query);\n$user = mysqli_fetch_assoc($result);\necho "Password: " . $user["password"];\n\nfunction sum($arr) {\n  $total = 0;\n  for ($i = 0; $i < count($arr); $i++) {\n    $total = $total + $arr[$i];\n  }\n  return $total;\n}\n?>'
    };
    document.getElementById('crCodeInput').value = samples[lang] || samples.javascript;
    crUpdateLineNumbers();
    showToast('📄 Sample loaded');
}

/* ═══ REVIEW ═══ */
function crReviewCode() {
    var code = document.getElementById('crCodeInput').value.trim();
    if (!code) { showToast('⚠️ Paste code dulu'); return; }
    if (code.length < 10) { showToast('⚠️ Code terlalu pendek'); return; }
    
    var language = document.getElementById('crLanguage').value;
    var optBug = document.getElementById('crOptBug').checked;
    var optPerf = document.getElementById('crOptPerf').checked;
    var optSec = document.getElementById('crOptSecurity').checked;
    var optStyle = document.getElementById('crOptStyle').checked;
    
    var result = document.getElementById('crResult');
    result.style.display = 'block';
    result.innerHTML = '<div class="cr-loading"><div class="rc-spinner"></div><div style="font-size: 12px; color: var(--text-muted);">AI sedang review code lu... 🔍</div></div>';
    
    var apiKey = (typeof config !== 'undefined' && config.apiKey) ? config.apiKey : '';
    
    /* Always run local review first (fast) */
    var localReview = crLocalReview(code, language);
    
    if (!apiKey || apiKey.length < 10) {
        setTimeout(function() {
            crDisplayReview(localReview, code, language, true);
            showToast('💡 Demo review — isi API key untuk AI mendalam');
        }, 800);
        return;
    }
    
    /* Build prompt for AI */
    var options = [];
    if (optBug) options.push('BUGS/ERRORS');
    if (optPerf) options.push('PERFORMANCE');
    if (optSec) options.push('SECURITY');
    if (optStyle) options.push('BEST PRACTICES');
    
    var prompt = 'Review code ' + language.toUpperCase() + ' berikut secara profesional.\n\n' +
        'Fokus pada: ' + options.join(', ') + '\n\n' +
        '```' + language + '\n' + code + '\n```\n\n' +
        'Jawab dengan JSON VALID (jangan ada teks di luar JSON):\n' +
        '{\n' +
        '  "score": 85,\n' +
        '  "grade": "A",\n' +
        '  "summary": "ringkasan 1-2 kalimat tentang code ini",\n' +
        '  "bugs": [{"line": 3, "severity": "critical", "title": "SQL Injection", "desc": "deskripsi masalahnya", "fix": "cara fix-nya"}],\n' +
        '  "performance": [{"line": 5, "severity": "warning", "title": "Loop tidak efisien", "desc": "deskripsi", "fix": "saran"}],\n' +
        '  "security": [{"line": 2, "severity": "critical", "title": "Hardcoded password", "desc": "deskripsi", "fix": "saran"}],\n' +
        '  "style": [{"line": 1, "severity": "info", "title": "Gunakan const/let", "desc": "deskripsi", "fix": "saran"}],\n' +
        '  "fixedCode": "versi code yang udah diperbaiki lengkap"\n' +
        '}\n\n' +
        'Grade: A (90+), B (75-89), C (60-74), D (40-59), F (<40). Severity: critical/warning/info.';
    
    fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
            model: config.model || 'llama-3.1-8b-instant',
            messages: [
                { role: 'system', content: 'Kamu adalah senior code reviewer. Jawab HANYA dengan JSON valid tanpa teks pembuka/penutup. Jangan pakai markdown code block untuk JSON.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 3000,
            response_format: { type: 'json_object' }
        })
    })
    .then(function(res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
    })
    .then(function(data) {
        var content = data.choices[0].message.content;
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        var aiReview = JSON.parse(content);
        /* Merge with local */
        var merged = crMergeReview(localReview, aiReview);
        crDisplayReview(merged, code, language, false);
    })
    .catch(function(err) {
        console.error('[CodeReview] Error:', err);
        crDisplayReview(localReview, code, language, true);
        showToast('⚠️ AI gagal, pakai local review');
    });
}

/* ═══ LOCAL REVIEW (fallback + always merge) ═══ */
function crLocalReview(code, language) {
    var lines = code.split('\n');
    var bugs = [];
    var perf = [];
    var sec = [];
    var style = [];
    
    var patterns = {
        javascript: [
            { regex: /eval\s*\(/i, type: 'sec', severity: 'critical', title: 'Penggunaan eval()', desc: 'eval() sangat berbahaya, bisa jadi celah XSS atau code injection.', fix: 'Hindari eval(). Pakai JSON.parse() atau fungsi spesifik.' },
            { regex: /innerHTML\s*=/i, type: 'sec', severity: 'warning', title: 'Penggunaan innerHTML', desc: 'innerHTML bisa menyebabkan XSS kalau datanya dari user.', fix: 'Pakai textContent atau sanitize input dulu.' },
            { regex: /\bvar\s+/i, type: 'style', severity: 'info', title: 'Pakai var', desc: 'var itu function-scoped, bisa bikin bug. Modern JS pakai const/let.', fix: 'Ganti var jadi const atau let.' },
            { regex: /console\.log/i, type: 'style', severity: 'info', title: 'Console.log masih ada', desc: 'console.log sebaiknya dihapus di production.', fix: 'Hapus console.log sebelum deploy.' },
            { regex: /==(?!=)/g, type: 'style', severity: 'warning', title: 'Pakai == bukan ===', desc: '== bisa bikin bug karena type coercion.', fix: 'Ganti == jadi ===.' },
            { regex: /document\.write/i, type: 'sec', severity: 'critical', title: 'document.write', desc: 'document.write bahaya dan deprecated.', fix: 'Pakai DOM manipulation modern.' }
        ],
        python: [
            { regex: /eval\s*\(/i, type: 'sec', severity: 'critical', title: 'Penggunaan eval()', desc: 'eval() berbahaya untuk input user.', fix: 'Hindari eval(). Pakai ast.literal_eval() atau parser.' },
            { regex: /exec\s*\(/i, type: 'sec', severity: 'critical', title: 'Penggunaan exec()', desc: 'exec() bisa eksekusi code arbitrary.', fix: 'Hindari exec() untuk input user.' },
            { regex: /f".*SELECT.*\{/i, type: 'sec', severity: 'critical', title: 'SQL Injection (f-string)', desc: 'Query SQL pakai f-string = SQL injection!', fix: 'Pakai parameterized query: cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))' },
            { regex: /print\s*\(/i, type: 'style', severity: 'info', title: 'Print statement', desc: 'Sebisa mungkin pakai logging di production.', fix: 'Pakai logging module.' }
        ],
        php: [
            { regex: /\$_(GET|POST|REQUEST|COOKIE)\[/i, type: 'sec', severity: 'critical', title: 'Input user tanpa sanitasi', desc: 'Mengakses $_GET/$_POST langsung sangat berbahaya.', fix: 'Pakai filter_input() atau htmlspecialchars().' },
            { regex: /mysqli_query.*\$/i, type: 'sec', severity: 'critical', title: 'Kemungkinan SQL Injection', desc: 'Query SQL yang di-concat dengan variable = SQL injection.', fix: 'Pakai prepared statement (mysqli_prepare atau PDO).' },
            { regex: /echo\s+.*\$/i, type: 'sec', severity: 'warning', title: 'Echo data user', desc: 'Echo data user tanpa escape bisa XSS.', fix: 'Pakai htmlspecialchars() sebelum echo.' }
        ]
    };
    
    var langPatterns = patterns[language] || patterns.javascript;
    
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        for (var j = 0; j < langPatterns.length; j++) {
            var p = langPatterns[j];
            if (p.regex.test(line)) {
                var issue = { line: i + 1, severity: p.severity, title: p.title, desc: p.desc, fix: p.fix };
                if (p.type === 'bug') bugs.push(issue);
                else if (p.type === 'perf') perf.push(issue);
                else if (p.type === 'sec') sec.push(issue);
                else style.push(issue);
            }
        }
    }
    
    /* Calculate score */
    var score = 100;
    score -= bugs.filter(function(b) { return b.severity === 'critical'; }).length * 15;
    score -= bugs.filter(function(b) { return b.severity === 'warning'; }).length * 5;
    score -= sec.filter(function(s) { return s.severity === 'critical'; }).length * 20;
    score -= sec.filter(function(s) { return s.severity === 'warning'; }).length * 10;
    score -= perf.length * 3;
    score -= style.length * 2;
    score = Math.max(0, Math.min(100, score));
    
    return {
        score: score,
        grade: score >= 90 ? 'A' : (score >= 75 ? 'B' : (score >= 60 ? 'C' : (score >= 40 ? 'D' : 'F'))),
        summary: 'Analisis lokal ' + lines.length + ' baris code ' + language,
        bugs: bugs,
        performance: perf,
        security: sec,
        style: style,
        fixedCode: ''
    };
}

function crMergeReview(local, ai) {
    return {
        score: ai.score || local.score,
        grade: ai.grade || local.grade,
        summary: ai.summary || local.summary,
        bugs: (ai.bugs || []).concat(local.bugs || []),
        performance: (ai.performance || []).concat(local.performance || []),
        security: (ai.security || []).concat(local.security || []),
        style: (ai.style || []).concat(local.style || []),
        fixedCode: ai.fixedCode || local.fixedCode || ''
    };
}

/* ═══ DISPLAY ═══ */
function crDisplayReview(review, originalCode, language, isLocal) {
    var result = document.getElementById('crResult');
    result.style.display = 'block';
    
    var html = '';
    
    /* Score card */
    html += '<div class="cr-score-card">';
    html += '<div class="cr-score-label">CODE SCORE</div>';
    html += '<div class="cr-score-value">' + review.score + '</div>';
    html += '<div class="cr-score-grade">' + (review.score >= 90 ? '🏆 Grade A — Excellent!' : (review.score >= 75 ? '👍 Grade B — Good' : (review.score >= 60 ? '😐 Grade C — Fair' : (review.score >= 40 ? '⚠️ Grade D — Needs Work' : '🚨 Grade F — Critical')))) + '</div>';
    html += '<div class="cr-score-desc">' + escapeHtml(review.summary || '') + '</div>';
    html += '</div>';
    
    /* Metrics */
    html += '<div class="cr-metrics-grid">';
    html += '<div class="cr-metric"><div class="cr-metric-val">' + review.bugs.length + '</div><div class="cr-metric-label">🐛 Bug</div></div>';
    html += '<div class="cr-metric"><div class="cr-metric-val">' + review.performance.length + '</div><div class="cr-metric-label">⚡ Perf</div></div>';
    html += '<div class="cr-metric"><div class="cr-metric-val">' + review.security.length + '</div><div class="cr-metric-label">🔒 Security</div></div>';
    html += '</div>';
    
    /* Sections */
    if (review.bugs && review.bugs.length > 0) html += crRenderSection('🐛 Bug & Error', review.bugs, 'critical');
    if (review.security && review.security.length > 0) html += crRenderSection('🔒 Security Issues', review.security, 'critical');
    if (review.performance && review.performance.length > 0) html += crRenderSection('⚡ Performance', review.performance, 'warning');
    if (review.style && review.style.length > 0) html += crRenderSection('✨ Best Practices', review.style, 'info');
    
    if (review.bugs.length === 0 && review.security.length === 0 && review.performance.length === 0 && review.style.length === 0) {
        html += '<div class="cr-section"><div class="cr-issue success"><div class="cr-issue-icon">✅</div><div class="cr-issue-body"><div class="cr-issue-title">Code Lu Bersih!</div><div class="cr-issue-desc">Gak ada masalah yang terdeteksi. Keep coding! 🚀</div></div></div></div>';
    }
    
    /* Fixed code */
    if (review.fixedCode && review.fixedCode.trim()) {
        html += '<div class="cr-section">';
        html += '<div class="cr-section-header">✨ Versi yang Diperbaiki</div>';
        html += '<div class="cr-code-block">';
        html += '<div class="cr-code-header"><span>' + language.toUpperCase() + ' · FIXED</span><button class="cr-code-copy" onclick="crCopyFixed(this)">📋 COPY</button></div>';
        html += '<code>' + escapeHtml(review.fixedCode) + '</code>';
        html += '</div></div>';
    }
    
    /* Export */
    html += '<button class="cr-tool-btn" style="width: 100%; margin-top: 16px; padding: 12px;" onclick="crExportReport()">📥 Export Report (.md)</button>';
    
    if (isLocal) {
        html += '<div style="text-align: center; font-size: 11px; color: var(--text-muted); margin-top: 12px;">💡 Local review — isi API key di DEV untuk AI review mendalam</div>';
    }
    
    result.innerHTML = html;
    crLastReview = review;
    crLastLanguage = language;
}

var crLastReview = null;
var crLastLanguage = '';

function crRenderSection(title, issues, defaultSeverity) {
    if (!issues || issues.length === 0) return '';
    
    var criticalCount = issues.filter(function(i) { return i.severity === 'critical'; }).length;
    var warningCount = issues.filter(function(i) { return i.severity === 'warning'; }).length;
    
    var countClass = criticalCount > 0 ? 'critical' : (warningCount > 0 ? 'warning' : 'info');
    
    var html = '<div class="cr-section">';
    html += '<div class="cr-section-header">' + title + '<span class="cr-count ' + countClass + '">' + issues.length + '</span></div>';
    
    for (var i = 0; i < issues.length; i++) {
        var issue = issues[i];
        var sev = issue.severity || defaultSeverity;
        var icon = sev === 'critical' ? '🚨' : (sev === 'warning' ? '⚠️' : 'ℹ️');
        
        html += '<div class="cr-issue ' + sev + '">';
        html += '<div class="cr-issue-icon">' + icon + '</div>';
        html += '<div class="cr-issue-body">';
        if (issue.line) html += '<span class="cr-issue-line">Line ' + issue.line + '</span>';
        html += '<div class="cr-issue-title">' + escapeHtml(issue.title || 'Issue') + '</div>';
        if (issue.desc) html += '<div class="cr-issue-desc">' + escapeHtml(issue.desc) + '</div>';
        if (issue.fix) html += '<div class="cr-issue-fix"><strong>💡 Fix:</strong> ' + escapeHtml(issue.fix) + '</div>';
        html += '</div></div>';
    }
    
    html += '</div>';
    return html;
}

function crCopyFixed(btn) {
    var code = btn.closest('.cr-code-block').querySelector('code').textContent;
    copyToClipboard(code, 'Fixed code disalin!');
}

function crExportReport() {
    if (!crLastReview) { showToast('⚠️ Review code dulu'); return; }
    
    var r = crLastReview;
    var text = '# 🔍 Code Review Report\n\n';
    text += '**Tanggal**: ' + new Date().toLocaleString('id-ID') + '\n';
    text += '**Bahasa**: ' + crLastLanguage.toUpperCase() + '\n';
    text += '**Score**: ' + r.score + '/100 (' + r.grade + ')\n\n';
    text += '---\n\n';
    text += '## 📋 Summary\n\n' + (r.summary || '') + '\n\n';
    
    if (r.bugs && r.bugs.length) {
        text += '## 🐛 Bugs & Errors (' + r.bugs.length + ')\n\n';
        r.bugs.forEach(function(b) {
            text += '### ' + (b.severity === 'critical' ? '🚨' : '⚠️') + ' ' + b.title + '\n';
            if (b.line) text += '**Line**: ' + b.line + '\n\n';
            text += b.desc + '\n\n';
            if (b.fix) text += '**Fix**: ' + b.fix + '\n\n';
        });
    }
    
    if (r.security && r.security.length) {
        text += '## 🔒 Security (' + r.security.length + ')\n\n';
        r.security.forEach(function(s) {
            text += '### ' + s.title + '\n';
            if (s.line) text += '**Line**: ' + s.line + '\n\n';
            text += s.desc + '\n\n';
            if (s.fix) text += '**Fix**: ' + s.fix + '\n\n';
        });
    }
    
    if (r.performance && r.performance.length) {
        text += '## ⚡ Performance (' + r.performance.length + ')\n\n';
        r.performance.forEach(function(p) {
            text += '- **' + p.title + '**' + (p.line ? ' (Line ' + p.line + ')' : '') + ': ' + p.desc + '\n';
        });
        text += '\n';
    }
    
    if (r.style && r.style.length) {
        text += '## ✨ Best Practices (' + r.style.length + ')\n\n';
        r.style.forEach(function(s) {
            text += '- **' + s.title + '**' + (s.line ? ' (Line ' + s.line + ')' : '') + ': ' + s.desc + '\n';
        });
        text += '\n';
    }
    
    if (r.fixedCode) {
        text += '## ✨ Fixed Code\n\n```' + crLastLanguage + '\n' + r.fixedCode + '\n```\n\n';
    }
    
    text += '---\n\n*Generated by CLOSIWER AI Code Reviewer by PANN*\n';
    
    var blob = new Blob([text], { type: 'text/markdown' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'code-review-' + Date.now() + '.md';
    a.click();
    URL.revokeObjectURL(url);
    showToast('📥 Report di-download!');
}

/* ═══ QUICK ACCESS ═══ */
function openCodeReviewer() {
    var modal = document.getElementById('codeReviewerModal');
    if (modal) {
        modal.classList.add('show');
        setTimeout(crUpdateLineNumbers, 100);
    }
}

console.log('💻 FITUR v5.1: Code Reviewer loaded!');
/* ═══════════════════════════════════════
   FITUR #6: AI STUDY BUDDY
═══════════════════════════════════════ */

var sbData = JSON.parse(localStorage.getItem('closiwer_study') || '{"subjects":[],"materi":[],"flashcards":[],"quizzes":[],"stats":{"streak":0,"totalTime":0,"cardsReviewed":0,"badges":0,"lastStudyDate":null}}');
var sbCurrentFlashSession = null;
var sbCurrentQuizSession = null;
var sbTimerInterval = null;
var sbTimerSeconds = 25 * 60;
var sbTimerRunning = false;
var sbTimerPreset = 25;

/* ═══ SAVE ═══ */
function sbSave() {
    localStorage.setItem('closiwer_study', JSON.stringify(sbData));
}

/* ═══ INIT ═══ */
function sbInit() {
    sbUpdateStats();
    sbRenderSubjects();
    sbRenderMateriSelectors();
}

function sbSetTab(tab, el) {
    document.querySelectorAll('.sb-tab').forEach(function(t) { t.classList.remove('active'); });
    document.querySelectorAll('.sb-content').forEach(function(c) { c.classList.remove('active'); });
    el.classList.add('active');
    var content = document.querySelector('.sb-content[data-sb-tab="' + tab + '"]');
    if (content) content.classList.add('active');
    
    if (tab === 'subjects') sbRenderSubjects();
    if (tab === 'materi') sbRenderMateriSelectors();
    if (tab === 'flashcards') sbRenderMateriSelectors();
    if (tab === 'quiz') sbRenderMateriSelectors();
}

/* ═══ STATS ═══ */
function sbUpdateStats() {
    document.getElementById('sbStreak').textContent = sbData.stats.streak || 0;
    var mins = Math.floor((sbData.stats.totalTime || 0) / 60);
    document.getElementById('sbTotalTime').textContent = mins + 'm';
    document.getElementById('sbCardsReviewed').textContent = sbData.stats.cardsReviewed || 0;
    document.getElementById('sbBadges').textContent = sbData.stats.badges || 0;
}

function sbCheckStreak() {
    var today = new Date().toDateString();
    var last = sbData.stats.lastStudyDate;
    if (last === today) return;
    
    var yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    if (last === yesterday) {
        sbData.stats.streak = (sbData.stats.streak || 0) + 1;
    } else {
        sbData.stats.streak = 1;
    }
    sbData.stats.lastStudyDate = today;
    sbSave();
    sbUpdateStats();
}

/* ═══ SUBJECTS ═══ */
function sbAddSubject() {
    var input = document.getElementById('sbNewSubject');
    var name = input.value.trim();
    if (!name) { showToast('⚠️ Isi nama pelajaran'); return; }
    
    if (sbData.subjects.some(function(s) { return s.name.toLowerCase() === name.toLowerCase(); })) {
        showToast('⚠️ Pelajaran udah ada');
        return;
    }
    
    var emoji = sbGetEmojiForSubject(name);
    sbData.subjects.push({
        id: 'subj_' + Date.now(),
        name: name,
        emoji: emoji,
        createdAt: Date.now()
    });
    sbSave();
    input.value = '';
    sbRenderSubjects();
    sbRenderMateriSelectors();
    sbCheckStreak();
    showToast('✅ Pelajaran ditambahkan!');
}

function sbGetEmojiForSubject(name) {
    var lower = name.toLowerCase();
    var map = {
        matematika: '📐', math: '📐', fisika: '⚛️', kimia: '🧪', biologi: '🧬',
        sejarah: '📜', geografi: '🗺️', ekonomi: '💰', bahasa: '📖',
        inggris: '🇬🇧', indonesia: '🇮🇩', komputer: '💻', coding: '💻',
        pemrograman: '💻', seni: '🎨', musik: '🎵', olahraga: '⚽',
        agama: '🕌', pkn: '⚖️', sosiologi: '👥', antropologi: '🏛️',
        statistik: '📊', kalkulus: '∫', aljabar: '🔢', geometri: '📏',
        trigonometri: '📐', akuntansi: '🧾', manajemen: '📋'
    };
    for (var key in map) {
        if (lower.indexOf(key) !== -1) return map[key];
    }
    return '📚';
}

function sbRenderSubjects() {
    var list = document.getElementById('sbSubjectsList');
    if (sbData.subjects.length === 0) {
        list.innerHTML = '<div class="sb-empty"><div class="sb-empty-icon">📚</div>Belum ada pelajaran.<br><br>Tambah pelajaran dulu di atas! 👆</div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < sbData.subjects.length; i++) {
        var subj = sbData.subjects[i];
        var materiCount = sbData.materi.filter(function(m) { return m.subjectId === subj.id; }).length;
        var flashCount = sbData.flashcards.filter(function(f) { return f.subjectId === subj.id; }).length;
        var quizCount = sbData.quizzes.filter(function(q) { return q.subjectId === subj.id; }).length;
        
        html += '<div class="sb-subject" onclick="sbSelectSubject(\'' + subj.id + '\')">';
        html += '<div class="sb-subject-emoji">' + subj.emoji + '</div>';
        html += '<div class="sb-subject-info">';
        html += '<div class="sb-subject-name">' + escapeHtml(subj.name) + '</div>';
        html += '<div class="sb-subject-meta">';
        html += '<span>📝 ' + materiCount + ' materi</span>';
        html += '<span>🎴 ' + flashCount + ' kartu</span>';
        html += '<span>❓ ' + quizCount + ' soal</span>';
        html += '</div></div>';
        html += '<button class="sb-subject-delete" onclick="event.stopPropagation(); sbDeleteSubject(\'' + subj.id + '\')">🗑️</button>';
        html += '</div>';
    }
    list.innerHTML = html;
}

function sbSelectSubject(id) {
    var subj = sbData.subjects.find(function(s) { return s.id === id; });
    if (!subj) return;
    
    /* Auto-select di materi tab */
    document.getElementById('sbMateriSubject').value = id;
    sbRenderMateri();
    
    /* Auto-switch to materi tab */
    var tabEl = document.querySelectorAll('.sb-tab')[1];
    sbSetTab('materi', tabEl);
    
    showToast('📚 ' + subj.name + ' dipilih');
}

function sbDeleteSubject(id) {
    if (!confirm('Hapus pelajaran ini? Semua materi & kartu akan dihapus.')) return;
    sbData.subjects = sbData.subjects.filter(function(s) { return s.id !== id; });
    sbData.materi = sbData.materi.filter(function(m) { return m.subjectId !== id; });
    sbData.flashcards = sbData.flashcards.filter(function(f) { return f.subjectId !== id; });
    sbData.quizzes = sbData.quizzes.filter(function(q) { return q.subjectId !== id; });
    sbSave();
    sbRenderSubjects();
    sbRenderMateriSelectors();
    showToast('🗑️ Pelajaran dihapus');
}

/* ═══ MATERI ═══ */
function sbRenderMateriSelectors() {
    var selects = ['sbMateriSubject', 'sbFlashSubject', 'sbQuizSubject'];
    for (var i = 0; i < selects.length; i++) {
        var sel = document.getElementById(selects[i]);
        if (!sel) continue;
        var currentValue = sel.value;
        var html = '<option value="">-- Pilih Pelajaran --</option>';
        for (var j = 0; j < sbData.subjects.length; j++) {
            var s = sbData.subjects[j];
            html += '<option value="' + s.id + '">' + s.emoji + ' ' + escapeHtml(s.name) + '</option>';
        }
        sel.innerHTML = html;
        if (currentValue) sel.value = currentValue;
    }
}

function sbSaveMateri() {
    var subjectId = document.getElementById('sbMateriSubject').value;
    var title = document.getElementById('sbMateriTitle').value.trim();
    var content = document.getElementById('sbMateriContent').value.trim();
    
    if (!subjectId) { showToast('⚠️ Pilih pelajaran dulu'); return; }
    if (!title) { showToast('⚠️ Isi judul materi'); return; }
    if (!content || content.length < 20) { showToast('⚠️ Isi materi terlalu pendek (min 20 karakter)'); return; }
    
    sbData.materi.push({
        id: 'mat_' + Date.now(),
        subjectId: subjectId,
        title: title,
        content: content,
        createdAt: Date.now()
    });
    sbSave();
    document.getElementById('sbMateriTitle').value = '';
    document.getElementById('sbMateriContent').value = '';
    sbRenderMateri();
    sbRenderSubjects();
    sbCheckStreak();
    showToast('✅ Materi tersimpan!');
}

function sbRenderMateri() {
    var subjectId = document.getElementById('sbMateriSubject').value;
    var list = document.getElementById('sbMateriList');
    if (!subjectId) { list.innerHTML = ''; return; }
    
    var filtered = sbData.materi.filter(function(m) { return m.subjectId === subjectId; });
    if (filtered.length === 0) {
        list.innerHTML = '<div class="sb-empty" style="padding: 20px;"><div style="font-size: 12px;">Belum ada materi untuk pelajaran ini</div></div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < filtered.length; i++) {
        var m = filtered[i];
        var preview = m.content.replace(/\n/g, ' ').slice(0, 100);
        html += '<div class="sb-materi-item">';
        html += '<div class="sb-materi-header">';
        html += '<div class="sb-materi-title">📖 ' + escapeHtml(m.title) + '</div>';
        html += '<button class="sb-materi-delete" onclick="sbDeleteMateri(\'' + m.id + '\')">🗑️</button>';
        html += '</div>';
        html += '<div class="sb-materi-preview">' + escapeHtml(preview) + '...</div>';
        html += '</div>';
    }
    list.innerHTML = html;
}

function sbDeleteMateri(id) {
    if (!confirm('Hapus materi ini?')) return;
    sbData.materi = sbData.materi.filter(function(m) { return m.id !== id; });
    sbSave();
    sbRenderMateri();
    sbRenderSubjects();
    showToast('🗑️ Materi dihapus');
}

/* ═══ FLASHCARDS ═══ */
function sbGenerateFlashcards() {
    var subjectId = document.getElementById('sbFlashSubject').value;
    if (!subjectId) { showToast('⚠️ Pilih pelajaran dulu'); return; }
    
    var materi = sbData.materi.filter(function(m) { return m.subjectId === subjectId; });
    if (materi.length === 0) {
        showToast('⚠️ Belum ada materi. Tambah materi dulu!');
        return;
    }
    
    var combinedContent = materi.map(function(m) { return m.title + '\n' + m.content; }).join('\n\n');
    
    var flashList = document.getElementById('sbFlashList');
    flashList.innerHTML = '<div class="rc-loading"><div class="rc-spinner"></div><div style="font-size: 12px; color: var(--text-muted);">AI bikin flashcards... 🎴</div></div>';
    
    var apiKey = (typeof config !== 'undefined' && config.apiKey) ? config.apiKey : '';
    
    if (!apiKey || apiKey.length < 10) {
        setTimeout(function() {
            var dummy = sbGenerateDummyFlashcards(combinedContent, subjectId);
            sbSaveFlashcards(dummy, subjectId);
            showToast('💡 Demo flashcards — isi API key untuk AI');
        }, 1200);
        return;
    }
    
    var prompt = 'Buat 5-8 flashcards dari materi berikut:\n\n' + combinedContent.slice(0, 3000) + '\n\n' +
        'Format JSON valid:\n' +
        '{"cards": [{"q": "pertanyaan", "a": "jawaban singkat"}]}\n\n' +
        'Pertanyaan harus spesifik, jawaban ringkas (1-2 kalimat). Bahasa Indonesia.';
    
    fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
        body: JSON.stringify({
            model: config.model || 'llama-3.1-8b-instant',
            messages: [
                { role: 'system', content: 'Kamu adalah teacher yang bikin flashcards. Jawab HANYA JSON valid tanpa teks lain.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.5,
            max_tokens: 1500,
            response_format: { type: 'json_object' }
        })
    })
    .then(function(res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
    .then(function(data) {
        var content = data.choices[0].message.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        var parsed = JSON.parse(content);
        var cards = parsed.cards || parsed.flashcards || [];
        sbSaveFlashcards(cards, subjectId);
    })
    .catch(function(err) {
        console.error('[Flashcards]', err);
        var dummy = sbGenerateDummyFlashcards(combinedContent, subjectId);
        sbSaveFlashcards(dummy, subjectId);
        showToast('⚠️ AI gagal, pakai demo');
    });
}

function sbGenerateDummyFlashcards(content, subjectId) {
    var sentences = content.split(/[.!?\n]+/).map(function(s) { return s.trim(); }).filter(function(s) { return s.length > 20 && s.length < 200; });
    if (sentences.length < 2) sentences = ['Materi belajar perlu dipahami dengan baik.', 'Praktek lebih penting dari teori.'];
    
    var cards = [];
    for (var i = 0; i < Math.min(5, sentences.length); i++) {
        var s = sentences[i];
        cards.push({
            q: 'Apa yang dimaksud dengan: "' + s.slice(0, 60) + '..."?',
            a: s
        });
    }
    return cards;
}

function sbSaveFlashcards(cards, subjectId) {
    /* Hapus flashcard lama untuk subject ini */
    sbData.flashcards = sbData.flashcards.filter(function(f) { return f.subjectId !== subjectId; });
    
    for (var i = 0; i < cards.length; i++) {
        sbData.flashcards.push({
            id: 'fc_' + Date.now() + '_' + i,
            subjectId: subjectId,
            question: cards[i].q,
            answer: cards[i].a,
            learned: false,
            reviewCount: 0,
            createdAt: Date.now()
        });
    }
    sbSave();
    sbRenderFlashList();
    sbRenderSubjects();
    showToast('✅ ' + cards.length + ' flashcards dibuat!');
}

function sbRenderFlashList() {
    var subjectId = document.getElementById('sbFlashSubject').value;
    var list = document.getElementById('sbFlashList');
    if (!subjectId) { list.innerHTML = ''; return; }
    
    var filtered = sbData.flashcards.filter(function(f) { return f.subjectId === subjectId; });
    if (filtered.length === 0) {
        list.innerHTML = '<div class="sb-empty"><div class="sb-empty-icon">🎴</div>Belum ada flashcards.<br><br>Klik 🤖 Generate di atas!</div>';
        return;
    }
    
    var html = '<button class="sb-btn-primary" onclick="sbStartFlashReview(\'' + subjectId + '\')">🎯 Mulai Review (' + filtered.length + ' kartu)</button>';
    html += '<div style="display: flex; flex-direction: column; gap: 8px;">';
    for (var i = 0; i < filtered.length; i++) {
        var f = filtered[i];
        html += '<div class="sb-flash-item">';
        html += '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">';
        html += '<div class="sb-flash-q" style="flex: 1;">Q: ' + escapeHtml(f.question) + '</div>';
        html += '<span class="sb-flash-status ' + (f.learned ? 'learned' : 'new') + '">' + (f.learned ? '✓ Hafal' : 'Baru') + '</span>';
        html += '<button class="sb-materi-delete" onclick="sbDeleteFlashcard(\'' + f.id + '\')">🗑️</button>';
        html += '</div>';
        html += '<div class="sb-flash-a">A: ' + escapeHtml(f.answer) + '</div>';
        html += '</div>';
    }
    html += '</div>';
    list.innerHTML = html;
}

function sbDeleteFlashcard(id) {
    sbData.flashcards = sbData.flashcards.filter(function(f) { return f.id !== id; });
    sbSave();
    sbRenderFlashList();
    sbRenderSubjects();
}

/* ═══ FLASHCARD REVIEW ═══ */
function sbStartFlashReview(subjectId) {
    var cards = sbData.flashcards.filter(function(f) { return f.subjectId === subjectId; });
    if (cards.length === 0) { showToast('⚠️ Belum ada kartu'); return; }
    
    /* Shuffle */
    cards = cards.slice().sort(function() { return 0.5 - Math.random(); });
    
    sbCurrentFlashSession = {
        cards: cards,
        index: 0,
        correct: 0,
        wrong: 0,
        flipped: false
    };
    
    document.getElementById('sbFlashModal').classList.add('show');
    sbShowFlashCard();
}

function sbShowFlashCard() {
    var session = sbCurrentFlashSession;
    if (!session) return;
    if (session.index >= session.cards.length) {
        sbEndFlashReview();
        return;
    }
    
    var card = session.cards[session.index];
    session.flipped = false;
    
    document.getElementById('sbFlashProgress').textContent = 'Kartu ' + (session.index + 1) + ' dari ' + session.cards.length;
    document.getElementById('sbFlashFront').textContent = card.question;
    document.getElementById('sbFlashFront').style.display = 'block';
    document.getElementById('sbFlashBack').textContent = card.answer;
    document.getElementById('sbFlashBack').style.display = 'none';
    document.getElementById('sbFlashActions').style.display = 'none';
}

function sbFlipCard() {
    var session = sbCurrentFlashSession;
    if (!session || session.flipped) return;
    session.flipped = true;
    document.getElementById('sbFlashFront').style.display = 'none';
    document.getElementById('sbFlashBack').style.display = 'block';
    document.getElementById('sbFlashActions').style.display = 'grid';
}

function sbAnswerCard(correct) {
    var session = sbCurrentFlashSession;
    if (!session) return;
    
    var card = session.cards[session.index];
    var origCard = sbData.flashcards.find(function(f) { return f.id === card.id; });
    if (origCard) {
        origCard.reviewCount = (origCard.reviewCount || 0) + 1;
        if (correct) origCard.learned = true;
        else origCard.learned = false;
    }
    
    if (correct) session.correct++;
    else session.wrong++;
    
    sbData.stats.cardsReviewed = (sbData.stats.cardsReviewed || 0) + 1;
    sbSave();
    
    session.index++;
    sbShowFlashCard();
}

function sbEndFlashReview() {
    var session = sbCurrentFlashSession;
    if (!session) return;
    
    var total = session.cards.length;
    var correct = session.correct;
    var pct = Math.round((correct / total) * 100);
    
    document.getElementById('sbFlashProgress').textContent = '🎉 Selesai!';
    document.getElementById('sbFlashFront').innerHTML = '<div style="text-align: center;"><div style="font-size: 48px; margin-bottom: 12px;">🎉</div><div style="font-size: 20px; font-weight: 800; margin-bottom: 8px;">Selesai!</div><div style="font-size: 14px; opacity: 0.9;">Score: ' + correct + ' / ' + total + ' (' + pct + '%)</div></div>';
    document.getElementById('sbFlashFront').style.display = 'block';
    document.getElementById('sbFlashBack').style.display = 'none';
    document.getElementById('sbFlashActions').style.display = 'none';
    
    sbUpdateStats();
    sbCheckStreak();
    sbRenderFlashList();
    sbRenderSubjects();
    sbCheckBadges();
    
    sbCurrentFlashSession = null;
}

/* ═══ QUIZ ═══ */
function sbGenerateQuiz() {
    var subjectId = document.getElementById('sbQuizSubject').value;
    if (!subjectId) { showToast('⚠️ Pilih pelajaran'); return; }
    
    var materi = sbData.materi.filter(function(m) { return m.subjectId === subjectId; });
    if (materi.length === 0) {
        showToast('⚠️ Belum ada materi');
        return;
    }
    
    var content = materi.map(function(m) { return m.title + '\n' + m.content; }).join('\n\n');
    var list = document.getElementById('sbQuizList');
    list.innerHTML = '<div class="rc-loading"><div class="rc-spinner"></div><div style="font-size: 12px; color: var(--text-muted);">AI bikin quiz... ❓</div></div>';
    
    var apiKey = (typeof config !== 'undefined' && config.apiKey) ? config.apiKey : '';
    
    if (!apiKey || apiKey.length < 10) {
        setTimeout(function() {
            sbSaveQuiz(sbGenerateDummyQuiz(content), subjectId);
            showToast('💡 Demo quiz');
        }, 1200);
        return;
    }
    
    var prompt = 'Buat 5 soal pilihan ganda dari materi berikut:\n\n' + content.slice(0, 3000) + '\n\n' +
        'Format JSON:\n' +
        '{"questions": [{"q": "pertanyaan", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "penjelasan singkat"}]}\n\n' +
        'correct = index jawaban benar (0-3). Bahasa Indonesia.';
    
    fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
        body: JSON.stringify({
            model: config.model || 'llama-3.1-8b-instant',
            messages: [
                { role: 'system', content: 'Kamu teacher yang bikin soal. Jawab HANYA JSON valid.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.6,
            max_tokens: 2000,
            response_format: { type: 'json_object' }
        })
    })
    .then(function(res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
    .then(function(data) {
        var content2 = data.choices[0].message.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        var parsed = JSON.parse(content2);
        var questions = parsed.questions || parsed.quiz || [];
        sbSaveQuiz(questions, subjectId);
    })
    .catch(function(err) {
        console.error('[Quiz]', err);
        sbSaveQuiz(sbGenerateDummyQuiz(content), subjectId);
        showToast('⚠️ AI gagal, pakai demo');
    });
}

function sbGenerateDummyQuiz(content) {
    var sentences = content.split(/[.!?\n]+/).map(function(s) { return s.trim(); }).filter(function(s) { return s.length > 20 && s.length < 200; });
    if (sentences.length < 2) sentences = ['Ini adalah materi pelajaran.', 'Belajar itu penting.'];
    
    var questions = [];
    for (var i = 0; i < Math.min(5, sentences.length); i++) {
        var s = sentences[i];
        questions.push({
            q: 'Manakah pernyataan yang BENAR?',
            options: [s.slice(0, 80), 'Pernyataan salah 1', 'Pernyataan salah 2', 'Pernyataan salah 3'],
            correct: 0,
            explanation: 'Jawaban benar ada di pilihan pertama.'
        });
    }
    return questions;
}

function sbSaveQuiz(questions, subjectId) {
    sbData.quizzes = sbData.quizzes.filter(function(q) { return q.subjectId !== subjectId; });
    sbData.quizzes.push({
        id: 'quiz_' + Date.now(),
        subjectId: subjectId,
        questions: questions,
        createdAt: Date.now()
    });
    sbSave();
    sbRenderQuizList();
    sbRenderSubjects();
    showToast('✅ ' + questions.length + ' soal dibuat!');
}

function sbRenderQuizList() {
    var subjectId = document.getElementById('sbQuizSubject').value;
    var list = document.getElementById('sbQuizList');
    if (!subjectId) { list.innerHTML = ''; return; }
    
    var quiz = sbData.quizzes.find(function(q) { return q.subjectId === subjectId; });
    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
        list.innerHTML = '<div class="sb-empty"><div class="sb-empty-icon">❓</div>Belum ada quiz.<br><br>Klik 🤖 Generate Quiz!</div>';
        return;
    }
    
    var html = '<button class="sb-btn-primary" onclick="sbStartQuiz(\'' + subjectId + '\')">🎯 Mulai Quiz (' + quiz.questions.length + ' soal)</button>';
    html += '<div class="sb-empty" style="padding: 20px; font-size: 11px;">📝 Terakhir dibuat: ' + new Date(quiz.createdAt).toLocaleDateString('id-ID') + '</div>';
    list.innerHTML = html;
}

function sbStartQuiz(subjectId) {
    var quiz = sbData.quizzes.find(function(q) { return q.subjectId === subjectId; });
    if (!quiz) return;
    
    sbCurrentQuizSession = {
        quiz: quiz,
        index: 0,
        score: 0,
        answered: false
    };
    
    document.getElementById('sbQuizModal').classList.add('show');
    sbShowQuizQuestion();
}

function sbShowQuizQuestion() {
    var session = sbCurrentQuizSession;
    if (!session) return;
    
    if (session.index >= session.quiz.questions.length) {
        sbEndQuiz();
        return;
    }
    
    var q = session.quiz.questions[session.index];
    session.answered = false;
    
    document.getElementById('sbQuizProgress').textContent = 'Soal ' + (session.index + 1) + ' dari ' + session.quiz.questions.length;
    document.getElementById('sbQuizScore').textContent = 'Score: ' + session.score;
    document.getElementById('sbQuizQuestion').textContent = q.q;
    document.getElementById('sbQuizFeedback').textContent = '';
    
    var html = '';
    for (var i = 0; i < q.options.length; i++) {
        html += '<button class="sb-quiz-option" onclick="sbAnswerQuiz(' + i + ')">' + String.fromCharCode(65 + i) + '. ' + escapeHtml(q.options[i]) + '</button>';
    }
    document.getElementById('sbQuizOptions').innerHTML = html;
}

function sbAnswerQuiz(choice) {
    var session = sbCurrentQuizSession;
    if (!session || session.answered) return;
    session.answered = true;
    
    var q = session.quiz.questions[session.index];
    var correct = q.correct;
    var options = document.querySelectorAll('.sb-quiz-option');
    
    options.forEach(function(opt, idx) {
        opt.classList.add('disabled');
        if (idx === correct) opt.classList.add('correct');
        else if (idx === choice) opt.classList.add('wrong');
    });
    
    if (choice === correct) {
        session.score++;
        document.getElementById('sbQuizFeedback').innerHTML = '<span style="color: #4ade80;">✅ Benar! ' + (q.explanation ? escapeHtml(q.explanation) : '') + '</span>';
    } else {
        document.getElementById('sbQuizFeedback').innerHTML = '<span style="color: #ef4444;">❌ Salah. Jawaban: ' + String.fromCharCode(65 + correct) + '. ' + (q.explanation ? escapeHtml(q.explanation) : '') + '</span>';
    }
    
    document.getElementById('sbQuizScore').textContent = 'Score: ' + session.score;
    
    setTimeout(function() {
        session.index++;
        sbShowQuizQuestion();
    }, 2000);
}

function sbEndQuiz() {
    var session = sbCurrentQuizSession;
    if (!session) return;
    var total = session.quiz.questions.length;
    var score = session.score;
    var pct = Math.round((score / total) * 100);
    
    document.getElementById('sbQuizProgress').textContent = '🎉 Selesai!';
    document.getElementById('sbQuizQuestion').innerHTML = '<div style="text-align: center; padding: 20px;"><div style="font-size: 48px; margin-bottom: 12px;">' + (pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '📚') + '</div><div style="font-size: 22px; font-weight: 800; margin-bottom: 8px;">Score: ' + score + ' / ' + total + '</div><div style="font-size: 16px; color: var(--primary); font-weight: 700;">' + pct + '%</div><div style="font-size: 12px; color: var(--text-muted); margin-top: 12px;">' + (pct >= 80 ? 'Mantap! Lu udah paham materi ini! 🎉' : pct >= 60 ? 'Bagus! Sedikit lagi sempurna 💪' : 'Perlu review lagi nih 📚') + '</div></div>';
    document.getElementById('sbQuizOptions').innerHTML = '<button class="sb-btn-primary" onclick="closeModal(\'sbQuizModal\'); sbCurrentQuizSession=null;">✓ Selesai</button>';
    document.getElementById('sbQuizFeedback').textContent = '';
    
    sbCheckStreak();
    sbCheckBadges();
    sbCurrentQuizSession = null;
}

/* ═══ TIMER ═══ */
function sbSetTimerPreset(mins) {
    sbTimerPreset = mins;
    sbTimerSeconds = mins * 60;
    document.querySelectorAll('.sb-preset-btn').forEach(function(b) { b.classList.remove('active'); });
    event.target.classList.add('active');
    document.getElementById('sbTimerMode').textContent = '⏱️ Pomodoro ' + mins + ' menit';
    sbResetTimer();
}

function sbToggleTimer() {
    var btn = document.getElementById('sbTimerStartBtn');
    if (sbTimerRunning) {
        clearInterval(sbTimerInterval);
        sbTimerRunning = false;
        btn.textContent = '▶️ Lanjut';
        btn.classList.add('paused');
    } else {
        if (sbTimerSeconds <= 0) sbTimerSeconds = sbTimerPreset * 60;
        sbTimerRunning = true;
        btn.textContent = '⏸️ Pause';
        btn.classList.remove('paused');
        
        sbTimerInterval = setInterval(function() {
            sbTimerSeconds--;
            sbUpdateTimerDisplay();
            
            if (sbTimerSeconds <= 0) {
                clearInterval(sbTimerInterval);
                sbTimerRunning = false;
                btn.textContent = '▶️ Mulai';
                btn.classList.remove('paused');
                sbData.stats.totalTime = (sbData.stats.totalTime || 0) + (sbTimerPreset * 60);
                sbSave();
                sbUpdateStats();
                sbCheckStreak();
                showToast('⏰ Waktu habis! Istirahat dulu 🎉');
                
                try {
                    var ctx = new (window.AudioContext || window.webkitAudioContext)();
                    var osc = ctx.createOscillator();
                    var gain = ctx.createGain();
                    osc.connect(gain); gain.connect(ctx.destination);
                    osc.frequency.value = 880;
                    gain.gain.setValueAtTime(0.2, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
                    osc.start(); osc.stop(ctx.currentTime + 1.5);
                } catch(e) {}
            }
        }, 1000);
    }
}

function sbResetTimer() {
    clearInterval(sbTimerInterval);
    sbTimerRunning = false;
    sbTimerSeconds = sbTimerPreset * 60;
    sbUpdateTimerDisplay();
    var btn = document.getElementById('sbTimerStartBtn');
    if (btn) { btn.textContent = '▶️ Mulai'; btn.classList.remove('paused'); }
}

function sbUpdateTimerDisplay() {
    var m = Math.floor(sbTimerSeconds / 60);
    var s = sbTimerSeconds % 60;
    document.getElementById('sbTimerClock').textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
}

/* ═══ BADGES ═══ */
function sbCheckBadges() {
    var badges = 0;
    if (sbData.stats.streak >= 3) badges++;
    if (sbData.stats.streak >= 7) badges++;
    if (sbData.stats.streak >= 30) badges++;
    if (sbData.stats.cardsReviewed >= 50) badges++;
    if (sbData.stats.cardsReviewed >= 200) badges++;
    if (sbData.stats.totalTime >= 3600) badges++;
    if (sbData.stats.totalTime >= 36000) badges++;
    if (sbData.subjects.length >= 3) badges++;
    if (sbData.subjects.length >= 5) badges++;
    if (sbData.materi.length >= 10) badges++;
    
    var oldBadges = sbData.stats.badges || 0;
    sbData.stats.badges = badges;
    if (badges > oldBadges) {
        sbSave();
        sbUpdateStats();
        setTimeout(function() { showToast('🏆 Badge baru! Total: ' + badges); }, 1500);
    }
}

/* ═══ QUICK ACCESS ═══ */
function openStudyBuddy() {
    var modal = document.getElementById('studyModal');
    if (modal) {
        modal.classList.add('show');
        sbInit();
    }
}

/* ═══ AUTO-INIT ═══ */
setTimeout(function() {
    sbInit();
    sbUpdateTimerDisplay();
}, 1500);

console.log('📚 FITUR v5.1: Study Buddy loaded!');
/* ═══════════════════════════════════════
   FITUR #7: AI AGENT MODE
═══════════════════════════════════════ */

var agAgents = JSON.parse(localStorage.getItem('closiwer_agents') || '[]');
var agLogs = JSON.parse(localStorage.getItem('closiwer_agent_logs') || '[]');
var agIntervals = {};
var agLastRunTime = {};

/* ═══ SAVE ═══ */
function agSave() {
    localStorage.setItem('closiwer_agents', JSON.stringify(agAgents));
    localStorage.setItem('closiwer_agent_logs', JSON.stringify(agLogs.slice(0, 100)));
}

/* ═══ TABS ═══ */
function agSetTab(tab, el) {
    document.querySelectorAll('.ag-tab').forEach(function(t) { t.classList.remove('active'); });
    document.querySelectorAll('.ag-content').forEach(function(c) { c.classList.remove('active'); });
    el.classList.add('active');
    var content = document.querySelector('.ag-content[data-ag-tab="' + tab + '"]');
    if (content) content.classList.add('active');
    
    if (tab === 'active') agRenderActive();
    if (tab === 'presets') agRenderPresets();
    if (tab === 'logs') agRenderLogs();
}

/* ═══ TRIGGER FIELDS ═══ */
function agUpdateTriggerFields() {
    var type = document.getElementById('agTriggerType').value;
    var container = document.getElementById('agTriggerFields');
    var html = '';
    
    if (type === 'time') {
        html = '<div class="field"><label>🕐 Jam Berapa?</label>' +
            '<input type="time" id="agTriggerTime" class="sb-input" value="07:00">' +
            '<div class="ag-field-hint">💡 Agent bakal jalan tiap hari di jam ini</div></div>';
    } else if (type === 'interval') {
        html = '<div class="field"><label>⏱️ Setiap Berapa Menit?</label>' +
            '<select id="agTriggerInterval" class="sb-select">' +
            '<option value="1">1 menit (testing)</option>' +
            '<option value="5">5 menit</option>' +
            '<option value="15">15 menit</option>' +
            '<option value="30">30 menit</option>' +
            '<option value="60" selected>1 jam</option>' +
            '<option value="120">2 jam</option></select></div>';
    } else if (type === 'weekday') {
        html = '<div class="field"><label>📅 Hari Apa?</label>' +
            '<select id="agTriggerWeekday" class="sb-select">' +
            '<option value="1">Senin</option><option value="2">Selasa</option>' +
            '<option value="3">Rabu</option><option value="4">Kamis</option>' +
            '<option value="5">Jumat</option><option value="6">Sabtu</option>' +
            '<option value="0">Minggu</option></select></div>' +
            '<div class="field"><label>🕐 Jam Berapa?</label>' +
            '<input type="time" id="agTriggerTime" class="sb-input" value="09:00"></div>';
    } else if (type === 'keyword') {
        html = '<div class="field"><label>💬 Keyword Trigger</label>' +
            '<input type="text" id="agTriggerKeyword" class="sb-input" placeholder="contoh: reminder, bantu, urgent">' +
            '<div class="ag-field-hint">💡 Kalau lu kirim chat dengan kata ini, agent bakal jalan</div></div>';
    } else if (type === 'once') {
        html = '<div class="field"><label>📅 Tanggal</label>' +
            '<input type="date" id="agTriggerDate" class="sb-input"></div>' +
            '<div class="field"><label>🕐 Jam</label>' +
            '<input type="time" id="agTriggerTime" class="sb-input" value="09:00"></div>';
    }
    
    container.innerHTML = html;
}

/* ═══ ACTION FIELDS ═══ */
function agUpdateActionFields() {
    var type = document.getElementById('agActionType').value;
    var container = document.getElementById('agActionFields');
    var html = '';
    
    if (type === 'notify') {
        html = '<div class="field"><label>🔔 Pesan Notifikasi</label>' +
            '<input type="text" id="agActionMessage" class="sb-input" placeholder="contoh: Jangan lupa minum air! 💧"></div>';
    } else if (type === 'chat') {
        html = '<div class="field"><label>💬 Pertanyaan ke AI</label>' +
            '<input type="text" id="agActionPrompt" class="sb-input" placeholder="contoh: Bikin quote motivasi hari ini">' +
            '<div class="ag-field-hint">💡 AI bakal jawab, hasilnya masuk ke chat</div></div>';
    } else if (type === 'note') {
        html = '<div class="field"><label>📝 Judul Catatan</label>' +
            '<input type="text" id="agActionTitle" class="sb-input" placeholder="contoh: Jurnal Harian">' +
            '<div class="field"><label>Isi Catatan</label>' +
            '<input type="text" id="agActionMessage" class="sb-input" placeholder="Tulis disini..."></div></div>';
    } else if (type === 'reminder') {
        html = '<div class="field"><label>⏰ Reminder Text</label>' +
            '<input type="text" id="agActionMessage" class="sb-input" placeholder="contoh: Cek email penting"></div>';
    } else if (type === 'auto_message') {
        html = '<div class="field"><label>💌 Pesan Auto Reply</label>' +
            '<input type="text" id="agActionMessage" class="sb-input" placeholder="Balas otomatis..."></div>';
    } else if (type === 'custom') {
        html = '<div class="field"><label>🧩 JavaScript Code</label>' +
            '<textarea id="agActionCode" class="sb-textarea" style="font-family: \'JetBrains Mono\', monospace; min-height: 120px;" placeholder="// Code jalan otomatis\n// Contoh:\nconsole.log(\'Agent jalan!\');\nalert(\'Halo!\');"></textarea>' +
            '<div class="ag-field-hint">⚠️ Hati-hati! Code bakal dieksekusi real</div></div>';
    }
    
    container.innerHTML = html;
}

/* ═══ CREATE AGENT ═══ */
function agCreateAgent() {
    var name = document.getElementById('agName').value.trim();
    if (!name) { showToast('⚠️ Isi nama agent'); return; }
    
    var triggerType = document.getElementById('agTriggerType').value;
    var actionType = document.getElementById('agActionType').value;
    
    var trigger = { type: triggerType };
    if (triggerType === 'time') {
        trigger.time = document.getElementById('agTriggerTime').value;
    } else if (triggerType === 'interval') {
        trigger.minutes = parseInt(document.getElementById('agTriggerInterval').value);
    } else if (triggerType === 'weekday') {
        trigger.weekday = parseInt(document.getElementById('agTriggerWeekday').value);
        trigger.time = document.getElementById('agTriggerTime').value;
    } else if (triggerType === 'keyword') {
        trigger.keyword = document.getElementById('agTriggerKeyword').value.trim().toLowerCase();
        if (!trigger.keyword) { showToast('⚠️ Isi keyword'); return; }
    } else if (triggerType === 'once') {
        trigger.date = document.getElementById('agTriggerDate').value;
        trigger.time = document.getElementById('agTriggerTime').value;
        if (!trigger.date) { showToast('⚠️ Isi tanggal'); return; }
    }
    
    var action = { type: actionType };
    if (actionType === 'notify' || actionType === 'reminder' || actionType === 'auto_message') {
        action.message = document.getElementById('agActionMessage').value.trim();
        if (!action.message) { showToast('⚠️ Isi message'); return; }
    } else if (actionType === 'chat') {
        action.prompt = document.getElementById('agActionPrompt').value.trim();
        if (!action.prompt) { showToast('⚠️ Isi prompt'); return; }
    } else if (actionType === 'note') {
        action.title = document.getElementById('agActionTitle').value.trim();
        action.message = document.getElementById('agActionMessage').value.trim();
    } else if (actionType === 'custom') {
        action.code = document.getElementById('agActionCode').value;
    }
    
    var agent = {
        id: 'agent_' + Date.now(),
        name: name,
        trigger: trigger,
        action: action,
        enabled: true,
        createdAt: Date.now(),
        runCount: 0
    };
    
    agAgents.push(agent);
    agSave();
    
    /* Reset form */
    document.getElementById('agName').value = '';
    document.getElementById('agActionMessage') && (document.getElementById('agActionMessage').value = '');
    document.getElementById('agActionPrompt') && (document.getElementById('agActionPrompt').value = '');
    
    agStartAgent(agent);
    showToast('🤖 Agent aktif!');
    agSetTab('active', document.querySelectorAll('.ag-tab')[1]);
}

/* ═══ RENDER ACTIVE ═══ */
function agRenderActive() {
    var list = document.getElementById('agActiveList');
    if (agAgents.length === 0) {
        list.innerHTML = '<div class="ag-empty"><div class="ag-empty-icon">🤖</div>Belum ada agent.<br><br>Bikin di tab ➕ Buat Agent!</div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < agAgents.length; i++) {
        var a = agAgents[i];
        var triggerDesc = agDescribeTrigger(a.trigger);
        var actionDesc = agDescribeAction(a.action);
        
        html += '<div class="ag-agent-card ' + (a.enabled ? '' : 'disabled') + '">';
        html += '<div class="ag-agent-header">';
        html += '<div class="ag-agent-status-dot ' + (a.enabled ? '' : 'off') + '"></div>';
        html += '<div class="ag-agent-name">' + escapeHtml(a.name) + '</div>';
        html += '<button class="ag-agent-toggle ' + (a.enabled ? 'on' : 'off') + '" onclick="agToggleAgent(\'' + a.id + '\')">' + (a.enabled ? '⚡ ON' : '💤 OFF') + '</button>';
        html += '<button class="ag-agent-delete" onclick="agDeleteAgent(\'' + a.id + '\')">🗑️</button>';
        html += '</div>';
        html += '<div class="ag-agent-details">';
        html += '<span>🎯 ' + triggerDesc + '</span>';
        html += '<span>⚡ ' + actionDesc + '</span>';
        html += '<span>📊 Jalan: ' + (a.runCount || 0) + 'x</span>';
        html += '</div>';
        html += '<div class="ag-agent-actions">';
        html += '<button class="ag-agent-action-btn" onclick="agTestRun(\'' + a.id + '\')">🧪 Test</button>';
        html += '<button class="ag-agent-action-btn" onclick="agManualRun(\'' + a.id + '\')">▶️ Jalanin Sekarang</button>';
        html += '</div>';
        html += '</div>';
    }
    list.innerHTML = html;
}

function agDescribeTrigger(t) {
    if (t.type === 'time') return '⏰ Tiap hari jam ' + t.time;
    if (t.type === 'interval') return '⏱️ Tiap ' + t.minutes + ' menit';
    if (t.type === 'weekday') {
        var days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        return '📅 Tiap ' + days[t.weekday] + ' jam ' + t.time;
    }
    if (t.type === 'keyword') return '💬 Keyword: "' + t.keyword + '"';
    if (t.type === 'once') return '🎯 ' + t.date + ' jam ' + t.time;
    return t.type;
}

function agDescribeAction(a) {
    if (a.type === 'notify') return '🔔 Notif: "' + (a.message || '').slice(0, 30) + '"';
    if (a.type === 'chat') return '💬 AI: "' + (a.prompt || '').slice(0, 30) + '"';
    if (a.type === 'note') return '📝 Note: "' + (a.title || '') + '"';
    if (a.type === 'reminder') return '⏰ Reminder: "' + (a.message || '').slice(0, 30) + '"';
    if (a.type === 'auto_message') return '💌 Auto: "' + (a.message || '').slice(0, 30) + '"';
    if (a.type === 'custom') return '🧩 Custom JS';
    return a.type;
}

/* ═══ TOGGLE / DELETE ═══ */
function agToggleAgent(id) {
    var a = agAgents.find(function(x) { return x.id === id; });
    if (!a) return;
    a.enabled = !a.enabled;
    agSave();
    
    if (a.enabled) agStartAgent(a);
    else agStopAgent(a);
    
    agRenderActive();
    showToast(a.enabled ? '⚡ Agent ON' : '💤 Agent OFF');
}

function agDeleteAgent(id) {
    if (!confirm('Hapus agent ini?')) return;
    agStopAgent(agAgents.find(function(x) { return x.id === id; }));
    agAgents = agAgents.filter(function(x) { return x.id !== id; });
    agSave();
    agRenderActive();
    showToast('🗑️ Agent dihapus');
}

/* ═══ START / STOP ═══ */
function agStartAgent(agent) {
    agStopAgent(agent);
    if (!agent.enabled) return;
    
    var trigger = agent.trigger;
    
    if (trigger.type === 'interval') {
        agIntervals[agent.id] = setInterval(function() {
            agExecute(agent.id);
        }, trigger.minutes * 60 * 1000);
    }
    /* For time/weekday/once, we check every 30s */
    if (trigger.type === 'time' || trigger.type === 'weekday' || trigger.type === 'once') {
        agIntervals[agent.id] = setInterval(function() {
            agCheckTimeTrigger(agent);
        }, 30000); /* Check every 30s */
    }
}

function agStopAgent(agent) {
    if (!agent) return;
    if (agIntervals[agent.id]) {
        clearInterval(agIntervals[agent.id]);
        delete agIntervals[agent.id];
    }
}

function agCheckTimeTrigger(agent) {
    if (!agent.enabled) return;
    var trigger = agent.trigger;
    var now = new Date();
    var currentTime = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    var currentDate = now.toDateString();
    
    /* Once trigger */
    if (trigger.type === 'once') {
        var triggerDateTime = trigger.date + ' ' + trigger.time;
        var nowDateTime = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0') + ' ' + currentTime;
        if (triggerDateTime === nowDateTime) {
            agExecute(agent.id);
            agent.enabled = false;
            agSave();
            agStopAgent(agent);
        }
        return;
    }
    
    /* Time trigger */
    if (trigger.type === 'time') {
        if (trigger.time === currentTime && agLastRunTime[agent.id] !== currentDate + '_' + currentTime) {
            agLastRunTime[agent.id] = currentDate + '_' + currentTime;
            agExecute(agent.id);
        }
    }
    
    /* Weekday trigger */
    if (trigger.type === 'weekday') {
        if (now.getDay() === trigger.weekday && trigger.time === currentTime && agLastRunTime[agent.id] !== currentDate + '_' + currentTime) {
            agLastRunTime[agent.id] = currentDate + '_' + currentTime;
            agExecute(agent.id);
        }
    }
}

/* ═══ EXECUTE ═══ */
function agExecute(agentId) {
    var agent = agAgents.find(function(x) { return x.id === agentId; });
    if (!agent || !agent.enabled) return;
    agRunAction(agent);
}

function agRunAction(agent) {
    var action = agent.action;
    var result = 'OK';
    
    try {
        if (action.type === 'notify') {
            showToast('🔔 ' + agent.name + ': ' + action.message);
            agSendBrowserNotification(agent.name, action.message);
        } else if (action.type === 'chat') {
            agSendToChat(agent, action.prompt);
        } else if (action.type === 'note') {
            var notes = localStorage.getItem('closiwer_notes') || '';
            var newNote = '\n\n## ' + (action.title || agent.name) + '\n' + (action.message || '') + '\n_' + new Date().toLocaleString('id-ID') + '_';
            localStorage.setItem('closiwer_notes', notes + newNote);
            showToast('📝 Catatan dibuat: ' + action.title);
        } else if (action.type === 'reminder') {
            var tasks = JSON.parse(localStorage.getItem('closiwer_tasks') || '[]');
            tasks.push({ text: '⏰ ' + action.message, done: false, created: Date.now() });
            localStorage.setItem('closiwer_tasks', JSON.stringify(tasks));
            showToast('⏰ Reminder ditambah ke Tasks');
        } else if (action.type === 'auto_message') {
            showToast('💌 Auto: ' + action.message);
        } else if (action.type === 'custom') {
            try {
                new Function(action.code)();
                result = 'Code executed';
            } catch (e) {
                result = 'Error: ' + e.message;
            }
        }
        
        agent.runCount = (agent.runCount || 0) + 1;
        agSave();
        agLog(agent.name, 'success', result);
        agRenderActive();
    } catch (e) {
        console.error('[Agent] Error:', e);
        agLog(agent.name, 'error', e.message);
    }
}

function agSendToChat(agent, prompt) {
    /* Add message to current chat */
    var s = (typeof state !== 'undefined' && state.sessions) ? state.sessions.find(function(x) { return x.id === state.currentSessionId; }) : null;
    if (s) {
        s.messages.push({
            role: 'assistant',
            content: '🤖 **' + agent.name + '**: ' + prompt,
            timestamp: Date.now()
        });
        if (typeof updateCurrentSession === 'function') updateCurrentSession(s.messages);
        if (typeof renderMessages === 'function') renderMessages();
    }
    showToast('💬 AI Agent: ' + agent.name);
}

function agSendBrowserNotification(title, body) {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
        try { new Notification(title, { body: body, icon: '/Ai-Closiwer/Dev.png' }); } catch(e) {}
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
}

/* ═══ LOGS ═══ */
function agLog(name, type, result) {
    agLogs.unshift({
        name: name,
        type: type,
        result: result,
        timestamp: Date.now()
    });
    agLogs = agLogs.slice(0, 100);
    agSave();
}

function agRenderLogs() {
    var list = document.getElementById('agLogsList');
    if (agLogs.length === 0) {
        list.innerHTML = '<div class="ag-empty"><div class="ag-empty-icon">📋</div>Belum ada log.<br><br>Aktifin agent untuk lihat log di sini.</div>';
        return;
    }
    var html = '';
    for (var i = 0; i < agLogs.length; i++) {
        var l = agLogs[i];
        var time = new Date(l.timestamp).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });
        html += '<div class="ag-log-item">';
        html += '<div class="ag-log-header">';
        html += '<div class="ag-log-name">' + escapeHtml(l.name) + '</div>';
        html += '<div class="ag-log-time">' + time + '</div>';
        html += '</div>';
        html += '<div class="ag-log-result ' + l.type + '">' + (l.type === 'success' ? '✅' : '❌') + ' ' + escapeHtml(l.result) + '</div>';
        html += '</div>';
    }
    list.innerHTML = html;
}

function agClearLogs() {
    if (!confirm('Hapus semua log?')) return;
    agLogs = [];
    agSave();
    agRenderLogs();
    showToast('🗑️ Logs dihapus');
}

/* ═══ TEST RUN ═══ */
function agTestRun(id) {
    var a = agAgents.find(function(x) { return x.id === id; });
    if (!a) return;
    showToast('🧪 Test: ' + a.name);
    agRunAction(a);
}

function agManualRun(id) {
    var a = agAgents.find(function(x) { return x.id === id; });
    if (!a) return;
    showToast('▶️ Manual run: ' + a.name);
    agRunAction(a);
}

/* ═══ PRESETS ═══ */
var agPresets = [
    { icon: '💧', name: 'Reminder Minum Air', desc: 'Ingetin minum air tiap 1 jam', trigger: { type: 'interval', minutes: 60 }, action: { type: 'notify', message: 'Jangan lupa minum air! 💧' } },
    { icon: '📚', name: 'Reminder Belajar', desc: 'Ingetin belajar tiap jam 7 malam', trigger: { type: 'time', time: '19:00' }, action: { type: 'notify', message: 'Waktunya belajar! 📚' } },
    { icon: '💪', name: 'Reminder Olahraga', desc: 'Reminder olahraga pagi', trigger: { type: 'time', time: '06:00' }, action: { type: 'notify', message: 'Waktunya olahraga pagi! 💪' } },
    { icon: '📝', name: 'Jurnal Harian', desc: 'Auto-bikin jurnal tiap malam', trigger: { type: 'time', time: '22:00' }, action: { type: 'note', title: 'Jurnal Harian', message: 'Hari ini gimana?' } },
    { icon: '🧘', name: 'Reminder Istirahat', desc: 'Ingetin istirahat tiap 2 jam', trigger: { type: 'interval', minutes: 120 }, action: { type: 'notify', message: 'Istirahat dulu 5 menit! 🧘' } },
    { icon: '📧', name: 'Cek Email', desc: 'Reminder cek email pagi', trigger: { type: 'time', time: '09:00' }, action: { type: 'notify', message: 'Cek email penting! 📧' } },
    { icon: '💊', name: 'Reminder Vitamin', desc: 'Reminder minum vitamin', trigger: { type: 'time', time: '08:00' }, action: { type: 'notify', message: 'Minum vitamin dulu! 💊' } },
    { icon: '🌟', name: 'Quote Pagi', desc: 'AI bikin quote motivasi pagi', trigger: { type: 'time', time: '06:30' }, action: { type: 'chat', prompt: 'Bikin 1 quote motivasi pagi yang singkat' } }
];

function agRenderPresets() {
    var grid = document.getElementById('agPresetsGrid');
    var html = '';
    for (var i = 0; i < agPresets.length; i++) {
        var p = agPresets[i];
        html += '<div class="ag-preset-card" onclick="agUsePreset(' + i + ')">';
        html += '<div class="ag-preset-icon">' + p.icon + '</div>';
        html += '<div class="ag-preset-name">' + escapeHtml(p.name) + '</div>';
        html += '<div class="ag-preset-desc">' + escapeHtml(p.desc) + '</div>';
        html += '</div>';
    }
    grid.innerHTML = html;
}

function agUsePreset(idx) {
    var p = agPresets[idx];
    var agent = {
        id: 'agent_' + Date.now(),
        name: p.name,
        trigger: JSON.parse(JSON.stringify(p.trigger)),
        action: JSON.parse(JSON.stringify(p.action)),
        enabled: true,
        createdAt: Date.now(),
        runCount: 0
    };
    agAgents.push(agent);
    agSave();
    agStartAgent(agent);
    showToast('✅ ' + p.name + ' aktif!');
    agSetTab('active', document.querySelectorAll('.ag-tab')[1]);
}

/* ═══ KEYWORD TRIGGER (integrate with chat) ═══ */
function agCheckKeywordTriggers(message) {
    var lower = message.toLowerCase();
    for (var i = 0; i < agAgents.length; i++) {
        var a = agAgents[i];
        if (a.enabled && a.trigger.type === 'keyword' && lower.indexOf(a.trigger.keyword) !== -1) {
            agRunAction(a);
        }
    }
}

/* ═══ QUICK ACCESS ═══ */
function openAgentMode() {
    var modal = document.getElementById('agentModal');
    if (modal) {
        modal.classList.add('show');
        agUpdateTriggerFields();
        agUpdateActionFields();
        agRenderActive();
    }
}

/* ═══ AUTO-START ALL ENABLED AGENTS ═══ */
setTimeout(function() {
    for (var i = 0; i < agAgents.length; i++) {
        if (agAgents[i].enabled) agStartAgent(agAgents[i]);
    }
    console.log('[Agent] ' + agAgents.length + ' agents loaded');
}, 2000);

console.log('🤖 FITUR v5.1: AI Agent Mode loaded!');
/* ═══════════════════════════════════════
   FITUR #8: AI WEBSITE BUILDER
═══════════════════════════════════════ */

var wbCurrentCode = { html: '', css: '', js: '' };
var wbCurrentTab = 'html';
var wbProjects = JSON.parse(localStorage.getItem('closiwer_webprojects') || '[]');
var wbCurrentDevice = 'desktop';

function wbSetTab(tab, el) {
    document.querySelectorAll('.wb-tab').forEach(function(t) { t.classList.remove('active'); });
    document.querySelectorAll('.wb-content').forEach(function(c) { c.classList.remove('active'); });
    el.classList.add('active');
    var content = document.querySelector('.wb-content[data-wb-tab="' + tab + '"]');
    if (content) content.classList.add('active');
    
    if (tab === 'templates') wbRenderTemplates();
    if (tab === 'projects') wbRenderProjects();
}

function wbSetColor(color) {
    document.getElementById('wbColor').value = color;
}

function wbSetDevice(device, el) {
    wbCurrentDevice = device;
    document.querySelectorAll('.wb-device-btn').forEach(function(b) { b.classList.remove('active'); });
    el.classList.add('active');
    var frame = document.getElementById('wbDeviceFrame');
    frame.className = 'wb-device-frame ' + device;
}

function wbSetCodeTab(tab, el) {
    wbCurrentTab = tab;
    document.querySelectorAll('.wb-code-tab').forEach(function(t) { t.classList.remove('active'); });
    el.classList.add('active');
    document.getElementById('wbCodeEditor').value = wbCurrentCode[tab] || '';
}

function wbRefreshPreview() {
    /* Update current code from editor */
    wbCurrentCode[wbCurrentTab] = document.getElementById('wbCodeEditor').value;
    wbUpdatePreview();
}

function wbUpdatePreview() {
    var html = wbCurrentCode.html || '';
    var css = wbCurrentCode.css || '';
    var js = wbCurrentCode.js || '';
    
    /* Check if html already complete */
    var fullDoc;
    if (html.match(/<!DOCTYPE|<html/i)) {
        fullDoc = html;
        /* Inject css & js if not present */
        if (css && html.indexOf('</head>') !== -1) {
            fullDoc = fullDoc.replace('</head>', '<style>' + css + '</style></head>');
        }
        if (js && html.indexOf('</body>') !== -1) {
            fullDoc = fullDoc.replace('</body>', '<script>' + js + '<\/script></body>');
        }
    } else {
        fullDoc = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>' + css + '</style></head><body>' + html + '<script>' + js + '<\/script></body></html>';
    }
    
    var iframe = document.getElementById('wbPreviewFrame');
    if (iframe) {
        iframe.srcdoc = fullDoc;
    }
}

/* ═══ GENERATE ═══ */
function wbGenerate() {
    var desc = document.getElementById('wbDesc').value.trim();
    if (!desc) { showToast('⚠️ Isi deskripsi dulu'); return; }
    
    var style = document.getElementById('wbStyle').value;
    var type = document.getElementById('wbType').value;
    var color = document.getElementById('wbColor').value;
    
    document.getElementById('wbPreviewWrap').style.display = 'block';
    document.getElementById('wbPreviewFrame').srcdoc = '<html><body style="background: #0a0a0f; color: #f5f4ef; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;"><div style="text-align: center;"><div style="width: 40px; height: 40px; border: 3px solid #333; border-top-color: ' + color + '; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div><div>AI generating website... 🤖</div><style>@keyframes spin { to { transform: rotate(360deg); } }</style></div></body></html>';
    
    var apiKey = (typeof config !== 'undefined' && config.apiKey) ? config.apiKey : '';
    
    if (!apiKey || apiKey.length < 10) {
        setTimeout(function() {
            var template = wbGenerateTemplate(desc, style, type, color);
            wbCurrentCode = template;
            document.getElementById('wbCodeEditor').value = template.html;
            wbUpdatePreview();
            showToast('💡 Demo template — isi API key untuk AI generate');
        }, 1500);
        return;
    }
    
    var prompt = 'Bikin website ' + type + ' dengan deskripsi: "' + desc + '"\n\n' +
        'Persyaratan:\n' +
        '- Style: ' + style + '\n' +
        '- Warna utama: ' + color + '\n' +
        '- Single HTML file dengan CSS inline di <style> dan JS di <script>\n' +
        '- Modern, responsive, ready to use\n' +
        '- Bahasa Indonesia\n' +
        '- Include: navbar, hero section, features/content, footer\n\n' +
        'Jawab dengan JSON valid:\n' +
        '{"html": "kode HTML lengkap dengan inline CSS dan JS di dalam <!DOCTYPE html>", "explanation": "penjelasan singkat"}';
    
    fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
        body: JSON.stringify({
            model: config.model || 'llama-3.1-8b-instant',
            messages: [
                { role: 'system', content: 'Kamu web developer expert. Buat single-file HTML dengan inline CSS+JS. Jawab dengan JSON valid.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 4000,
            response_format: { type: 'json_object' }
        })
    })
    .then(function(res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
    .then(function(data) {
        var content = data.choices[0].message.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        var parsed = JSON.parse(content);
        var fullHtml = parsed.html || '';
        
        /* Split into parts */
        var cssMatch = fullHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
        var jsMatch = fullHtml.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
        var bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        
        wbCurrentCode = {
            html: fullHtml,
            css: cssMatch ? cssMatch[1].trim() : '',
            js: jsMatch ? jsMatch[1].trim() : ''
        };
        
        document.getElementById('wbCodeEditor').value = fullHtml;
        wbCurrentTab = 'html';
        document.querySelectorAll('.wb-code-tab').forEach(function(t, i) { if (i === 0) t.classList.add('active'); else t.classList.remove('active'); });
        wbUpdatePreview();
        showToast('✅ Website generated!');
    })
    .catch(function(err) {
        console.error('[WebsiteBuilder]', err);
        var template = wbGenerateTemplate(desc, style, type, color);
        wbCurrentCode = template;
        document.getElementById('wbCodeEditor').value = template.html;
        wbUpdatePreview();
        showToast('⚠️ AI gagal, pakai demo template');
    });
}

/* ═══ TEMPLATE GENERATOR (Fallback) ═══ */
function wbGenerateTemplate(desc, style, type, color) {
    var bg, text, card;
    if (style === 'dark') { bg = '#0a0a0f'; text = '#f5f4ef'; card = '#1a1a24'; }
    else if (style === 'minimal') { bg = '#ffffff'; text = '#1a1a24'; card = '#f5f5f7'; }
    else if (style === 'playful') { bg = '#fef3c7'; text = '#1a1a24'; card = '#ffffff'; }
    else if (style === 'corporate') { bg = '#f8fafc'; text = '#0f172a'; card = '#ffffff'; }
    else { bg = '#ffffff'; text = '#1a1a24'; card = '#f5f5f7'; }
    
    var gradient = 'linear-gradient(135deg, ' + color + ', ' + wbDarken(color, 30) + ')';
    
    var html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(desc.slice(0, 40))}</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, 'Segoe UI', sans-serif; }
body { background: ${bg}; color: ${text}; line-height: 1.6; }
.navbar { padding: 20px 40px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(128,128,128,0.2); }
.logo { font-size: 22px; font-weight: 800; background: ${gradient}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.nav-links { display: flex; gap: 24px; }
.nav-links a { color: ${text}; text-decoration: none; font-size: 14px; font-weight: 600; opacity: 0.8; }
.nav-links a:hover { opacity: 1; color: ${color}; }
.hero { padding: 80px 40px; text-align: center; background: ${gradient}; color: white; }
.hero h1 { font-size: 48px; font-weight: 800; margin-bottom: 16px; line-height: 1.2; }
.hero p { font-size: 18px; opacity: 0.95; max-width: 600px; margin: 0 auto 30px; }
.btn { display: inline-block; padding: 14px 32px; background: white; color: ${color}; text-decoration: none; border-radius: 12px; font-weight: 700; transition: all 0.2s; }
.btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
.section { padding: 80px 40px; max-width: 1200px; margin: 0 auto; }
.section-title { font-size: 32px; font-weight: 800; text-align: center; margin-bottom: 16px; }
.section-sub { text-align: center; color: ${text}; opacity: 0.6; margin-bottom: 48px; }
.features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.feature { padding: 32px; background: ${card}; border-radius: 16px; text-align: center; transition: all 0.3s; }
.feature:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.1); }
.feature-icon { font-size: 48px; margin-bottom: 16px; }
.feature h3 { font-size: 20px; margin-bottom: 8px; }
.feature p { opacity: 0.7; font-size: 14px; }
.footer { padding: 40px; text-align: center; border-top: 1px solid rgba(128,128,128,0.2); opacity: 0.6; font-size: 14px; }
@media (max-width: 768px) {
.hero h1 { font-size: 32px; }
.navbar { padding: 16px 20px; }
.nav-links { display: none; }
.features { grid-template-columns: 1fr; }
.section { padding: 40px 20px; }
}
</style>
</head>
<body>
<nav class="navbar">
<div class="logo">${escapeHtml(desc.slice(0, 20))}</div>
<div class="nav-links">
<a href="#">Home</a>
<a href="#">About</a>
<a href="#">Contact</a>
</div>
</nav>
<section class="hero">
<h1>${escapeHtml(desc.slice(0, 60))}</h1>
<p>Website ini dibuat dengan CLOSIWER AI Website Builder. Tinggal customize sesuai kebutuhan lu!</p>
<a href="#" class="btn">Mulai Sekarang →</a>
</section>
<section class="section">
<h2 class="section-title">Fitur Unggulan</h2>
<p class="section-sub">Kenapa pilih kami?</p>
<div class="features">
<div class="feature"><div class="feature-icon">⚡</div><h3>Cepat</h3><p>Performa tinggi dan responsif di semua device</p></div>
<div class="feature"><div class="feature-icon">🎨</div><h3>Modern</h3><p>Design kekinian dengan animasi halus</p></div>
<div class="feature"><div class="feature-icon">🔒</div><h3>Aman</h3><p>Keamanan terjamin dan terpercaya</p></div>
</div>
</section>
<footer class="footer">
<p>© 2026 ${escapeHtml(desc.slice(0, 20))} — Generated by CLOSIWER AI</p>
</footer>
<script>
console.log('Website loaded!');
document.querySelectorAll('a[href="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) { e.preventDefault(); });
});
<\/script>
</body>
</html>`;
    
    var cssMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    var jsMatch = html.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    
    return {
        html: html,
        css: cssMatch ? cssMatch[1].trim() : '',
        js: jsMatch ? jsMatch[1].trim() : ''
    };
}

function wbDarken(hex, percent) {
    var rgb = hex.replace('#', '');
    if (rgb.length === 3) rgb = rgb.split('').map(function(c) { return c + c; }).join('');
    var r = Math.max(0, Math.floor(parseInt(rgb.substring(0, 2), 16) * (1 - percent / 100)));
    var g = Math.max(0, Math.floor(parseInt(rgb.substring(2, 4), 16) * (1 - percent / 100)));
    var b = Math.max(0, Math.floor(parseInt(rgb.substring(4, 6), 16) * (1 - percent / 100)));
    return '#' + [r, g, b].map(function(x) { var h = x.toString(16); return h.length === 1 ? '0' + h : h; }).join('');
}

/* ═══ FULLSCREEN / EXPORT / COPY ═══ */
function wbViewFullscreen() {
    wbCurrentCode[wbCurrentTab] = document.getElementById('wbCodeEditor').value;
    var html = wbCurrentCode.html || '';
    if (!html.match(/<!DOCTYPE|<html/i)) {
        html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>' + (wbCurrentCode.css || '') + '</style></head><body>' + html + '<script>' + (wbCurrentCode.js || '') + '<\/script></body></html>';
    }
    var w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
}

function wbExportHTML() {
    wbCurrentCode[wbCurrentTab] = document.getElementById('wbCodeEditor').value;
    var html = wbCurrentCode.html || '';
    if (!html.match(/<!DOCTYPE|<html/i)) {
        html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>' + (wbCurrentCode.css || '') + '</style></head><body>' + html + '<script>' + (wbCurrentCode.js || '') + '<\/script></body></html>';
    }
    var blob = new Blob([html], { type: 'text/html' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'website-' + Date.now() + '.html';
    a.click();
    URL.revokeObjectURL(url);
    showToast('📥 Website di-export!');
}

function wbCopyCode() {
    wbCurrentCode[wbCurrentTab] = document.getElementById('wbCodeEditor').value;
    var html = wbCurrentCode.html || '';
    if (!html.match(/<!DOCTYPE|<html/i)) {
        html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>' + (wbCurrentCode.css || '') + '</style></head><body>' + html + '<script>' + (wbCurrentCode.js || '') + '<\/script></body></html>';
    }
    copyToClipboard(html, 'Kode website disalin!');
}

function wbSaveProject() {
    wbCurrentCode[wbCurrentTab] = document.getElementById('wbCodeEditor').value;
    var desc = document.getElementById('wbDesc').value.trim() || 'Untitled Project';
    
    var project = {
        id: 'wb_' + Date.now(),
        name: desc.slice(0, 40),
        code: JSON.parse(JSON.stringify(wbCurrentCode)),
        createdAt: Date.now()
    };
    wbProjects.unshift(project);
    wbProjects = wbProjects.slice(0, 20);
    localStorage.setItem('closiwer_webprojects', JSON.stringify(wbProjects));
    showToast('💾 Project saved!');
    wbRenderProjects();
}

/* ═══ TEMPLATES ═══ */
var wbTemplates = [
    { icon: '🚀', name: 'Landing Page', desc: 'Landing page modern untuk startup', prompt: 'Website landing page untuk startup teknologi', style: 'modern', type: 'landing' },
    { icon: '💼', name: 'Portfolio', desc: 'Portfolio personal untuk freelancer', prompt: 'Website portfolio untuk designer grafis dengan galeri karya', style: 'minimal', type: 'portfolio' },
    { icon: '📝', name: 'Blog', desc: 'Blog pribadi dengan artikel', prompt: 'Blog pribadi tentang traveling dan lifestyle', style: 'modern', type: 'blog' },
    { icon: '🍽️', name: 'Restaurant', desc: 'Website restoran dengan menu', prompt: 'Website restoran Indonesia dengan menu dan reservasi', style: 'dark', type: 'restaurant' },
    { icon: '🏢', name: 'Business', desc: 'Website perusahaan profesional', prompt: 'Website perusahaan konsultan bisnis', style: 'corporate', type: 'business' },
    { icon: '🎉', name: 'Event', desc: 'Landing page event & conference', prompt: 'Website event tech conference 2026', style: 'playful', type: 'event' },
    { icon: '🎓', name: 'School', desc: 'Website sekolah/les', prompt: 'Website lembaga kursus bahasa Inggris', style: 'modern', type: 'school' },
    { icon: '📦', name: 'Product', desc: 'Product showcase page', prompt: 'Website product launch untuk gadget terbaru', style: 'glassmorphism', type: 'product' }
];

function wbRenderTemplates() {
    var grid = document.getElementById('wbTemplatesGrid');
    var html = '';
    for (var i = 0; i < wbTemplates.length; i++) {
        var t = wbTemplates[i];
        html += '<div class="wb-template-card" onclick="wbUseTemplate(' + i + ')">';
        html += '<div class="wb-template-icon">' + t.icon + '</div>';
        html += '<div class="wb-template-name">' + escapeHtml(t.name) + '</div>';
        html += '<div class="wb-template-desc">' + escapeHtml(t.desc) + '</div>';
        html += '</div>';
    }
    grid.innerHTML = html;
}

function wbUseTemplate(idx) {
    var t = wbTemplates[idx];
    document.getElementById('wbDesc').value = t.prompt;
    document.getElementById('wbStyle').value = t.style;
    document.getElementById('wbType').value = t.type;
    wbSetTab('generate', document.querySelectorAll('.wb-tab')[0]);
    setTimeout(wbGenerate, 200);
}

/* ═══ PROJECTS ═══ */
function wbRenderProjects() {
    var list = document.getElementById('wbProjectsList');
    if (wbProjects.length === 0) {
        list.innerHTML = '<div class="ag-empty"><div class="ag-empty-icon">💾</div>Belum ada project.<br><br>Generate website dulu, terus klik 💾 Save!</div>';
        return;
    }
    var html = '';
    for (var i = 0; i < wbProjects.length; i++) {
        var p = wbProjects[i];
        var date = new Date(p.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        html += '<div class="wb-project-item">';
        html += '<div class="wb-project-icon">🌐</div>';
        html += '<div class="wb-project-info" onclick="wbLoadProject(' + i + ')">';
        html += '<div class="wb-project-name">' + escapeHtml(p.name) + '</div>';
        html += '<div class="wb-project-meta">' + date + ' · ' + (p.code.html || '').length + ' chars</div>';
        html += '</div>';
        html += '<button class="wb-project-delete" onclick="wbDeleteProject(' + i + ')">🗑️</button>';
        html += '</div>';
    }
    list.innerHTML = html;
}

function wbLoadProject(idx) {
    var p = wbProjects[idx];
    if (!p) return;
    wbCurrentCode = JSON.parse(JSON.stringify(p.code));
    document.getElementById('wbDesc').value = p.name;
    document.getElementById('wbPreviewWrap').style.display = 'block';
    document.getElementById('wbCodeEditor').value = wbCurrentCode[wbCurrentTab] || wbCurrentCode.html || '';
    wbSetTab('generate', document.querySelectorAll('.wb-tab')[0]);
    wbUpdatePreview();
    showToast('📂 Project loaded: ' + p.name);
}

function wbDeleteProject(idx) {
    if (!confirm('Hapus project ini?')) return;
    wbProjects.splice(idx, 1);
    localStorage.setItem('closiwer_webprojects', JSON.stringify(wbProjects));
    wbRenderProjects();
    showToast('🗑️ Project dihapus');
}

function wbClearProjects() {
    if (!confirm('Hapus SEMUA project?')) return;
    wbProjects = [];
    localStorage.removeItem('closiwer_webprojects');
    wbRenderProjects();
    showToast('🗑️ Semua project dihapus');
}

/* ═══ QUICK ACCESS ═══ */
function openWebsiteBuilder() {
    var modal = document.getElementById('webBuilderModal');
    if (modal) {
        modal.classList.add('show');
        wbRenderTemplates();
        wbRenderProjects();
    }
}

console.log('🌐 FITUR v5.1: Website Builder loaded!');
/* ═══════════════════════════════════════
   CINEMATIC LOADER v3.0 - Full Script
═══════════════════════════════════════ */

var loaderState = {
    running: false,
    done: false,
    progress: 0,
    animationId: null
};

/* ═══ LOG MESSAGES ═══ */
var loaderLogMessages = [
    { ok: true, text: 'Initializing CLOSIWER core engine...' },
    { ok: true, text: 'Loading neural networks...' },
    { ok: true, text: 'Mounting AI modules (v5.1)...' },
    { ok: true, text: 'Connecting to Groq API...' },
    { ok: true, text: 'Loading Color Palette Engine...' },
    { ok: true, text: 'Calibrating Avatar Generator...' },
    { ok: true, text: 'Warming Recipe Engine...' },
    { ok: true, text: 'Initializing Finance Tracker...' },
    { ok: true, text: 'Loading Code Reviewer AI...' },
    { ok: true, text: 'Syncing Study Buddy database...' },
    { ok: true, text: 'Activating AI Agent Mode...' },
    { ok: true, text: 'Launching Website Builder...' },
    { ok: true, text: 'Optimizing performance...' },
    { ok: true, text: 'All systems operational! ✨' }
];

/* ═══ TYPE TEXT ═══ */
function typeTextCin(element, text, speed, callback) {
    var i = 0;
    element.innerHTML = '';
    var cursor = '<span class="cursor-blink"></span>';
    
    function type() {
        if (i < text.length) {
            element.innerHTML = text.substring(0, i + 1) + cursor;
            i++;
            setTimeout(type, speed);
        } else {
            element.innerHTML = text + cursor;
            if (callback) callback();
        }
    }
    type();
}

/* ═══ PARTICLES ═══ */
function initLoaderParticles() {
    var canvas = document.getElementById('loaderCanvas');
    if (!canvas) return;
    
    var ctx = canvas.getContext('2d');
    var particles = [];
    var W, H;
    
    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    
    var centerX = W / 2;
    var centerY = H / 2;
    
    /* Burst particles */
    for (var i = 0; i < 80; i++) {
        var angle = (Math.PI * 2 * i) / 80 + Math.random() * 0.3;
        var speed = 2 + Math.random() * 5;
        particles.push({
            x: centerX,
            y: centerY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 1 + Math.random() * 3,
            life: 1,
            decay: 0.005 + Math.random() * 0.01,
            color: Math.random() < 0.5 ? '#d97757' : (Math.random() < 0.5 ? '#38bdf8' : '#8b5cf6')
        });
    }
    
    /* Ambient particles */
    for (var j = 0; j < 30; j++) {
        particles.push({
            x: Math.random() * W,
            y: Math.random() * H,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 0.5,
            life: 1,
            decay: 0,
            ambient: true,
            color: '#d97757'
        });
    }
    
    function animate() {
        if (loaderState.done && particles.length < 5) return;
        
        ctx.clearRect(0, 0, W, H);
        
        for (var i = particles.length - 1; i >= 0; i--) {
            var p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            
            if (!p.ambient) {
                p.vx *= 0.98;
                p.vy *= 0.98;
                p.life -= p.decay;
            } else {
                if (p.x < 0 || p.x > W) p.vx *= -1;
                if (p.y < 0 || p.y > H) p.vy *= -1;
            }
            
            if (p.life <= 0) {
                particles.splice(i, 1);
                continue;
            }
            
            var gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 6);
            gradient.addColorStop(0, p.color);
            gradient.addColorStop(0.5, p.color + '80');
            gradient.addColorStop(1, p.color + '00');
            
            ctx.globalAlpha = p.life * 0.9;
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 6, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.globalAlpha = p.life;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.globalAlpha = 1;
        loaderState.animationId = requestAnimationFrame(animate);
    }
    animate();
}

/* ═══ MORPH LOGO ═══ */
function initMorphLogo() {
    var morphPath = document.getElementById('morphPath');
    var morphCircle = document.getElementById('morphCircle');
    if (!morphPath) return;
    
    var shapes = [
        'M50 10 L85 30 L85 70 L50 90 L15 70 L15 30 Z',
        'M50 15 L85 50 L50 85 L15 50 Z',
        'M50 12 L80 30 L80 70 L50 88 L20 70 L20 30 Z',
        'M50 15 L78 40 L78 60 L50 85 L22 60 L22 40 Z',
        'M50 10 L85 30 L85 70 L50 90 L15 70 L15 30 Z'
    ];
    
    var gradients = ['url(#morphGrad1)', 'url(#morphGrad2)', 'url(#morphGrad3)', 'url(#morphGrad1)'];
    
    var shapeIndex = 0;
    var gradIndex = 0;
    
    function morphNext() {
        if (loaderState.done) return;
        
        shapeIndex = (shapeIndex + 1) % shapes.length;
        gradIndex = (gradIndex + 1) % gradients.length;
        
        morphPath.setAttribute('d', shapes[shapeIndex]);
        morphPath.setAttribute('stroke', gradients[gradIndex]);
        
        if (morphCircle) morphCircle.setAttribute('fill', gradients[gradIndex]);
        
        setTimeout(morphNext, 1200);
    }
    
    setTimeout(morphNext, 1500);
}

/* ═══ TERMINAL ═══ */
function startTerminalLog() {
    var terminalBody = document.getElementById('terminalBody');
    if (!terminalBody) return;
    
    var index = 0;
    
    function addLog() {
        if (loaderState.done || index >= loaderLogMessages.length) return;
        
        var msg = loaderLogMessages[index];
        var time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        var line = document.createElement('span');
        line.className = 'log-line';
        line.innerHTML = '<span class="log-time">' + time + '</span>' +
                        '<span class="' + (msg.ok ? 'log-ok' : 'log-info') + '">' + (msg.ok ? '✓' : '●') + '</span>' +
                        '<span class="log-text">' + msg.text + '</span>';
        terminalBody.appendChild(line);
        
        while (terminalBody.children.length > 6) {
            terminalBody.removeChild(terminalBody.firstChild);
        }
        
        index++;
        setTimeout(addLog, 350 + Math.random() * 200);
    }
    
    setTimeout(addLog, 2000);
}

/* ═══ PROGRESS ═══ */
function startProgress() {
    var fill = document.getElementById('progressFill');
    var pct = document.getElementById('progressPct');
    var sparkles = document.getElementById('progressSparkles');
    if (!fill) return;
    
    function update() {
        if (loaderState.done) return;
        
        var increment;
        if (loaderState.progress < 30) increment = 0.6;
        else if (loaderState.progress < 60) increment = 0.45;
        else if (loaderState.progress < 85) increment = 0.3;
        else if (loaderState.progress < 95) increment = 0.2;
        else increment = 0.1;
        
        loaderState.progress += increment;
        
        if (loaderState.progress >= 100) {
            loaderState.progress = 100;
            fill.style.width = '100%';
            pct.textContent = '100%';
            setTimeout(triggerFinale, 400);
            return;
        }
        
        fill.style.width = loaderState.progress + '%';
        pct.textContent = Math.floor(loaderState.progress) + '%';
        
        var chipCount = Math.floor((loaderState.progress / 100) * 6);
        var chips = document.querySelectorAll('.chip-cine');
        chips.forEach(function(chip, i) {
            if (i < chipCount) chip.classList.add('active');
        });
        
        if (Math.random() < 0.3 && sparkles) {
            var sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.left = loaderState.progress + '%';
            sparkles.appendChild(sparkle);
            setTimeout(function() {
                if (sparkle.parentNode) sparkle.parentNode.removeChild(sparkle);
            }, 1200);
        }
        
        requestAnimationFrame(update);
    }
    
    setTimeout(update, 1500);
}

/* ═══ FINALE ═══ */
function triggerFinale() {
    var loader = document.getElementById('closiwerLoader');
    if (!loader) return;
    
    for (var i = 0; i < 5; i++) {
        setTimeout(function() { createFireworkCin(loader); }, i * 150);
    }
    
    setTimeout(function() {
        loaderState.done = true;
        if (loaderState.animationId) cancelAnimationFrame(loaderState.animationId);
        hideLoader();
    }, 1200);
}

function createFireworkCin(parent) {
    var W = window.innerWidth;
    var H = window.innerHeight;
    var cx = W / 2 + (Math.random() - 0.5) * W * 0.6;
    var cy = H / 2 + (Math.random() - 0.5) * H * 0.5;
    
    var colors = ['#ff8c5a', '#38bdf8', '#8b5cf6', '#ec4899', '#fbbf24', '#4ade80'];
    
    for (var i = 0; i < 20; i++) {
        var particle = document.createElement('div');
        particle.className = 'firework';
        particle.style.left = cx + 'px';
        particle.style.top = cy + 'px';
        var color = colors[Math.floor(Math.random() * colors.length)];
        particle.style.background = color;
        particle.style.boxShadow = '0 0 12px ' + color;
        particle.style.setProperty('--angle', (Math.PI * 2 * i / 20) + 'rad');
        particle.style.setProperty('--distance', (60 + Math.random() * 80) + 'px');
        particle.style.animationDelay = (Math.random() * 0.2) + 's';
        parent.appendChild(particle);
        
        (function(p) {
            setTimeout(function() {
                if (p.parentNode) p.parentNode.removeChild(p);
            }, 2000);
        })(particle);
    }
}

/* ═══ START LOADER ═══ */
function startCinematicLoader() {
    if (loaderState.running) return;
    loaderState.running = true;
    
    var loader = document.getElementById('closiwerLoader');
    if (!loader) return;
    
    initLoaderParticles();
    initMorphLogo();
    
    setTimeout(function() {
        var brandText = document.getElementById('brandText');
        if (brandText) {
            typeTextCin(brandText, 'CLOSIWER', 100, function() {
                var sub = document.getElementById('brandSub');
                if (sub) {
                    setTimeout(function() {
                        typeTextCin(sub, 'AI v5.1 — ULTIMATE', 60);
                    }, 200);
                }
            });
        }
    }, 800);
    
    startTerminalLog();
    startProgress();
}

/* ═══ HIDE LOADER ═══ */
function hideLoader() {
    var loader = document.getElementById('closiwerLoader');
    var app = document.querySelector('.app-container');
    
    if (!loader) return;
    
    loader.classList.add('fade-out');
    if (app) app.classList.add('loaded');
    
    setTimeout(function() {
        loader.classList.add('hidden');
        setTimeout(function() {
            if (loader.parentNode) loader.parentNode.removeChild(loader);
        }, 500);
    }, 1000);
    
    if (typeof initParticles === 'function') setTimeout(initParticles, 200);
    if (typeof initMatrix === 'function') setTimeout(initMatrix, 400);
    
    console.log('✅ CLOSIWER loaded with cinematic animation!');
}

/* ═══ SKIP ═══ */
function skipLoader() {
    if (loaderState.done) return;
    loaderState.done = true;
    if (loaderState.animationId) cancelAnimationFrame(loaderState.animationId);
    hideLoader();
    if (typeof showToast === 'function') showToast('⏩ Skipped!');
}

/* ═══ AUTO-START ═══ */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startCinematicLoader);
} else {
    if (document.getElementById('closiwerLoader')) {
        startCinematicLoader();
    }
}

/* ═══ FALLBACK ═══ */
setTimeout(function() {
    if (!loaderState.done) {
        console.log('⏰ Loader timeout, forcing hide');
        skipLoader();
    }
}, 15000);

console.log('🎬 CINEMATIC LOADER v3.0 loaded!');
/* ═══════════════════════════════════════
   v6.0 — PWA + PERFORMANCE + BUG FIXES
═══════════════════════════════════════ */

/* ═══ 1. PWA SERVICE WORKER ═══ */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('sw.js')
            .then(function(reg) {
                console.log('✅ Service Worker registered:', reg.scope);
            })
            .catch(function(err) {
                console.log('❌ SW failed:', err);
            });
    });
}

/* ═══ 2. PERFORMANCE — Defer non-critical init ═══ */
function deferInit() {
    var deferredModules = [
        { fn: 'sbInit', delay: 2000 },
        { fn: 'finInit', delay: 2500 },
        { fn: 'rcRenderFavorites', delay: 3000 },
        { fn: 'cpUpdateLineNumbers', delay: 3500 }
    ];
    
    deferredModules.forEach(function(mod) {
        setTimeout(function() {
            if (typeof window[mod.fn] === 'function') {
                try {
                    window[mod.fn]();
                    console.log('✅ Deferred:', mod.fn);
                } catch(e) {
                    console.log('⚠️ Deferred failed:', mod.fn, e.message);
                }
            }
        }, mod.delay);
    });
}

if (document.readyState === 'complete') {
    deferInit();
} else {
    window.addEventListener('load', function() {
        setTimeout(deferInit, 1500);
    });
}

/* Idle task */
function idleTask(fn) {
    if ('requestIdleCallback' in window) {
        requestIdleCallback(fn, { timeout: 3000 });
    } else {
        setTimeout(fn, 200);
    }
}

/* Preload images */
idleTask(function() {
    var img = new Image();
    img.src = 'Dev.png';
});

/* ═══ 3. BUG FIXES & ERROR HANDLING ═══ */

/* Global error handler */
window.addEventListener('error', function(e) {
    console.error('🚨 Error:', e.message, 'at', e.filename + ':' + e.lineno);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('🚨 Unhandled Promise:', e.reason);
});

/* Safe function call */
function safeCall(fnName) {
    var args = Array.prototype.slice.call(arguments, 1);
    try {
        if (typeof window[fnName] === 'function') {
            return window[fnName].apply(null, args);
        }
        return null;
    } catch (e) {
        console.error('❌ safeCall failed:', fnName, e.message);
        return null;
    }
}

/* Prevent double-tap zoom */
document.addEventListener('gesturestart', function(e) { e.preventDefault(); });

/* iOS keyboard fix */
document.addEventListener('focusin', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        setTimeout(function() {
            e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    }
});

/* localStorage quota handling */
var _originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
    try {
        _originalSetItem.call(localStorage, key, value);
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            console.warn('⚠️ Storage full, cleaning...');
            try {
                localStorage.removeItem('closiwer_agent_logs');
                localStorage.removeItem('closiwer_chat_history');
                _originalSetItem.call(localStorage, key, value);
            } catch (e2) {
                console.error('❌ Storage full');
                if (typeof showToast === 'function') showToast('⚠️ Storage penuh!');
            }
        }
    }
};

/* Health check */
setTimeout(function() {
    var issues = [];
    if (typeof config !== 'undefined' && (!config.apiKey || config.apiKey.length < 10)) {
        issues.push('API Key belum diset');
    }
    try {
        var used = JSON.stringify(localStorage).length;
        if (used > 4000000) issues.push('Storage: ' + Math.round(used/1000000) + 'MB');
    } catch(e) {}
    console.log(issues.length ? '⚠️ Health: ' + issues.join(', ') : '✅ Health OK');
}, 3000);

/* ═══ 4. PWA INSTALL PROMPT ═══ */
var deferredPrompt = null;

window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    deferredPrompt = e;
    console.log('💡 PWA install available');
    
    /* Show install button kalau ada */
    setTimeout(function() {
        if (deferredPrompt && !localStorage.getItem('closiwer_pwa_dismissed')) {
            if (confirm('📱 Install CLOSIWER AI di Home Screen?')) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then(function(choice) {
                    if (choice.outcome === 'accepted') {
                        console.log('✅ PWA installed');
                        if (typeof showToast === 'function') showToast('📱 PWA installed!');
                    }
                    deferredPrompt = null;
                });
            } else {
                localStorage.setItem('closiwer_pwa_dismissed', '1');
            }
        }
    }, 5000);
});

/* Detect installed mode */
if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('📱 Running as PWA');
    document.body.classList.add('pwa-mode');
}

/* ═══ 5. VERSION CHECK ═══ */
console.log('%c🎯 CLOSIWER AI v6.0', 'color: #d97757; font-size: 16px; font-weight: bold;');
console.log('%cBatch 1: PWA + Performance + Bug Fixes ✅', 'color: #4ade80; font-size: 12px;');

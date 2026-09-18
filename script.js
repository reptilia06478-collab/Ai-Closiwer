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
    } else {
        alert('❌ Color Palette modal tidak ditemukan. Cek index.html');
    }
}

function openAvatarGen() {
    var modal = document.getElementById('avatarModal');
    if (modal) {
        modal.classList.add('show');
        if (typeof loadAvatarGallery === 'function') loadAvatarGallery();
    } else {
        alert('❌ Avatar modal tidak ditemukan. Cek index.html');
    }
}

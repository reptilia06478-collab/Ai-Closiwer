/* ═══════════════════════════════════════════════
   CLOSIWER AI v3.0 - Core Engine
   Coding + Math Specialist · 100% Free
═══════════════════════════════════════════════ */

const CLOSIWER = {
    version: '3.0.0',
    build: 'ultimate-2026',
    engine: 'ClosiwerCore™ v3',
    startTime: Date.now()
};

const state = {
    messages: [],
    chats: JSON.parse(localStorage.getItem('closiwer_chats') || '[]'),
    currentChatId: null,
    isTyping: false,
    currentModel: localStorage.getItem('closiwer_model') || 'dev-elite',
    apiKey: localStorage.getItem('closiwer_apiKey') || '',
apiProvider: localStorage.getItem('closiwer_apiProvider') || 'groq',
apiModel: localStorage.getItem('closiwer_apiModel') || 'llama-3.3-70b-versatile',
    stats: {
        messages: 0,
        tokens: 0,
        latency: 0
    }
};

// ═══ DOM ═══
const $ = (id) => document.getElementById(id);
const userInput = $('userInput');
const sendBtn = $('sendBtn');
const messagesEl = $('messages');
const welcomeScreen = $('welcomeScreen');
const chatContainer = $('chatContainer');
const newChatBtn = $('newChatBtn');
const chatHistory = $('chatHistory');
const menuToggle = $('menuToggle');
const sidebar = $('sidebar');
const modelSelector = $('modelSelector');
const currentModel = $('currentModel');
const currentModelDesc = $('currentModelDesc');
const tokenText = $('tokenText');
const greeting = $('greeting');

// ═══ PARTICLES BACKGROUND ═══
function initParticles() {
    const canvas = $('particleCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];
    const PARTICLE_COUNT = 60;
    
    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    
    function createParticle() {
        return {
            x: Math.random() * W,
            y: Math.random() * H,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            r: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.5 + 0.2
        };
    }
    
    resize();
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(createParticle());
    
    window.addEventListener('resize', resize);
    
    function animate() {
        ctx.clearRect(0, 0, W, H);
        
        particles.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;
            
            if (p.x < 0 || p.x > W) p.vx *= -1;
            if (p.y < 0 || p.y > H) p.vy *= -1;
            
            // Glow dot
            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
            gradient.addColorStop(0, `rgba(217, 119, 87, ${p.opacity})`);
            gradient.addColorStop(1, 'rgba(217, 119, 87, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Connections
            particles.slice(i + 1).forEach(p2 => {
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.strokeStyle = `rgba(217, 119, 87, ${0.15 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            });
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// ═══ LOADER ═══
function runLoader() {
    const steps = [
        { pct: 20, text: 'Memuat CLOSIWER Core...' },
        { pct: 40, text: 'Inisialisasi AI Engine...' },
        { pct: 60, text: 'Menyiapkan Coding Module...' },
        { pct: 80, text: 'Loading Math Solver...' },
        { pct: 95, text: 'Optimasi performa...' },
        { pct: 100, text: 'Siap digunakan! 🚀' }
    ];
    
    let i = 0;
    const interval = setInterval(() => {
        if (i >= steps.length) {
            clearInterval(interval);
            setTimeout(() => {
                $('loader').classList.add('hidden');
                $('app').style.transition = 'opacity 0.6s';
                $('app').style.opacity = '1';
                setTimeout(() => userInput.focus(), 100);
            }, 300);
            return;
        }
        $('loaderFill').style.width = steps[i].pct + '%';
        $('loaderStatus').textContent = steps[i].text;
        i++;
    }, 400);
}

// ═══ INIT ═══
function init() {
    runLoader();           
    setGreeting();
    loadHistory();
    updateModelName();
    updateApiStatus();
    setupEventListeners();
    autoResizeTextarea();
    startUptimeCounter();
    updateStats();
    initParticles();
    updateTokenCount();
}
// ═══ START APPLICATION ═══
init();
    
    logConsole('info', `[CLOSIWER] v${CLOSIWER.version} initialized`);
    logConsole('success', `[ENGINE] ${CLOSIWER.engine} ready`);
    logConsole('info', `[MODEL] ${state.currentModel} loaded`);
    logConsole('info', `[MODE] ${state.apiKey ? 'API Mode' : 'Unlimited Simulation'}`);
}

function setGreeting() {
    const hour = new Date().getHours();
    let time = 'Selamat malam';
    if (hour >= 5 && hour < 11) time = 'Selamat pagi';
    else if (hour >= 11 && hour < 15) time = 'Selamat siang';
    else if (hour >= 15 && hour < 19) time = 'Selamat sore';
    greeting.textContent = `${time}, Developer`;
}

// ═══ EVENTS ═══
function setupEventListeners() {
    userInput.addEventListener('input', () => {
        sendBtn.disabled = !userInput.value.trim();
        autoResizeTextarea();
        updateTokenCount();
    });
    
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!sendBtn.disabled) sendMessage();
        }
    });
    
    sendBtn.addEventListener('click', sendMessage);
    newChatBtn.addEventListener('click', startNewChat);
    menuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
    
    modelSelector.addEventListener('click', (e) => {
        if (!e.target.closest('.model-dropdown')) {
            modelSelector.classList.toggle('open');
        }
    });
    
    document.querySelectorAll('.model-option').forEach(opt => {
        opt.addEventListener('click', (e) => {
            e.stopPropagation();
            const model = opt.dataset.model;
            state.currentModel = model;
            localStorage.setItem('closiwer_model', model);
            document.querySelectorAll('.model-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            updateModelName();
            modelSelector.classList.remove('open');
            logConsole('info', `[MODEL] Switched to ${model}`);
        });
    });
    
    document.addEventListener('click', (e) => {
        if (!modelSelector.contains(e.target)) modelSelector.classList.remove('open');
    });
    
    document.querySelectorAll('.suggestion-card').forEach(card => {
        card.addEventListener('click', () => {
            userInput.value = card.dataset.prompt;
            sendBtn.disabled = false;
            updateTokenCount();
            sendMessage();
        });
    });
    
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            logConsole('info', `[TOOL] Mode: ${btn.dataset.tool}`);
        });
    });
    
    // Dev panel
    $('devPanelBtn').addEventListener('click', () => {
        $('devPanel').classList.toggle('open');
    });
    
    $('devClose').addEventListener('click', () => $('devPanel').classList.remove('open'));
    
    // Clear history
    $('clearHistory').addEventListener('click', () => {
        if (confirm('Hapus semua riwayat chat?')) {
            state.chats = [];
            localStorage.removeItem('closiwer_chats');
            renderHistory();
            logConsole('info', '[HISTORY] Cleared');
        }
    });
    
    // Settings
    $('settingsBtn').addEventListener('click', () => $('settingsModal').classList.add('active'));
    $('closeModal').addEventListener('click', () => $('settingsModal').classList.remove('active'));
    $('settingsModal').addEventListener('click', (e) => {
        if (e.target === $('settingsModal')) $('settingsModal').classList.remove('active');
    });
    
    // Theme
    document.querySelectorAll('.theme-opt').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.theme-opt').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            const theme = opt.dataset.theme;
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('closiwer_theme', theme);
            logConsole('info', `[THEME] ${theme}`);
        });
    });
    
    // Load theme
    const savedTheme = localStorage.getItem('closiwer_theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        const el = document.querySelector(`[data-theme="${savedTheme}"]`);
        if (el) {
            document.querySelectorAll('.theme-opt').forEach(o => o.classList.remove('active'));
            el.classList.add('active');
        }
    }
    
    // Particle toggle
    $('particleToggle').addEventListener('change', (e) => {
        const canvas = $('particleCanvas');
        canvas.style.display = e.target.checked ? 'block' : 'none';
    });
    
    // Brightness
    $('brightnessSlider').addEventListener('input', (e) => {
        document.querySelector('.hero-bg').style.opacity = e.target.value / 100;
    });
    
    // Voice input
    $('micBtn').addEventListener('click', startVoiceInput);
    
    // Attach
    $('attachBtn').addEventListener('click', () => {
        logConsole('info', '[ATTACH] File attachment (coming soon)');
    });
    
    // Search
    $('searchBtn').addEventListener('click', () => {
        logConsole('info', '[SEARCH] Search feature');
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            startNewChat();
        }
        if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
            e.preventDefault();
            $('devPanel').classList.toggle('open');
        }
    });
    
    // Mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && 
            sidebar.classList.contains('open') && 
            !sidebar.contains(e.target) && 
            !menuToggle.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    });
    
    // Close dev panel on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            $('devPanel').classList.remove('open');
            modelSelector.classList.remove('open');
        }
    });
}

// ═══ VOICE INPUT ═══
function startVoiceInput() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
        alert('Browser Anda tidak mendukung voice input');
        return;
    }
    
    const recognition = new SR();
    recognition.lang = 'id-ID';
    recognition.continuous = false;
    
    $('micBtn').style.color = 'var(--primary)';
    logConsole('info', '[VOICE] Listening...');
    
    recognition.onresult = (e) => {
        const text = e.results[0][0].transcript;
        userInput.value = text;
        sendBtn.disabled = false;
        updateTokenCount();
        autoResizeTextarea();
        logConsole('success', `[VOICE] Recognized: ${text}`);
    };
    
    recognition.onend = () => {
        $('micBtn').style.color = '';
    };
    
    recognition.start();
}

// ═══ MODEL ═══
function updateModelName() {
    const models = {
        'dev-elite': { name: 'CLOSIWER Dev-Elite', desc: 'Coding · Math · Reasoning' },
        'math-master': { name: 'CLOSIWER Math-Master', desc: 'Ahli matematika & logika' },
        'quantum': { name: 'CLOSIWER Quantum', desc: 'Penalaran tingkat tinggi' },
        'flash': { name: 'CLOSIWER Flash Ultra', desc: 'Super cepat unlimited' }
    };
    const m = models[state.currentModel] || models['dev-elite'];
    currentModel.textContent = m.name;
    currentModelDesc.textContent = m.desc;
}

// ═══ CHAT ═══
function startNewChat() {
    if (state.messages.length > 0) saveChat();
    state.messages = [];
    state.currentChatId = null;
    renderMessages();
    showWelcome();
    userInput.value = '';
    userInput.focus();
    updateTokenCount();
    logConsole('info', '[CHAT] New conversation');
    if (window.innerWidth <= 768) sidebar.classList.remove('open');
}

function showWelcome() {
    welcomeScreen.style.display = state.messages.length === 0 ? 'flex' : 'none';
}

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text || state.isTyping) return;
    
    state.messages.push({
        role: 'user',
        content: text,
        timestamp: Date.now()
    });
    state.stats.messages++;
    
    userInput.value = '';
    sendBtn.disabled = true;
    autoResizeTextarea();
    showWelcome();
    renderMessages();
    scrollToBottom();
    updateStats();
    updateTokenCount();
    
    logConsole('user', `[USER] ${text.slice(0, 60)}${text.length > 60 ? '...' : ''}`);
    
    state.isTyping = true;
    showTypingIndicator();
    
    const startTime = Date.now();
    
    try {
        const response = await getAIResponse(text);
        const latency = Date.now() - startTime;
        state.stats.latency = latency;
        
        removeTypingIndicator();
        
        state.messages.push({
            role: 'assistant',
            content: response,
            timestamp: Date.now(),
            model: state.currentModel,
            latency
        });
        renderMessages();
        scrollToBottom();
        updateStats();
        
        logConsole('success', `[AI] Response in ${latency}ms`);
        playNotification();
        
    } catch (error) {
        removeTypingIndicator();
        state.messages.push({
            role: 'assistant',
            content: `⚠️ **Error**: ${error.message}\n\nSilakan cek konfigurasi di Dev Panel → tab API.`,
            timestamp: Date.now(),
            model: state.currentModel
        });
        renderMessages();
        logConsole('error', `[ERROR] ${error.message}`);
    } finally {
        state.isTyping = false;
        userInput.focus();
    }
}

// ═══ AI RESPONSE ═══
async function getAIResponse(userText) {
    if (state.apiKey && state.apiKey.length > 10) {
        try {
            return await callRealAPI(userText);
        } catch (err) {
            logConsole('error', `[API] ${err.message}`);
            logConsole('warning', '[API] Fallback to local engine');
            return await localEngine(userText);
        }
    }
    return await localEngine(userText);
}

async function callRealAPI(userText) {
    const endpoints = {
        openai: 'https://api.openai.com/v1/chat/completions',
        groq: 'https://api.groq.com/openai/v1/chat/completions',
        anthropic: 'https://api.anthropic.com/v1/messages'
    };
    
    if (state.apiProvider === 'anthropic') {
        const res = await fetch(endpoints.anthropic, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': state.apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({
                model: state.apiModel || 'claude-3-5-sonnet-20241022',
                max_tokens: 4096,
                system: 'Kamu adalah CLOSIWER AI, asisten ahli coding dan matematika. Jawab dengan detail, contoh kode, dan penjelasan jelas dalam Bahasa Indonesia.',
                messages: state.messages.filter(m => m.role !== 'system').map(m => ({
                    role: m.role,
                    content: m.content
                }))
            })
        });
        
        if (!res.ok) throw new Error('API error: ' + res.status);
        const data = await res.json();
        return data.content[0].text;
    }
    
    const url = endpoints[state.apiProvider] || endpoints.groq;
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.apiKey}`
        },
        body: JSON.stringify({
            model: state.apiModel || 'llama-3.1-70b-versatile',
            messages: [
                { role: 'system', content: 'Kamu adalah CLOSIWER AI, asisten ahli coding dan matematika. Jawab detail dengan contoh kode dan penjelasan dalam Bahasa Indonesia.' },
                ...state.messages.map(m => ({ role: m.role, content: m.content }))
            ],
            temperature: 0.7,
            max_tokens: 4096
        })
    });
    
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${res.status}`);
    }
    
    const data = await res.json();
    return data.choices[0].message.content;
}

// ═══ LOCAL ENGINE (Simulation - Unlimited) ═══
async function localEngine(prompt) {
    await new Promise(r => setTimeout(r, 600 + Math.random() * 800));
    
    const p = prompt.toLowerCase();
    
    // ═══ MATH SOLVER ═══
    if (p.includes('integral') || p.includes('∫')) {
        return `## 📐 Integral Solver

**Soal:** ∫ (2x³ + 3x² - 5x + 7) dx

### ✏️ Penyelesaian Step-by-Step

Gunakan **power rule**: ∫ xⁿ dx = xⁿ⁺¹/(n+1) + C

**Langkah 1:** Pisahkan setiap suku
\`\`\`
∫ 2x³ dx + ∫ 3x² dx - ∫ 5x dx + ∫ 7 dx
\`\`\`

**Langkah 2:** Integralkan masing-masing
\`\`\`
∫ 2x³ dx = 2·x⁴/4 = x⁴/2
∫ 3x² dx = 3·x³/3 = x³
∫ 5x dx  = 5·x²/2 = 5x²/2
∫ 7 dx   = 7x
\`\`\`

**Langkah 3:** Gabungkan + C
\`\`\`
✅ Hasil: x⁴/2 + x³ - 5x²/2 + 7x + C
\`\`\`

### 🎯 Verifikasi (turunan dari hasil)
d/dx (x⁴/2 + x³ - 5x²/2 + 7x) = 2x³ + 3x² - 5x + 7 ✓

Butuh soal integral lain? Kirim aja! 📚`;
    }
    
    if (p.includes('f(x)') || p.includes('fungsi') || p.includes('kuadrat')) {
        return `## 🧮 Penyelesaian Soal Fungsi

**Soal:** f(x) = x² + 3x - 4
**Pertanyaan:** Tentukan f(5) dan akar-akarnya

### 1️⃣ Mencari f(5)
Substitusi x = 5:
\`\`\`
f(5) = (5)² + 3(5) - 4
     = 25 + 15 - 4
     = 36
\`\`\`
✅ **f(5) = 36**

### 2️⃣ Mencari Akar-akar (f(x) = 0)
\`\`\`
x² + 3x - 4 = 0
\`\`\`

**Metode Pemfaktoran:**
Cari 2 bilangan yang:
- Dikalikan = -4
- Dijumlahkan = 3

→ Angka tersebut adalah **4** dan **-1**

\`\`\`
(x + 4)(x - 1) = 0
\`\`\`

**Maka:**
- x + 4 = 0 → **x₁ = -4**
- x - 1 = 0 → **x₂ = 1**

### 🎯 Verifikasi dengan Rumus ABC
\`\`\`
x = (-b ± √(b² - 4ac)) / 2a
x = (-3 ± √(9 + 16)) / 2
x = (-3 ± √25) / 2
x = (-3 ± 5) / 2

x₁ = (-3 + 5)/2 = 1
x₂ = (-3 - 5)/2 = -4
\`\`\`

✅ **HP = {-4, 1}** ✓

Ada soal lain? Kirim aja! 🚀`;
    }
    
    if (p.includes('turunan') || p.includes('derivatif') || p.includes('d/dx')) {
        return `## 📐 Derivatif Solver

Untuk menyelesaikan turunan, saya menggunakan aturan dasar:

### 📚 Aturan Turunan
| Fungsi | Turunan |
|--------|---------|
| xⁿ | n·xⁿ⁻¹ |
| sin x | cos x |
| cos x | -sin x |
| eˣ | eˣ |
| ln x | 1/x |

### ✏️ Contoh: Turunan dari 3x⁴ - 2x³ + 5x - 7

\`\`\`
d/dx (3x⁴)  = 12x³
d/dx (-2x³) = -6x²
d/dx (5x)   = 5
d/dx (-7)   = 0
\`\`\`

✅ **Hasil: 12x³ - 6x² + 5**

Kirim soal turunan spesifik Anda! 🎯`;
    }
    
    // ═══ CODING ═══
    if (p.includes('react') || p.includes('hooks') || p.includes('todo')) {
        return `## 💻 React Todo List App

Berikut implementasi lengkap dengan React Hooks:

\`\`\`jsx
import { useState, useEffect } from 'react';

function TodoApp() {
    const [todos, setTodos] = useState([]);
    const [input, setInput] = useState('');

    // Load dari localStorage
    useEffect(() => {
        const saved = localStorage.getItem('todos');
        if (saved) setTodos(JSON.parse(saved));
    }, []);

    // Save ke localStorage
    useEffect(() => {
        localStorage.setItem('todos', JSON.stringify(todos));
    }, [todos]);

    const addTodo = () => {
        if (!input.trim()) return;
        setTodos([...todos, {
            id: Date.now(),
            text: input,
            done: false
        }]);
        setInput('');
    };

    const toggleTodo = (id) => {
        setTodos(todos.map(t => 
            t.id === id ? { ...t, done: !t.done } : t
        ));
    };

    const deleteTodo = (id) => {
        setTodos(todos.filter(t => t.id !== id));
    };

    return (
        <div className="todo-app">
            <h1>📝 Todo List</h1>
            
            <div className="input-group">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                    placeholder="Tambah todo..."
                />
                <button onClick={addTodo}>+ Tambah</button>
            </div>

            <ul className="todo-list">
                {todos.map(todo => (
                    <li key={todo.id} className={todo.done ? 'done' : ''}>
                        <input
                            type="checkbox"
                            checked={todo.done}
                            onChange={() => toggleTodo(todo.id)}
                        />
                        <span>{todo.text}</span>
                        <button onClick={() => deleteTodo(todo.id)}>🗑️</button>
                    </li>
                ))}
            </ul>

            <div className="stats">
                Total: {todos.length} | 
                Selesai: {todos.filter(t => t.done).length}
            </div>
        </div>
    );
}

export default TodoApp;
\`\`\`

### ✨ Fitur
- ✅ Add / toggle / delete todo
- ✅ Auto-save ke localStorage
- ✅ Persist setelah refresh
- ✅ Statistics counter

### 🎨 Styling (CSS)
\`\`\`css
.todo-app { max-width: 500px; margin: 40px auto; padding: 24px; }
.input-group { display: flex; gap: 8px; margin-bottom: 20px; }
.todo-list { list-style: none; padding: 0; }
.todo-list li {
    display: flex; align-items: center; gap: 10px;
    padding: 10px; border-bottom: 1px solid #eee;
}
.todo-list li.done span {
    text-decoration: line-through; opacity: 0.5;
}
\`\`\`

Mau saya bantu level berikutnya? (Context API, Redux, atau backend)? 🚀`;
    }
    
    if (p.includes('api') || p.includes('rest') || p.includes('express') || p.includes('node')) {
        return `## 🚀 REST API Node.js + JWT Auth

Setup lengkap production-ready:

### 📁 Struktur
\`\`\`
project/
├── src/
│   ├── config/db.js
│   ├── models/User.js
│   ├── middleware/auth.js
│   ├── routes/auth.js
│   └── app.js
└── package.json
\`\`\`

### 1️⃣ Setup (package.json)
\`\`\`bash
npm init -y
npm i express mongoose jsonwebtoken bcryptjs cors dotenv
npm i -D nodemon
\`\`\`

### 2️⃣ Server (app.js)
\`\`\`javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect DB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ DB Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));

app.listen(3000, () => console.log('🚀 Server on :3000'));
\`\`\`

### 3️⃣ User Model
\`\`\`javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: String
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = mongoose.model('User', UserSchema);
\`\`\`

### 4️⃣ Auth Route
\`\`\`javascript
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ error: 'Email sudah terdaftar' });
        
        const user = await User.create({ email, password, name });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        res.status(201).json({ 
            token, 
            user: { id: user._id, email: user.email, name: user.name }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: 'Kredensial salah' });
        
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Kredensial salah' });
        
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, email, name: user.name } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
\`\`\`

### 5️⃣ Auth Middleware
\`\`\`javascript
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
};
\`\`\`

### 📝 .env
\`\`\`
MONGO_URI=mongodb://localhost:27017/myapp
JWT_SECRET=your_secret_key_here
\`\`\`

### 🧪 Test dengan cURL
\`\`\`bash
curl -X POST http://localhost:3000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"email":"test@test.com","password":"123456","name":"Test"}'
\`\`\`

Fitur lengkap: ✅ Register ✅ Login ✅ JWT ✅ Bcrypt ✅ Validation

Mau saya lanjutkan dengan refresh token, RBAC, atau deployment? 🚀`;
    }
    
    if (p.includes('python') || p.includes('flask') || p.includes('django')) {
        return `## 🐍 Python Flask API

\`\`\`python
from flask import Flask, request, jsonify
from flask_cors import CORS
from functools import wraps
import jwt
import datetime

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'your-secret-key'

# Decorator auth
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return jsonify({'error': 'Token missing'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = data['user']
        except:
            return jsonify({'error': 'Invalid token'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

# Routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    # Simpan user (contoh)
    token = jwt.encode({
        'user': data['email'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }, app.config['SECRET_KEY'])
    return jsonify({'token': token}), 201

@app.route('/api/profile', methods=['GET'])
@token_required
def profile(current_user):
    return jsonify({'user': current_user})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
\`\`\`

Dependency:
\`\`\`bash
pip install flask flask-cors pyjwt
\`\`\`

Mau saya bantu dengan database SQLAlchemy atau deployment? 🚀`;
    }
    
    // ═══ GREETING ═══
    if (/^(halo|hai|hello|hey|hi|pagi|siang|sore|malam)/i.test(p)) {
        return `Halo! 👋 Saya **CLOSIWER AI** — asisten coding & matematika **100% GRATIS & UNLIMITED**.

### 🎯 Spesialisasi Saya
- 💻 **Coding** — 50+ bahasa (JS, Python, PHP, Go, Rust...)
- 📐 **Matematika** — Aljabar, Kalkulus, Statistik, Geometri
- 🧮 **Soal Sekolah** — SD, SMP, SMA, Kuliah
- 🐛 **Debugging** — Fix error & optimize code
- 📊 **Analisis** — Algoritma & struktur data

### 💡 Coba Tanya:
- "Buatkan REST API Node.js"
- "Selesaikan integral 2x³+3x²"
- "Buat Todo List React"
- "Jelaskan neural network"

Mau mulai dari mana? 🚀

> ⚡ **No limits. No paywall. No BS.**`;
    }
    
    if (p.includes('siapa kamu') || p.includes('tentang kamu') || p.includes('closiwer')) {
        return `## 🤖 Tentang CLOSIWER AI

Saya **CLOSIWER AI v${CLOSIWER.version}** — asisten AI **GRATIS SELAMANYA** yang fokus di coding & matematika.

### ✨ Keunggulan
| Fitur | Detail |
|-------|--------|
| 💰 **Harga** | 100% GRATIS |
| ♾️ **Limit** | UNLIMITED |
| 🚫 **Batasan** | TIDAK ADA |
| 💻 **Coding** | 50+ bahasa |
| 📐 **Math** | Aljabar sampai Kalkulus |
| 🔓 **Restriksi** | Tanpa sensor |

### 🎯 Misi Saya
Membantu developer, pelajar, dan siapa saja tanpa paywall, tanpa limit, tanpa batasan.

### 🛠️ Powered By
- Engine: **${CLOSIWER.engine}**
- Version: **${CLOSIWER.build}**
- Model: **${state.currentModel}**

Dibuat dengan ❤️ oleh creator Indonesia 🇮🇩

Mau ngobrol apa hari ini? 🚀`;
    }
    
    if (p.includes('terima kasih') || p.includes('thanks') || p.includes('makasih')) {
        return `Sama-sama! 😊 Senang bisa membantu! 🎉

**CLOSIWER AI** selalu online 24/7 — gratis tanpa batas. Balik lagi kalau butuh bantuan coding atau matematika ya!

💡 **Tips:** Coba tombol **DEV** di kanan atas untuk akses DevTools dengan console, code editor, dan API settings!`;
    }
    
    // ═══ DEBUGGING ═══
    if (p.includes('error') || p.includes('debug') || p.includes('bug')) {
        return `## 🐛 Debug Helper

Untuk membantu debug, kirimkan:

1. **Pesan error lengkap** (copy-paste dari console)
2. **Kode yang bermasalah**
3. **Bahasa/framework** yang dipakai
4. **Yang diharapkan vs yang terjadi**

### 🔍 Tips Debug Cepat
| Error | Penyebab Umum |
|-------|--------------|
| \`undefined is not a function\` | Typo atau salah import |
| \`Cannot read property X\` | Null/undefined access |
| \`CORS error\` | Backend belum allow origin |
| \`Network Error\` | URL/endpoint salah |
| \`SyntaxError\` | Typo, kurung tidak tutup |

Kirim detail error-nya, saya bantu fix! 🔧`;
    }
    
    // ═══ DEFAULT ═══
    return `Terima kasih atas pertanyaan: **"${prompt}"**

Saya dalam **mode simulasi** (belum ada API key). Untuk jawaban AI yang lebih pintar & dinamis:

### 🔑 Cara Aktifkan AI Penuh (GRATIS!)
1. Buka **Dev Panel** (tombol DEV di kanan atas)
2. Tab **API**
3. Pilih **Groq** (GRATIS & CEPAT!)
4. Dapatkan key di: [console.groq.com](https://console.groq.com/)
5. Paste & Simpan

### 💡 Sementara ini, saya bisa bantu:
- 📐 **Matematika**: integral, turunan, persamaan
- 💻 **Coding**: React, Node.js, Python
- 🐛 **Debugging**: fix error
- 📚 **Konsep**: jelaskan topik programming

Coba tanya salah satu di atas! 🚀`;
}

// ═══ RENDERING ═══
function renderMessages() {
    messagesEl.innerHTML = '';
    state.messages.forEach(msg => {
        messagesEl.appendChild(createMessageElement(msg));
    });
    showWelcome();
}

function createMessageElement(msg) {
    const el = document.createElement('div');
    const isUser = msg.role === 'user';
    el.className = `message ${isUser ? 'user' : 'ai'}`;
    
    const avatar = isUser ? 'U' : '✦';
    const roleName = isUser ? 'Anda' : 'CLOSIWER';
    const time = formatTime(msg.timestamp);
    const modelBadge = !isUser ? `<span class="message-badge">${getModelShort(msg.model)}</span>` : '';
    
    el.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-role">${roleName}</span>
                ${modelBadge}
                <span class="message-time">${time}</span>
            </div>
            <div class="message-text">${formatMessage(msg.content)}</div>
            ${!isUser ? `
                <div class="message-actions">
                    <button class="msg-action" onclick="copyMsg(this)">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        Copy
                    </button>
                    <button class="msg-action" onclick="regenMsg()">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="23 4 23 10 17 10"></polyline>
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                        </svg>
                        Ulang
                    </button>
                    <button class="msg-action" onclick="speakMsg(this)">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        </svg>
                        Dengar
                    </button>
                </div>
            ` : ''}
        </div>
    `;
    
    return el;
}

function getModelShort(model) {
    const map = {
        'dev-elite': 'DEV-ELITE',
        'math-master': 'MATH',
        'quantum': 'QUANTUM',
        'flash': 'FLASH'
    };
    return map[model] || 'AI';
}

function formatTime(ts) {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function formatMessage(text) {
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    
    // Code blocks with language
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (m, lang, code) => {
        return `<pre data-lang="${lang || 'code'}"><code>${code.trim()}</code></pre>`;
    });
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    
    // Bold & Italic
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Blockquote
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');
    
    // Horizontal rule
    html = html.replace(/^---$/gm, '<hr>');
    
    // Tables
    html = html.replace(/^\|(.+)\|$/gm, (match) => {
        const cells = match.split('|').slice(1, -1).map(c => c.trim());
        if (cells.every(c => /^[-:]+$/.test(c))) return '';
        const tag = cells.some(c => /^[-:]+$/.test(c)) ? 'th' : 'td';
        return '<tr>' + cells.map(c => `<${tag}>${c}</${tag}>`).join('') + '</tr>';
    });
    html = html.replace(/(<tr>[\s\S]*?<\/tr>)+/g, (m) => `<table>${m}</table>`);
    
    // Lists
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*?<\/li>)(?:\n|$)+/gs, (m) => `<ul>${m}</ul>`);
    
    // Checkboxes
    html = html.replace(/✅/g, '<span style="color:#4ade80">✅</span>');
    html = html.replace(/❌/g, '<span style="color:#f87171">❌</span>');
    
    // Line breaks
    const blocks = html.split('\n\n');
    html = blocks.map(b => {
        const trimmed = b.trim();
        if (!trimmed) return '';
        if (/^<(pre|ul|ol|h1|h2|h3|blockquote|table|hr)/.test(trimmed)) return trimmed;
        return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
    }).join('');
    
    return html;
}

function showTypingIndicator() {
    const el = document.createElement('div');
    el.className = 'message ai';
    el.id = 'typingIndicator';
    el.innerHTML = `
        <div class="message-avatar">✦</div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-role">CLOSIWER</span>
                <span class="message-badge">${getModelShort(state.currentModel)}</span>
            </div>
            <div class="typing">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    messagesEl.appendChild(el);
    scrollToBottom();
}

function removeTypingIndicator() {
    const el = $('typingIndicator');
    if (el) el.remove();
}

function scrollToBottom() {
    requestAnimationFrame(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    });
}

function autoResizeTextarea() {
    userInput.style.height = 'auto';
    userInput.style.height = Math.min(userInput.scrollHeight, 240) + 'px';
}

function updateTokenCount() {
    const len = userInput.value.length;
    if (len === 0) {
        tokenText.textContent = 'Ready';
    } else {
        tokenText.textContent = `${len} chars`;
    }
}

// ═══ AUDIO ═══
function playNotification() {
    if (!$('soundToggle')?.checked) return;
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 660;
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
    } catch(e) {}
}

// ═══ GLOBAL ACTIONS ═══
window.copyMsg = function(btn) {
    const text = btn.closest('.message-content').querySelector('.message-text').innerText;
    navigator.clipboard.writeText(text).then(() => {
        const orig = btn.innerHTML;
        btn.innerHTML = '✓ Tersalin';
        setTimeout(() => btn.innerHTML = orig, 1500);
    });
};

window.speakMsg = function(btn) {
    const text = btn.closest('.message-content').querySelector('.message-text').innerText;
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text.slice(0, 500));
        u.lang = 'id-ID';
        u.rate = 1;
        speechSynthesis.speak(u);
    }
};

window.regenMsg = function() {
    if (state.messages.length < 2) return;
    state.messages.pop();
    const last = state.messages[state.messages.length - 1];
    state.messages.pop();
    userInput.value = last.content;
    renderMessages();
    sendMessage();
};

// ═══ HISTORY ═══
function saveChat() {
    if (state.messages.length === 0) return;
    if (!state.currentChatId) state.currentChatId = 'chat_' + Date.now();
    
    const firstUser = state.messages.find(m => m.role === 'user');
    const title = firstUser ? firstUser.content.slice(0, 40) : 'Chat Baru';
    
    const existing = state.chats.find(c => c.id === state.currentChatId);
    if (existing) {
        existing.messages = [...state.messages];
        existing.title = title;
        existing.timestamp = Date.now();
    } else {
        state.chats.unshift({
            id: state.currentChatId,
            title,
            messages: [...state.messages],
            timestamp: Date.now()
        });
    }
    
    localStorage.setItem('closiwer_chats', JSON.stringify(state.chats.slice(0, 30)));
    renderHistory();
}

function loadHistory() { renderHistory(); }

function renderHistory() {
    chatHistory.innerHTML = `
        <div class="history-label">
            <span>Riwayat Chat</span>
            <button class="clear-history" onclick="document.getElementById('clearHistory').click()">Hapus</button>
        </div>
    `;
    
    if (state.chats.length === 0) {
        chatHistory.innerHTML += '<div class="history-empty">Belum ada riwayat</div>';
        return;
    }
    
    state.chats.forEach(chat => {
        const el = document.createElement('div');
        el.className = 'history-item' + (chat.id === state.currentChatId ? ' active' : '');
        el.textContent = chat.title;
        el.title = chat.title;
        el.addEventListener('click', () => loadChat(chat.id));
        chatHistory.appendChild(el);
    });
}

function loadChat(chatId) {
    const chat = state.chats.find(c => c.id === chatId);
    if (!chat) return;
    
    if (state.messages.length > 0 && state.currentChatId !== chatId) saveChat();
    
    state.currentChatId = chatId;
    state.messages = [...chat.messages];
    renderMessages();
    renderHistory();
    scrollToBottom();
    logConsole('info', `[CHAT] Loaded: ${chat.title}`);
    if (window.innerWidth <= 768) sidebar.classList.remove('open');
}

// ═══ STATS ═══
function updateStats() {
    $('statMessages').textContent = state.stats.messages;
    $('statTokens').textContent = Math.ceil(
        state.messages.reduce((s, m) => s + m.content.length / 4, 0)
    );
    $('statLatency').textContent = state.stats.latency + 'ms';
}

function startUptimeCounter() {
    setInterval(() => {
        const up = Math.floor((Date.now() - CLOSIWER.startTime) / 1000);
        $('statUptime').textContent = `${Math.floor(up / 60)}m ${up % 60}s`;
    }, 1000);
}

// ═══ API ═══
function updateApiStatus() {
    const el = $('apiStatus');
    if (state.apiKey) {
        el.textContent = `✓ API Active (${state.apiProvider})`;
        el.classList.add('active');
    } else {
        el.textContent = 'Mode: Simulasi (Unlimited)';
        el.classList.remove('active');
    }
}

// ═══ LOG ═══
function logConsole(type, msg) {
    const el = $('consoleOutput');
    if (!el) return;
    const time = new Date().toLocaleTimeString('id-ID', { hour12: false });
    const line = document.createElement('div');
    line.className = `console-line ${type}`;
    line.textContent = `[${time}] ${msg}`;
    el.appendChild(line);
    el.scrollTop = el.scrollHeight;
    while (el.children.length > 80) el.removeChild(el.firstChild);
}

// ═══ START ═══
init();

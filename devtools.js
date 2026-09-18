/* ═══════════════════════════════════════════════
   CLOSIWER DevTools - Separate Module
═══════════════════════════════════════════════ */

(function() {
    'use strict';
    
    const $ = (id) => document.getElementById(id);
    
    // ═══ TAB SWITCHING ═══
    document.querySelectorAll('.dev-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            document.querySelectorAll('.dev-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.dev-tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.querySelector(`[data-content="${target}"]`).classList.add('active');
        });
    });
    
    // ═══ CONSOLE ═══
    const consoleInput = $('consoleInput');
    const consoleOutput = $('consoleOutput');
    
    consoleInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = consoleInput.value.trim();
            if (cmd) {
                executeCmd(cmd);
                consoleInput.value = '';
            }
        }
    });
    
    // Command history
    let cmdHistory = [];
    let historyIdx = -1;
    
    consoleInput.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIdx < cmdHistory.length - 1) {
                historyIdx++;
                consoleInput.value = cmdHistory[cmdHistory.length - 1 - historyIdx];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIdx > 0) {
                historyIdx--;
                consoleInput.value = cmdHistory[cmdHistory.length - 1 - historyIdx];
            } else {
                historyIdx = -1;
                consoleInput.value = '';
            }
        }
    });
    
    function executeCmd(cmd) {
        log('user', `› ${cmd}`);
        cmdHistory.push(cmd);
        historyIdx = -1;
        
        const [c, ...args] = cmd.trim().split(' ');
        const command = c.toLowerCase();
        
        switch (command) {
            case 'help':
                log('info', 'Commands tersedia:');
                log('info', '  help          - tampilkan ini');
                log('info', '  clear         - bersihkan console');
                log('info', '  version       - info versi');
                log('info', '  model [name]  - ganti model');
                log('info', '  stats         - statistik');
                log('info', '  api           - info API');
                log('info', '  reset         - reset semua data');
                log('info', '  echo [text]   - print text');
                log('info', '  time          - waktu sekarang');
                log('info', '  calc [expr]   - kalkulator');
                break;
                
            case 'clear':
                consoleOutput.innerHTML = '';
                log('success', '[CLI] Console cleared');
                break;
                
            case 'version':
                log('success', `CLOSIWER AI v3.0.0 (ultimate-2026)`);
                log('info', `Engine: ClosiwerCore™ v3`);
                break;
                
            case 'model':
                if (args[0]) {
                    window.state && (window.state.currentModel = args[0]);
                    log('success', `Model → ${args[0]}`);
                } else {
                    log('info', `Current model: ${window.state?.currentModel || 'dev-elite'}`);
                }
                break;
                
            case 'stats':
                const s = window.state?.stats || {};
                log('info', `Messages: ${s.messages || 0}`);
                log('info', `Tokens: ${Math.ceil((window.state?.messages || []).reduce((a, m) => a + m.content.length / 4, 0))}`);
                log('info', `Latency: ${s.latency || 0}ms`);
                break;
                
            case 'api':
                const st = window.state || {};
                log('info', `Provider: ${st.apiProvider || 'groq'}`);
                log('info', `Model: ${st.apiModel || 'llama-3.1-70b'}`);
                log('info', `Status: ${st.apiKey ? '✓ Configured' : '✗ Not set (Simulation)'}`);
                break;
                
            case 'reset':
                if (confirm('Reset semua data?')) {
                    localStorage.clear();
                    location.reload();
                }
                break;
                
            case 'echo':
                log('info', args.join(' '));
                break;
                
            case 'time':
                log('success', new Date().toLocaleString('id-ID'));
                break;
                
            case 'calc':
                try {
                    const expr = args.join(' ');
                    const result = Function('"use strict";return (' + expr + ')')();
                    log('success', `${expr} = ${result}`);
                } catch {
                    log('error', 'Invalid expression');
                }
                break;
                
            default:
                log('error', `Unknown command: "${command}". Ketik 'help'`);
        }
    }
    
    function log(type, msg) {
        const time = new Date().toLocaleTimeString('id-ID', { hour12: false });
        const line = document.createElement('div');
        line.className = `console-line ${type}`;
        line.textContent = `[${time}] ${msg}`;
        consoleOutput.appendChild(line);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
        while (consoleOutput.children.length > 100) {
            consoleOutput.removeChild(consoleOutput.firstChild);
        }
    }
    
    // ═══ CODE EDITOR ═══
    const codeEditor = $('codeEditor');
    const codeOutput = $('codeOutput');
    
    $('runCode').addEventListener('click', runCode);
    
    // Ctrl+Enter to run
    codeEditor.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            runCode();
        }
        
        // Tab for indentation
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = codeEditor.selectionStart;
            const end = codeEditor.selectionEnd;
            codeEditor.value = codeEditor.value.substring(0, start) + '    ' + codeEditor.value.substring(end);
            codeEditor.selectionStart = codeEditor.selectionEnd = start + 4;
        }
    });
    
    function runCode() {
        const code = codeEditor.value;
        codeOutput.innerHTML = '<div class="output-label">Output:</div>';
        
        log('info', '[CODE] Executing...');
        
        const outputs = [];
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        
        console.log = (...args) => {
            outputs.push(args.map(a => {
                try {
                    return typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a);
                } catch { return String(a); }
            }).join(' '));
            originalLog.apply(console, args);
        };
        
        console.error = (...args) => {
            outputs.push('❌ ' + args.join(' '));
            originalError.apply(console, args);
        };
        
        console.warn = (...args) => {
            outputs.push('⚠️ ' + args.join(' '));
            originalWarn.apply(console, args);
        };
        
        try {
            const result = new Function(code)();
            if (result !== undefined) outputs.push('→ ' + (typeof result === 'object' ? JSON.stringify(result, null, 2) : result));
            
            const outputText = outputs.join('\n') || '(no output)';
            codeOutput.innerHTML += `<div class="output-content">${escapeHtml(outputText)}</div>`;
            log('success', '[CODE] Execution completed');
        } catch (err) {
            codeOutput.innerHTML += `<div class="output-content output-error">${escapeHtml(err.name + ': ' + err.message)}</div>`;
            log('error', `[CODE] ${err.message}`);
        } finally {
            console.log = originalLog;
            console.error = originalError;
            console.warn = originalWarn;
        }
    }
    
    $('clearCode').addEventListener('click', () => {
        codeEditor.value = '';
        codeOutput.innerHTML = '<div class="output-label">Output:</div>';
        log('info', '[CODE] Editor cleared');
    });
    
    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
    
    // ═══ API CONFIG ═══
    const apiKeyInput = $('apiKeyInput');
    const apiProviderSelect = $('apiProvider');
    const apiModelInput = $('apiModelInput');
    const apiStatus = $('apiStatus');
    
    // Load saved config
    setTimeout(() => {
        if (window.state) {
            apiKeyInput.value = window.state.apiKey || '';
            apiProviderSelect.value = window.state.apiProvider || 'groq';
            apiModelInput.value = window.state.apiModel || '';
        }
    }, 100);
    
    // Provider presets
    const presets = {
        groq: 'llama-3.1-70b-versatile',
        openai: 'gpt-3.5-turbo',
        anthropic: 'claude-3-5-sonnet-20241022',
        gemini: 'gemini-1.5-flash'
    };
    
    apiProviderSelect.addEventListener('change', (e) => {
        apiModelInput.placeholder = presets[e.target.value] || '';
        if (!apiModelInput.value) {
            apiModelInput.value = presets[e.target.value] || '';
        }
        log('info', `[API] Provider: ${e.target.value}`);
    });
    
    $('saveApiBtn').addEventListener('click', () => {
        const provider = apiProviderSelect.value;
        const key = apiKeyInput.value.trim();
        const model = apiModelInput.value.trim();
        
        localStorage.setItem('closiwer_apiProvider', provider);
        localStorage.setItem('closiwer_apiKey', key);
        localStorage.setItem('closiwer_apiModel', model);
        
        if (window.state) {
            window.state.apiProvider = provider;
            window.state.apiKey = key;
            window.state.apiModel = model;
        }
        
        if (key) {
            apiStatus.textContent = `✓ API Active (${provider})`;
            apiStatus.classList.add('active');
            log('success', `[API] Configured: ${provider} / ${model}`);
        } else {
            apiStatus.textContent = 'Mode: Simulasi (Unlimited)';
            apiStatus.classList.remove('active');
            log('warning', '[API] Key removed - simulation mode');
        }
        
        // Visual feedback
        const btn = $('saveApiBtn');
        const orig = btn.textContent;
        btn.textContent = '✓ Tersimpan!';
        setTimeout(() => btn.textContent = orig, 1500);
    });
    
    // Update status awal
    setTimeout(() => {
        if (window.state && window.state.apiKey) {
            apiStatus.textContent = `✓ API Active (${window.state.apiProvider})`;
            apiStatus.classList.add('active');
        }
    }, 200);
    
    // ═══ WELCOME LOG ═══
    setTimeout(() => {
        log('info', '[DEVTOOLS] Module loaded ✓');
        log('success', '[READY] All systems operational');
    }, 800);
    
})();
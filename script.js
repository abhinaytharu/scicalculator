const state = {
    expression: '',      // Internal math.js syntax
    result: null,       // The raw result object from math.js
    displayMode: 'dec', // 'dec' or 'exact'
    angleMode: 'deg',   // 'deg', 'rad', 'grad'
    isShift: false,
    isHyp: false,
    lastAns: '0',
    cursorPos: 0
};

// DOM Elements
const inputArea = document.getElementById('math-input-area');
const resultArea = document.getElementById('math-result-area');
const shiftLabel = document.getElementById('shift-label');
const angleLabel = document.getElementById('angle-label');

function init() {
    setupEventListeners();
    setupKeyboardShortcuts();
    renderModifiers();
    render();
}

function setupEventListeners() {
    document.querySelectorAll('.key').forEach(button => {
        button.addEventListener('click', () => {
            const val = button.dataset.val;
            const action = button.dataset.action;
            const keyType = button.dataset.key;

            if (keyType === 'shift') toggleShift();
            else if (action === 'toggle-angle') toggleAngleMode();
            else if (action) handleAction(action);
            else if (val) handleInput(val);
        });
    });
}

function setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Shift') {
            state.isShift = true;
            renderModifiers();
            return;
        }

        if (e.key >= '0' && e.key <= '9') handleInput(e.key);
        else if (e.key === '.') handleInput('.');
        else if (e.key === '+') handleInput('+');
        else if (e.key === '-') handleInput('-');
        else if (e.key === '*') handleInput('*');
        else if (e.key === '/') { e.preventDefault(); handleInput('/'); }
        else if (e.key === '(') handleInput('(');
        else if (e.key === ')') handleInput(')');
        else if (e.key === '^') handleInput('pow');
        else if (e.key === 'Enter') handleAction('equal');
        else if (e.key === 'Backspace') handleAction('delete');
        else if (e.key === 'ArrowLeft') handleAction('left');
        else if (e.key === 'ArrowRight') handleAction('right');
        else if (e.key === 'ArrowUp') { e.preventDefault(); handleAction('up'); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); handleAction('down'); }
        else if (e.key === 'p') handleInput('pi');
        else if (e.key === 'e') handleInput('e');
        else if (e.key === 'v') handleAction('sd');
        else if (e.key === 'Escape') handleAction('clear');
    });

    window.addEventListener('keyup', (e) => {
        if (e.key === 'Shift') {
            state.isShift = false;
            renderModifiers();
        }
    });
}

function toggleShift() {
    state.isShift = !state.isShift;
    renderModifiers();
}

function toggleHyp() {
    state.isHyp = !state.isHyp;
    renderModifiers();
}

function toggleAngleMode() {
    const modes = ['deg', 'rad', 'grad'];
    const currentIdx = modes.indexOf(state.angleMode);
    state.angleMode = modes[(currentIdx + 1) % modes.length];
    renderModifiers();
}

function renderModifiers() {
    shiftLabel.classList.toggle('active', state.isShift);
    
    if (angleLabel) {
        angleLabel.innerText = state.angleMode.toUpperCase();
        angleLabel.classList.add('active');
    }

    const angleBtn = document.getElementById('angle-btn');
    if (angleBtn) {
        angleBtn.innerText = state.angleMode.toUpperCase();
        angleBtn.classList.add('active');
    }

    const hypLabel = document.getElementById('hyp-label');
    if (hypLabel) hypLabel.classList.toggle('active', state.isHyp);
    
    // Visual feedback for keys that change
    document.querySelector('.key.shift').classList.toggle('active', state.isShift);
    const hypBtn = document.querySelector('.key[data-val="hyp"]');
    if (hypBtn) hypBtn.classList.toggle('active', state.isHyp);
}

function handleInput(val) {
    let raw = val;

    // Handle Hyp modifier for trig
    let prefix = state.isHyp ? 'h' : '';

    if (['sin', 'cos', 'tan'].includes(val)) {
        if (state.isShift) {
            raw = `a${val}${prefix}(`;
        } else {
            raw = `${val}${prefix}(`;
        }
        state.isShift = false;
        state.isHyp = false;
    } else if (state.isShift) {
        switch(val) {
            case 'sqrt': raw = 'cbrt('; break;
            case 'log': raw = '10^'; break;
            case 'ln': raw = 'e^'; break;
            default: break;
        }
        state.isShift = false;
    } else {
        switch(val) {
            case 'fraction': raw = '/'; break;
            case 'sqrt': raw = 'sqrt('; break;
            case 'square': raw = '^2'; break;
            case 'pow': raw = '^'; break;
            case 'log': raw = 'log10('; break;
            case 'ln': raw = 'log('; break;
            case 'pi': raw = 'pi'; break;
            case 'e': raw = 'e'; break;
            case 'ans': raw = state.lastAns; break;
            case 'exp': raw = '*10^'; break;
            case 'hyp': 
                toggleHyp(); 
                return; 
        }
    }

    const before = state.expression.slice(0, state.cursorPos);
    const after = state.expression.slice(state.cursorPos);
    state.expression = before + raw + after;
    state.cursorPos += raw.length;

    renderModifiers();
    render();
    
    // Live preview
    if (state.expression) {
        try {
            calculate(true);
        } catch (e) {}
    }
}

function handleAction(action) {
    switch(action) {
        case 'clear':
            state.expression = '';
            state.cursorPos = 0;
            state.result = null;
            resultArea.innerText = '0';
            break;
        case 'delete':
            if (state.cursorPos > 0) {
                const before = state.expression.slice(0, state.cursorPos - 1);
                const after = state.expression.slice(state.cursorPos);
                state.expression = before + after;
                state.cursorPos--;
            }
            break;
        case 'left':
            state.cursorPos = Math.max(0, state.cursorPos - 1);
            break;
        case 'right':
            state.cursorPos = Math.min(state.expression.length, state.cursorPos + 1);
            break;
        case 'up':
        case 'down':
            handleVerticalNav(action);
            break;
        case 'equal':
            calculate();
            break;
        case 'sd':
            toggleSD();
            break;
    }
    render();
}

function handleVerticalNav(dir) {
    const expr = state.expression;
    const pos = state.cursorPos;
    let divPos = -1;
    for (let i = 0; i < expr.length; i++) {
        if (expr[i] === '/') {
            if (divPos === -1 || Math.abs(i - pos) < Math.abs(divPos - pos)) {
                divPos = i;
            }
        }
    }
    if (divPos === -1) return;
    if (pos <= divPos) {
        if (dir === 'down') state.cursorPos = divPos + 1;
    } else {
        if (dir === 'up') state.cursorPos = divPos;
    }
}

function calculate(isPreview = false) {
    if (!state.expression) return;
    try {
        let expr = state.expression;
        const open = (expr.match(/\(/g) || []).length;
        const close = (expr.match(/\)/g) || []).length;
        expr += ')'.repeat(Math.max(0, open - close));

        // Angle mode logic
        const factor = state.angleMode === 'deg' ? Math.PI / 180 : 
                       state.angleMode === 'grad' ? Math.PI / 200 : 1;
        
        // Define custom trig functions in scope
        const scope = {
            sin: x => Math.sin(x * factor),
            cos: x => Math.cos(x * factor),
            tan: x => Math.tan(x * factor),
            asin: x => Math.asin(x) / factor,
            acos: x => Math.acos(x) / factor,
            atan: x => Math.atan(x) / factor,
            sinh: x => Math.sinh(x), // Hyperbolic stay the same
            cosh: x => Math.cosh(x),
            tanh: x => Math.tanh(x),
            asinh: x => Math.asinh(x),
            acosh: x => Math.acosh(x),
            atanh: x => Math.atanh(x),
            pi: Math.PI,
            e: Math.E
        };

        const res = math.evaluate(expr, scope);
        state.result = res;
        if (!isPreview) state.lastAns = res.toString();
        showResult();
    } catch (e) {
        if (!isPreview) resultArea.innerText = 'Error';
    }
}

function toggleSD() {
    if (state.result === null) return;
    state.displayMode = (state.displayMode === 'dec' ? 'exact' : 'dec');
    showResult();
}

function showResult() {
    if (state.result === null) return;
    
    let formattedResult = '';
    
    if (state.displayMode === 'dec') {
        let val = typeof state.result === 'number' ? state.result : state.result.valueOf();
        if (Math.abs(val) >= 1e10 || (Math.abs(val) < 1e-7 && val !== 0)) {
            const sci = val.toExponential(6);
            const [mantissa, exponent] = sci.split('e');
            katex.render(`${parseFloat(mantissa)} \\times 10^{${parseInt(exponent)}}`, resultArea);
            return;
        } else {
            formattedResult = math.format(val, { precision: 10, upperExp: 100, lowerExp: -100 });
        }
        resultArea.innerText = formattedResult;
    } else {
        // EXACT MODE
        const val = typeof state.result === 'number' ? state.result : state.result.valueOf();
        
        // 1. Check for common Trig/Exact values
        const exactTrig = getExactTrig(val);
        if (exactTrig) {
            katex.render(exactTrig, resultArea);
            return;
        }

        // 2. Check for simplified radicals
        const exactRad = getExactRadical(val);
        if (exactRad) {
            katex.render(exactRad, resultArea);
            return;
        }

        // 3. Fallback to fractions
        try {
            const frac = math.fraction(state.result);
            if (frac.d === 1) {
                resultArea.innerText = frac.n.toString();
            } else {
                katex.render(`\\frac{${frac.n}}{${frac.d}}`, resultArea);
            }
        } catch (e) {
            // 4. Fallback to Pi multiples
            const piVal = Math.PI;
            const ratio = val / piVal;
            if (Math.abs(ratio - Math.round(ratio)) < 1e-10) {
                const n = Math.round(ratio);
                if (n === 1) katex.render('\\pi', resultArea);
                else if (n === -1) katex.render('-\\pi', resultArea);
                else katex.render(`${n}\\pi`, resultArea);
                return;
            }
            resultArea.innerText = math.format(state.result, { precision: 10 });
        }
    }
}

/**
 * Recognizes common exact trig values like sqrt(3)/2
 */
function getExactTrig(val) {
    const eps = 1e-10;
    const targets = [
        { v: 0.5, t: '1/2' },
        { v: -0.5, t: '-1/2' },
        { v: Math.sqrt(2)/2, t: '\\frac{\\sqrt{2}}{2}' },
        { v: -Math.sqrt(2)/2, t: '-\\frac{\\sqrt{2}}{2}' },
        { v: Math.sqrt(3)/2, t: '\\frac{\\sqrt{3}}{2}' },
        { v: -Math.sqrt(3)/2, t: '-\\frac{\\sqrt{3}}{2}' },
        { v: Math.sqrt(3), t: '\\sqrt{3}' },
        { v: -Math.sqrt(3), t: '-\\sqrt{3}' },
        { v: Math.sqrt(3)/3, t: '\\frac{\\sqrt{3}}{3}' },
        { v: -Math.sqrt(3)/3, t: '-\\frac{\\sqrt{3}}{3}' }
    ];
    
    for (const target of targets) {
        if (Math.abs(val - target.v) < eps) return target.t;
    }
    return null;
}

/**
 * Simplifies sqrt(X) into A*sqrt(B)
 */
function getExactRadical(val) {
    const squared = val * val;
    if (Math.abs(squared - Math.round(squared)) < 1e-9) {
        let n = Math.round(squared);
        if (n <= 1) return null;
        
        let a = 1;
        let b = n;
        for (let i = Math.floor(Math.sqrt(n)); i >= 2; i--) {
            if (n % (i * i) === 0) {
                a = i;
                b = n / (i * i);
                break;
            }
        }
        
        const sign = val < 0 ? '-' : '';
        if (b === 1) return sign + a.toString();
        if (a === 1) return sign + `\\sqrt{${b}}`;
        return sign + `${a}\\sqrt{${b}}`;
    }
    return null;
}

function render() {
    if (state.expression === '') {
        inputArea.innerHTML = '<span class="blinking-cursor">|</span>';
        return;
    }

    try {
        const before = state.expression.slice(0, state.cursorPos);
        const after = state.expression.slice(state.cursorPos);
        // Use a spaced placeholder to prevent merging with tokens like 'pi'
        const placeholder = ' CURSORX ';
        const tempExpr = before + placeholder + after;
        
        let renderExpr = tempExpr;
        const open = (renderExpr.match(/\(/g) || []).length;
        const close = (renderExpr.match(/\)/g) || []).length;
        renderExpr += ')'.repeat(Math.max(0, open - close));

        const node = math.parse(renderExpr);
        let tex = node.toTex({ parenthesis: 'keep', implicit: 'hide' });
        
        // Clean up the placeholder and handle potential spaces math.js might add
        tex = tex.replace(/\s?CURSORX\s?/g, '\\textcolor{#38bdf8}{|}');
        katex.render(tex, inputArea, { throwOnError: false });

    } catch (e) {
        let fallbackTex = state.expression.slice(0, state.cursorPos) + "CURSOR" + state.expression.slice(state.cursorPos);
        fallbackTex = fallbackTex
            .replace(/pi/g, '\\pi ')
            .replace(/sqrt\(/g, '\\sqrt{')
            .replace(/\//g, '\\frac{\\text{ }}{\\text{ }}')
            .replace(/\*/g, '\\times ')
            .replace(/\^/g, '^')
            .replace(/log10\(/g, '\\log_{10}(')
            .replace(/log\(/g, '\\ln(')
            .replace(/CURSOR/g, '\\textcolor{#38bdf8}{|}');
        katex.render(fallbackTex, inputArea, { throwOnError: false });
    }
}

init();

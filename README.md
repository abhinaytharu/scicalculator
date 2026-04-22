# QuantumCalc | Premium Scientific Calculator

QuantumCalc is a modern, high-performance web-based scientific calculator designed to provide a "Natural Math" experience. It mimics the behavior of high-end physical scientific calculators while leveraging the power of modern web technologies.

![QuantumCalc Interface](img.png)

## ✨ Features

### 📐 Natural Math Rendering
Uses **KaTeX** to render expressions exactly as they appear in textbooks. Fractions, square roots, exponents, and trigonometric functions are displayed in professional mathematical notation in real-time.

### 🎯 Exact Result Engine
Unlike standard calculators that only show decimals, QuantumCalc provides:
- **Simplified Radicals**: `sqrt(8)` $\rightarrow$ $2\sqrt{2}$
- **Exact Trig Values**: `sin(60)` $\rightarrow$ $\frac{\sqrt{3}}{2}$
- **Pi Multiples**: Results like $2\pi$ or $-\pi$ are preserved.
- **S⇔D Toggle**: Instantly switch between exact forms and decimal approximations.

### ⌨️ Desktop Power User Features
- **Smart Vertical Navigation**: Use **Up/Down** arrows to jump between the numerator and denominator of fractions.
- **Live Preview**: See the result update instantly as you type.
- **Shortcut Panel**: Integrated side panel for quick reference of all keyboard commands.

### 🔄 Multiple Angle Modes
Easily toggle between **DEG** (Degrees), **RAD** (Radians), and **GRAD** (Gradians). Trig functions automatically adjust their calculations.

---

## 🎹 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Calculate Result |
| `Esc` | Clear All (AC) |
| `Backspace` | Delete last character |
| `V` | Toggle S⇔D (Decimal/Exact) |
| `P` | Insert Pi (π) |
| `E` | Insert Euler's number (e) |
| `^` | Power ($x^y$) |
| `/` | Fraction ($\frac{\square}{\square}$) |
| `Arrows` | Navigate through expressions |
| `Shift` | Toggle Shift mode (Inverse Trig, etc.) |

---

## 🛠️ Built With

- **Vanilla JavaScript**: Core logic and state management.
- **Math.js**: Robust mathematical evaluation engine.
- **KaTeX**: High-speed LaTeX math rendering.
- **Modern CSS**: Glassmorphism aesthetic and responsive design.

## 🚀 Getting Started

1. Clone the repository.
2. Open `index.html` in any modern web browser.
3. No build step or installation required!

---

## 📄 Documentation

### Expression Parsing
QuantumCalc uses a custom pre-processor to handle cursor positioning and placeholder tokens (`CURSORX`) to ensure that the mathematical parser (Math.js) doesn't choke during live editing.

### Exact Form Logic
The exact form engine uses a tolerance-based matching system. It checks the squared value of results to identify radicals and compares results against a lookup table of common trigonometric constants.

---

## 📝 GitHub Description
A premium, web-based scientific calculator with natural math rendering (KaTeX), exact result simplification (radicals/trig), and smart navigation. Built for power users with comprehensive keyboard shortcuts and a sleek glassmorphism UI.

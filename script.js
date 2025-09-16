const historyEl = document.getElementById("history");
const resultEl = document.getElementById("result");
const buttonsContainer = document.getElementById("buttons");
const themeToggle = document.getElementById("theme-toggle");
const historyToggle = document.getElementById("history-toggle");
const historyPanel = document.getElementById("history-panel");
const historyList = document.getElementById("history-list");
const clearHistory = document.getElementById("clear-history");
const modeSelect = document.getElementById("mode-select");

let history = "";
let current = "";
let resetScreen = false;

/* Button Layouts */
const layouts = {
  standard: [
    "AC", "%", "⌫", "÷",
    "7", "8", "9", "×",
    "4", "5", "6", "-",
    "1", "2", "3", "+",
    "0", ".", "="
  ],
  scientific: [
    "sin", "cos", "tan", "log",
    "ln", "exp","eˣ", "Rand", 
    "√", "x²", "x³", "π",
    "AC", "%", "⌫", "÷",
    "7", "8", "9", "×",
    "4", "5", "6", "-",
    "1", "2", "3", "+",
    "0", ".", "="
  ],
  programmer: [
    "AND", "OR", "XOR", "NOT",
    "DEC", "BIN", "HEX", "OCT",
    "AC", "%", "⌫", "÷",
    "7", "8", "9", "×",
    "4", "5", "6", "-",
    "1", "2", "3", "+",
    "0", ".", "="
  ]
};

/* Render Buttons */
function renderButtons(mode) {
  buttonsContainer.innerHTML = "";
  layouts[mode].forEach(txt => {
    const btn = document.createElement("button");
    btn.textContent = txt;
    btn.className = "btn";
    if (txt === "AC") btn.classList.add("ac");
    if (txt === "=") btn.classList.add("equal");
    if (txt === "0") btn.classList.add("zero");
    buttonsContainer.appendChild(btn);
  });
}
renderButtons("standard");

/* Handle Button Clicks */
buttonsContainer.addEventListener("click", e => {
  if (!e.target.classList.contains("btn")) return;
  const value = e.target.textContent;

  // Basic actions
  if (value === "AC") {
    history = "";
    current = "";
    resultEl.textContent = "0";
    historyEl.textContent = "";
    return;
  }
  if (value === "⌫") {
    current = current.slice(0, -1);
    resultEl.textContent = current || "0";
    return;
  }

  // Evaluate
  if (value === "=") {
    try {
      history = current;

      // Auto-close unmatched parentheses before evaluation
      let exprToEval = current;
      const openCount = (exprToEval.match(/\(/g) || []).length;
      const closeCount = (exprToEval.match(/\)/g) || []).length;
      if (closeCount < openCount) exprToEval += ')'.repeat(openCount - closeCount);

      // Replace × and ÷
      let expr = exprToEval.replace(/×/g, "*").replace(/÷/g, "/");

      // Scientific replacements (handles functions with parentheses)
      // Scientific replacements (handles functions with parentheses)
expr = expr
  .replace(/π/g, Math.PI)
  .replace(/sin\(([^)]+)\)/g, "Math.sin(($1)*Math.PI/180)")   // sin in degrees
  .replace(/cos\(([^)]+)\)/g, "Math.cos(($1)*Math.PI/180)")   // cos in degrees
  .replace(/tan\(([^)]+)\)/g, "Math.tan(($1)*Math.PI/180)")   // tan in degrees
  .replace(/log\(([^)]+)\)/g, "Math.log10($1)")               // log base 10
  .replace(/ln\(([^)]+)\)/g, "Math.log($1)")                  // natural log
  .replace(/exp\(([^)]+)\)/g, "Math.exp($1)")                 // exp(x)
  .replace(/eˣ\(([^)]+)\)/g, "Math.exp($1)")                  // eˣ(x)
  .replace(/eˣ([0-9.]+)/g, "Math.exp($1)")                    // eˣ5 style
  .replace(/√\(([^)]+)\)/g, "Math.sqrt($1)")                  // sqrt(...) form
  .replace(/√([0-9.]+)/g, "Math.sqrt($1)")                    // sqrtN form
  .replace(/x²/g, "**2")
  .replace(/x³/g, "**3")
  .replace(/Rand/g, "Math.random()");                         // Random


      let evaluated = eval(expr);
      resultEl.textContent = evaluated;
      historyEl.textContent = history;

      // Save to history
      const li = document.createElement("li");
      li.textContent = `${history} = ${evaluated}`;
      historyList.prepend(li);

      current = evaluated.toString();
      resetScreen = true;
    } catch {
      resultEl.textContent = "Error";
    }
    return;
  }

  /* Programmer functions */
  if (["AND", "OR", "XOR"].includes(value)) {
    current += ` ${value} `;
    resultEl.textContent = current;
    return;
  }
  if (value === "NOT") {
    current = (~parseInt(current || "0")).toString();
    resultEl.textContent = current;
    return;
  }
  if (["BIN", "HEX", "OCT", "DEC"].includes(value)) {
    let num = parseInt(current || "0");
    if (value === "BIN") current = num.toString(2);
    if (value === "HEX") current = num.toString(16).toUpperCase();
    if (value === "OCT") current = num.toString(8);
    if (value === "DEC") current = num.toString(10);
    resultEl.textContent = current;
    return;
  }

  /* --- NEW: auto-insert '(' for function buttons so user gets sin(30) not sin30 --- */
  const funcButtons = ["sin", "cos", "tan", "log", "ln", "exp", "√"];
  if (funcButtons.includes(value)) {
    if (value === "√") {
      // Use √( so both √(...) and √number are supported by replacement patterns
      current += "√(";
    } else {
      current += value + "(";
    }
    resultEl.textContent = current;
    return;
  }

  /* reset screen after evaluation if user starts typing a number */
  if (resetScreen && !["+", "-", "×", "÷"].includes(value)) {
    current = "";
    resetScreen = false;
  }

  /* default append */
  current += value;
  resultEl.textContent = current;
});

/* Mode Switch */
modeSelect.addEventListener("change", e => {
  renderButtons(e.target.value);
  current = "";
  resultEl.textContent = "0";
  historyEl.textContent = "";
});

/* Theme Toggle */
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});

/* History Toggle (slide-down expectation) */
historyToggle.addEventListener("click", () => {
  historyPanel.classList.toggle("active");
});

/* Clear History */
clearHistory.addEventListener("click", () => {
  historyList.innerHTML = "";
});

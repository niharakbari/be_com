const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/Dashboard.jsx', 'utf8');

// Remove insight block
const start = code.indexOf('{/* Category Insights */}');
const end = code.indexOf('{/* Transactions List */}');
if (start !== -1 && end !== -1) {
  code = code.slice(0, start) + code.slice(end);
}

// Remove insight variables
code = code.replace(/const \[insightFilters.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?setInsightLoading\(false\);\n  };\n/s, '');

// Also remove Filter import if unused
code = code.replace(', Filter ', ' ');

fs.writeFileSync('frontend/src/pages/Dashboard.jsx', code);
console.log('Category Insights removed from Dashboard');

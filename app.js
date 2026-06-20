// ============================================
// CONFIGURATION
// ============================================
const FREE_ENTRY_LIMIT = 20;

// Stripe Configuration - Replace with your actual keys from https://dashboard.stripe.com
// See .env.example for setup instructions
const STRIPE_PUBLISHABLE_KEY = 'pk_live_51TjfhR2XHBy6XYp9d3rdcfSawiYiy31tdnsNXeo1XX2kQgWwKhRkBZ566VOjhMVDDKcb1liUwWyRo28hUWNP7epa00P0ywpjlG'; // or pk_test_ for development

// Supabase Configuration - Replace with your values from https://supabase.com
// Initialize with: npx supabase init
// The below is loaded from environment variables in production
let SUPABASE_URL = 'https://udnqbsebbwupmyaqreog.supabase.co';
let SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkbnFic2ViYnd1cG15YXFyZW9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NDQ5NDQsImV4cCI6MjA5NzMyMDk0NH0.EliviUNNCP2EU9jYyMmpoAPi1Godm1aq8nXXsuAq-lQ';
let supabase = null;

// ============================================
// STATE
// ============================================
let user = null;
const STATE_TAX_RATES = {
  'AL': 5, 'AK': 0, 'AZ': 2.5, 'AR': 4.4, 'CA': 9.3, 'CO': 4.4, 'CT': 5.5, 'DE': 6.6, 'FL': 0, 'GA': 5.49, 'HI': 11, 'ID': 5.8, 'IL': 4.95, 'IN': 3.23, 'IA': 5.6, 'KS': 5.7, 'KY': 4, 'LA': 4.25, 'ME': 7.15, 'MD': 5.75, 'MA': 5, 'MI': 4.25, 'MN': 9.85, 'MS': 5, 'MO': 4.8, 'MT': 6.72, 'NE': 5.84, 'NV': 0, 'NH': 0, 'NJ': 6.37, 'NM': 5.9, 'NY': 6.85, 'NC': 4.5, 'ND': 2.9, 'OH': 3.99, 'OK': 4.75, 'OR': 9, 'PA': 3.07, 'RI': 5.99, 'SC': 7, 'SD': 5.5, 'TN': 0, 'TX': 0, 'UT': 4.65, 'VT': 8.75, 'VA': 5.75, 'WA': 0, 'WV': 5.6, 'WI': 5.3, 'WY': 0
};
let rules = { tax: 25, reinvest: 10, savings: 20, state: 'NC', userTaxRate: 25 };
let entries = [];
window.currentMonth = new Date();
let selectedCategory = 'sponsorship';
let cookieConsent = localStorage.getItem('cookie_consent') === 'accepted';
let tourShown = localStorage.getItem('tour_shown') === 'true';
let trendChart = null;
let mixChart = null;

// ============================================
// HELPERS
// ============================================
function formatCurrency(num) {
  return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonth(date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function getCurrentEntries() {
  const key = getMonthKey(currentMonth);
  return entries.filter(e => e.monthKey === key);
}

function getPreviousMonthEntries() {
  const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
  const key = getMonthKey(prev);
  return entries.filter(e => e.monthKey === key);
}

function canAddEntry() {
  if (user && user.user_metadata?.tier === 'pro') return true;
  return getCurrentEntries().length < FREE_ENTRY_LIMIT;
}

// ============================================
// ANALYTICS
// ============================================
async function updateAnalytics() {
  if (!user || user.user_metadata?.tier !== 'pro') {
    document.getElementById('analyticsSection').style.display = 'none';
    return;
  }
  document.getElementById('analyticsSection').style.display = 'block';

  // 1. Aggregate Income Trend (Monthly)
  const monthlyData = {};
  entries.forEach(e => {
    const key = e.monthKey; // e.g. "2026-01"
    monthlyData[key] = (monthlyData[key] || 0) + e.amount;
  });

  const sortedKeys = Object.keys(monthlyData).sort();
  const labels = sortedKeys.map(key => {
    const [year, month] = key.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  });
  const totals = sortedKeys.map(key => monthlyData[key]);

  // 2. Aggregate Revenue Mix (Category)
  const categoryData = {};
  entries.forEach(e => {
    categoryData[e.category] = (categoryData[e.category] || 0) + e.amount;
  });

  const categories = Object.keys(categoryData);
  const categoryTotals = categories.map(cat => categoryData[cat]);
  const categoryColors = {
    sponsorship: '#3B82F6',
    platform: '#A855F7',
    membership: '#EC4899',
    affiliate: '#22C55E',
    course: '#F97316',
    other: '#8B8B8B'
  };
  const colors = categories.map(cat => categoryColors[cat] || '#8B8B8B');

  // 3. Render/Update Charts
  const trendCtx = document.getElementById('trendChart').getContext('2d');
  if (trendChart) {
    trendChart.destroy();
  }
  trendChart = new Chart(trendCtx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Monthly Income',
        data: totals,
        borderColor: '#22C55E',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#8B8B8B',
            callback: value => '$' + value.toLocaleString()
          },
          grid: { color: '#2A2A2A' }
        },
        x: {
          ticks: {
            color: '#8B8B8B',
            align: 'center',
            padding: 10
          },
          grid: { display: false }
        }
      }
    }
  });

  const mixCtx = document.getElementById('mixChart').getContext('2d');
  if (mixChart) {
    mixChart.destroy();
  }
  mixChart = new Chart(mixCtx, {
    type: 'doughnut',
    data: {
      labels: categories.map(cat => getCategoryLabel(cat)),
      datasets: [{
        data: categoryTotals,
        backgroundColor: colors,
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#8B8B8B',
            usePointStyle: true,
            padding: 20
          }
        }
      }
    }
  });
}

// ============================================
// INCOME MANAGEMENT
// ============================================
async function addIncome(amount, source, category) {
  if (!canAddEntry()) {
    openUpgradeModal();
    return;
  }

  const entry = {
    id: Date.now().toString(),
    amount,
    source: source || '',
    category,
    monthKey: getMonthKey(currentMonth),
    createdAt: Date.now()
  };

  // Try Supabase first, fall back to localStorage
  if (supabase && user) {
    const result = await saveToSupabase(entry);
    if (!result.error) {
      entries.unshift(result.data);
      showToast(`Added ${formatCurrency(amount)} income`, 'success');
    } else {
      showToast('Failed to save. Using local storage.', 'error');
      entries.push(entry);
      saveData();
    }
  } else {
    entries.push(entry);
    saveData();
  }

  updateDisplay();
}

async function deleteEntry(id) {
  // Try Supabase first
  if (supabase && user) {
    await deleteFromSupabase(id);
  }

  entries = entries.filter(e => e.id !== id);

  if (!supabase) {
    saveData();
  }

  updateDisplay();
  showToast('Entry deleted', 'info');
}

function exportCSV() {
  const monthEntries = getCurrentEntries();
  if (monthEntries.length === 0) {
    showToast('No entries to export', 'error');
    return;
  }

  const headers = ['Date', 'Category', 'Source', 'Amount'];
  const rows = monthEntries.map(e => [
    new Date(e.createdAt).toLocaleDateString(),
    getCategoryLabel(e.category),
    e.source || '-',
    e.amount
  ]);

  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `creatortally-${getMonthKey(currentMonth)}.csv`;
  a.click();

  URL.revokeObjectURL(url);
  showToast('CSV exported successfully', 'success');
}

// ============================================
// RULES
// ============================================
function adjustRule(type, delta) {
  const newValue = rules[type] + delta;
  if (newValue >= 0 && newValue <= 100) {
    rules[type] = newValue;
    if (type === 'tax') rules.userTaxRate = newValue;
    saveData();
    updateDisplay();
  }
}

// ============================================
// LOCAL STORAGE
// ============================================
function loadData() {
  const savedUser = localStorage.getItem('creatortally_user');
  if (savedUser) {
    user = JSON.parse(savedUser);
    rules = user.rules || rules;
    entries = user.entries || [];
  }
}

function saveData() {
  if (user) {
    localStorage.setItem('creatortally_user', JSON.stringify({
      ...user,
      rules,
      entries
    }));
  }
}

// ============================================
// INITIALIZE
// ============================================
async function init() {
  loadData();
  showCookieBanner();

  // Try to initialize Supabase
  const connected = await initDatabase();

  if (connected) {
    showToast('Connected to cloud storage', 'info');
  } else {
    // Using localStorage fallback
    if (user) {
      document.getElementById('landingPage').classList.add('hidden');
      document.getElementById('dashboardPage').classList.add('active');
      updateDisplay();
    }
  }

  // Initialize UI components
  const addBtn = document.getElementById('addIncomeBtn');
  if (addBtn) addBtn.addEventListener('click', openModal);
  if (typeof populateStateSelector === 'function') populateStateSelector();
  if (typeof initModalListeners === 'function') initModalListeners();
}

// ============================================
// EVENT LISTENERS
// ============================================
document.addEventListener('keydown', (e) => {
  // Only when not in an input
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  if (e.key === 'n' || e.key === 'N') {
    const dashboard = document.getElementById('dashboardPage');
    if (dashboard.classList.contains('active')) {
      openModal();
    }
  }

  if (e.key === 'Escape') {
    closeModal();
    closeUpgradeModal();
    closeLoginModal();
  }
});

init();

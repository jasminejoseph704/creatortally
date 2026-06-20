// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icons = {
    success: `<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    error: `<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    info: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
  };

  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="dismissToast(this)">&times;</button>
  `;

  container.appendChild(toast);

  // Auto remove after 4 seconds
  setTimeout(() => {
    dismissToast(toast.querySelector('.toast-close'));
  }, 4000);
}

function dismissToast(btn) {
  const toast = btn.closest('.toast');
  if (toast) {
    toast.style.animation = 'toastOut 0.3s ease-out forwards';
    setTimeout(() => toast.remove(), 300);
  }
}

// ============================================
// COOKIE CONSENT
// ============================================
function showCookieBanner() {
  if (!cookieConsent) {
    document.getElementById('cookieBanner').classList.add('visible');
  }
}

function acceptCookies() {
  cookieConsent = true;
  localStorage.setItem('cookie_consent', 'accepted');
  document.getElementById('cookieBanner').classList.remove('visible');
  showToast('Cookies accepted', 'info');
}

function declineCookies() {
  localStorage.setItem('cookie_consent', 'declined');
  document.getElementById('cookieBanner').classList.remove('visible');
}

// ============================================
// UI UPDATES
// ============================================
async function updateDisplay() {
  const monthEntries = getCurrentEntries();
  const prevEntries = getPreviousMonthEntries();

  const total = monthEntries.reduce((sum, e) => sum + e.amount, 0);
  const prevTotal = prevEntries.reduce((sum, e) => sum + e.amount, 0);

  const taxAmount = Math.round(total * (rules.tax / 100));
  const reinvestAmount = Math.round(total * (rules.reinvest / 100));
  const savingsAmount = Math.round(total * (rules.savings / 100));
  const takeHomeAmount = total - taxAmount - reinvestAmount - savingsAmount;

  // User info
  document.getElementById('userEmail').textContent = user ? (user.full_name || user.email) : 'guest';
  const tierBadge = document.getElementById('tierBadge');
  if (user && user.user_metadata?.tier === 'pro') {
    tierBadge.textContent = 'Pro';
    tierBadge.className = 'tier-badge pro';
    document.getElementById('usageBar').style.display = 'none';
    document.getElementById('proFeatures').style.display = 'none';
  } else {
    tierBadge.textContent = 'Free';
    tierBadge.className = 'tier-badge free';
    document.getElementById('usageBar').style.display = 'flex';
    document.getElementById('proFeatures').style.display = 'block';
  }

  // Snapshot
  document.getElementById('totalIncome').textContent = formatCurrency(total);
  document.getElementById('taxReserve').textContent = formatCurrency(taxAmount);
  document.getElementById('reinvestAmount').textContent = formatCurrency(reinvestAmount);
  document.getElementById('takeHome').textContent = formatCurrency(takeHomeAmount);

  // Subs
  document.getElementById('totalSub').textContent = `${monthEntries.length} ${monthEntries.length === 1 ? 'entry' : 'entries'} this month`;
  document.getElementById('taxSub').textContent = `${rules.tax}% set aside for taxes`;
  document.getElementById('reinvestSub').textContent = `${rules.reinvest}% for business growth`;
  document.getElementById('takeHomeSub').textContent = 'Safe to spend';

  // Month
  document.getElementById('currentMonth').textContent = formatMonth(currentMonth);

  // Month comparison
  const comparisonBar = document.getElementById('comparisonBar');
  if (entries.length > 0 && prevTotal > 0) {
    comparisonBar.style.display = 'flex';
    document.getElementById('lastMonthAmount').textContent = formatCurrency(prevTotal);

    const change = ((total - prevTotal) / prevTotal) * 100;
    const comparisonChange = document.getElementById('comparisonChange');
    const arrow = document.getElementById('comparisonArrow');
    const percent = document.getElementById('comparisonPercent');

    percent.textContent = Math.abs(change).toFixed(0) + '%';

    if (change >= 0) {
      comparisonChange.className = 'comparison-change up';
      arrow.textContent = '↑';
    } else {
      comparisonChange.className = 'comparison-change down';
      arrow.textContent = '↓';
    }
  } else {
    comparisonBar.style.display = 'none';
  }

  // Usage bar
  const entryCount = monthEntries.length;
  document.getElementById('usageCount').textContent = entryCount;

  const fillPercent = user && user.user_metadata?.tier === 'pro' ? 0 : (entryCount / FREE_ENTRY_LIMIT) * 100;
  const usageFill = document.getElementById('usageFill');
  const usageCta = document.getElementById('usageCta');
  const addBtn = document.getElementById('addIncomeBtn');

  usageFill.style.width = `${fillPercent}%`;

  if (user && user.user_metadata?.tier === 'pro') {
    usageFill.className = 'usage-fill';
    usageCta.style.display = 'none';
    addBtn.disabled = false;
  } else {
    if (fillPercent >= 100) {
      usageFill.className = 'usage-fill danger';
      usageCta.style.display = 'inline';
      addBtn.disabled = true;
    } else if (fillPercent >= 80) {
      usageFill.className = 'usage-fill warning';
      usageCta.style.display = 'none';
      addBtn.disabled = false;
    } else {
      usageFill.className = 'usage-fill';
      usageCta.style.display = 'none';
      addBtn.disabled = false;
    }
  }

  // Rules
  document.getElementById('taxPercent').textContent = `${rules.tax}%`;
  document.getElementById('reinvestPercent').textContent = `${rules.reinvest}%`;
  document.getElementById('savingsPercent').textContent = `${rules.savings}%`;

  // Income list
  const listEl = document.getElementById('incomeList');

  if (monthEntries.length === 0) {
    listEl.innerHTML = `
      <div class="income-empty">
        <div class="income-empty-icon">💸</div>
        <h3>No income logged yet</h3>
        <p>Add your first income entry to see your financial picture</p>
        <span class="hint">💡 Tip: Track every payment you receive — sponsorships, platform payouts, affiliate links, all of it.</span>
      </div>
    `;
  } else {
    listEl.innerHTML = monthEntries
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(entry => `
        <div class="income-item">
          <div class="income-icon ${entry.category}">
            ${getCategoryIcon(entry.category)}
          </div>
          <div class="income-details">
            <div class="income-source">${entry.source || getCategoryLabel(entry.category)}</div>
            <div class="income-category">${getCategoryLabel(entry.category)}</div>
          </div>
          <div class="income-right">
            <div class="income-amount">${formatCurrency(entry.amount)}</div>
            <div class="income-date">${new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
          </div>
          <button class="income-delete" onclick="deleteEntry('${entry.id}')" aria-label="Delete entry">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      `).join('');
  }
  await updateAnalytics();
}

function getCategoryIcon(category) {
  const icons = {
    sponsorship: '🤝',
    platform: '📺',
    membership: '💜',
    affiliate: '🔗',
    course: '📚',
    other: '✨'
  };
  return icons[category] || '✨';
}

function getCategoryLabel(category) {
  const labels = {
    sponsorship: 'Sponsorship',
    platform: 'Platform Payout',
    membership: 'Membership',
    affiliate: 'Affiliate',
    course: 'Course/Digital',
    other: 'Other'
  };
  return labels[category] || 'Other';
}

function populateStateSelector() {
  const selector = document.getElementById('stateSelector');
  if (!selector) return;

  const states = [
    { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }
  ];

  states.forEach(state => {
    const option = document.createElement('option');
    option.value = state.code;
    option.textContent = `${state.name} (${state.code})`;
    selector.appendChild(option);
  });

  if (rules.state) {
    selector.value = rules.state;
  } else {
    selector.value = 'NC';
    rules.state = 'NC';
  }
}

function showTour() {
  const tooltip = document.getElementById('tourTooltip');
  tooltip.classList.add('active');
  tooltip.style.top = '200px';
  tooltip.style.left = '50%';
  tooltip.style.transform = 'translateX(-50%)';
}

function nextTourStep() {
  tourStep++;
  const tooltip = document.getElementById('tourTooltip');

  if (tourStep >= 2) {
    tooltip.classList.remove('active');
    localStorage.setItem('tour_shown', 'true');
    tourShown = true;
    showToast('You\'re all set! Start tracking your income.', 'success');
  } else {
    tooltip.querySelector('p').textContent = 'Click "Add Income" to log your first payment — sponsorship, platform payout, anything.';
    tooltip.querySelector('.tour-actions').innerHTML = `
      <button class="btn btn-primary btn-sm" onclick="closeTour()">Got it!</button>
    `;
  }
}

function closeTour() {
  document.getElementById('tourTooltip').classList.remove('active');
  localStorage.setItem('tour_shown', 'true');
  tourShown = true;
}

function showDashboard() {
  document.getElementById('landingPage').classList.add('hidden');
  document.getElementById('dashboardPage').classList.add('active');
  updateDisplay();
}

function updateState(stateCode) {
  rules.state = stateCode;
  const stateRate = STATE_TAX_RATES[stateCode] || 0;
  rules.tax = 25 + stateRate;
  rules.userTaxRate = rules.tax;
  saveData();
  updateDisplay();
}

// Modals
function openModal() {
  if (!canAddEntry()) {
    openUpgradeModal();
    return;
  }
  const modal = document.getElementById('modalOverlay');
  modal.classList.add('active');
  document.getElementById('amountInput').value = '';
  document.getElementById('sourceInput').value = '';
  document.getElementById('amountInput').focus();
}

function closeModal() {
  const modal = document.getElementById('modalOverlay');
  modal.classList.remove('active');
}

function openUpgradeModal() {
  document.getElementById('upgradeModal').classList.add('active');
}

function closeUpgradeModal() {
  document.getElementById('upgradeModal').classList.remove('active');
}

function showLoginModal() {
  document.getElementById('loginModal').classList.add('active');
}

function closeLoginModal() {
  document.getElementById('loginModal').classList.remove('active');
}

function showSignupModal() {
  document.getElementById('signupModal').classList.add('active');
}

function closeSignupModal() {
  document.getElementById('signupModal').classList.remove('active');
}

function showForgotPasswordModal() {
  document.getElementById('forgotPasswordModal').classList.add('active');
}

function closeForgotPasswordModal() {
  document.getElementById('forgotPasswordModal').classList.remove('active');
}

function showResetPasswordModal() {
  document.getElementById('resetPasswordModal').classList.add('active');
}

function closeResetPasswordModal() {
  document.getElementById('resetPasswordModal').classList.remove('active');
}

// ============================================
// MODAL EVENT LISTENERS
// ============================================
function initModalListeners() {
  const modalClose = document.getElementById('modalClose');
  if (modalClose) modalClose.addEventListener('click', closeModal);

  const modalCancel = document.getElementById('modalCancel');
  if (modalCancel) modalCancel.addEventListener('click', closeModal);

  const modalSave = document.getElementById('modalSave');
  if (modalSave) modalSave.addEventListener('click', handleSaveIncome);

  const categoryButtons = document.querySelectorAll('.category-btn');
  categoryButtons.forEach(btn => {
    btn.addEventListener('click', handleCategorySelect);
  });

  const monthSelector = document.getElementById('monthSelector');
  if (monthSelector) {
    monthSelector.addEventListener('click', () => {
      const defaultVal = `${window.currentMonth.getFullYear()}-${String(window.currentMonth.getMonth() + 1).padStart(2, '0')}`;
      const input = prompt('Enter month and year (YYYY-MM):', defaultVal);
      if (input) {
        const match = input.match(/^(\d{4})-(\d{2})$/);
        if (match) {
          const year = parseInt(match[1], 10);
          const month = parseInt(match[2], 10);
          if (month >= 1 && month <= 12) {
            window.currentMonth = new Date(year, month - 1, 1);
            updateDisplay();
          } else {
            showToast('Invalid month. Must be 01-12', 'error');
          }
        } else {
          showToast('Invalid format. Use YYYY-MM', 'error');
        }
      }
    });
  }
}

function handleSaveIncome() {
  const amountInput = document.getElementById('amountInput');
  const sourceInput = document.getElementById('sourceInput');

  if (!amountInput || !sourceInput) return;

  const amountStr = amountInput.value;
  const amount = parseFloat(amountStr.replace(/[^0-9.]/g, ''));

  if (isNaN(amount) || amount <= 0) {
    showToast('Please enter a valid amount', 'error');
    return;
  }

  const source = sourceInput.value;
  addIncome(amount, source, selectedCategory);
  closeModal();
}

function handleCategorySelect(e) {
  const btn = e.currentTarget;
  const category = btn.dataset.category;
  if (!category) return;

  selectedCategory = category;

  document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

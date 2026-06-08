let dashboardRates = {};
let watchlistItems = [];
let alertItems = [];
let currencies = [];

document.addEventListener('DOMContentLoaded', async () => {
  // Wait for authentication state synchronization
  await syncAuthState();

  // Guard route
  if (!isLoggedIn()) {
    return;
  }

  // Display user details
  const user = getLoggedInUser();
  const welcomeUserEl = document.getElementById('welcome-user');
  if (welcomeUserEl && user) {
    welcomeUserEl.textContent = user.username;
  }

  // Fetch rates first so they are available for watchlist/favorites
  await fetchDashboardRates();

  // Load dynamic currency options list from the API
  await loadDashboardCurrencies();

  // Setup Form Selectors for Dashboard Adders (executes after currencies are available)
  setupDashboardSelectors();

  // Load dashboard panels
  loadHistoryPanel();
  loadFavoritesPanel();
  loadWatchlistPanel();
  loadAlertsPanel();

  // Search History handler
  const searchInput = document.getElementById('history-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      loadHistoryPanel(e.target.value);
    });
  }

  // Clear all history handler
  const clearHistoryBtn = document.getElementById('btn-clear-history');
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to clear your entire conversion history?')) {
        try {
          const res = await authFetch('/history/clear', { method: 'DELETE' });
          if (res.ok) {
            showToast('Conversion history cleared', 'success');
            loadHistoryPanel();
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  }
});

// Fetch latest rates to compute values in the watchlist
async function fetchDashboardRates() {
  try {
    const response = await fetch(`${API_BASE_URL}/rates/latest`);
    const data = await response.json();
    if (data.rates) {
      dashboardRates = data.rates;
    }
  } catch (err) {
    console.error('Error fetching rates:', err);
  }
}

// ==========================================================================
// HISTORY PANEL
// ==========================================================================
async function loadHistoryPanel(searchQuery = '') {
  const tableBody = document.getElementById('history-table-body');
  if (!tableBody) return;

  try {
    const url = searchQuery ? `/history?search=${encodeURIComponent(searchQuery)}` : '/history';
    const response = await authFetch(url);
    const history = await response.json();

    // Update Dashboard Top Stats
    updateStatsOverview(history);

    if (history.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="history-empty-state">
            <i class="fa-solid fa-folder-open"></i>
            <p>${searchQuery ? 'No history matching search query' : 'No conversion history found. Convert some currencies on the home page!'}</p>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = history.map((item) => {
      const fromDetails = getCurrencyDetails(item.fromCurrency);
      const toDetails = getCurrencyDetails(item.toCurrency);
      const date = new Date(item.createdAt).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      return `
        <tr id="history-row-${item._id}">
          <td>${date}</td>
          <td>
            <div style="display:flex; align-items:center; gap:8px;">
              <img class="currency-flag-img" src="${fromDetails.flagUrl}" alt="${item.fromCurrency}">
              <strong>${item.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
              <span style="color:var(--text-secondary); font-size:0.82rem;">${item.fromCurrency}</span>
            </div>
          </td>
          <td>
            <div style="display:flex; align-items:center; gap:8px;">
              <img class="currency-flag-img" src="${toDetails.flagUrl}" alt="${item.toCurrency}">
              <strong>${item.result.toLocaleString(undefined, { maximumFractionDigits: 4 })}</strong>
              <span style="color:var(--text-secondary); font-size:0.82rem;">${item.toCurrency}</span>
            </div>
          </td>
          <td>1 ${item.fromCurrency} = ${(item.result / item.amount).toFixed(4)} ${item.toCurrency}</td>
          <td>
            <button class="history-btn-del" onclick="deleteHistoryRow('${item._id}')" title="Delete record">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('Error loading history:', err);
  }
}

// Delete single history row
async function deleteHistoryRow(id) {
  try {
    const res = await authFetch(`/history/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Record removed', 'success');
      const row = document.getElementById(`history-row-${id}`);
      if (row) row.remove();
      
      // Reload history to refresh counts
      loadHistoryPanel();
    } else {
      showToast('Could not delete record', 'danger');
    }
  } catch (err) {
    console.error(err);
  }
}

// Compute top overview statistics
function updateStatsOverview(history) {
  const totalConvEl = document.getElementById('stat-total-conversions');
  const favPairEl = document.getElementById('stat-favorite-pair');

  if (totalConvEl) {
    totalConvEl.textContent = history.length;
  }

  if (favPairEl) {
    if (history.length === 0) {
      favPairEl.textContent = 'None';
      return;
    }

    // Count pair frequencies
    const pairs = {};
    history.forEach((h) => {
      const pair = `${h.fromCurrency}/${h.toCurrency}`;
      pairs[pair] = (pairs[pair] || 0) + 1;
    });

    // Find highest frequency
    let bestPair = 'None';
    let max = 0;
    Object.keys(pairs).forEach((p) => {
      if (pairs[p] > max) {
        max = pairs[p];
        bestPair = p;
      }
    });

    favPairEl.textContent = bestPair;
  }
}

// ==========================================================================
// FAVORITES PANEL
// ==========================================================================
async function loadFavoritesPanel() {
  const container = document.getElementById('favorites-grid');
  if (!container) return;

  try {
    const response = await authFetch('/favorites');
    const favorites = await response.json();

    if (favorites.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 20px; font-size: 0.88rem;">
          No favorite pairs added yet. Customize your quick-access grid below!
        </div>
      `;
      return;
    }

    container.innerHTML = favorites.map((fav) => {
      const fromDetails = getCurrencyDetails(fav.fromCurrency);
      const toDetails = getCurrencyDetails(fav.toCurrency);
      const rate = dashboardRates[fav.toCurrency] / dashboardRates[fav.fromCurrency];
      
      return `
        <div class="fav-card" onclick="quickConvert('${fav.fromCurrency}', '${fav.toCurrency}')" title="Click to convert this pair on the home page">
          <button class="fav-card-delete" onclick="removeFavoriteItem(event, '${fav._id}')" title="Remove Favorite">
            <i class="fa-solid fa-xmark"></i>
          </button>
          <div style="display:flex; justify-content:center; gap:4px; margin-bottom:8px;">
            <img class="currency-flag-img" src="${fromDetails.flagUrl}" alt="${fav.fromCurrency}">
            <i class="fa-solid fa-right-long" style="font-size:0.75rem; color:var(--color-primary); align-self:center;"></i>
            <img class="currency-flag-img" src="${toDetails.flagUrl}" alt="${fav.toCurrency}">
          </div>
          <div class="fav-pair-text">${fav.fromCurrency}/${fav.toCurrency}</div>
          <div style="font-size:0.8rem; font-weight:600; color:var(--text-secondary); margin-top:2px;">
            ${rate ? rate.toFixed(4) : 'N/A'}
          </div>
          <div class="fav-click-hint">Convert Now</div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Error loading favorites:', err);
  }
}

// Remove favorite pair
async function removeFavoriteItem(event, id) {
  event.stopPropagation(); // prevent triggering redirect
  try {
    const res = await authFetch(`/favorites/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Favorite removed', 'success');
      loadFavoritesPanel();
    }
  } catch (err) {
    console.error(err);
  }
}

// Click to quick convert on Homepage
function quickConvert(from, to) {
  window.location.href = `/?from=${from}&to=${to}`;
}

// ==========================================================================
// WATCHLIST PANEL
// ==========================================================================
async function loadWatchlistPanel() {
  const container = document.getElementById('watchlist-stack');
  if (!container) return;

  try {
    const response = await authFetch('/watchlist');
    const watchlist = await response.json();
    watchlistItems = watchlist; // Store in state for validation

    if (watchlist.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; color: var(--text-secondary); padding: 20px; font-size: 0.88rem;">
          Watchlist is empty. Track individual currencies!
        </div>
      `;
      return;
    }

    container.innerHTML = watchlist.map((item) => {
      const details = getCurrencyDetails(item.currencyCode);
      const usdRate = dashboardRates[item.currencyCode];
      
      // Calculate rate vs USD (base currency representation)
      // e.g. 1 USD = rate units
      return `
        <div class="watchlist-card-item">
          <div class="watchlist-currency-info">
            <img class="currency-flag-img" src="${details.flagUrl}" alt="${item.currencyCode}" style="width:28px; height:20px;">
            <div>
              <div class="watchlist-code">${item.currencyCode}</div>
              <div class="watchlist-name">${details.name}</div>
            </div>
          </div>
          <div style="display:flex; align-items:center;">
            <div class="watchlist-values">
              <span class="watchlist-rate">${usdRate ? usdRate.toFixed(4) : 'N/A'}</span>
              <span style="font-size:0.75rem; color:var(--text-muted);">per USD</span>
            </div>
            <button class="watchlist-btn-delete" onclick="removeFromWatchlistItem('${item._id}')" title="Remove">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Error loading watchlist:', err);
  }
}

// Remove from watchlist
async function removeFromWatchlistItem(id) {
  try {
    const res = await authFetch(`/watchlist/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Currency unwatched', 'success');
      loadWatchlistPanel();
    }
  } catch (err) {
    console.error(err);
  }
}

// ==========================================================================
// ALERTS PANEL
// ==========================================================================
async function loadAlertsPanel() {
  const container = document.getElementById('alerts-list');
  if (!container) return;

  try {
    const response = await authFetch('/alerts');
    const alerts = await response.json();
    alertItems = alerts; // Store in state for validation

    if (alerts.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; color: var(--text-secondary); padding: 20px; font-size: 0.88rem;">
          No active rate alerts. Set one up below!
        </div>
      `;
      return;
    }

    container.innerHTML = alerts.map((alert) => {
      const conditionSymbol = alert.condition === 'GREATER_THAN' ? '>' : '<';
      
      let badgeClass = 'status-active';
      let badgeText = 'Active';

      if (alert.isTriggered) {
        badgeClass = 'status-triggered';
        badgeText = 'Triggered';
      } else if (!alert.isActive) {
        badgeClass = 'status-dismissed';
        badgeText = 'Dismissed';
      }

      const createdDateStr = new Date(alert.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      const triggeredDateStr = alert.triggeredAt ? new Date(alert.triggeredAt).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : null;

      return `
        <div class="alert-item-card ${alert.isTriggered ? 'triggered' : ''} ${!alert.isActive ? 'dismissed' : ''}">
          <div class="alert-card-header">
            <span class="alert-info-desc">
              ${alert.fromCurrency}/${alert.toCurrency} ${conditionSymbol} ${alert.value.toFixed(4)}
            </span>
            <span class="alert-status-badge ${badgeClass}">${badgeText}</span>
          </div>
          
          <div class="alert-card-body">
            <span class="alert-date-info">Created: ${createdDateStr}</span>
            ${triggeredDateStr ? `<span class="alert-date-info alert-trigger-time">| Triggered: ${triggeredDateStr}</span>` : ''}
          </div>
          
          <div class="alert-actions">
            ${alert.isTriggered ? `
              <button class="btn btn-primary alert-btn alert-btn-dismiss" onclick="dismissAlertItem('${alert._id}')">
                Dismiss
              </button>
            ` : ''}
            <button class="btn btn-secondary alert-btn alert-btn-delete" onclick="deleteAlertItem('${alert._id}')" title="Delete Alert">
              <i class="fa-solid fa-trash-can"></i> Delete
            </button>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Error loading alerts:', err);
  }
}

// Delete alert
async function deleteAlertItem(id) {
  try {
    const res = await authFetch(`/alerts/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Alert removed', 'success');
      loadAlertsPanel();
    }
  } catch (err) {
    console.error(err);
  }
}

// Dismiss triggered alert (deactivates/clears it)
async function dismissAlertItem(id) {
  try {
    const res = await authFetch(`/alerts/${id}/dismiss`, { method: 'PUT' });
    if (res.ok) {
      showToast('Alert dismissed', 'info');
      loadAlertsPanel();
    }
  } catch (err) {
    console.error(err);
  }
}

// Validate if currency is already in watchlist
function validateWatchlistCurrency(code) {
  console.log(`[Validation] Running validateWatchlistCurrency for code: ${code}`);
  const exists = watchlistItems.some(item => item.currencyCode === code);
  if (exists) {
    showToast('This currency is already in your watchlist.', 'warning');
    return false;
  }
  return true;
}

// Validate if identical alert already exists (matches base, target, condition, and value)
function validateRateAlert(from, to, condition, value) {
  const numericValue = parseFloat(value);
  console.log(`[Validation] Running validateRateAlert for pair: ${from}/${to}, condition: ${condition}, value: ${numericValue}`);
  
  const exists = alertItems.some(alert => 
    alert.fromCurrency === from &&
    alert.toCurrency === to &&
    alert.condition === condition &&
    Math.abs(alert.value - numericValue) < 0.00001 &&
    alert.isActive // Only check active alerts
  );

  if (exists) {
    showToast('An identical alert already exists.', 'warning');
    return false;
  }
  return true;
}

// Fetch dynamic currency list from rates API
async function loadDashboardCurrencies() {
  console.log("[Currencies] Initializing currency data load...");
  
  // Set all dropdown lists to loading state initially
  setDropdownsState("Loading currencies...");

  try {
    const response = await fetch(`${API_BASE_URL}/rates/latest`);
    if (!response.ok) {
      throw new Error(`API response status ${response.status}`);
    }
    const data = await response.json();
    
    if (data && data.rates && Object.keys(data.rates).length > 0) {
      // Clear array and copy new values to preserve array reference
      currencies.length = 0;
      currencies.push(...Object.keys(data.rates));
      
      console.log("Currencies loaded:", currencies);
      console.log("Currency count:", currencies.length);
    } else {
      throw new Error("Invalid or empty currency rates in API response");
    }
  } catch (err) {
    console.error("[Currencies] Failed to load currencies via API, using fallbacks:", err);
    
    // Clear array and push fallback currency data
    currencies.length = 0;
    currencies.push('USD', 'EUR', 'INR', 'GBP', 'JPY', 'AUD', 'CAD', 'AED');
    
    console.log("Currencies loaded:", currencies);
    console.log("Currency count:", currencies.length);
    
    // Set all dropdown lists to error/fallback message
    setDropdownsState("Unable to load currencies. Using defaults.");
    showToast("Unable to load live currencies. Using offline defaults.", "warning");
  }
}

// Set loading or error state messages in options dropdown containers
function setDropdownsState(message) {
  const dropdownIds = [
    'fav-from-options',
    'fav-to-options',
    'watch-options',
    'alert-from-options',
    'alert-to-options'
  ];
  dropdownIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = `
        <li class="select-option disabled" style="cursor: default; color: var(--text-muted); text-align: center; padding: 12px; font-size: 0.85rem;">
          ${message}
        </li>
      `;
    }
  });
}

// ==========================================================================
// DASHBOARD FORM SUBMISSION SELECTORS
// ==========================================================================
function setupDashboardSelectors() {
  // 1. Favorites selector row
  if (document.getElementById('fav-from-trigger')) {
    const setFavFrom = setupSearchableDropdown(
      'fav-from-trigger', 'fav-from-dropdown', 'fav-from-search', 'fav-from-options',
      null, currencies
    );
    const setFavTo = setupSearchableDropdown(
      'fav-to-trigger', 'fav-to-dropdown', 'fav-to-search', 'fav-to-options',
      null, currencies
    );
    
    setFavFrom('USD');
    setFavTo('EUR');

    const addFavForm = document.getElementById('add-fav-form');
    if (addFavForm) {
      addFavForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const from = document.getElementById('fav-from-trigger').dataset.value;
        const to = document.getElementById('fav-to-trigger').dataset.value;

        if (from === to) {
          showToast('Currencies must be different', 'warning');
          return;
        }

        try {
          const res = await authFetch('/favorites', {
            method: 'POST',
            body: JSON.stringify({ fromCurrency: from, toCurrency: to })
          });
          const data = await res.json();
          if (res.ok) {
            showToast('Favorite pair added!', 'success');
            loadFavoritesPanel();
          } else {
            showToast(data.message || 'Error saving favorite', 'danger');
          }
        } catch (err) {
          console.error(err);
        }
      });
    }
  }

  // 2. Watchlist selector
  if (document.getElementById('watch-trigger')) {
    const setWatch = setupSearchableDropdown(
      'watch-trigger', 'watch-dropdown', 'watch-search', 'watch-options',
      null, currencies
    );
    setWatch('EUR');

    const addWatchForm = document.getElementById('add-watch-form');
    if (addWatchForm) {
      addWatchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = document.getElementById('watch-trigger').dataset.value;

        // Dedicated watchlist validation
        if (!validateWatchlistCurrency(code)) {
          return;
        }

        try {
          const res = await authFetch('/watchlist', {
            method: 'POST',
            body: JSON.stringify({ currencyCode: code })
          });
          const data = await res.json();
          if (res.ok) {
            showToast(`${code} added to watchlist!`, 'success');
            loadWatchlistPanel();
          } else {
            showToast(data.message || 'Error saving to watchlist', 'danger');
          }
        } catch (err) {
          console.error(err);
        }
      });
    }
  }

  // 3. Alerts selectors
  if (document.getElementById('alert-from-trigger')) {
    const setAlertFrom = setupSearchableDropdown(
      'alert-from-trigger', 'alert-from-dropdown', 'alert-from-search', 'alert-from-options',
      null, currencies
    );
    const setAlertTo = setupSearchableDropdown(
      'alert-to-trigger', 'alert-to-dropdown', 'alert-to-search', 'alert-to-options',
      null, currencies
    );
    
    setAlertFrom('USD');
    setAlertTo('INR');

    const addAlertForm = document.getElementById('add-alert-form');
    if (addAlertForm) {
      addAlertForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const from = document.getElementById('alert-from-trigger').dataset.value;
        const to = document.getElementById('alert-to-trigger').dataset.value;
        const condition = document.getElementById('alert-condition').value;
        const value = document.getElementById('alert-value').value;

        if (from === to) {
          showToast('Currencies must be different', 'warning');
          return;
        }

        if (!value || isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
          showToast('Please enter a valid positive target rate', 'warning');
          return;
        }

        // Dedicated alert validation
        if (!validateRateAlert(from, to, condition, value)) {
          return;
        }

        try {
          const res = await authFetch('/alerts', {
            method: 'POST',
            body: JSON.stringify({
              fromCurrency: from,
              toCurrency: to,
              condition,
              value: parseFloat(value)
            })
          });
          const data = await res.json();
          if (res.ok) {
            showToast('Rate alert created!', 'success');
            document.getElementById('alert-value').value = '';
            loadAlertsPanel();
          } else {
            showToast(data.message || 'Error saving rate alert', 'danger');
          }
        } catch (err) {
          console.error(err);
        }
      });
    }
  }
}

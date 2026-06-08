// Global references for rates and charts
let latestRates = {};
let historyChart = null;
let activeDays = 30; // default view

document.addEventListener('DOMContentLoaded', async () => {
  const fromSelectTrigger = 'from-trigger';
  const toSelectTrigger = 'to-trigger';

  // Initialize latest rates and setup selectors
  await fetchLatestRates();
  initTickerMarquee();

  if (document.getElementById(fromSelectTrigger)) {
    // Setup selectors
    const setFromVal = setupSearchableDropdown(
      'from-trigger', 'from-dropdown', 'from-search', 'from-options',
      (code) => {
        localStorage.setItem('fromCurrency', code);
        updateFlags();
        triggerConversion();
        fetchAndRenderHistory();
      }
    );

    const setToVal = setupSearchableDropdown(
      'to-trigger', 'to-dropdown', 'to-search', 'to-options',
      (code) => {
        localStorage.setItem('toCurrency', code);
        updateFlags();
        triggerConversion();
        fetchAndRenderHistory();
      }
    );

    // Set initial defaults: URL query params > localStorage > default fallbacks
    const urlParams = new URLSearchParams(window.location.search);
    const urlFrom = urlParams.get('from');
    const urlTo = urlParams.get('to');

    const savedFrom = urlFrom || localStorage.getItem('fromCurrency') || 'USD';
    const savedTo = urlTo || localStorage.getItem('toCurrency') || 'EUR';

    setFromVal(savedFrom);
    setToVal(savedTo);

    if (urlFrom) localStorage.setItem('fromCurrency', urlFrom);
    if (urlTo) localStorage.setItem('toCurrency', urlTo);

    updateFlags();

    // Event listeners
    const amountInput = document.getElementById('amount');
    if (amountInput) {
      amountInput.addEventListener('input', triggerConversion);
    }

    const swapBtn = document.getElementById('btn-swap');
    if (swapBtn) {
      swapBtn.addEventListener('click', () => {
        const fromCode = document.getElementById('from-trigger').dataset.value;
        const toCode = document.getElementById('to-trigger').dataset.value;
        setFromVal(toCode);
        setToVal(fromCode);
        localStorage.setItem('fromCurrency', toCode);
        localStorage.setItem('toCurrency', fromCode);
        updateFlags();
        triggerConversion();
        fetchAndRenderHistory();
      });
    }

    // Chart tab triggers
    const tab7 = document.getElementById('tab-7d');
    const tab30 = document.getElementById('tab-30d');
    if (tab7 && tab30) {
      tab7.addEventListener('click', () => {
        tab7.classList.add('active');
        tab30.classList.remove('active');
        activeDays = 7;
        fetchAndRenderHistory();
      });
      tab30.addEventListener('click', () => {
        tab30.classList.add('active');
        tab7.classList.remove('active');
        activeDays = 30;
        fetchAndRenderHistory();
      });
    }

    // Run conversion and chart initially
    triggerConversion();
    fetchAndRenderHistory();

    // Listen to theme changes to re-color charts
    window.addEventListener('themeChanged', () => {
      fetchAndRenderHistory();
    });
  }
});

// Fetch latest rates from backend
async function fetchLatestRates() {
  try {
    const response = await fetch(`${API_BASE_URL}/rates/latest`);
    const data = await response.json();
    if (data.rates) {
      latestRates = data.rates;
    }
  } catch (err) {
    console.error('Error fetching latest rates:', err);
    showToast('Failed to load live exchange rates.', 'danger');
  }
}

// Perform live conversion
async function triggerConversion() {
  const amountField = document.getElementById('amount');
  if (!amountField) return;

  const amount = parseFloat(amountField.value);
  const fromCode = document.getElementById('from-trigger').dataset.value;
  const toCode = document.getElementById('to-trigger').dataset.value;

  if (isNaN(amount) || amount <= 0) {
    updateResultArea(0, fromCode, toCode, 0);
    return;
  }

  const rateFrom = latestRates[fromCode];
  const rateTo = latestRates[toCode];

  if (!rateFrom || !rateTo) return;

  // Conversion: amount * (toRate / fromRate)
  const rate = rateTo / rateFrom;
  const result = amount * rate;

  updateResultArea(amount, fromCode, toCode, result, rate);

  // Debounced/delayed history storage if user is logged in
  // We avoid saving immediately on every keystroke, let's save when a "Save Conversion" button or completed action happens,
  // or simple debounce. Let's add a debouncer for auto-saving conversions!
  autoSaveConversion(amount, fromCode, toCode, result);
}

// Debounce helper for saving history
let saveHistoryTimeout = null;
function autoSaveConversion(amount, from, to, result) {
  if (!isLoggedIn()) return;

  if (saveHistoryTimeout) clearTimeout(saveHistoryTimeout);

  saveHistoryTimeout = setTimeout(async () => {
    try {
      await authFetch('/history', {
        method: 'POST',
        body: JSON.stringify({ amount, fromCurrency: from, toCurrency: to, result }),
      });
      console.log('Conversion auto-saved to history');
    } catch (err) {
      console.error('History save error:', err);
    }
  }, 1500); // Wait 1.5 seconds after typing finishes
}

function updateResultArea(amount, from, to, result, rate) {
  const resultVal = document.getElementById('result-value');
  const resultRate = document.getElementById('result-rate');

  if (!resultVal || !resultRate) return;

  const fromDetails = getCurrencyDetails(from);
  const toDetails = getCurrencyDetails(to);

  if (amount === 0) {
    resultVal.textContent = `${toDetails.symbol} 0.00`;
    resultRate.textContent = `1 ${from} = 0.0000 ${to}`;
    return;
  }

  resultVal.textContent = `${toDetails.symbol} ${result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  resultRate.textContent = `1 ${from} = ${rate.toFixed(4)} ${to} | 1 ${to} = ${(1/rate).toFixed(4)} ${from}`;
}

// Update flags in the converter UI
function updateFlags() {
  const fromCode = document.getElementById('from-trigger').dataset.value;
  const toCode = document.getElementById('to-trigger').dataset.value;

  const fromDetails = getCurrencyDetails(fromCode);
  const toDetails = getCurrencyDetails(toCode);

  const fromFlagImg = document.getElementById('from-flag');
  const toFlagImg = document.getElementById('to-flag');
  const fromLabel = document.getElementById('from-currency-name');
  const toLabel = document.getElementById('to-currency-name');

  if (fromFlagImg) fromFlagImg.src = fromDetails.flagUrl;
  if (toFlagImg) toFlagImg.src = toDetails.flagUrl;
  if (fromLabel) fromLabel.textContent = `${fromDetails.name} (${fromDetails.symbol})`;
  if (toLabel) toLabel.textContent = `${toDetails.name} (${toDetails.symbol})`;
}

// Fetch historical rates and render analytics + chart
async function fetchAndRenderHistory() {
  const fromCode = document.getElementById('from-trigger').dataset.value;
  const toCode = document.getElementById('to-trigger').dataset.value;
  const canvas = document.getElementById('history-chart');

  if (!fromCode || !toCode || !canvas) return;

  // Show loading skeleton in chart container
  const loader = document.getElementById('chart-loader');
  if (loader) loader.classList.add('active');

  // Hide empty state and show canvas initially
  const emptyState = document.getElementById('chart-empty-state');
  if (emptyState) emptyState.style.display = 'none';
  canvas.style.display = 'block';

  try {
    const response = await fetch(`${API_BASE_URL}/rates/history?from=${fromCode}&to=${toCode}&days=${activeDays}`);
    
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    
    const data = await response.json();

    if (data.history && data.history.length > 0) {
      renderExchangeRateAnalytics(data.history, fromCode, toCode);
      renderChart(data.history, fromCode, toCode);
      updateChartStats(data.stats, toCode, data.history);
    } else {
      showEmptyState();
    }
  } catch (err) {
    console.error('History fetch error:', err);
    showEmptyState();
  } finally {
    if (loader) loader.classList.remove('active');
  }

  function showEmptyState() {
    if (emptyState) emptyState.style.display = 'flex';
    canvas.style.display = 'none';

    // Clear dynamic headers
    const pairTitleEl = document.getElementById('chart-pair-title');
    if (pairTitleEl) pairTitleEl.textContent = `${fromCode} → ${toCode}`;
    const trendEl = document.getElementById('chart-trend-badge');
    if (trendEl) trendEl.style.display = 'none';

    // Reset stats to N/A
    document.getElementById('stat-high').textContent = 'N/A';
    document.getElementById('stat-low').textContent = 'N/A';
    document.getElementById('stat-avg').textContent = 'N/A';
    document.getElementById('stat-current').textContent = 'N/A';
  }
}

// Render exchange rate analytics card
function renderExchangeRateAnalytics(history, from, to) {
  const rateToday = history[history.length - 1].rate;
  
  // Yesterday is index before last (or fallback if 1-length)
  const yesterdayIndex = history.length >= 2 ? history.length - 2 : 0;
  const rateYesterday = history[yesterdayIndex].rate;

  const diff = rateToday - rateYesterday;
  const percent = (diff / rateYesterday) * 100;

  const currentRateEl = document.getElementById('analytics-current-rate');
  const yesterdayRateEl = document.getElementById('analytics-yesterday-rate');
  const changeEl = document.getElementById('analytics-change');

  if (!currentRateEl || !yesterdayRateEl || !changeEl) return;

  const toDetails = getCurrencyDetails(to);

  currentRateEl.textContent = `${toDetails.symbol} ${rateToday.toFixed(4)}`;
  yesterdayRateEl.textContent = `${toDetails.symbol} ${rateYesterday.toFixed(4)}`;

  const directionIcon = diff >= 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down';
  const colorClass = diff >= 0 ? 'change-up' : 'change-down';
  const sign = diff >= 0 ? '+' : '';

  changeEl.className = `analytic-change-row ${colorClass}`;
  changeEl.innerHTML = `
    <i class="fa-solid ${directionIcon}"></i>
    <span>${sign}${diff.toFixed(4)}</span>
    <span class="change-pill ${colorClass}">${sign}${percent.toFixed(2)}%</span>
  `;
}

// Render Chart.js
function renderChart(history, from, to) {
  const canvas = document.getElementById('history-chart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  
  // Destroy existing chart to rebuild
  if (historyChart) {
    historyChart.destroy();
  }

  const labels = history.map(h => {
    // Format YYYY-MM-DD to short month/day (e.g. Jun 07)
    const dateObj = new Date(h.date);
    return dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  });
  const data = history.map(h => h.rate);

  // Read current theme to apply matching colors
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  const textColor = theme === 'dark' ? '#94a3b8' : '#475569';
  const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
  
  // Trend calculations
  const firstRate = data[0];
  const lastRate = data[data.length - 1];
  const isTrendPositive = (lastRate - firstRate) >= 0;
  const percentChange = ((lastRate - firstRate) / firstRate) * 100;

  // Update Header details
  const pairTitleEl = document.getElementById('chart-pair-title');
  const trendEl = document.getElementById('chart-trend-badge');
  if (pairTitleEl) {
    pairTitleEl.textContent = `${from} → ${to}`;
  }
  if (trendEl) {
    trendEl.style.display = 'inline-flex';
    if (isTrendPositive) {
      trendEl.className = 'chart-trend-badge trend-positive';
      trendEl.innerHTML = `<i class="fa-solid fa-caret-up"></i> +${percentChange.toFixed(2)}%`;
    } else {
      trendEl.className = 'chart-trend-badge trend-negative';
      trendEl.innerHTML = `<i class="fa-solid fa-caret-down"></i> ${percentChange.toFixed(2)}%`;
    }
  }

  const lineColor = isTrendPositive ? '#10b981' : '#ef4444';
  
  // Gradient for line
  const gradient = ctx.createLinearGradient(0, 0, 0, 200);
  if (isTrendPositive) {
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
  } else {
    gradient.addColorStop(0, 'rgba(239, 68, 68, 0.35)');
    gradient.addColorStop(1, 'rgba(239, 68, 68, 0.0)');
  }

  historyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: `${from}/${to} Exchange Rate`,
        data,
        borderColor: lineColor,
        borderWidth: 2.5,
        fill: true,
        backgroundColor: gradient,
        tension: 0.3,
        pointBackgroundColor: lineColor,
        pointRadius: (context) => {
          const idx = context.dataIndex;
          const total = context.dataset.data.length;
          return idx === total - 1 ? 6 : 0;
        },
        pointBorderColor: isTrendPositive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)',
        pointBorderWidth: (context) => {
          const idx = context.dataIndex;
          const total = context.dataset.data.length;
          return idx === total - 1 ? 6 : 0;
        },
        pointHoverBackgroundColor: lineColor,
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
        pointHoverRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animations: {
        radius: {
          duration: 1200,
          easing: 'easeInOutQuad',
          from: (context) => {
            return context.dataIndex === context.dataset.data.length - 1 ? 5 : 0;
          },
          to: (context) => {
            return context.dataIndex === context.dataset.data.length - 1 ? 8 : 0;
          },
          loop: true
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
          titleColor: theme === 'dark' ? '#ffffff' : '#0f172a',
          bodyColor: theme === 'dark' ? '#f3f4f6' : '#374151',
          borderColor: lineColor + '33', // 20% opacity color border
          borderWidth: 1,
          padding: 10,
          displayColors: false,
          callbacks: {
            title: (tooltipItems) => {
              return tooltipItems[0].label;
            },
            label: (context) => {
              const rateVal = context.parsed.y.toFixed(2);
              return `1 ${from} = ${rateVal} ${to}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { 
            color: textColor, 
            font: { family: 'Outfit', size: 10 },
            maxTicksLimit: window.innerWidth < 768 ? 4 : 8,
            autoSkip: true,
            maxRotation: 0,
            minRotation: 0
          }
        },
        y: {
          grid: { color: gridColor },
          ticks: { color: textColor, font: { family: 'Outfit', size: 10 } }
        }
      },
      hover: {
        mode: 'nearest',
        intersect: true
      }
    }
  });
}

function updateChartStats(stats, to, history) {
  const highEl = document.getElementById('stat-high');
  const lowEl = document.getElementById('stat-low');
  const avgEl = document.getElementById('stat-avg');
  const currentEl = document.getElementById('stat-current');

  if (!highEl || !lowEl || !avgEl || !currentEl) return;

  const toDetails = getCurrencyDetails(to);

  highEl.textContent = `${toDetails.symbol}${stats.highest.toFixed(4)}`;
  lowEl.textContent = `${toDetails.symbol}${stats.lowest.toFixed(4)}`;
  avgEl.textContent = `${toDetails.symbol}${stats.average.toFixed(4)}`;

  if (history && history.length > 0) {
    const currentRate = history[history.length - 1].rate;
    currentEl.textContent = `${toDetails.symbol}${currentRate.toFixed(2)}`;
  } else {
    currentEl.textContent = 'N/A';
  }
}

// Populate live ticker marquee with popular rate streams
async function initTickerMarquee() {
  const marquee = document.getElementById('marquee-track');
  if (!marquee) return;

  // We want to highlight popular pairs
  const pairs = [
    { from: 'USD', to: 'EUR' },
    { from: 'USD', to: 'INR' },
    { from: 'EUR', to: 'GBP' },
    { from: 'USD', to: 'JPY' },
    { from: 'AUD', to: 'USD' },
    { from: 'USD', to: 'CAD' },
    { from: 'GBP', to: 'JPY' }
  ];

  let marqueeHtml = '';

  pairs.forEach(p => {
    const fromRate = latestRates[p.from];
    const toRate = latestRates[p.to];
    
    if (fromRate && toRate) {
      const rate = toRate / fromRate;
      
      // Compute mock direction based on simple checksum of characters (just to show up/down variety)
      const isUp = (p.from.charCodeAt(0) + p.to.charCodeAt(0)) % 2 === 0;
      const changePercent = (isUp ? 0.12 : -0.09);
      const icon = isUp ? 'up' : 'down';
      const colorClass = isUp ? 'change-up' : 'change-down';

      marqueeHtml += `
        <span class="marquee-item">
          <strong>${p.from}/${p.to}</strong>
          <span>${rate.toFixed(4)}</span>
          <span class="${colorClass}" style="font-size: 0.75rem;">
            <i class="fa-solid fa-caret-${icon}"></i> ${changePercent}%
          </span>
        </span>
      `;
    }
  });

  marquee.innerHTML = marqueeHtml + marqueeHtml; // duplicate for infinite scroll effect
}

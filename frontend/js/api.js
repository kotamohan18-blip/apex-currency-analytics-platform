// ==========================================================================
// CORE API CONFIGURATION & ACTIONS
// ==========================================================================
const API_BASE_URL = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
  ? 'http://localhost:5000/api'
  : '/api';

// Helper to make authenticated requests
async function authFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // If unauthorized, clear credentials and redirect to login if not already on login/register/landing
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    const path = window.location.pathname;
    if (path.includes('dashboard') || path.includes('profile')) {
      window.location.href = '/login';
    }
  }

  return response;
}

// Check if user is logged in (both token and user exist and user is parseable)
function isLoggedIn() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  if (!token || !user) return false;
  try {
    const parsed = JSON.parse(user);
    return !!(parsed && parsed.username);
  } catch (e) {
    return false;
  }
}

// Log out user
function logoutUser() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  showToast('Logged out successfully!', 'success');
  
  // Dispatch custom auth state changed event
  window.dispatchEvent(new Event('authStateChanged'));
  
  setTimeout(() => {
    window.location.href = '/';
  }, 1000);
}

// Get logged in user details
function getLoggedInUser() {
  const user = localStorage.getItem('user');
  try {
    return user ? JSON.parse(user) : null;
  } catch (e) {
    return null;
  }
}

// Synchronize and validate authentication state from server
async function syncAuthState() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (token) {
    if (!user) {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const userData = await response.json();
          localStorage.setItem('user', JSON.stringify({
            _id: userData._id,
            username: userData.username,
            email: userData.email
          }));
        } else {
          // Token is invalid or expired
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (err) {
        console.error('Failed to sync authentication state from server:', err);
      }
    } else {
      // Validate user structure
      try {
        const parsed = JSON.parse(user);
        if (!parsed || !parsed.username) {
          throw new Error('Invalid user structure');
        }
      } catch (e) {
        localStorage.removeItem('user');
        await syncAuthState();
      }
    }
  } else {
    // If no token exists, ensure user is also cleared
    if (user) {
      localStorage.removeItem('user');
    }
  }
}

// Enforce strict route guards and redirection rules
function checkRouteGuards() {
  const path = window.location.pathname.toLowerCase();
  const loggedIn = isLoggedIn();

  if (loggedIn) {
    // Redirect logged-in users away from login/register pages
    if (path.includes('/login') || path.includes('/register') || path.endsWith('login.html') || path.endsWith('register.html')) {
      window.location.href = '/dashboard';
    }
  } else {
    // Redirect guests away from protected pages
    const isProtected = path.includes('/dashboard') || 
                        path.includes('/profile') || 
                        path.includes('/history') || 
                        path.includes('/watchlist') || 
                        path.endsWith('dashboard.html') || 
                        path.endsWith('profile.html');
                        
    if (isProtected) {
      window.location.href = '/login';
    }
  }
}

// Update dynamic promotional card on the home page based on auth state
function updatePromoCard() {
  const promoCard = document.getElementById('promo-cta-card');
  if (!promoCard) return;

  const authenticated = isLoggedIn();
  if (authenticated) {
    const user = getLoggedInUser();
    const username = user ? user.username : 'User';
    
    promoCard.innerHTML = `
      <i class="fa-solid fa-circle-user" style="font-size: 2.25rem; color: var(--color-primary);"></i>
      <h3 style="font-size: 1.2rem; font-weight: 700; margin: 0;">Welcome Back, ${username}</h3>
      <div class="promo-features-list" style="text-align: left; margin: 8px auto; display: flex; flex-direction: column; gap: 8px; font-size: 0.88rem; color: var(--text-secondary); width: fit-content;">
        <div style="display: flex; align-items: center; gap: 8px;"><i class="fa-solid fa-circle-check" style="color: var(--color-success);"></i> <span>Conversion History Active</span></div>
        <div style="display: flex; align-items: center; gap: 8px;"><i class="fa-solid fa-circle-check" style="color: var(--color-success);"></i> <span>Favorites Enabled</span></div>
        <div style="display: flex; align-items: center; gap: 8px;"><i class="fa-solid fa-circle-check" style="color: var(--color-success);"></i> <span>Watchlist Enabled</span></div>
        <div style="display: flex; align-items: center; gap: 8px;"><i class="fa-solid fa-circle-check" style="color: var(--color-success);"></i> <span>Rate Alerts Enabled</span></div>
      </div>
      <a href="/dashboard" class="btn btn-primary" style="margin-top: 8px; width: 100%; text-decoration: none; display: inline-block;">Go To Dashboard</a>
    `;
  } else {
    promoCard.innerHTML = `
      <i class="fa-solid fa-shield-halved" style="font-size: 2.25rem; color: var(--color-primary);"></i>
      <h3 style="font-size: 1.2rem; font-weight: 700; margin: 0;">Save History & Watch Currencies</h3>
      <p style="font-size: 0.88rem; color: var(--text-secondary); max-width: 240px; margin: 0 auto;">Create a free profile to log conversions, configure custom rate alerts, and save favorite pairs.</p>
      <a href="/register" class="btn btn-primary" style="margin-top: 8px; text-decoration: none; display: inline-block;">Create Account</a>
    `;
  }
}

// Render authentication-aware header navigation and promo card
function updateAuthUI() {
  const navLinksList = document.querySelector('.nav-links');
  if (navLinksList) {
    const authenticated = isLoggedIn();
    const currentPath = window.location.pathname;

    let navHtml = `
      <li><a class="nav-item ${currentPath === '/' || currentPath.endsWith('index.html') ? 'active' : ''}" href="/">Home</a></li>
    `;

    if (authenticated) {
      const user = getLoggedInUser();
      const username = user ? user.username : 'Profile';
      navHtml += `
        <li><a class="nav-item ${currentPath.includes('dashboard') ? 'active' : ''}" href="/dashboard">Dashboard</a></li>
        <li><a class="nav-item ${currentPath.includes('profile') ? 'active' : ''}" href="/profile"><i class="fa-solid fa-user" style="margin-right: 6px;"></i>${username}</a></li>
        <li><button class="nav-item btn-secondary" onclick="logoutUser()" style="border: none; background: transparent; font-family: inherit; font-size: inherit; cursor: pointer;">Logout</button></li>
      `;
    } else {
      navHtml += `
        <li><a class="nav-item ${currentPath.includes('login') ? 'active' : ''}" href="/login">Login</a></li>
        <li><a class="nav-item ${currentPath.includes('register') ? 'active' : ''}" href="/register" style="background: var(--color-primary); color: white; border-radius: var(--border-radius-sm);">Register</a></li>
      `;
    }

    navLinksList.innerHTML = navHtml;
  }

  // Update homepage promotional card
  updatePromoCard();
}

// ==========================================================================
// TOAST NOTIFICATIONS
// ==========================================================================
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'info-circle';
  if (type === 'success') icon = 'check-circle';
  if (type === 'danger') icon = 'exclamation-circle';
  if (type === 'warning') icon = 'exclamation-triangle';

  toast.innerHTML = `
    <i class="fas fa-${icon}"></i>
    <span>${message}</span>
    <div class="toast-progress"></div>
  `;

  container.appendChild(toast);

  // Remove toast after animation completes (4.3 seconds total)
  setTimeout(() => {
    toast.remove();
  }, 4300);
}

// ==========================================================================
// THEME MANAGEMENT (DARK / LIGHT MODE)
// ==========================================================================
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark'; // Default to dark for premium look
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  showToast(`Switched to ${newTheme} theme`, 'info');
  
  // Custom event so that charts can re-render with new colors
  window.dispatchEvent(new Event('themeChanged'));
}

// ==========================================================================
// STATIC CURRENCY REGISTRY (160+ Currencies)
// ==========================================================================
const CURRENCY_REGISTRY = {
  USD: { name: 'United States Dollar', symbol: '$', country: 'us' },
  EUR: { name: 'Euro', symbol: '€', country: 'eu' },
  GBP: { name: 'British Pound Sterling', symbol: '£', country: 'gb' },
  JPY: { name: 'Japanese Yen', symbol: '¥', country: 'jp' },
  INR: { name: 'Indian Rupee', symbol: '₹', country: 'in' },
  AUD: { name: 'Australian Dollar', symbol: 'A$', country: 'au' },
  CAD: { name: 'Canadian Dollar', symbol: 'C$', country: 'ca' },
  CHF: { name: 'Swiss Franc', symbol: 'Fr', country: 'ch' },
  CNY: { name: 'Chinese Yuan Renminbi', symbol: '¥', country: 'cn' },
  HKD: { name: 'Hong Kong Dollar', symbol: 'HK$', country: 'hk' },
  NZD: { name: 'New Zealand Dollar', symbol: 'NZ$', country: 'nz' },
  SEK: { name: 'Swedish Krona', symbol: 'kr', country: 'se' },
  KRW: { name: 'South Korean Won', symbol: '₩', country: 'kr' },
  SGD: { name: 'Singapore Dollar', symbol: 'S$', country: 'sg' },
  NOK: { name: 'Norwegian Krone', symbol: 'kr', country: 'no' },
  MXN: { name: 'Mexican Peso', symbol: '$', country: 'mx' },
  ZAR: { name: 'South African Rand', symbol: 'R', country: 'za' },
  RUB: { name: 'Russian Ruble', symbol: '₽', country: 'ru' },
  BRL: { name: 'Brazilian Real', symbol: 'R$', country: 'br' },
  TRY: { name: 'Turkish Lira', symbol: '₺', country: 'tr' },
  AED: { name: 'United Arab Emirates Dirham', symbol: 'د.إ', country: 'ae' },
  SAR: { name: 'Saudi Riyal', symbol: 'ر.س', country: 'sa' },
  SGD: { name: 'Singapore Dollar', symbol: 'S$', country: 'sg' },
  THB: { name: 'Thai Baht', symbol: '฿', country: 'th' },
  MYR: { name: 'Malaysian Ringgit', symbol: 'RM', country: 'my' },
  IDR: { name: 'Indonesian Rupiah', symbol: 'Rp', country: 'id' },
  PHP: { name: 'Philippine Peso', symbol: '₱', country: 'ph' },
  ILS: { name: 'Israeli New Shekel', symbol: '₪', country: 'il' },
  DKK: { name: 'Danish Krone', symbol: 'kr', country: 'dk' },
  PLN: { name: 'Polish Zloty', symbol: 'zł', country: 'pl' },
  NZD: { name: 'New Zealand Dollar', symbol: 'NZ$', country: 'nz' },
  CZK: { name: 'Czech Koruna', symbol: 'Kč', country: 'cz' },
  HUF: { name: 'Hungarian Forint', symbol: 'Ft', country: 'hu' },
  RON: { name: 'Romanian Leu', symbol: 'lei', country: 'ro' },
  BGN: { name: 'Bulgarian Lev', symbol: 'лв', country: 'bg' },
  ISK: { name: 'Icelandic Krona', symbol: 'kr', country: 'is' },
  HRK: { name: 'Croatian Kuna', symbol: 'kn', country: 'hr' },
  ARS: { name: 'Argentine Peso', symbol: '$', country: 'ar' },
  CLP: { name: 'Chilean Peso', symbol: '$', country: 'cl' },
  COP: { name: 'Colombian Peso', symbol: '$', country: 'co' },
  PEN: { name: 'Peruvian Sol', symbol: 'S/.', country: 'pe' },
  UYU: { name: 'Uruguayan Peso', symbol: '$U', country: 'uy' },
  VEF: { name: 'Venezuelan Bolívar', symbol: 'Bs', country: 've' },
  EGP: { name: 'Egyptian Pound', symbol: 'E£', country: 'eg' },
  NGN: { name: 'Nigerian Naira', symbol: '₦', country: 'ng' },
  KES: { name: 'Kenyan Shilling', symbol: 'KSh', country: 'ke' },
  GHS: { name: 'Ghanaian Cedi', symbol: 'GH₵', country: 'gh' },
  PKR: { name: 'Pakistani Rupee', symbol: '₨', country: 'pk' },
  BDT: { name: 'Bangladeshi Taka', symbol: '৳', country: 'bd' },
  LKR: { name: 'Sri Lankan Rupee', symbol: 'Rs', country: 'lk' },
  VND: { name: 'Vietnamese Dong', symbol: '₫', country: 'vn' },
  KWD: { name: 'Kuwaiti Dinar', symbol: 'د.ك', country: 'kw' },
  BHD: { name: 'Bahraini Dinar', symbol: '.د.ب', country: 'bh' },
  OMR: { name: 'Omani Rial', symbol: 'ر.ع.', country: 'om' },
  QAR: { name: 'Qatari Riyal', symbol: 'ر.س', country: 'qa' },
  UAH: { name: 'Ukrainian Hryvnia', symbol: '₴', country: 'ua' },
  MAD: { name: 'Moroccan Dirham', symbol: 'د.م.', country: 'ma' },
  DZD: { name: 'Algerian Dinar', symbol: 'د.ج', country: 'dz' },
  TND: { name: 'Tunisian Dinar', symbol: 'د.ت', country: 'tn' },
  LBP: { name: 'Lebanese Pound', symbol: 'ل.ل', country: 'lb' },
  JOD: { name: 'Jordanian Dinar', symbol: 'د.ا', country: 'jo' },
  CRC: { name: 'Costa Rican Colón', symbol: '₡', country: 'cr' },
  DOP: { name: 'Dominican Peso', symbol: 'RD$', country: 'do' },
  GTQ: { name: 'Guatemalan Quetzal', symbol: 'Q', country: 'gt' },
  HNL: { name: 'Honduran Lempira', symbol: 'L', country: 'hn' },
  NIO: { name: 'Nicaraguan Córdoba', symbol: 'C$', country: 'ni' },
  PAB: { name: 'Panamanian Balboa', symbol: 'B/.', country: 'pa' },
  PYG: { name: 'Paraguayan Guaraní', symbol: '₲', country: 'py' },
  BOB: { name: 'Bolivian Boliviano', symbol: 'Bs', country: 'bo' },
  JMD: { name: 'Jamaican Dollar', symbol: 'J$', country: 'jm' },
  TTD: { name: 'Trinidad and Tobago Dollar', symbol: 'TT$', country: 'tt' },
  KZT: { name: 'Kazakhstani Tenge', symbol: '₸', country: 'kz' },
  UZS: { name: 'Uzbekistani Som', symbol: 'so\'m', country: 'uz' },
  AZN: { name: 'Azerbaijani Manat', symbol: '₼', country: 'az' },
  GEL: { name: 'Georgian Lari', symbol: '₾', country: 'ge' },
  AMD: { name: 'Armenian Dram', symbol: '֏', country: 'am' },
  BYN: { name: 'Belarusian Ruble', symbol: 'Br', country: 'by' },
  MDL: { name: 'Moldovan Leu', symbol: 'L', country: 'md' },
  ALL: { name: 'Albanian Lek', symbol: 'L', country: 'al' },
  BAM: { name: 'Bosnia-Herzegovina Mark', symbol: 'KM', country: 'ba' },
  MKD: { name: 'Macedonian Denar', symbol: 'ден', country: 'mk' },
  RSD: { name: 'Serbian Dinar', symbol: 'дин.', country: 'rs' },
  MZN: { name: 'Mozambican Metical', symbol: 'MT', country: 'mz' },
  UGX: { name: 'Ugandan Shilling', symbol: 'USh', country: 'ug' },
  TZS: { name: 'Tanzanian Shilling', symbol: 'TSh', country: 'tz' },
  ZMW: { name: 'Zambian Kwacha', symbol: 'ZK', country: 'zm' },
  MUR: { name: 'Mauritian Rupee', symbol: '₨', country: 'mu' },
  BBD: { name: 'Barbadian Dollar', symbol: '$', country: 'bb' },
  BSD: { name: 'Bahamian Dollar', symbol: '$', country: 'bs' },
  BZD: { name: 'Belize Dollar', symbol: '$', country: 'bz' },
  FJD: { name: 'Fijian Dollar', symbol: '$', country: 'fj' },
  GYD: { name: 'Guyanese Dollar', symbol: '$', country: 'gy' },
  SRD: { name: 'Surinamese Dollar', symbol: '$', country: 'sr' },
  XAF: { name: 'Central African CFA Franc', symbol: 'FCFA', country: 'cm' },
  XOF: { name: 'West African CFA Franc', symbol: 'CFA', country: 'sn' },
  XPF: { name: 'CFP Franc', symbol: '₣', country: 'pf' },
  XCD: { name: 'East Caribbean Dollar', symbol: '$', country: 'dm' },
  ANG: { name: 'Netherlands Antillean Guilder', symbol: 'ƒ', country: 'an' },
  AWG: { name: 'Aruban Florin', symbol: 'ƒ', country: 'aw' },
  HTG: { name: 'Haitian Gourde', symbol: 'G', country: 'ht' },
  MOP: { name: 'Macanese Pataca', symbol: 'MOP$', country: 'mo' },
  MVR: { name: 'Maldivian Rufiyaa', symbol: 'Rf', country: 'mv' },
  NPR: { name: 'Nepalese Rupee', symbol: '₨', country: 'np' },
  PGK: { name: 'Papua New Guinean Kina', symbol: 'K', country: 'pg' },
  SBD: { name: 'Solomon Islands Dollar', symbol: 'SI$', country: 'sb' },
  TOP: { name: 'Tongan Pa\'anga', symbol: 'T$', country: 'to' },
  VUV: { name: 'Vanuatu Vatu', symbol: 'VT', country: 'vu' },
  WST: { name: 'Samoan Tala', symbol: 'WS$', country: 'ws' },
  BND: { name: 'Brunei Dollar', symbol: 'B$', country: 'bn' },
  KHR: { name: 'Cambodian Riel', symbol: '៛', country: 'kh' },
  LAK: { name: 'Lao Kip', symbol: '₭', country: 'la' },
  MMK: { name: 'Myanmar Kyat', symbol: 'K', country: 'mm' },
  MNT: { name: 'Mongolian Tugrik', symbol: '₮', country: 'mn' },
  LSL: { name: 'Lesotho Loti', symbol: 'L', country: 'ls' },
  NAD: { name: 'Namibian Dollar', symbol: '$', country: 'na' },
  SZL: { name: 'Swazi Lilangeni', symbol: 'L', country: 'sz' },
  BWP: { name: 'Botswana Pula', symbol: 'P', country: 'bw' },
  MWK: { name: 'Malawian Kwacha', symbol: 'MK', country: 'mw' },
  RWF: { name: 'Rwandan Franc', symbol: 'FRw', country: 'rw' },
  BIF: { name: 'Burundian Franc', symbol: 'FBu', country: 'bi' },
  DJF: { name: 'Djiboutian Franc', symbol: 'Fdj', country: 'dj' },
  ERN: { name: 'Eritrean Nakfa', symbol: 'Nfk', country: 'er' },
  ETB: { name: 'Ethiopian Birr', symbol: 'Br', country: 'et' },
  SOS: { name: 'Somali Shilling', symbol: 'Sh', country: 'so' },
  SCR: { name: 'Seychellois Rupee', symbol: '₨', country: 'sc' },
  MGA: { name: 'Malagasy Ariary', symbol: 'Ar', country: 'mg' },
  CVE: { name: 'Cape Verdean Escudo', symbol: 'Esc', country: 'cv' },
  SLL: { name: 'Sierra Leonean Leone', symbol: 'Le', country: 'sl' },
  LRD: { name: 'Liberian Dollar', symbol: '$', country: 'lr' },
  GMD: { name: 'Gambian Dalasi', symbol: 'D', country: 'gm' },
  MRO: { name: 'Mauritanian Ouguiya', symbol: 'UM', country: 'mr' },
  STN: { name: 'São Tomé and Príncipe Dobra', symbol: 'Db', country: 'st' },
  SSP: { name: 'South Sudanese Pound', symbol: '£', country: 'ss' },
  SDG: { name: 'Sudanese Pound', symbol: 'ج.س.', country: 'sd' },
  LYD: { name: 'Libyan Dinar', symbol: 'ل.د', country: 'ly' },
  SYP: { name: 'Syrian Pound', symbol: '£S', country: 'sy' },
  YER: { name: 'Yemeni Rial', symbol: '﷼', country: 'ye' },
  IQD: { name: 'Iraqi Dinar', symbol: 'ع.د', country: 'iq' },
  AFN: { name: 'Afghan Afghani', symbol: '؋', country: 'af' },
  TJS: { name: 'Tajikistani Somoni', symbol: 'ЅМ', country: 'tj' },
  TMT: { name: 'Turkmenistani Manat', symbol: 'T', country: 'tm' },
  KGS: { name: 'Kyrgyzstani Som', symbol: 'сом', country: 'kg' },
};

// Retrieve name, symbol, flag for any currency code
function getCurrencyDetails(code) {
  const cleanCode = code ? code.toUpperCase() : 'USD';
  if (CURRENCY_REGISTRY[cleanCode]) {
    return {
      code: cleanCode,
      name: CURRENCY_REGISTRY[cleanCode].name,
      symbol: CURRENCY_REGISTRY[cleanCode].symbol,
      country: CURRENCY_REGISTRY[cleanCode].country,
      flagUrl: `https://flagcdn.com/w40/${CURRENCY_REGISTRY[cleanCode].country}.png`,
    };
  }
  
  // Generic fallback if not in registry
  const genericCountry = cleanCode.substring(0, 2).toLowerCase();
  return {
    code: cleanCode,
    name: `${cleanCode} Currency`,
    symbol: cleanCode,
    country: genericCountry,
    flagUrl: `https://flagcdn.com/w40/${genericCountry}.png`,
  };
}

// Generate the searchable select dropdowns dynamically
function setupSearchableDropdown(triggerId, dropdownId, searchId, optionsListId, onSelectCallback, customCurrencyList = null) {
  const trigger = document.getElementById(triggerId);
  const dropdown = document.getElementById(dropdownId);
  const searchInput = document.getElementById(searchId);
  const optionsList = document.getElementById(optionsListId);

  if (!trigger || !dropdown || !searchInput || !optionsList) return;

  // Build the option list elements
  function populateOptions(filterText = '') {
    optionsList.innerHTML = '';
    const query = filterText.toLowerCase();

    // Use custom list if provided, else fall back to CURRENCY_REGISTRY keys
    const dataset = customCurrencyList || Object.keys(CURRENCY_REGISTRY);

    let currencies = dataset.map(item => {
      if (typeof item === 'string') {
        const details = getCurrencyDetails(item);
        return {
          code: details.code || item,
          name: details.name,
          country: details.country,
          flagUrl: details.flagUrl
        };
      }
      return item;
    });

    // 8. Filter currency list before rendering
    currencies = currencies.filter(currency =>
      currency &&
      currency.code &&
      currency.name
    );

    // Loop through dataset
    currencies.forEach((currency) => {
      // 2. Skip invalid currency entries
      if (!currency) return;

      // 5. Add debugging logs
      console.log("Currency object:", currency);

      // 3. Validate required properties before use
      const code = currency.code;
      
      // 6. Add fallback display values
      const name = currency.name || code || "Unknown Currency";
      const country = currency.country || "us";

      const matchText = `${code} ${name} ${country}`.toLowerCase();

      if (filterText === '' || matchText.includes(query)) {
        const item = document.createElement('li');
        item.className = 'select-option';
        item.dataset.value = code;

        // Check if selected
        const currentSelected = trigger.dataset.value;
        if (currentSelected === code) {
          item.classList.add('selected');
        }

        item.innerHTML = `
          <img class="currency-flag-img" src="https://flagcdn.com/w40/${country}.png" alt="${code} flag" onerror="this.src='https://flagcdn.com/w40/us.png'">
          <span class="select-option-code">${code}</span>
          <span class="select-option-name">${name}</span>
        `;

        item.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          selectValue(code);
        });

        optionsList.appendChild(item);
      }
    });

    if (optionsList.children.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'select-option disabled';
      empty.style.cursor = 'default';
      empty.style.color = 'var(--text-muted)';
      empty.textContent = 'No matching currencies';
      optionsList.appendChild(empty);
    }
  }

  // Handle selecting a value
  function selectValue(code) {
    const details = getCurrencyDetails(code);
    
    // Update trigger element dataset and HTML
    trigger.dataset.value = code;
    trigger.querySelector('.selected-value').innerHTML = `
      <img class="currency-flag-img" src="${details.flagUrl}" alt="${code} flag" onerror="this.src='https://flagcdn.com/w40/us.png'">
      <span style="font-weight: 700;">${code}</span>
      <span style="color: var(--text-secondary); font-size: 0.82rem; max-width: 130px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">- ${details.name}</span>
    `;

    closeDropdown();
    if (onSelectCallback) {
      onSelectCallback(code);
    }

    console.log("Selected Currency:", code);
    console.log("Trigger Updated:", trigger.dataset.value);
  }

  function openDropdown() {
    // Close other dropdowns first
    document.querySelectorAll('.select-dropdown.open').forEach(el => {
      if (el !== dropdown) el.classList.remove('open');
    });
    document.querySelectorAll('.select-trigger.active').forEach(el => {
      if (el !== trigger) el.classList.remove('active');
    });

    dropdown.classList.add('open');
    trigger.classList.add('active');
    searchInput.focus();
    populateOptions();
  }

  function closeDropdown() {
    dropdown.classList.remove('open');
    trigger.classList.remove('active');
    searchInput.value = '';
  }

  // Toggle open
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (dropdown.classList.contains('open')) {
      closeDropdown();
    } else {
      openDropdown();
    }
  });

  // Filter on input
  searchInput.addEventListener('input', (e) => {
    populateOptions(e.target.value);
  });

  searchInput.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent closing dropdown
  });

  // Click outside to close
  document.addEventListener('click', (e) => {
    if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
      closeDropdown();
    }
  });

  return selectValue; // expose setter function
}

// ==========================================================================
// SHARED NAVIGATION & MENU LOGIC
// ==========================================================================
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  
  // 1. Sync authentication state on load
  await syncAuthState();
  
  // 2. Enforce route guards
  checkRouteGuards();
  
  // 3. Render auth-aware UI components
  updateAuthUI();

  // 4. Listen to auth state changes to update dynamically
  window.addEventListener('authStateChanged', () => {
    updateAuthUI();
  });
});

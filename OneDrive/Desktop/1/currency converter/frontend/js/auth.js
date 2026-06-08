document.addEventListener('DOMContentLoaded', async () => {
  // Wait for authentication state synchronization and enforce route guards
  await syncAuthState();
  checkRouteGuards();

  // Handle Login Form Submission
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      // Basic validation
      if (!email || !password) {
        showToast('Please enter all fields', 'warning');
        return;
      }

      setLoading(true);

      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify({
            _id: data._id,
            username: data.username,
            email: data.email,
          }));

          // Notify UI components of the login state change
          window.dispatchEvent(new Event('authStateChanged'));

          showToast(`Welcome back, ${data.username}!`, 'success');
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1000);
        } else {
          showToast(data.message || 'Login failed. Check details.', 'danger');
        }
      } catch (err) {
        console.error('Login Error:', err);
        showToast('Server connection failed. Try again.', 'danger');
      } finally {
        setLoading(false);
      }
    });
  }

  // Handle Registration Form Submission
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = document.getElementById('username').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      // Validation
      if (!username || !email || !password || !confirmPassword) {
        showToast('Please enter all fields', 'warning');
        return;
      }

      if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'warning');
        return;
      }

      if (password !== confirmPassword) {
        showToast('Passwords do not match', 'warning');
        return;
      }

      setLoading(true);

      try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify({
            _id: data._id,
            username: data.username,
            email: data.email,
          }));

          // Notify UI components of the registration state change
          window.dispatchEvent(new Event('authStateChanged'));

          showToast('Registration successful!', 'success');
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1000);
        } else {
          showToast(data.message || 'Registration failed.', 'danger');
        }
      } catch (err) {
        console.error('Registration Error:', err);
        showToast('Server connection failed. Try again.', 'danger');
      } finally {
        setLoading(false);
      }
    });
  }
});

// Helper to show/hide loading states on forms
function setLoading(isLoading) {
  const btn = document.querySelector('button[type="submit"]');
  if (!btn) return;

  if (isLoading) {
    btn.disabled = true;
    btn.dataset.originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner"></span> Loading...';
  } else {
    btn.disabled = false;
    btn.innerHTML = btn.dataset.originalText || btn.innerHTML;
  }
}

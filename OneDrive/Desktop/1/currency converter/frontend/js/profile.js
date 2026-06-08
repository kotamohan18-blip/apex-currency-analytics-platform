document.addEventListener('DOMContentLoaded', async () => {
  // Wait for authentication state synchronization
  await syncAuthState();

  // Guard route
  if (!isLoggedIn()) {
    return;
  }

  // Populate profile info initially
  loadProfileData();

  // Handle Profile Form Submission (Username & Email)
  const profileForm = document.getElementById('profile-details-form');
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = document.getElementById('profile-username').value.trim();
      const email = document.getElementById('profile-email').value.trim();

      if (!username || !email) {
        showToast('Please enter username and email', 'warning');
        return;
      }

      setProfileLoading('details-submit-btn', true);

      try {
        const response = await authFetch('/auth/profile', {
          method: 'PUT',
          body: JSON.stringify({ username, email }),
        });

        const data = await response.json();

        if (response.ok) {
          // Update local details
          localStorage.setItem('user', JSON.stringify({
            _id: data._id,
            username: data.username,
            email: data.email,
          }));

          showToast('Profile details updated successfully!', 'success');
          loadProfileData();
        } else {
          showToast(data.message || 'Failed to update profile details', 'danger');
        }
      } catch (err) {
        console.error(err);
        showToast('Server connection failed.', 'danger');
      } finally {
        setProfileLoading('details-submit-btn', false);
      }
    });
  }

  // Handle Security Form Submission (Password Change)
  const securityForm = document.getElementById('profile-security-form');
  if (securityForm) {
    securityForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const password = document.getElementById('profile-password').value;
      const confirmPassword = document.getElementById('profile-confirm-password').value;

      if (!password || !confirmPassword) {
        showToast('Please enter password and confirmation', 'warning');
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

      setProfileLoading('security-submit-btn', true);

      try {
        const response = await authFetch('/auth/profile', {
          method: 'PUT',
          body: JSON.stringify({ password }),
        });

        const data = await response.json();

        if (response.ok) {
          showToast('Password updated successfully!', 'success');
          securityForm.reset();
        } else {
          showToast(data.message || 'Failed to update password', 'danger');
        }
      } catch (err) {
        console.error(err);
        showToast('Server connection failed.', 'danger');
      } finally {
        setProfileLoading('security-submit-btn', false);
      }
    });
  }
});

// Load and populate profile fields
async function loadProfileData() {
  try {
    const response = await authFetch('/auth/me');
    const data = await response.json();

    if (response.ok) {
      // Set values in forms
      const usernameInput = document.getElementById('profile-username');
      const emailInput = document.getElementById('profile-email');
      const sideName = document.getElementById('summary-card-name');
      const sideEmail = document.getElementById('summary-card-email');
      const avatarName = document.getElementById('summary-avatar-initials');
      const createdDate = document.getElementById('summary-created-date');

      if (usernameInput) usernameInput.value = data.username;
      if (emailInput) emailInput.value = data.email;
      if (sideName) sideName.textContent = data.username;
      if (sideEmail) sideEmail.textContent = data.email;

      if (avatarName) {
        avatarName.textContent = data.username.substring(0, 2).toUpperCase();
      }

      if (createdDate) {
        const date = new Date(data.createdAt).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        createdDate.textContent = `Member since ${date}`;
      }
    }
  } catch (err) {
    console.error('Me query error:', err);
  }
}

// Loader helper for profile buttons
function setProfileLoading(btnId, isLoading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;

  if (isLoading) {
    btn.disabled = true;
    btn.dataset.originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner"></span> Saving...';
  } else {
    btn.disabled = false;
    btn.innerHTML = btn.dataset.originalText || btn.innerHTML;
  }
}

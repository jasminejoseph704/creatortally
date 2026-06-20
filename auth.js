// ============================================
// DATABASE INTEGRATION
// ============================================
async function initDatabase() {
  // Check if we have env vars (set via Netlify or .env)
  const isPlaceholder = SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_URL === '';

  if (!isPlaceholder && typeof SUPABASE_URL !== 'undefined') {
    try {
      const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
      supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      // Check for existing session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        if (!user || user.user_metadata?.tier !== 'pro') {
          user = session.user;
        }

        // Check for successful Stripe checkout redirect
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('success') === 'true') {
          // Refresh session to get updated metadata
          const { data: { session: refreshedSession } } = await supabase.auth.getSession();
          if (refreshedSession) {
            if (!user || user.user_metadata?.tier !== 'pro') {
              user = refreshedSession.user;
              showToast('🎉 Welcome to Pro! Your subscription is active.', 'success');
            }
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }

        await loadFromSupabase();
        showDashboard();
        return true;
      }
    } catch (e) {
      console.log('Supabase connection failed, falling back to localStorage', e);
    }
  } else {
    console.log('Supabase credentials not configured, running in local-only mode');
  }
  return false;
}

async function loadFromSupabase() {
  if (!supabase || !user) return;

  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (!error && data) {
    entries = data;
  }

  // Load rules from user metadata
  if (user.user_metadata?.rules) {
    rules = user.user_metadata.rules;
  }
  if (user.user_metadata?.full_name) {
    user.full_name = user.user_metadata.full_name;
  }
}

async function saveToSupabase(entry) {
  if (!supabase || !user) return { error: 'Not connected to Supabase' };

  const { data, error } = await supabase
    .from('entries')
    .insert([{ ...entry, user_id: user.id }])
    .select()
    .single();

  return { data, error };
}

async function deleteFromSupabase(id) {
  if (!supabase || !user) return { error: 'Not connected to Supabase' };

  return await supabase
    .from('entries')
    .delete()
    .eq('id', id);
}

// ============================================
// AUTHENTICATION
// ============================================
function handleSignupFromHero(e) {
  e.preventDefault();
  const email = document.getElementById('landingEmail').value;
  if (!email) return;

  // Pre-fill signup modal
  document.getElementById('signupEmail').value = email;
  showSignupModal();
}

async function handleSignup(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  if (!name || !email || !password) {
    showToast('Please fill in all fields', 'error');
    return;
  }

  if (supabase) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          tier: 'free'
        }
      }
    });

    if (error) {
      showToast('Signup failed: ' + error.message, 'error');
      return;
    }

    user = data.user;
  } else {
    user = {
      email,
      full_name: name,
      tier: 'free',
      createdAt: Date.now()
    };
    saveData();
  }

  showToast('Account created! Welcome to Creator Tally.', 'success');
  closeSignupModal();
  showDashboard();
}

async function handleLogin() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      showToast('Login failed: ' + error.message, 'error');
      return;
    }

    user = data.user;
    await loadFromSupabase();
    closeLoginModal();
    showDashboard();
    showToast('Welcome back!', 'success');
  } else {
    showToast('Login requires Supabase setup. Using local mode.', 'info');
    closeLoginModal();
  }
}

async function handleSignOut() {
  if (supabase) {
    await supabase.auth.signOut();
  }

  user = null;
  entries = [];
  localStorage.removeItem('creatortally_user');
  document.getElementById('landingPage').classList.remove('hidden');
  document.getElementById('dashboardPage').classList.remove('active');
  showToast('Signed out successfully', 'info');
}

async function handleForgotPassword() {
  const email = document.getElementById('forgotEmail').value;
  if (!email) {
    showToast('Please enter your email', 'error');
    return;
  }

  if (supabase) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      showToast('Error sending reset link: ' + error.message, 'error');
      return;
    }
    showToast('Reset link sent! Check your email.', 'success');
    closeForgotPasswordModal();
  } else {
    showToast('Password reset requires Supabase setup.', 'error');
  }
}

// ... existing code ...
async function handleResetPassword() {
  const newPassword = document.getElementById('resetPassword').value;
  const confirmPassword = document.getElementById('resetPasswordConfirm').value;

  if (newPassword !== confirmPassword) {
    showToast('Passwords do not match', 'error');
    return;
  }

  if (supabase) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      showToast('Error updating password: ' + error.message, 'error');
      return;
    }
    showToast('Password updated successfully!', 'success');
    closeResetPasswordModal();
    showDashboard();
  } else {
    showToast('Password reset requires Supabase setup.', 'error');
  }
}

async function handleUpgrade() {
  if (!user) {
    showToast('Please sign in to upgrade', 'info');
    openUpgradeModal();
    return;
  }

  showToast('Redirecting to secure checkout...', 'info');
  try {
    const response = await fetch('/.netlify/functions/create-checkout', {
      method: 'POST',
      body: JSON.stringify({ email: user.email }),
    });
    const { sessionId } = await response.json();
    const stripe = await import('https://js.stripe.com/v3/');
    const stripeInstance = await stripe.loadStripe(STRIPE_PUBLISHABLE_KEY);
    await stripeInstance.redirectToCheckout({ sessionId });
  } catch (error) {
    console.error('Upgrade failed:', error);
    showToast('Upgrade failed. Please try again.', 'error');
  }
}


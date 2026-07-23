import { supabase } from './supabase-client.js';

const LOGIN_URL = './login.html';

function goToLogin() {
  window.location.replace(LOGIN_URL);
}

async function validateSession() {
  try {
    const {
      data: { session },
      error
    } = await supabase.auth.getSession();

    if (error || !session) goToLogin();
  } catch (error) {
    console.error('Error al validar la sesión:', error);
    goToLogin();
  }
}

function createLogoutButton() {
  const existingButton = document.getElementById('logoutButton');
  if (existingButton) return existingButton;

  const button = document.createElement('button');
  button.id = 'logoutButton';
  button.type = 'button';
  button.textContent = 'Cerrar sesión';
  button.className = 'btn secondary logout-button';

  Object.assign(button.style, {
    position: 'fixed',
    right: '16px',
    bottom: '16px',
    zIndex: '9999',
    boxShadow: '0 4px 12px rgba(0,0,0,.15)'
  });

  document.body.appendChild(button);
  return button;
}

async function logout(button) {
  try {
    button.disabled = true;
    button.textContent = 'Cerrando sesión...';
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    goToLogin();
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    button.disabled = false;
    button.textContent = 'Cerrar sesión';
    alert('No fue posible cerrar la sesión.');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await validateSession();
  const logoutButton = createLogoutButton();
  logoutButton.addEventListener('click', async (event) => {
    event.preventDefault();
    event.stopPropagation();
    await logout(logoutButton);
  });
});

supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') goToLogin();
});

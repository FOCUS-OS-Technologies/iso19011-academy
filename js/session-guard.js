import { supabase } from "./supabase-client.js";

const LOGIN_URL = "./login.html";

function goToLogin() {
  window.location.replace(LOGIN_URL);
}

async function validateSession() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Error al consultar la sesión:", error);
      goToLogin();
      return;
    }

    if (!session) {
      goToLogin();
    }
  } catch (error) {
    console.error("Error inesperado al validar la sesión:", error);
    goToLogin();
  }
}

async function logout() {
  const logoutButton = document.getElementById("logoutButton");

  try {
    if (logoutButton) {
      logoutButton.disabled = true;
      logoutButton.textContent = "Cerrando sesión...";
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    goToLogin();
  } catch (error) {
    console.error("Error al cerrar sesión:", error);

    if (logoutButton) {
      logoutButton.disabled = false;
      logoutButton.textContent = "Cerrar sesión";
    }

    alert("No fue posible cerrar la sesión.");
  }
}

function bindLogoutButton() {
  const logoutButton = document.getElementById("logoutButton");

  if (!logoutButton) {
    console.error(
      'No se encontró el botón con id="logoutButton".'
    );
    return;
  }

  logoutButton.addEventListener("click", async (event) => {
    event.preventDefault();
    await logout();
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  bindLogoutButton();
  await validateSession();
});

supabase.auth.onAuthStateChange((event) => {
  if (event === "SIGNED_OUT") {
    goToLogin();
  }
});
import { supabase } from "./supabase-client.js";

const LOGIN_URL = "./login.html";

async function redirectToLogin() {
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
      await redirectToLogin();
      return;
    }

    if (!session) {
      await redirectToLogin();
    }
  } catch (error) {
    console.error("Error inesperado al validar la sesión:", error);
    await redirectToLogin();
  }
}

async function closeSession(button) {
  try {
    button.disabled = true;
    button.textContent = "Cerrando sesión...";

    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    localStorage.removeItem("supabase.auth.token");
    sessionStorage.clear();

    await redirectToLogin();
  } catch (error) {
    console.error("Error al cerrar sesión:", error);

    button.disabled = false;
    button.textContent = "Cerrar sesión";

    alert("No fue posible cerrar la sesión. Intenta nuevamente.");
  }
}

function configureLogoutButton() {
  const logoutButton = document.getElementById("logoutButton");

  if (!logoutButton) {
    console.error(
      'No se encontró el botón de cierre de sesión con id="logoutButton".'
    );
    return;
  }

  logoutButton.type = "button";

  logoutButton.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();

    await closeSession(logoutButton);
  });
}

supabase.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_OUT" || !session) {
    redirectToLogin();
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  configureLogoutButton();
  await validateSession();
});
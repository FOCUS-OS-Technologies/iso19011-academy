import { supabase } from "./supabase-client.js";

const LOGIN_PAGE = "./login.html";

async function protectPage() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error("No se pudo validar la sesión:", error);
    window.location.replace(LOGIN_PAGE);
    return;
  }

  if (!session) {
    window.location.replace(LOGIN_PAGE);
  }
}

protectPage();

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("No se pudo cerrar la sesión:", error);
      alert("No fue posible cerrar la sesión.");
      return;
    }

    window.location.replace(LOGIN_PAGE);
  });
}
import { supabase } from "./supabase-client.js";

const loginForm = document.querySelector("#loginForm");
const registerForm = document.querySelector("#registerForm");
const authMessage = document.querySelector("#authMessage");

function showMessage(message, isError = false) {
  authMessage.textContent = message;
  authMessage.style.color = isError ? "#b42318" : "#067647";
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.querySelector("#loginEmail").value.trim();
  const password = document.querySelector("#loginPassword").value;

  showMessage("Iniciando sesión...");

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    showMessage(error.message, true);
    return;
  }

  window.location.href = "index.html";
});

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const fullName = document.querySelector("#registerName").value.trim();
  const email = document.querySelector("#registerEmail").value.trim();
  const password = document.querySelector("#registerPassword").value;

  showMessage("Creando cuenta...");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      },
      emailRedirectTo:
        "https://focus-os-technologies.github.io/iso19011-academy/"
    }
  });

  if (error) {
    showMessage(error.message, true);
    return;
  }

  if (data.session) {
    window.location.href = "index.html";
    return;
  }

  showMessage(
    "Cuenta creada. Revisa tu correo para confirmar el registro."
  );
});

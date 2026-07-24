import { supabase } from "./supabase-client.js";

const INTERNAL_AUTH_DOMAIN = "dym-training.example";
const COURSE_URL = "./index.html";

const loginForm = document.querySelector("#loginForm");
const registerForm = document.querySelector("#registerForm");
const loginPanel = document.querySelector("#loginPanel");
const registerPanel = document.querySelector("#registerPanel");
const showLoginButton = document.querySelector("#showLoginButton");
const showRegisterButton = document.querySelector("#showRegisterButton");
const authMessage = document.querySelector("#authMessage");

function normalizeEmployeeNumber(value) {
  return String(value ?? "").trim().toLowerCase().replace(/\s+/g, "");
}

function validateEmployeeNumber(value) {
  return /^[a-z0-9_-]{2,30}$/.test(value);
}

function employeeNumberToInternalEmail(employeeNumber) {
  return `employee.${employeeNumber}@${INTERNAL_AUTH_DOMAIN}`;
}

function setActivePanel(panelName) {
  const loginIsActive = panelName === "login";
  loginPanel.hidden = !loginIsActive;
  registerPanel.hidden = loginIsActive;
  showLoginButton.classList.toggle("is-active", loginIsActive);
  showRegisterButton.classList.toggle("is-active", !loginIsActive);
  showLoginButton.setAttribute("aria-selected", String(loginIsActive));
  showRegisterButton.setAttribute("aria-selected", String(!loginIsActive));
  clearMessage();

  const targetInput = loginIsActive
    ? document.querySelector("#employeeNumberLogin")
    : document.querySelector("#registerName");
  targetInput?.focus();
}

function showMessage(message, type = "info") {
  authMessage.textContent = message;
  authMessage.className = `auth-message is-${type}`;
  authMessage.hidden = false;
}

function clearMessage() {
  authMessage.textContent = "";
  authMessage.className = "auth-message";
  authMessage.hidden = true;
}

function setFormBusy(form, isBusy, busyText) {
  const button = form?.querySelector('button[type="submit"]');
  if (!button) return;

  if (isBusy) {
    button.dataset.originalText = button.textContent;
    button.textContent = busyText;
    button.disabled = true;
    form.setAttribute("aria-busy", "true");
  } else {
    button.textContent = button.dataset.originalText || button.textContent;
    button.disabled = false;
    form.removeAttribute("aria-busy");
  }
}

function getFriendlyAuthError(error, context) {
  const message = String(error?.message ?? "").toLowerCase();

  if (message.includes("already registered") ||
      message.includes("already been registered") ||
      message.includes("user already exists")) {
    return "Ese número de empleado ya está registrado.";
  }

  if (message.includes("invalid login credentials") ||
      message.includes("invalid credentials")) {
    return "Número de empleado o contraseña incorrectos.";
  }

  if (message.includes("email not confirmed")) {
    return "La cuenta todavía no está habilitada. Solicita apoyo al administrador.";
  }

  if (message.includes("rate limit") || message.includes("too many requests")) {
    return "Se realizaron demasiados intentos. Espera unos minutos e inténtalo nuevamente.";
  }

  return context === "register"
    ? "No fue posible crear la cuenta. Inténtalo nuevamente."
    : "No fue posible iniciar sesión. Inténtalo nuevamente.";
}

async function redirectIfAuthenticated() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("No fue posible comprobar la sesión:", error);
    return;
  }
  if (data.session) window.location.replace(COURSE_URL);
}

async function handleLogin(event) {
  event.preventDefault();
  clearMessage();

  const employeeNumber = normalizeEmployeeNumber(
    document.querySelector("#employeeNumberLogin")?.value
  );
  const password = document.querySelector("#loginPassword")?.value ?? "";

  if (!validateEmployeeNumber(employeeNumber)) {
    showMessage("Captura un número de empleado válido.", "error");
    return;
  }

  if (password.length < 8) {
    showMessage("La contraseña debe tener al menos 8 caracteres.", "error");
    return;
  }

  setFormBusy(loginForm, true, "Ingresando...");

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: employeeNumberToInternalEmail(employeeNumber),
      password,
    });

    if (error) throw error;

    showMessage("Acceso correcto. Abriendo el curso...", "success");
    window.location.replace(COURSE_URL);
  } catch (error) {
    console.error("Error de inicio de sesión:", error);
    showMessage(getFriendlyAuthError(error, "login"), "error");
  } finally {
    setFormBusy(loginForm, false, "Ingresando...");
  }
}

async function handleRegister(event) {
  event.preventDefault();
  clearMessage();

  const fullName = document.querySelector("#registerName")?.value.trim() ?? "";
  const employeeNumber = normalizeEmployeeNumber(
    document.querySelector("#employeeNumberRegister")?.value
  );
  const password = document.querySelector("#registerPassword")?.value ?? "";
  const confirmPassword = document.querySelector("#confirmPassword")?.value ?? "";
  const acceptTerms = document.querySelector("#acceptTerms")?.checked ?? false;

  if (fullName.length < 3) {
    showMessage("Captura tu nombre completo.", "error");
    return;
  }

  if (!validateEmployeeNumber(employeeNumber)) {
    showMessage("Captura un número de empleado válido.", "error");
    return;
  }

  if (password.length < 8) {
    showMessage("La contraseña debe tener al menos 8 caracteres.", "error");
    return;
  }

  if (password !== confirmPassword) {
    showMessage("Las contraseñas no coinciden.", "error");
    return;
  }

  if (!acceptTerms) {
    showMessage("Debes confirmar el uso autorizado de la cuenta.", "error");
    return;
  }

  setFormBusy(registerForm, true, "Creando cuenta...");

  try {
    const { data, error } = await supabase.auth.signUp({
      email: employeeNumberToInternalEmail(employeeNumber),
      password,
      options: {
        data: {
          full_name: fullName,
          employee_number: employeeNumber,
          display_name: fullName,
        },
      },
    });

    if (error) throw error;

    if (data.session) {
      showMessage("Cuenta creada correctamente. Abriendo el curso...", "success");
      window.location.replace(COURSE_URL);
      return;
    }

    registerForm.reset();
    document.querySelector("#employeeNumberLogin").value = employeeNumber;
    showMessage("Cuenta creada. Ya puedes iniciar sesión.", "success");

    window.setTimeout(() => setActivePanel("login"), 1200);
  } catch (error) {
    console.error("Error de registro:", error);
    showMessage(getFriendlyAuthError(error, "register"), "error");
  } finally {
    setFormBusy(registerForm, false, "Creando cuenta...");
  }
}

showLoginButton?.addEventListener("click", () => setActivePanel("login"));
showRegisterButton?.addEventListener("click", () => setActivePanel("register"));
loginForm?.addEventListener("submit", handleLogin);
registerForm?.addEventListener("submit", handleRegister);

redirectIfAuthenticated();

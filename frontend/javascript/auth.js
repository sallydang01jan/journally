// frontend/javascript/auth.js
import { auth, provider, signInWithPopup, signOut } from "./firebase.js";
import {
  API_BASE_URL,
  getToken,
  getValidToken,
  setToken,
  removeToken,
  parseJwt,
  showAlert,
  handleApiError,
} from "./utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  const redirectTo = (path) => (window.location.href = path);

  async function clearCaches() {
    if ("caches" in window) {
      const names = await caches.keys();
      for (const name of names) await caches.delete(name);
    }
  }

  function toggleSpinner(show) {
    const spinner = document.querySelector(".spinner");
    if (!spinner) return;
    spinner.style.display = show ? "block" : "none";
  }

  // AUTH GUARD: try to get a valid token (may refresh)
  const token = await getValidToken();
  const currentPath = window.location.pathname;

  if (token) {
    try {
      const payload = parseJwt(token);
      const now = Date.now() / 1000;

      if (payload.exp < now) {
        // expired — clear and redirect to auth
        removeToken();
        await clearCaches();
        if (!currentPath.endsWith("auth.html")) redirectTo("../html/auth.html");
      } else if (currentPath.endsWith("auth.html")) {
        // already logged in, don't stay on auth page
        redirectTo("../html/index.html");
      }
    } catch (err) {
      removeToken();
      await clearCaches();
      if (!currentPath.endsWith("auth.html")) redirectTo("../html/auth.html");
    }
  } else {
    // no token → only allow auth page
    if (!currentPath.endsWith("auth.html")) redirectTo("../html/auth.html");
  }

  // FORM
  const form = document.querySelector(".auth-form");
  const emailInput = document.querySelector("#email-input");
  const passwordInput = document.querySelector("#password-input");
  const googleBtn = document.querySelector(".sign-in-with-google");

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const action = event.submitter?.value || "signin";
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();

      if (!email || !password)
        return showAlert("Vui lòng nhập đầy đủ email và mật khẩu.", "error");

      if (!email.includes("@")) return showAlert("Email không hợp lệ.", "error");

      if (password.length < 6)
        return showAlert("Mật khẩu phải dài ít nhất 6 ký tự.", "error");

      toggleSpinner(true);
      await submitAuth(action, email, password);
      toggleSpinner(false);
    });
  }

  // SUBMIT
  async function submitAuth(action, email, password) {
    const endpoint =
      action === "signup"
        ? `${API_BASE_URL}/auth/register`
        : `${API_BASE_URL}/auth/login`;

    const payload =
      action === "signup"
        ? { username: email.split("@")[0], email, password }
        : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Lỗi đăng nhập/đăng ký");

      if (action === "signup") {
        showAlert("Đăng ký thành công! Hãy đăng nhập để tiếp tục.", "success");
      } else {
        setToken(data.token, data.refreshToken);
        showAlert("Đăng nhập thành công!", "success");

        // small UX delay so toast/alert shows
        setTimeout(() => redirectTo("../html/index.html"), 700);
      }
    } catch (err) {
      handleApiError(err);
    }
  }

  // LOGOUT
  const logoutBtn = document.querySelector(".logout-button");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await signOut(auth); // firebase session cleared
      } catch (err) {
        console.warn("Firebase signOut failed:", err);
      }
      removeToken();
      await clearCaches();
      redirectTo("../html/auth.html");
    });
  }

  // GOOGLE SIGN-IN
  if (googleBtn) {
    googleBtn.addEventListener("click", async () => {
      toggleSpinner(true);
      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const idToken = await user.getIdToken();

        const res = await fetch(`${API_BASE_URL}/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: idToken }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Lỗi đăng nhập Google");

        setToken(data.token, data.refreshToken);
        showAlert("Đăng nhập Google thành công!", "success");
        setTimeout(() => redirectTo("../html/index.html"), 700);
      } catch (err) {
        handleApiError(err);
      } finally {
        toggleSpinner(false);
      }
    });
  }
});

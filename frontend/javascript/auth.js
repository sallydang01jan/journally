// ===================================================
// ✅ BƯỚC 1: IMPORT CÁC MODULE CẦN THIẾT
// ===================================================
import { auth, provider, signInWithPopup, signOut } from "./firebase.js";
import {
  API_BASE_URL,
  getToken,
  setToken,
  removeToken,
  parseJwt,
  showAlert,
  handleApiError,
} from "./utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  // ===================================================
  // 🧩 HÀM PHỤ TRỢ
  // ===================================================
  const redirectTo = (path) => (window.location.href = path);

  // Xoá toàn bộ cache khi logout hoặc token hết hạn
  async function clearCaches() {
    if ("caches" in window) {
      const names = await caches.keys();
      for (const name of names) await caches.delete(name);
    }
  }

  // Hiện / ẩn spinner khi đang xử lý API
  function toggleSpinner(show) {
    const spinner = document.querySelector(".spinner");
    if (!spinner) return;
    spinner.style.display = show ? "block" : "none";
  }

  // ===================================================
  // 🔍 BƯỚC 2: KIỂM TRA JWT (AUTH GUARD)
  // ===================================================
  const token = getToken();
  const currentPath = window.location.pathname;

  if (token) {
    try {
      const payload = parseJwt(token);
      const now = Date.now() / 1000;

      if (payload.exp < now) {
        // Token hết hạn → xoá và về trang auth
        removeToken();
        await clearCaches();
        if (!currentPath.endsWith("auth.html")) redirectTo("../html/auth.html");
      } else if (currentPath.endsWith("auth.html")) {
        // Đã login mà vẫn ở trang auth → về index
        redirectTo("../html/index.html");
      }
    } catch (err) {
      removeToken();
      await clearCaches();
      if (!currentPath.endsWith("auth.html")) redirectTo("../html/auth.html");
    }
  } else {
    // Không có token → chỉ cho phép ở trang auth
    if (!currentPath.endsWith("auth.html")) redirectTo("../html/auth.html");
  }

  // ===================================================
  // 🧾 BƯỚC 3: FORM ĐĂNG KÝ / ĐĂNG NHẬP
  // ===================================================
  const form = document.querySelector(".auth-form");
  const emailInput = document.querySelector("#email-input");
  const passwordInput = document.querySelector("#password-input");
  const googleBtn = document.querySelector(".sign-in-with-google");

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const action = event.submitter?.value || "login";
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();

      // --- Validation cơ bản ---
      if (!email || !password)
        return showAlert("Vui lòng nhập đầy đủ email và mật khẩu.", "error");

      if (!email.includes("@"))
        return showAlert("Email không hợp lệ.", "error");

      if (password.length < 6)
        return showAlert("Mật khẩu phải dài ít nhất 6 ký tự.", "error");

      // --- Submit ---
      toggleSpinner(true);
      await submitAuth(action, email, password);
      toggleSpinner(false);
    });
  }

  // ===================================================
  // 🧠 BƯỚC 4: HÀM XỬ LÝ LOGIN / SIGNUP
  // ===================================================
  const submitAuth = async (action, email, password) => {
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
        setToken(data.token);
        showAlert("Đăng nhập thành công!", "success");

        const payload = parseJwt(getToken());
        console.log("✅ User ID:", payload.userId);

        // Delay nhẹ để alert hiển thị
        setTimeout(() => redirectTo("../html/index.html"), 800);
      }
    } catch (err) {
      handleApiError(err);
    }
  };

  // ===================================================
  // 🚪 BƯỚC 5: LOGOUT
  // ===================================================
  const logoutBtn = document.querySelector(".logout-button");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await signOut(auth); // ✅ Xoá session Firebase luôn
      } catch (err) {
        console.warn("Firebase signOut failed:", err);
      }
      removeToken();
      await clearCaches();
      redirectTo("../html/login.html");
    });
  }

  // ===================================================
  // 🔥 BƯỚC 6: GOOGLE SIGN-IN (FIREBASE)
  // ===================================================
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

        setToken(data.token);
        showAlert("Đăng nhập Google thành công!", "success");

        // Delay nhẹ để UX mượt
        setTimeout(() => redirectTo("../html/index.html"), 800);
      } catch (err) {
        handleApiError(err);
      } finally {
        toggleSpinner(false);
      }
    });
  }
});

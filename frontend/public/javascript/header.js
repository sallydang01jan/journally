// frontend/javascript/header.js
import { auth, signOut } from "../libs/firebase.js";
import { getValidToken, getUserData, removeToken } from "./utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  const headerLoggedIn = document.getElementById("header-logged-in");
  const headerNotLoggedIn = document.getElementById("header-not-logged-in");
  const accountOptions = document.querySelector(".account-options");
  const logoutBtn = document.querySelector(".logout-button");
  const userToggle = document.querySelector(".user-toggle");
  const userNameDisplay = document.querySelector(".user-name");
  const userAvatar = document.querySelector(".user-avatar");

  // Ẩn sẵn header để tránh nhấp nháy UI
  headerLoggedIn.hidden = true;
  headerNotLoggedIn.hidden = true;

  // ✅ (3) Auth Guard: kiểm tra token hợp lệ
  const token = await getValidToken();
  if (!token) {
    removeToken();
    headerNotLoggedIn.hidden = false;
    return (window.location.href = "/html/auth.html");
  }

  // ✅ (4) Hiển thị header & tải thông tin user
  try {
    const user = await getUserData(token);

    headerLoggedIn.hidden = false;
    headerNotLoggedIn.hidden = true;

    userNameDisplay.textContent =
      user.username ||
      user.name ||
      (user.email ? user.email.split("@")[0] : "User");

    userAvatar.src =
      user.avatar && user.avatar.trim() !== ""
        ? user.avatar
        : "/assets/image/default-avatar.png";
  } catch (err) {
    console.warn("Không thể lấy thông tin user:", err);
    removeToken();
    return (window.location.href = "/html/auth.html");
  }

  // 🎛 Toggle menu user (hiệu ứng mượt hơn + aria)
  if (userToggle && accountOptions) {
    userToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = accountOptions.classList.toggle("open");
      accountOptions.hidden = !isOpen;
      userToggle.setAttribute("aria-expanded", isOpen);
    });

    document.addEventListener("click", (e) => {
      if (!userToggle.contains(e.target) && !accountOptions.contains(e.target)) {
        accountOptions.classList.remove("open");
        accountOptions.hidden = true;
        userToggle.setAttribute("aria-expanded", false);
      }
    });
  }

  // 🔥 Logout thực sự: Firebase + token local
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await signOut(auth);
      } catch (err) {
        console.error("Firebase signOut error:", err);
      } finally {
        removeToken();
        window.location.href = "/html/auth.html";
      }
    });
  }

  // 🚀 Ẩn header khi cuộn xuống
  let lastScroll = 0;
  window.addEventListener("scroll", () => {
    const currentScroll = window.scrollY;
    if (headerLoggedIn) {
      headerLoggedIn.classList.toggle(
        "hidden-header",
        currentScroll > lastScroll && currentScroll > 100
      );
    }
    lastScroll = currentScroll;
  });
});

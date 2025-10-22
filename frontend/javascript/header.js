import { isAuthenticated, getUserData, removeToken } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  const headerLoggedIn = document.getElementById("header-logged-in");
  const headerNotLoggedIn = document.getElementById("header-not-logged-in");
  const accountOptions = document.querySelector(".account-options");
  const logoutBtn = document.querySelector(".logout-button");
  const userIcon = document.querySelector(".user-icon");
  const userNameDisplay = document.querySelector(".user-name"); // để hiển thị tên user nếu có
  const userAvatar = document.querySelector(".user-avatar"); // hiển thị avatar nếu có

  // 🧭 Kiểm tra trạng thái đăng nhập
  if (isAuthenticated()) {
    headerLoggedIn.hidden = false;
    headerNotLoggedIn.hidden = true;

    // ✨ Hiển thị thông tin user
    const user = getUserData();
    if (userNameDisplay) userNameDisplay.textContent = user.name || "User";
    if (userAvatar && user.avatar) userAvatar.src = user.avatar;

  } else {
    headerLoggedIn.hidden = true;
    headerNotLoggedIn.hidden = false;
  }

  // 👤 Toggle dropdown menu người dùng
  if (userIcon) {
    userIcon.addEventListener("click", () => {
      accountOptions.hidden = !accountOptions.hidden;
    });

    // Ẩn dropdown khi click ra ngoài
    document.addEventListener("click", (e) => {
      if (!userIcon.contains(e.target) && !accountOptions.contains(e.target)) {
        accountOptions.hidden = true;
      }
    });
  }

  // 🚪 Đăng xuất
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      removeToken();
      window.location.href = "../html/auth.html";
    });
  }

  // ✨ Ẩn hiện header khi cuộn
  let lastScroll = 0;
  window.addEventListener("scroll", () => {
    const currentScroll = window.scrollY;
    if (currentScroll > lastScroll && currentScroll > 100) {
      headerLoggedIn.style.transform = "translateY(-100%)";
    } else {
      headerLoggedIn.style.transform = "translateY(0)";
    }
    lastScroll = currentScroll;
  });
});

// FILE: frontend/javascript/header.js
import { auth, signOut } from "./firebase.js"; // 🔥 import thêm signOut
import { isAuthenticated, getUserData, removeToken } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  const headerLoggedIn = document.getElementById('header-logged-in');
  const headerNotLoggedIn = document.getElementById('header-not-logged-in');
  const accountOptions = document.querySelector('.account-options');
  const logoutBtn = document.querySelector('.logout-button');
  const userToggle = document.querySelector('.user-toggle');
  const userNameDisplay = document.querySelector('.user-name');
  const userAvatar = document.querySelector('.user-avatar');

  // Hiển thị header dựa vào token
  if (isAuthenticated()) {
    headerLoggedIn.hidden = false;
    headerNotLoggedIn.hidden = true;

    try {
      const user = await getUserData();
      userNameDisplay.textContent = user.username || user.name || 'User';
      if (user.avatar) userAvatar.src = user.avatar;
    } catch (err) {
      console.warn('Không thể lấy user trong header:', err);
    }
  } else {
    headerLoggedIn.hidden = true;
    headerNotLoggedIn.hidden = false;
  }

  // Toggle menu user
  if (userToggle) {
    userToggle.addEventListener('click', () => {
      accountOptions.hidden = !accountOptions.hidden;
    });

    document.addEventListener('click', (e) => {
      if (!userToggle.contains(e.target) && !accountOptions.contains(e.target)) {
        accountOptions.hidden = true;
      }
    });
  }

  // 🔥 Logout thực sự: Firebase + token local
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await signOut(auth); // sign out khỏi Firebase
      } catch (err) {
        console.error("Firebase signOut error:", err);
      }
      removeToken(); // xóa token localStorage
      window.location.href = '../html/auth.html';
    });
  }

  // Ẩn header khi cuộn xuống
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (headerLoggedIn) {
      headerLoggedIn.style.transform =
        currentScroll > lastScroll && currentScroll > 100
          ? 'translateY(-100%)'
          : 'translateY(0)';
    }
    lastScroll = currentScroll;
  });
});

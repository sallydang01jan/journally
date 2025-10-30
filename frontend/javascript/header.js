
// FILE: frontend/javascript/header.js
import { isAuthenticated, getUserData, removeToken } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  const headerLoggedIn = document.getElementById('header-logged-in');
  const headerNotLoggedIn = document.getElementById('header-not-logged-in');
  const accountOptions = document.querySelector('.account-options');
  const logoutBtn = document.querySelector('.logout-button');
  const userIcon = document.querySelector('.user-icon');
  const userNameDisplay = document.querySelector('.user-name');
  const userAvatar = document.querySelector('.user-avatar');

  if (isAuthenticated()) {
    if (headerLoggedIn) headerLoggedIn.hidden = false;
    if (headerNotLoggedIn) headerNotLoggedIn.hidden = true;

    try {
      const user = await getUserData();
      if (userNameDisplay) userNameDisplay.textContent = user.username || user.name || 'User';
      if (userAvatar && user.avatar) userAvatar.src = user.avatar;
    } catch (err) {
      console.warn('Không thể lấy user trong header:', err);
    }
  } else {
    if (headerLoggedIn) headerLoggedIn.hidden = true;
    if (headerNotLoggedIn) headerNotLoggedIn.hidden = false;
  }

  if (userIcon) {
    userIcon.addEventListener('click', () => {
      if (accountOptions) accountOptions.hidden = !accountOptions.hidden;
    });

    document.addEventListener('click', (e) => {
      if (!userIcon.contains(e.target) && accountOptions && !accountOptions.contains(e.target)) {
        accountOptions.hidden = true;
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      removeToken();
      window.location.href = '../html/auth.html';
    });
  }

  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (headerLoggedIn) {
      if (currentScroll > lastScroll && currentScroll > 100) {
        headerLoggedIn.style.transform = 'translateY(-100%)';
      } else {
        headerLoggedIn.style.transform = 'translateY(0)';
      }
    }
    lastScroll = currentScroll;
  });
});

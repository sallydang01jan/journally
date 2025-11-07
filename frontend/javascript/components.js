// frontend/javascript/components.js
export async function loadComponent(id, path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
    const html = await res.text();
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  } catch (err) {
    console.error(`Lỗi khi tải ${path}:`, err);
  }
}

export async function loadAllComponents() {
  await Promise.all([
    loadComponent('header-container', '../components/header.html'),
    loadComponent('footer-container', '../components/footer.html'),
    loadComponent('post-card', '../components/post-card.html'),
    loadComponent('comment-card', '../components/comment.html'),
    loadComponent('notification-card', '../components/notification-card.html')
  ]);
  console.log("✅ Tất cả component HTML đã được load!");
}

window.addEventListener("DOMContentLoaded", () => {
  loadAllComponents().catch((e) => console.warn('loadAllComponents failed:', e));
});
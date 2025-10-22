// 📁 frontend/javascript/components.js
export async function loadComponent(id, path) {
  try {
    const res = await fetch(path);
    const html = await res.text();
    document.getElementById(id).innerHTML = html;
  } catch (err) {
    console.error(`Lỗi khi tải ${path}:`, err);
  }
}

// Load nhiều component song song
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

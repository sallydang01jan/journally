// frontend/javascript/comments.js
import { apiFetch, getToken, handleApiError, escapeHTML, showAlert, getUserData, formatDate } from "./utils.js";
import { createCommentCard } from "./createComponents.js";

/**
 * Render một comment vào container
 */
async function renderSingleComment(comment, container, prepend = false) {
  if (!container) return;

  const currentUser = await getUserData();
  const commentCard = createCommentCard(comment);

  // Thời gian
  const timeEl = document.createElement("span");
  timeEl.classList.add("comment-time");
  timeEl.textContent = formatDate(comment.createdAt);
  commentCard.appendChild(timeEl);

  // nút xóa nếu comment của current user
  if (currentUser && (comment.userId?._id === currentUser.id || comment.userId === currentUser.id)) {
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("comment-delete-btn");
    deleteBtn.textContent = "🗑️ Xóa";
    deleteBtn.addEventListener("click", () => deleteComment(comment._id, commentCard));
    commentCard.appendChild(deleteBtn);
  }

  commentCard.classList.add("fade-in");

  if (prepend) container.prepend(commentCard);
  else container.appendChild(commentCard);
}

/**
 * Load danh sách bình luận
 */
async function loadComments(postId, container) {
  if (!container) return;
  try {
    const comments = await apiFetch(`/comments/post/${postId}`);
    container.innerHTML = "";
    if (!Array.isArray(comments) || comments.length === 0) {
      container.innerHTML = `<p class="text-muted">Chưa có bình luận nào.</p>`;
      return;
    }
    for (const c of comments) {
      await renderSingleComment(c, container);
    }
  } catch (err) {
    handleApiError(err, "Không thể tải bình luận");
    container.innerHTML = `<p class="text-danger">Lỗi tải bình luận</p>`;
  }
}

/**
 * Add comment
 */
async function addComment(postId, container, text) {
  const token = getToken();
  if (!token) {
    showAlert("Vui lòng đăng nhập để bình luận!", "warning");
    return;
  }
  if (!container) return;

  try {
    const safeText = escapeHTML(text);
    const newComment = await apiFetch(`/comments/${postId}`, {
      method: "POST",
      body: { text: safeText }
    });
    // backend returns comment object
    await renderSingleComment(newComment, container, true);
    showAlert("Bình luận đã được đăng!", "success");
  } catch (err) {
    handleApiError(err);
  }
}

/**
 * Delete comment
 */
async function deleteComment(commentId, commentElement) {
  const token = getToken();
  if (!token) return showAlert("Vui lòng đăng nhập!", "warning");
  if (!confirm("Bạn có chắc muốn xóa bình luận này?")) return;

  try {
    await apiFetch(`/comments/${commentId}`, { method: "DELETE" });
    commentElement.remove();
    showAlert("Đã xóa bình luận!", "success");
  } catch (err) {
    handleApiError(err, "Không thể xóa bình luận");
  }
}

/**
 * Khởi tạo comment cho một post (hoặc nhiều post)
 */
function initComments(postId, container, form, textarea) {
  if (!postId || !container) return;
  loadComments(postId, container);

  if (form && textarea) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = textarea.value.trim();
      if (!text) return showAlert("Vui lòng nhập nội dung bình luận!", "warning");
      addComment(postId, container, text);
      textarea.value = "";
    });
  }
}

export { renderSingleComment, loadComments, addComment, deleteComment, initComments };

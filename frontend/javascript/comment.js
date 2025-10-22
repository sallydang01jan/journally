// comments.js
import { API_BASE_URL, fetchData, getToken, handleApiError, escapeHTML, showAlert, getUserData, formatDate } from "./utils.js";
import { createCommentCard } from "../components/createComponents.js";

/**
 * Render một comment vào container
 * Thêm nút xóa nếu comment thuộc về user hiện tại
 */
function renderSingleComment(comment, container, prepend = false) {
  if (!container) return;

  const currentUser = getUserData();
  const commentCard = createCommentCard(comment);

  // Thêm thời gian comment
  const timeEl = document.createElement("span");
  timeEl.classList.add("comment-time");
  timeEl.textContent = formatDate(comment.createdAt);
  commentCard.appendChild(timeEl);

  // Thêm nút xóa nếu comment của user hiện tại
  if (currentUser && comment.userId._id === currentUser.id) {
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
 * Load danh sách bình luận từ API và render
 */
async function loadComments(postId, container) {
  if (!container) return;
  try {
    const comments = await fetchData(`${API_BASE_URL}/comments/post/${postId}`, "GET");
    container.innerHTML = "";
    if (!Array.isArray(comments) || comments.length === 0) {
      container.innerHTML = `<p class="text-muted">Chưa có bình luận nào.</p>`;
      return;
    }
    comments.forEach(c => renderSingleComment(c, container));
  } catch (err) {
    handleApiError(err, "Không thể tải bình luận");
    container.innerHTML = `<p class="text-danger">Lỗi tải bình luận</p>`;
  }
}

/**
 * Thêm bình luận mới
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
    const newComment = await fetchData(`${API_BASE_URL}/comments/${postId}`, "POST", { text: safeText }, token);
    renderSingleComment(newComment, container, true);
    showAlert("Bình luận đã được đăng!", "success");
  } catch (err) {
    handleApiError(err);
  }
}

/**
 * Xóa comment
 */
async function deleteComment(commentId, commentElement) {
  const token = getToken();
  if (!token) return showAlert("Vui lòng đăng nhập!", "warning");
  if (!confirm("Bạn có chắc muốn xóa bình luận này?")) return;

  try {
    await fetchData(`${API_BASE_URL}/comments/${commentId}`, "DELETE", null, token);
    commentElement.remove();
    showAlert("Đã xóa bình luận!", "success");
  } catch (err) {
    handleApiError(err, "Không thể xóa bình luận");
  }
}

/**
 * Khởi tạo comment cho một post (hoặc nhiều post)
 * @param {string} postId 
 * @param {HTMLElement} container 
 * @param {HTMLFormElement} form 
 * @param {HTMLTextAreaElement} textarea 
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
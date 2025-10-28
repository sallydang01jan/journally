# 📊 ERD – Entity Relationship Diagram

### Mô tả quan hệ
- Một **User** có thể có nhiều **Post**.
- Một **User** có thể tạo nhiều **Comment**.
- Một **Post** có nhiều **Comment**.
- Một **User** có nhiều **Notification**.

---

### Mô hình bảng

```sql
Table users {
  id ObjectId [pk]
  username varchar
  email varchar
  password varchar
  avatar varchar
  createdAt datetime
}

Table posts {
  id ObjectId [pk]
  content text
  author ObjectId [ref: > users.id]
  likes array<ObjectId>
  createdAt datetime
}

Table comments {
  id ObjectId [pk]
  postId ObjectId [ref: > posts.id]
  userId ObjectId [ref: > users.id]
  text text
  createdAt datetime
}

Table notifications {
  id ObjectId [pk]
  user ObjectId [ref: > users.id]
  type varchar
  message text
  isRead boolean
  createdAt datetime
}

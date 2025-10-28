<<<<<<< HEAD
Do you want the website tour?
I could take you to all the features
And I promise none of this is a metaphor
I just want you to come inside
Baby what's mine is now yours

My website is on pretty girl hosing
My website was especially built for you
Some say it's a place where your dreams come true
My website
Could be your website too!

# Social Media Backend

Dự án backend xây dựng bằng **Node.js + Express + MongoDB** mô phỏng các tính năng cơ bản của một mạng xã hội: đăng ký, đăng nhập, bài viết, like, comment, follow/unfollow, và notifications.

---

## Yêu cầu cài đặt
- [Node.js](https://nodejs.org/) (>= 16)
- [MongoDB](https://www.mongodb.com/) (local hoặc Atlas)
- (Tuỳ chọn) [Docker](https://www.docker.com/)

---

## Cách chạy dự án

Clone repo:
```bash
git clone <url-repo>
cd backend

Cài đặt:
npm install

Chạy server (dev):
npm run dev
npm start

### Auth
- **POST** `/auth/register` → đăng ký  
  **Body:**
  ```json
  {
    "username": "demo",
    "email": "demo@example.com",
    "password": "123456"
  }
- **Response** 
{ 
    "message": "Đăng ký thành công"
}

- **POST** `/auth/login` → đăng ký  
  **Body:**
  ```json
{
    "email": "demo@example.com",
    "password": "123456"
}
- **Response** 
{ 
    "token": "jwt_token_here" 
}

## Users

### GET /users/:id
- **headers**
Authorization: Bearer <token>
- **Response**
{ "id": "...", "username": "userA", "followers": [], "following": [] }

### PUT /users/:id/follow
- **headers**
Authorization: Bearer <token>
- **Response**
{ "message": "Đã follow" }

### PUT /users/profile
- **headers**
Authorization: Bearer <token>
- **Body**
```json
{ "username": "newName", "avatar": "link.png" }
- **Response**
{ "id": "...", "username": "newName", "avatar": "link.png" }

## Posts

### POST /posts
- **Body**
```json
{ "content": "Hello world!" }
- **Response**
{ "id": "...", "content": "Hello world!", "author": "userA" }

### GET /posts
- **Response**
[
  { "id": "...", "content": "Hello world!", "author": "userA" }
]

### PUT /users/profile
- **Response**
{ "message": "Đã like" }

### POST /posts/:id/comment
- **Body**
```json
{ "text": "Nice post!" }
- **Response**
{ "id": "...", "text": "Nice post!", "user": "userA" }

## Notifications

### GET /notifications
- **Response**
[
  { "id": "...", "type": "follow", "message": "userA đã follow bạn", "isRead": false }
]


### PUT /notifications/:id/read
- **Response**
{ "id": "...", "isRead": true }


### DELETE /notifications/:id
- **Response**
{ "message": "Đã xoá" }

## Upload

### POST /upload
- **Form-data**
key = file
- **Response**
{ "file": { "filename": "abc.png", "path": "uploads/abc.png" } }

### ERD
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

### Ghi chú
- Tất cả endpoint (trừ register/login) yêu cầu Authorization: Bearer <token>.
- Code chuẩn CommonJS, không lỗi ESM.
- Thư mục uploads/ để lưu file upload.
- Có logs hỗ trợ debug trong console.

**Dự án cuối khoá – Backend Social Media**



=======
# journally
hello! this is journally!
>>>>>>> 032cee5950eb6f2c093f934eae13fafbced3c8ce

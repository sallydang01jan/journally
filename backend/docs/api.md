# API Documentation

Dự án mạng xã hội mini – Backend API.

---

## Auth

### POST /auth/register
- **Body**
```json
{ "username": "userA", "email": "a@mail.com", "password": "123456" }
- **Response**
{ "message": "Đăng ký thành công", "user": { "id": "...", "username": "userA" } }

### POST /auth/login
- **Body**
```json
{ "email": "a@mail.com", "password": "123456" }
- **Response**
{ "token": "JWT_TOKEN" }


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
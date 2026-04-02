# Vibecode Media Backend 🚀

The official backend API for Vibecode Media, built with **Node.js**, **Express**, **TypeScript**, and **Prisma**. This service handles authentication, project management, media uploads, and community interactions.

**Base URL:** `https://vibecode-media-backend.vercel.app/api/v1`

---

## 📑 Table of Contents
* [Authentication](#-authentication)
* [Project Endpoints](#-project-endpoints)
* [User Profile](#-user-profile)
* [System & Health](#-system--health)
* [Technical Stack](#-technical-stack)

---

## 🔐 Authentication
*Endpoints for user onboarding and session management.*

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Create a new account | Public |
| `POST` | `/auth/login` | Authenticate and receive JWT | Public |

---

## 📁 Project Endpoints
*Management of creative projects, reviews, and ratings.*

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/projects` | Get all projects (supports filters) | Public |
| `GET` | `/projects/averages` | Fetch average vibe scores | Public |
| `POST` | `/projects` | Create project (w/ screenshot upload) | **Required** |
| `GET` | `/projects/:id` | Get specific project details | Public |
| `PUT` | `/projects/:id` | Update project (w/ screenshot upload) | **Required** |
| `DELETE` | `/projects/:id` | Permanently delete a project | **Required** |

### 💬 Project Interactions
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/projects/:id/review` | Submit a detailed review | **Required** |
| `GET` | `/projects/:id/reviews` | List all reviews for a project | Public |
| `POST` | `/projects/:id/ratings` | Submit a numeric rating | **Required** |
| `GET` | `/projects/:id/ratings` | List all ratings for a project | Public |
| `GET` | `/projects/:id/comments` | List all project comments | Public |

---

## 👤 User Profile
*Endpoints for managing user-specific data and history.*

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/users/profile` | Retrieve your profile info | **Required** |
| `PUT` | `/users/profile` | Update profile (w/ avatar upload) | **Required** |
| `GET` | `/users/projects` | Get projects created by the user | **Required** |
| `GET` | `/users/activity` | View user activity logs | **Required** |

---

## 🛠️ System & Health
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Server status and uptime check | Public |
| `GET` | `/` | API Welcome message (Base path) | Public |

---

## ⚙️ Technical Details

### 🔑 Authentication Header
For all endpoints marked as **Required**, you must include the JWT in the request header:
```http
Authorization: Bearer <your_jwt_token>
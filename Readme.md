#  UVIEW — Modern Video Platform Backend
### “See Everything. View Anything.”

UVIEW is a full-featured backend service designed for a modern video-sharing platform.  
It provides secure authentication, media management, channel analytics, and a foundation for scalable user interactions.

---

##  Features

###  Authentication & Security
- JWT-based **Access** and **Refresh Tokens**
- HTTP-only **secure cookies**
- Auto **token refresh** flow
- Password **encryption and update** system

###  User Management
- Register, Login, Logout
- Update profile details (name, email)
- Change password
- Upload or update **avatar** and **cover images**
- Fetch **current user** data securely

###  Channel & Watch History
- Fetch user channel profile with subscriber data
- View user watch history (with video + owner info via MongoDB aggregation)
- Real-time channel and subscription awareness

###  Media Upload
- Cloudinary integration for storing user avatars and cover images
- Multer middleware for handling local file uploads

###  Clean Code Architecture
- Modular **controllers** and **routes**
- Utility-based **async error handling** (`asyncHandler`)
- Consistent API structure using `ApiResponse` and `ApiError`
- Centralized **JWT verification** middleware

---

##  Tech Stack

| Category | Technology |
|-----------|-------------|
| Backend Framework | **Node.js**, **Express.js** |
| Database | **MongoDB**, **Mongoose** |
| Authentication | **JWT** (Access & Refresh Tokens) |
| File Uploads | **Multer**, **Cloudinary** |
| Utility | **dotenv**, **cookie-parser** |
| Language | **JavaScript (ES Modules)** |

---

##  Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/SauravDevRatan/UVIEW.git
cd UVIEW

#### Backend `README.md`

**File:** `petcare-backend/README.md`

````markdown
# Petcare.uz Backend

This is the backend for Petcare.uz, providing APIs for user authentication, pet management, and cart functionality. It’s built with Node.js, Express, and MongoDB, deployed on Render.
Official website link: https://abdusamadsherkulov.github.io/petcare.uz/

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Setup](#setup)
- [Deployment](#deployment)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)

## Features

- **User Authentication:** Register, login, and profile management.
- **Pet Management:** Submit pets for rehoming, fetch all pets.
- **Cart System:** Add/remove pets from a user’s cart, stored in MongoDB.
- **Google Drive Integration:** Upload pet photos to Google Drive.

## Technologies

- Node.js
- Express.js
- MongoDB (via Mongoose)
- JWT for authentication
- Multer for file uploads
- Google Drive API for photo storage
- CORS for frontend communication

## Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/abdusamadsherkulov/petcare-backend.git
   cd petcare-backend
   ```
````

## Deployment

**Deployed on Render at: https://petcare-backend-h0cq.onrender.com**
.env file or secret files are not included in the repository because of github security system.
secret files were added in the deployment process.

## API Endpoints

Auth:
POST /api/auth/register - Register a user
POST /api/auth/login - Login and get JWT token
GET /api/auth/profile - Get user profile (protected)
Pets:
GET /api/pets/all-pets - Fetch all pets
POST /api/pets/rehoming - Submit pet for rehoming (protected, multipart/form-data)
Cart:
GET /api/cart - Get user’s cart (protected)
POST /api/cart/add - Add pet to cart (protected)
POST /api/cart/remove - Remove pet from cart (protected)
DELETE /api/cart/clear - Clear cart (protected)

## Contributing

Fork the repo, create a branch, and submit a pull request.
Report issues via GitHub Issues.

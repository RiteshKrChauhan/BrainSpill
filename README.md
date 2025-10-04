# 🧠 BrainSpill

**An anonymous secrets sharing platform where thoughts flow freely**

BrainSpill is a modern web application that allows users to anonymously share their secrets and discover random secrets from other users. Built with a focus on privacy and user experience, it features secure authentication, elegant design, and seamless user interactions.

## ✨ Features

### 🔐 Secure Authentication
- **Local Authentication**: Email and password-based registration/login with bcrypt encryption
- **Google OAuth**: One-click sign-in with Google accounts
- **Username System**: Unique usernames for personalized experience while maintaining anonymity
- **Profile Completion**: Guided setup for new users to choose their preferred username

### 🎭 Anonymous Secret Sharing
- **Submit Secrets**: Share your thoughts anonymously with the community
- **Random Discovery**: View random secrets from other users
- **Privacy First**: No personal information is tied to shared secrets
- **Real-time Updates**: Fresh content with every visit

### 🎨 Modern UI/UX
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Animated Elements**: Engaging glitch effects and smooth transitions
- **Custom Typography**: Carefully selected fonts for optimal readability
- **Error Handling**: User-friendly error messages and validation feedback

## 🛠️ Technology Stack

### Backend
- **Node.js** with **Express.js** - Server framework
- **PostgreSQL** - Secure database for user data and secrets
- **Passport.js** - Authentication middleware with Local and Google OAuth strategies
- **bcrypt** - Password hashing and security
- **express-session** - Session management

### Frontend
- **EJS** - Dynamic HTML templating
- **CSS3** - Modern styling with animations and responsive design
- **Google Fonts** - Typography (Titan One, Gloria Hallelujah, Fira Mono)

### Security & Configuration
- **dotenv** - Environment variable management
- **Session-based authentication** - Secure user sessions
- **Input validation** - Server-side validation for all user inputs

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v14+ recommended)
- **PostgreSQL** database
- **Google OAuth credentials** (optional, for Google login)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd BrainSpill
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL database**
   ```sql
   CREATE DATABASE brainspill;
   
   CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     email VARCHAR(100) NOT NULL UNIQUE,
     password VARCHAR(100) NOT NULL,
     username VARCHAR(50) UNIQUE,
     secret TEXT
   );
   ```

4. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   PG_USER=your_postgres_username
   PG_HOST=localhost
   PG_DATABASE=brainspill
   PG_PASSWORD=your_postgres_password
   PG_PORT=5432
   
   # Session Security
   SESSION_SECRET=your_super_secret_session_key
   
   # Google OAuth (Optional)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

5. **Start the application**
   ```bash
   node index.js
   ```

6. **Visit the application**
   Open your browser and navigate to `http://localhost:3000`

## 📱 Usage

### For New Users
1. **Register**: Create an account with email and password, or use Google OAuth
2. **Choose Username**: Select a unique username for your profile
3. **Share a Secret**: Submit your first anonymous secret
4. **Discover**: Browse random secrets from the community

### For Returning Users
1. **Login**: Access your account with email/password or Google
2. **View Random Secrets**: See a fresh secret each time you visit
3. **Share More**: Add new secrets to the community pool
4. **Logout**: Securely end your session

## 🏗️ Project Structure

```
BrainSpill/
├── 📄 index.js              # Main server file
├── 📦 package.json          # Dependencies and scripts
├── 🔒 .env                  # Environment variables (not in repo)
├── 📁 public/
│   ├── 🎨 css/
│   │   └── styles.css       # Application styling
│   └── 🖼️ images/          # Static images
├── 📁 views/
│   ├── 🏠 home.ejs          # Main dashboard
│   ├── 🔐 login.ejs         # Login form
│   ├── ✍️ register.ejs      # Registration form
│   ├── 👤 complete-profile.ejs # Username setup
│   └── 📝 submit.ejs        # Secret submission form
└── 📋 README.md             # Project documentation
```

## 🔧 API Endpoints

### Authentication Routes
- `GET /` - Main dashboard (shows random secret if authenticated)
- `GET /login` - Login page
- `POST /login` - Process login
- `GET /register` - Registration page
- `POST /register` - Process registration
- `GET /logout` - Logout user

### Google OAuth Routes
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/brainspill` - Google OAuth callback

### User Profile Routes
- `GET /complete-profile` - Username setup page
- `POST /complete-profile` - Process username setup

### Secret Management Routes
- `GET /submit` - Secret submission page
- `POST /submit` - Process secret submission
- `GET /random` - Redirect to main page (shows random secret)

## 🛡️ Security Features

- **Password Encryption**: All passwords are hashed using bcrypt with salt rounds
- **Session Management**: Secure session-based authentication
- **Input Validation**: Server-side validation for all user inputs
- **SQL Injection Protection**: Parameterized queries with pg library
- **Environment Variables**: Sensitive data stored in environment variables
- **Authentication Middleware**: Protected routes require authentication

---

**Made with ❤️ and a lot of ☕**

*BrainSpill - Where secrets find their voice*
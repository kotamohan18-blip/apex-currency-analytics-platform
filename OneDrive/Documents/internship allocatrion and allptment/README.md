# InternHub - Internship Allocation System

A professional web-based platform for managing internship allocations between students and companies. Built with Node.js, Express, and SQLite. Features intelligent matching algorithms, comprehensive dashboards, role-based access control, AI-powered chatbot, and resume parsing capabilities.

## 📁 Project Structure

```
internship-allocation/
│
├── server.js                 → Main Express server entry point
├── package.json              → Node.js dependencies
├── .env                      → Environment configuration
├── database.js               → SQLite database layer
│
├── routes/                   → API route handlers
│   ├── auth.js               → Authentication (login/signup)
│   ├── internships.js        → Internship CRUD operations
│   ├── applications.js       → Application management
│   ├── admin.js              → Admin dashboard APIs
│   ├── profile.js            → User profile management
│   ├── chatbot.js            → AI chatbot integration
│   └── upload.js             → Resume upload and parsing
│
├── templates/                → HTML templates
│   ├── professional.html     → Main entry page
│   ├── login.html            → Login page
│   ├── signup.html           → User registration page
│   ├── admin.html            → Admin dashboard
│   ├── student.html          → Student dashboard
│   ├── index.html            → Landing page
│   └── profile.html          → User profile page
│
├── static/                   → Static assets (CSS, JS, images)
│
├── uploads/                  → Uploaded resumes storage
│
├── assets/                   → Additional assets
│
└── README.md                 → This documentation file
```

## 🚀 Features

### **Authentication System**
- **Multi-role Support**: Admin, Student accounts
- **Secure Login**: Email/password authentication with bcrypt hashing
- **Session Management**: Express sessions with secure cookies
- **Password Recovery**: Built-in password reset functionality

### **Admin Dashboard**
- **User Management**: View and manage all users
- **Internship Management**: Create, update, delete internship postings
- **Application Management**: Review and update application statuses
- **Analytics**: Statistics and insights dashboard
- **Role Management**: Assign user roles and permissions

### **Student Features**
- **Internship Search**: Browse available internships
- **Application System**: Apply to internships with resume upload
- **Profile Management**: Update personal information and student ID
- **Application Tracking**: View application status and history
- **Resume Upload**: Upload and parse PDF resumes

### **AI Chatbot**
- **Career Guidance**: Get internship and career advice
- **Application Help**: Assistance with applications and resumes
- **Interview Tips**: Prepare for internship interviews
- **Recommendations**: Get personalized internship suggestions
- **Powered by OpenAI GPT-3.5**

### **Resume Parsing**
- **PDF Support**: Upload and parse PDF resumes
- **Data Extraction**: Extract contact info, skills, education, experience
- **File Management**: Secure file upload and storage

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Authentication**: bcryptjs, express-session
- **AI Integration**: OpenAI GPT-3.5 API
- **File Upload**: multer
- **Resume Parsing**: pdf-parse
- **Environment**: dotenv

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   Create a `.env` file with:
   ```env
   PORT=5000
   NODE_ENV=development
   DB_PATH=./internship.db
   SESSION_SECRET=your-secret-key-change-in-production
   OPENAI_API_KEY=your-openai-api-key
   UPLOAD_DIR=./uploads
   MAX_FILE_SIZE=5242880
   ```

3. **Start the Server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

4. **Access the Application**
   Open your browser and go to `http://localhost:5000`

### Default Login Credentials
- **Admin**: admin@internship.com / admin123
- **Student**: student@internship.com / student123

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/current` - Get current user

### Internships
- `GET /api/internships` - List all active internships
- `GET /api/internships/:id` - Get specific internship
- `POST /api/internships` - Create internship (admin)
- `PUT /api/internships/:id` - Update internship (admin)
- `DELETE /api/internships/:id` - Delete internship (admin)

### Applications
- `GET /api/applications` - Get user's applications
- `POST /api/applications` - Apply to internship
- `GET /api/applications/:id` - Get application details
- `PUT /api/applications/:id` - Update application (admin)
- `DELETE /api/applications/:id` - Delete application

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/applications` - All applications
- `GET /api/admin/users` - All users
- `GET /api/admin/internships` - All internships
- `PUT /api/admin/applications/:id` - Update application status
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

### Profile
- `GET /api/profile` - Get profile
- `PUT /api/profile` - Update profile
- `PUT /api/profile/password` - Change password
- `GET /api/profile/applications` - Get application history
- `DELETE /api/profile` - Delete account

### Chatbot
- `POST /api/chatbot/chat` - Send message to chatbot
- `GET /api/chatbot/history` - Get conversation history
- `DELETE /api/chatbot/history` - Clear history
- `GET /api/chatbot/suggestions` - Get chat suggestions
- `GET /api/chatbot/recommendations` - Get internship recommendations

### Upload
- `POST /api/upload/resume` - Upload resume
- `GET /api/upload/resumes` - List uploaded resumes
- `GET /api/upload/resume/:id` - Download resume
- `DELETE /api/upload/resume/:id` - Delete resume

## 🤝 Contributing

### **Development Guidelines**
1. Follow the existing code structure
2. Use semantic HTML5 elements
3. Write clean, commented JavaScript
4. Ensure mobile responsiveness
5. Test across browsers

### **Code Style**
- **HTML**: Semantic, indented with 4 spaces
- **CSS**: BEM methodology, CSS variables
- **JavaScript**: ES6+, camelCase, proper documentation

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

### **Common Issues**
1. **Port Already in Use**: Change PORT in `.env` file
2. **Missing Dependencies**: Run `npm install`
3. **Database Errors**: Check file permissions for `internship.db`
4. **Environment Variables**: Ensure `.env` file exists and is configured

### **Getting Help**
- Check server console for error logs
- Verify all environment variables are set
- Ensure database file is writable
- Check Node.js version (v14+ required)

## 🔄 Version History

### **v2.0.0** (Current - Node.js Migration)
- ✅ Migrated from Python/Flask to Node.js/Express
- ✅ SQLite database with proper schema
- ✅ RESTful API architecture
- ✅ AI-powered chatbot integration
- ✅ Resume upload and parsing
- ✅ Secure authentication with bcrypt

### **v1.0.0** (Legacy)
- ✅ Complete authentication system
- ✅ Admin and student dashboards
- ✅ Responsive design
- ✅ Local storage data management
- ✅ Professional UI/UX

### **Planned Features**
- 🔄 Company dashboard
- 🔄 Real-time notifications
- 🔄 Advanced analytics
- 🔄 Email integration

## 📞 Contact

For questions, suggestions, or support:
- Create an issue in the project repository
- Email: support@internhub.com
- Documentation: [Link to docs]

---

**Built with ❤️ for students and companies worldwide**

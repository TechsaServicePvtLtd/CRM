
# CRM

CRM is a full-stack **Customer Relationship Management** application designed to streamline contact, leave, opportunity, and employee management for organizations. It includes separate frontend and backend components, leveraging a variety of technologies to ensure robustness and scalability.

---

## **Project Structure**
The project has the following main components:

- **Backend (`Back/`)**: Built with Node.js and Express, it handles API endpoints, database interactions, authentication, and other server-side operations.
- **Frontend (`Front/`)**: A React-based single-page application for user interaction.

---

## **Key Features**
1. **Contact Management**: Add, view, edit, and delete customer contacts.
2. **Opportunity Management**: Manage opportunities with filtering, sorting, and exporting features.
3. **Leave Management**: Comprehensive leave application, approval, and status tracking system with email notifications.
4. **Employee Management**: Manage employee details and statuses.
5. **Authentication**: Role-based access control with user-specific features.
6. **Reports and Logs**: Maintain logs for activities like leave application updates.
7. **Notifications**: Email integration for various user activities.

---

## **Tech Stack**

### **Backend**
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Nodemailer](https://img.shields.io/badge/Nodemailer-orange?style=for-the-badge)
![Helmet](https://img.shields.io/badge/Helmet.js-336699?style=for-the-badge)

### **Frontend**
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React Router](https://img.shields.io/badge/React%20Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)

---

## **Directory Structure**

### Backend
```
Back/
├── app.js                # Main Express app configuration
├── server.js             # Server startup script
├── database.js           # Database connection setup
├── config/
│   └── .env              # Environment variables
├── controller/           # Controllers for business logic
├── middleware/           # Custom middleware
├── routes/               # API route handlers
└── utils/                # Helper utilities
```

### Frontend
```
Front/
├── src/
│   ├── Pages/            # React components organized by feature
│   ├── assets/           # Static assets
│   └── context/          # Context for global state management
├── public/               # Static files
└── config.js             # Configuration for API endpoints
```

---

## **Setup Instructions**

### Clone the Repository:
```bash
git clone <repository-url>
cd crm
```

### **Backend Setup**
1. Navigate to the `Back/` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up a MySQL database using the `techsaadmin` schema.
4. Configure the `.env` file:
   ```dotenv
   PORT=8080
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_DATABASE=your_tablename
   DB_PORT=3306
   Frontend_url=http://localhost:3000
   JWT_SECRET_KEY=your_jwt_secret
   SMPT_MAIL=your_email@example.com
   SMPT_PASSWORD=your_password
   ```
5. Start the server:
   ```bash
   npm run dev
   ```

### **Frontend Setup**
1. Navigate to the `Front/` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the application:
   ```bash
   npm start
   ```

---

## **Deployment**

### Backend
- Host the backend on **AWS EC2** or any Node.js-compatible hosting service.
- Ensure MySQL is properly configured and accessible.

### Frontend
- Deploy the frontend on **AWS S3**, **Netlify**, or **Vercel**.

---

## **Key Commands**

### Backend
- **Start the server**: `npm start`
- **Development mode**: `npm run dev`

### Frontend
- **Install dependencies**: `npm install`
- **Run development server**: `npm start`
- **Build for production**: `npm run build`

---

## **License**
This project is licensed under the MIT License.





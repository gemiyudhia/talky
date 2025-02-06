# Talky 🚀

Talky is a Next.js-based application that supports user authentication, real-time communication, and Firebase integration. This project leverages modern technologies to provide a responsive and interactive user experience.

## 🌟 Key Features

- **User Authentication**: Uses NextAuth with Google OAuth for secure login.
- **Real-time Communication**: Powered by Socket.io for live chat and instant messaging.
- **Firebase Integration**: Utilizes Firebase for data storage and cloud services.
- **Fast Development**: Built with Next.js for server-side rendering and optimal performance.
- **Responsive Design**: Styled with Tailwind CSS for flexible and modern UI.
- **Dark Mode**: Coming soon
- **Search Bar**: Coming soon

## 🛠 Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/gemiyudhia/talky.git
cd talky
```

### 2. Install Dependencies
Ensure you have Node.js and npm installed, then run:
```bash
npm install
```

### 3. Set Up Environment Variables
Create a .env.local file in the root directory with the following configuration:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

NEXTAUTH_SECRET=your_nextauth_secret

GOOGLE_OAUTH_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

### 4. Run the Development Server
Start the development server:
```bash
npm run dev
```
Open http://localhost:3000 in your browser to see the app in action.

### 💻 Technologies Used
- **Next.js**: A React framework for server-side rendering and static site generation.
- **Tailwind CSS**: A utility-first CSS framework for fast and responsive styling.
- **TypeScript**: A statically typed superset of JavaScript.
- **NextAuth.js**: A flexible authentication library supporting multiple providers.
- **Firebase**: A backend-as-a-service platform for authentication and data storage.
- **Socket.io**: A real-time, bidirectional communication library.
- **ESLint & Prettier**: Tools for maintaining code consistency and quality.

### 🤝 Contribution
Contributions are welcome! If you have ideas, bug fixes, or feature enhancements, feel free to:
- Submit a pull request
- Create an issue in the repository

### 📄 License
This project is licensed under the MIT License. See the LICENSE file for more details.

// e:/POSE project/client/src/pages/common/Home.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Home = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Welcome to POSE Project
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            {user ? `Hello, ${user.username}! You are now logged in.` : 'Please log in to continue.'}
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            {user ? (
              <div className="rounded-md shadow">
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="rounded-md shadow">
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
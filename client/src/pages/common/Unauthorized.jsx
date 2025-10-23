// e:/POSE project/client/src/pages/common/Unauthorized.jsx
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">403</h1>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Unauthorized Access
        </h2>
        <p className="mt-6 text-base text-gray-600">
          Sorry, you don't have permission to access this page.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            to="/"
            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Go back home
          </Link>
          <Link to="/login" className="text-sm font-semibold text-gray-900">
            Sign in to another account <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
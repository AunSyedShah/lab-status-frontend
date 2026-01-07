import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">
            Lab Status Express
          </Link>
          <ul className="flex gap-6">
            <li>
              <Link to="/schedule" className="hover:text-blue-200 transition font-semibold">
                Schedule
              </Link>
            </li>
            <li>
              <Link to="/faculties" className="hover:text-blue-200 transition">
                Faculties
              </Link>
            </li>
            <li>
              <Link to="/labs" className="hover:text-blue-200 transition">
                Labs
              </Link>
            </li>
            <li>
              <Link to="/books" className="hover:text-blue-200 transition">
                Books
              </Link>
            </li>
            <li>
              <Link to="/batches" className="hover:text-blue-200 transition">
                Batches
              </Link>
            </li>
            <li>
              <Link to="/timeslots" className="hover:text-blue-200 transition">
                Time Slots
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

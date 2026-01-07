import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800">
      <div className="max-w-6xl mx-auto px-4 py-20 text-white text-center">
        <h1 className="text-5xl font-bold mb-4">Lab Status Express</h1>
        <p className="text-xl mb-12 opacity-90">
          Manage your lab schedules, allocations, and resources efficiently
        </p>
        
        <div className="grid md:grid-cols-4 gap-6 mt-16">
          <Link
            to="/faculties"
            className="bg-white text-blue-600 p-8 rounded-lg shadow-lg hover:shadow-xl transition transform hover:scale-105"
          >
            <h2 className="text-2xl font-bold mb-2">Faculties</h2>
            <p className="opacity-80">Manage academic faculties</p>
          </Link>
          
          <Link
            to="/labs"
            className="bg-white text-blue-600 p-8 rounded-lg shadow-lg hover:shadow-xl transition transform hover:scale-105"
          >
            <h2 className="text-2xl font-bold mb-2">Labs</h2>
            <p className="opacity-80">Manage lab facilities</p>
          </Link>
          
          <Link
            to="/books"
            className="bg-white text-blue-600 p-8 rounded-lg shadow-lg hover:shadow-xl transition transform hover:scale-105"
          >
            <h2 className="text-2xl font-bold mb-2">Books</h2>
            <p className="opacity-80">Manage textbooks</p>
          </Link>
          
          <Link
            to="/batches"
            className="bg-white text-blue-600 p-8 rounded-lg shadow-lg hover:shadow-xl transition transform hover:scale-105"
          >
            <h2 className="text-2xl font-bold mb-2">Batches</h2>
            <p className="opacity-80">Manage student batches</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

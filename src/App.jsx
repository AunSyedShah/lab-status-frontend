import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ReferenceDataProvider } from './context/ReferenceDataContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ScheduleView from './pages/ScheduleView';
import FacultyList from './pages/FacultyList';
import FacultyForm from './pages/FacultyForm';
import LabList from './pages/LabList';
import LabForm from './pages/LabForm';
import BookList from './pages/BookList';
import BookForm from './pages/BookForm';
import BatchList from './pages/BatchList';
import BatchForm from './pages/BatchForm';
import TimeSlotList from './pages/TimeSlotList';
import TimeSlotForm from './pages/TimeSlotForm';
import './App.css';

function App() {
  return (
    <ReferenceDataProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/schedule" element={<ScheduleView />} />
          <Route path="/faculties" element={<FacultyList />} />
          <Route path="/faculties/create" element={<FacultyForm />} />
          <Route path="/faculties/:id/edit" element={<FacultyForm />} />
          <Route path="/labs" element={<LabList />} />
          <Route path="/labs/create" element={<LabForm />} />
          <Route path="/labs/:id/edit" element={<LabForm />} />
          <Route path="/books" element={<BookList />} />
          <Route path="/books/create" element={<BookForm />} />
          <Route path="/books/:id/edit" element={<BookForm />} />
          <Route path="/batches" element={<BatchList />} />
          <Route path="/batches/create" element={<BatchForm />} />
          <Route path="/batches/:id/edit" element={<BatchForm />} />
          <Route path="/timeslots" element={<TimeSlotList />} />
          <Route path="/timeslots/create" element={<TimeSlotForm />} />
          <Route path="/timeslots/:id/edit" element={<TimeSlotForm />} />
        </Routes>
      </Router>
    </ReferenceDataProvider>
  );
}

export default App;

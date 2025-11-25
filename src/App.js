import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import DailyCheck from './pages/DailyCheck';
import PostingCheck from './pages/PostingCheck';
import PostingCheckGuide from './pages/PostingCheckGuide';
import MutualCheck from './pages/MutualCheck';
import TestPage from './pages/TestPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<DailyCheck />} />
            <Route path="/posting" element={<PostingCheck />} />
            <Route path="/posting/guide" element={<PostingCheckGuide />} />
            <Route path="/mutual" element={<MutualCheck />} />
            <Route path="/test" element={<TestPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import FeedbackForm from './components/FeedbackForm';
import FeedbackList from './components/FeedbackList';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleFeedbackSubmitted = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('view');
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>📚 Student Feedback System</h1>
        
      </header>

      <nav className="navigation">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={activeTab === 'submit' ? 'active' : ''}
          onClick={() => setActiveTab('submit')}
        >
          Submit Feedback
        </button>
        <button 
          className={activeTab === 'view' ? 'active' : ''}
          onClick={() => setActiveTab('view')}
        >
          View Feedback
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'dashboard' && <Dashboard refreshTrigger={refreshTrigger} />}
        {activeTab === 'submit' && <FeedbackForm onSubmitSuccess={handleFeedbackSubmitted} />}
        {activeTab === 'view' && <FeedbackList refreshTrigger={refreshTrigger} />}
      </main>

      <footer className="app-footer">
        <p>© 2025 Student Feedback App | Limkokwing University</p>
      </footer>
    </div>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaStar, FaRegStar, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';
import './FeedbackList.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function FeedbackList({ refreshTrigger }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRating, setSelectedRating] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchFeedbacks();
  }, [refreshTrigger]);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedRating, selectedCourse, sortBy, feedbacks]);

  const fetchFeedbacks = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(`${API_URL}/api/feedback`);
      setFeedbacks(response.data);
      setFilteredFeedbacks(response.data);
    } catch (err) {
      setError('Failed to load feedback. Please try again later.');
      console.error('Error fetching feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...feedbacks];

    // Search filter (student name, course code, or comments)
    if (searchTerm.trim()) {
      filtered = filtered.filter(feedback => 
        feedback.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.comments.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Rating filter
    if (selectedRating !== 'all') {
      filtered = filtered.filter(feedback => 
        feedback.rating === parseInt(selectedRating)
      );
    }

    // Course filter
    if (selectedCourse !== 'all') {
      filtered = filtered.filter(feedback => 
        feedback.course_code === selectedCourse
      );
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'highest':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      default:
        break;
    }

    setFilteredFeedbacks(filtered);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/feedback/${id}`);
      setDeleteMessage('Feedback deleted successfully');
      setTimeout(() => setDeleteMessage(''), 3000);
      fetchFeedbacks();
    } catch (err) {
      setError('Failed to delete feedback. Please try again.');
      console.error('Error deleting feedback:', err);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} style={{ color: '#ffc107', marginRight: '2px' }} />);
      } else {
        stars.push(<FaRegStar key={i} style={{ color: '#ddd', marginRight: '2px' }} />);
      }
    }
    return stars;
  };

  const getUniqueCourses = () => {
    const courses = [...new Set(feedbacks.map(f => f.course_code))];
    return courses.sort();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedRating('all');
    setSelectedCourse('all');
    setSortBy('newest');
  };

  if (loading) {
    return <div className="loading">Loading feedback...</div>;
  }

  return (
    <div className="feedback-list-container">
      <h2>All Course Feedback</h2>
      
      {deleteMessage && (
        <div className="message success">{deleteMessage}</div>
      )}
      
      {error && (
        <div className="message error">{error}</div>
      )}

      {/* Search and Filter Section */}
      <div className="filter-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by student, course, or comments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <FaFilter className="filter-icon" />
            <label>Rating:</label>
            <select 
              value={selectedRating} 
              onChange={(e) => setSelectedRating(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Course:</label>
            <select 
              value={selectedCourse} 
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Courses</option>
              {getUniqueCourses().map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>

          <button onClick={clearFilters} className="clear-filters-btn">
            Clear Filters
          </button>
        </div>

        <div className="results-count">
          Showing {filteredFeedbacks.length} of {feedbacks.length} feedback(s)
        </div>
      </div>

      {/* Feedback List */}
      {filteredFeedbacks.length === 0 ? (
        <div className="no-feedback">
          <p>
            {feedbacks.length === 0 
              ? 'No feedback submitted yet. Be the first to share your thoughts!' 
              : 'No feedback matches your search criteria.'}
          </p>
        </div>
      ) : (
        <div className="feedback-grid">
          {filteredFeedbacks.map(feedback => (
            <div key={feedback.id} className="feedback-card">
              <div className="feedback-header">
                <h3>{feedback.student_name}</h3>
                <span className="course-code">{feedback.course_code}</span>
              </div>
              
              <div className="feedback-rating">
                <span className="stars">{renderStars(feedback.rating)}</span>
                <span className="rating-text">{feedback.rating}/5</span>
              </div>
              
              <div className="feedback-comments">
                <p>{feedback.comments}</p>
              </div>
              
              <div className="feedback-footer">
                <span className="feedback-date">
                  {new Date(feedback.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <button 
                  className="delete-button"
                  onClick={() => handleDelete(feedback.id)}
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FeedbackList;
import React, { useState } from 'react';
import axios from 'axios';
import { FaStar } from 'react-icons/fa';
import './FeedbackForm.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function FeedbackForm({ onSubmitSuccess }) {
  const [formData, setFormData] = useState({
    studentName: '',
    courseCode: '',
    comments: '',
    rating: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.studentName.trim()) {
      newErrors.studentName = 'Student name is required';
    }
    
    if (!formData.courseCode.trim()) {
      newErrors.courseCode = 'Course code is required';
    }
    
    if (!formData.comments.trim()) {
      newErrors.comments = 'Comments are required';
    } else if (formData.comments.trim().length < 10) {
      newErrors.comments = 'Comments must be at least 10 characters';
    }
    
    if (!formData.rating) {
      newErrors.rating = 'Rating is required';
    } else if (formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = 'Rating must be between 1 and 5';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);

    try {
      await axios.post(`${API_URL}/api/feedback`, formData);
      
      setMessage({ 
        type: 'success', 
        text: 'Feedback submitted successfully!' 
      });
      
      // Reset form
      setFormData({
        studentName: '',
        courseCode: '',
        comments: '',
        rating: ''
      });
      
      if (onSubmitSuccess) {
        setTimeout(() => onSubmitSuccess(), 1500);
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to submit feedback. Please try again.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (num) => {
    return [...Array(num)].map((_, i) => (
      <FaStar key={i} style={{ color: '#ffc107', marginLeft: '2px' }} />
    ));
  };

  return (
    <div className="feedback-form-container">
      <h2>Submit Course Feedback</h2>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="feedback-form">
        <div className="form-group">
          <label htmlFor="studentName">Student Name *</label>
          <input
            type="text"
            id="studentName"
            name="studentName"
            value={formData.studentName}
            onChange={handleChange}
            className={errors.studentName ? 'error' : ''}
            placeholder="Enter your full name"
          />
          {errors.studentName && <span className="error-message">{errors.studentName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="courseCode">Course Code *</label>
          <input
            type="text"
            id="courseCode"
            name="courseCode"
            value={formData.courseCode}
            onChange={handleChange}
            className={errors.courseCode ? 'error' : ''}
            placeholder="e.g., BICA3110"
          />
          {errors.courseCode && <span className="error-message">{errors.courseCode}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="comments">Comments *</label>
          <textarea
            id="comments"
            name="comments"
            value={formData.comments}
            onChange={handleChange}
            className={errors.comments ? 'error' : ''}
            placeholder="Share your feedback about the course (minimum 10 characters)"
            rows="5"
          />
          {errors.comments && <span className="error-message">{errors.comments}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="rating">Rating (1-5) *</label>
          <div className="rating-container">
            {[1, 2, 3, 4, 5].map(num => (
              <label key={num} className="rating-option">
                <input
                  type="radio"
                  name="rating"
                  value={num}
                  checked={Number(formData.rating) === num}
                  onChange={handleChange}
                />
                <span className="rating-label">
                  {num} {renderStars(num)}
                </span>
              </label>
            ))}
          </div>
          {errors.rating && <span className="error-message">{errors.rating}</span>}
        </div>

        <button 
          type="submit" 
          className="submit-button"
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
}

export default FeedbackForm;
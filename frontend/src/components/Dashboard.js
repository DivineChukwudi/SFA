import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaChartBar, FaStar, FaChartLine } from 'react-icons/fa';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Dashboard({ refreshTrigger }) {
  const [stats, setStats] = useState({
    total: 0,
    averageRating: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    recentFeedback: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/feedback`);
      const feedbacks = response.data;

      // Calculate statistics
      const total = feedbacks.length;
      const ratings = feedbacks.map(f => f.rating);
      const averageRating = total > 0 
        ? (ratings.reduce((a, b) => a + b, 0) / total).toFixed(1)
        : 0;

      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      ratings.forEach(rating => {
        distribution[rating]++;
      });

      const recentFeedback = feedbacks.slice(0, 3);

      setStats({
        total,
        averageRating,
        ratingDistribution: distribution,
        recentFeedback
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(rating)].map((_, i) => (
      <FaStar key={i} style={{ color: '#ffc107', marginRight: '2px' }} />
    ));
  };

  const getHighestRating = () => {
    const ratingsWithFeedback = Object.keys(stats.ratingDistribution)
      .filter(k => stats.ratingDistribution[k] > 0)
      .map(Number);
    
    if (ratingsWithFeedback.length === 0) {
      return 'N/A';
    }
    
    return Math.max(...ratingsWithFeedback);
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <h2>Dashboard Overview</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FaChartBar size={32} />
          </div>
          <div className="stat-content">
            <h3>Total Feedback</h3>
            <p className="stat-value">{stats.total}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaStar size={32} />
          </div>
          <div className="stat-content">
            <h3>Average Rating</h3>
            <p className="stat-value">{stats.averageRating}/5</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaChartLine size={32} />
          </div>
          <div className="stat-content">
            <h3>Highest Rating</h3>
            <p className="stat-value">
              {getHighestRating() === 'N/A' ? (
                'N/A'
              ) : (
                <>
                  {getHighestRating()}
                  <FaStar style={{ color: '#ffc107', marginLeft: '5px' }} />
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="rating-distribution">
        <h3>Rating Distribution</h3>
        <div className="distribution-bars">
          {[5, 4, 3, 2, 1].map(rating => (
            <div key={rating} className="distribution-row">
              <span className="rating-label">
                {rating} <FaStar style={{ color: '#ffc107' }} />
              </span>
              <div className="bar-container">
                <div 
                  className="bar-fill"
                  style={{ 
                    width: stats.total > 0 
                      ? `${(stats.ratingDistribution[rating] / stats.total) * 100}%` 
                      : '0%'
                  }}
                />
              </div>
              <span className="count">{stats.ratingDistribution[rating]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="recent-feedback">
        <h3>Recent Feedback</h3>
        {stats.recentFeedback.length === 0 ? (
          <p className="no-data">No feedback available yet.</p>
        ) : (
          <div className="recent-list">
            {stats.recentFeedback.map(feedback => (
              <div key={feedback.id} className="recent-item">
                <div className="recent-header">
                  <strong>{feedback.student_name}</strong>
                  <span className="recent-rating">{renderStars(feedback.rating)}</span>
                </div>
                <p className="recent-course">{feedback.course_code}</p>
                <p className="recent-comment">{feedback.comments.substring(0, 100)}...</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
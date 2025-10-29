const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET all feedback
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM feedback ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error retrieving feedback:', err);
    res.status(500).json({ 
      error: 'Failed to retrieve feedback',
      message: err.message 
    });
  }
});

// POST new feedback
router.post('/', async (req, res) => {
  try {
    const { studentName, courseCode, comments, rating } = req.body;

    // Validation
    if (!studentName || !courseCode || !comments || !rating) {
      return res.status(400).json({ 
        error: 'All fields are required' 
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        error: 'Rating must be between 1 and 5' 
      });
    }

    const result = await pool.query(
      'INSERT INTO feedback (student_name, course_code, comments, rating) VALUES ($1, $2, $3, $4) RETURNING *',
      [studentName, courseCode, comments, rating]
    );

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: result.rows[0]
    });
  } catch (err) {
    console.error('Error adding feedback:', err);
    res.status(500).json({ 
      error: 'Failed to submit feedback',
      message: err.message 
    });
  }
});

// DELETE feedback (Bonus feature)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM feedback WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Feedback not found' 
      });
    }

    res.json({ 
      message: 'Feedback deleted successfully',
      feedback: result.rows[0]
    });
  } catch (err) {
    console.error('Error deleting feedback:', err);
    res.status(500).json({ 
      error: 'Failed to delete feedback',
      message: err.message 
    });
  }
});

module.exports = router;
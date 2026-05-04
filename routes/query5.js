const express = require('express');
const router = express.Router();
const connectDB = require('./db');

router.get('/', async (req, res, next) => {
  try {
    const db = await connectDB();

    const results = await db.collection('reviews').aggregate([
      {
        $project: {
          city: 1,
          year: { $year: '$date' },
          month: { $month: '$date' }
        }
      },
      {
        $match: {
          month: 12,
          city: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: {
            city: '$city',
            year: '$year'
          },
          review_count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          city: '$_id.city',
          year: '$_id.year',
          review_count: 1
        }
      },
      {
        $sort: {
          city: 1,
          year: 1
        }
      }
    ]).toArray();

    res.json({
      count: results.length,
      results
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
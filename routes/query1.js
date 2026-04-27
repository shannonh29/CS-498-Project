const express = require('express');
const router = express.Router();
const connectDB = require('./db');

router.get('/', async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ message: 'start_date and end_date are required' });
    }

    const start = new Date(start_date);
    const end = new Date(end_date);

    if (end.getTime() - start.getTime() !== 24 * 60 * 60 * 1000) {
      return res.status(400).json({
        message: 'end_date must be exactly 1 day after start_date'
      });
    }

    const db = await connectDB();

    const results = await db.collection('calendar').aggregate([
      {
        $match: {
          city: 'Portland, OR',
          available: true,
          date: { $in: [start, end] }
        }
      },
      {
        $group: {
          _id: '$listing_id',
          matchedDates: { $addToSet: '$date' }
        }
      },
      {
        $match: {
          $expr: { $eq: [{ $size: '$matchedDates' }, 2] }
        }
      },
      {
        $lookup: {
          from: 'listings',
          localField: '_id',
          foreignField: 'id',
          as: 'listing'
        }
      },
      {
        $unwind: '$listing'
      },
      {
        $project: {
          id: '$listing.id',
          name: '$listing.name',
          neighborhood: '$listing.neighbourhood_cleansed',
          room_type: '$listing.room_type',
          accommodates: '$listing.accommodates',
          property_type: '$listing.property_type',
          amenities: '$listing.amenities',
          price: '$listing.price',
          avg_rating: '$listing.review_scores_rating'
        }
      },
      {
        $sort: { avg_rating: -1 }
      },
      {
        $limit: 50
      }
    ]).toArray();

    res.json({
      count: results.length,
      start_date,
      end_date,
      results
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const connectDB = require('./db');

router.get('/', async (req, res, next) => {
  try {
    const { target_month_start, target_month_end } = req.query;

    if (!target_month_start || !target_month_end) {
      return res.status(400).json({
        message: 'target_month_start and target_month_end are required'
      });
    }

    const start = new Date(target_month_start);
    const end = new Date(target_month_end);

    if (start >= end) {
      return res.status(400).json({
        message: 'target_month_start must be earlier than target_month_end'
      });
    }

    const db = await connectDB();

    const activePairs = await db.collection('calendar').aggregate([
      {
        $match: {
          // add available: true if we want no available listings
          // available: true,
          date: { $gte: start, $lt: end }
        }
      },
      {
        $group: {
          _id: '$listing_id'
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
          _id: 0,
          neighbourhood_group: '$listing.neighbourhood_group_cleansed',
          neighbourhood: '$listing.neighbourhood_cleansed'
        }
      },
      {
        $match: {
          neighbourhood_group: { $ne: null },
          neighbourhood: { $ne: null }
        }
      },
      {
        $group: {
          _id: {
            neighbourhood_group: '$neighbourhood_group',
            neighbourhood: '$neighbourhood'
          }
        }
      }
    ]).toArray();

    const activeSet = new Set(
      activePairs.map(
        (item) =>
          `${item._id.neighbourhood_group}|||${item._id.neighbourhood}`
      )
    );

    const allNeighborhoods = await db.collection('neighborhoods').find(
      {
        neighbourhood_group: { $exists: true, $ne: null },
        neighbourhood: { $exists: true, $ne: null }
      },
      {
        projection: {
          _id: 0,
          neighbourhood_group: 1,
          neighbourhood: 1
        }
      }
    ).toArray();

    const results = allNeighborhoods
      .filter((item) => {
        const key = `${item.neighbourhood_group}|||${item.neighbourhood}`;
        return !activeSet.has(key);
      })
      .map((item) => ({
        city: item.neighbourhood_group,
        neighborhood: item.neighbourhood
      }))
      .sort((a, b) => {
        if (a.city !== b.city) return a.city.localeCompare(b.city);
        return a.neighborhood.localeCompare(b.neighborhood);
      });

    res.json({
      count: results.length,
      target_month_start,
      target_month_end,
      results
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
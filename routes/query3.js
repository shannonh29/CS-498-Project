const express = require('express');
const router = express.Router();
const connectDB = require('./db');

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function monthLabel(date) {
  return date.toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

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

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    if (start >= end) {
      return res.status(400).json({
        message: 'target_month_start must be earlier than target_month_end'
      });
    }

    const db = await connectDB();

    const calendarRows = await db.collection('calendar').aggregate([
      {
        $match: {
          city: 'Salem, OR',
          date: { $gte: start, $lt: end }
        }
      },
      {
        $lookup: {
          from: 'listings',
          localField: 'listing_id',
          foreignField: 'id',
          as: 'listing'
        }
      },
      {
        $unwind: '$listing'
      },
      {
        $match: {
          'listing.room_type': 'Entire home/apt'
        }
      },
      {
        $project: {
          _id: 0,
          listing_id: 1,
          date: 1,
          available: 1,
          minimum_nights: 1,
          listing_name: '$listing.name'
        }
      },
      {
        $sort: {
          listing_id: 1,
          date: 1
        }
      }
    ]).toArray();

    const rowsByListing = new Map();

    for (const row of calendarRows) {
      if (!rowsByListing.has(row.listing_id)) {
        rowsByListing.set(row.listing_id, []);
      }

      rowsByListing.get(row.listing_id).push(row);
    }

    const results = [];

    function processAvailableRun(listingId, run) {
      if (run.length === 0) return;

      let validStartIndex = null;
      let currentMinNights = null;

      for (let i = 0; i < run.length; i++) {
        const minimumNights = run[i].minimum_nights || 1;
        const remainingAvailableNights = run.length - i;
        const qualifies = remainingAvailableNights >= minimumNights;

        if (qualifies) {
          if (validStartIndex === null) {
            validStartIndex = i;
            currentMinNights = minimumNights;
          }
        } else if (validStartIndex !== null) {
          const validEndIndex = i - 1;

          results.push({
            listing_id: listingId,
            name: run[validStartIndex].listing_name || 'N/A',
            month: monthLabel(run[validStartIndex].date),
            availability_from: formatDate(run[validStartIndex].date),
            availability_to: formatDate(run[validEndIndex].date),
            minimum_nights: currentMinNights
          });

          validStartIndex = null;
          currentMinNights = null;
        }
      }

      if (validStartIndex !== null) {
        results.push({
          listing_id: listingId,
          name: run[validStartIndex].listing_name || 'N/A',
          month: monthLabel(run[validStartIndex].date),
          availability_from: formatDate(run[validStartIndex].date),
          availability_to: formatDate(run[run.length - 1].date),
          minimum_nights: currentMinNights
        });
      }
    }

    for (const [listingId, rows] of rowsByListing.entries()) {
      let availableRun = [];

      for (const row of rows) {
        if (row.available === true) {
          availableRun.push(row);
        } else {
          processAvailableRun(listingId, availableRun);
          availableRun = [];
        }
      }

      processAvailableRun(listingId, availableRun);
    }

    results.sort((a, b) => {
      if (a.name !== b.name) return a.name.localeCompare(b.name);
      return a.availability_from.localeCompare(b.availability_from);
    });

    res.json({
      count: results.length,
      target_month_start,
      target_month_end,
      city: 'Salem, OR',
      room_type: 'Entire home/apt',
      results
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
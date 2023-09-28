const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const transactions = [];
const pointsBalance = {};

// Endpoint to add points
app.post('/add', (req, res) => {
  const { payer, points, timestamp } = req.body;

  const transaction = {
    payer,
    points,
    timestamp: new Date(timestamp),
  };

  transactions.push(transaction);

  if (!pointsBalance[payer]) {
    pointsBalance[payer] = 0;
  }
  pointsBalance[payer] += points;

  res.sendStatus(200);
});

// Endpoint to spend points
app.post('/spend', (req, res) => {
  const { points } = req.body;

  if (points > getTotalPoints()) {
    res.status(400).send('User doesn\'t have enough points');
    return;
  }

  const spendResults = spendPoints(points);
  res.status(200).json(spendResults);
});

// Endpoint to fetch point balance
app.get('/balance', (req, res) => {
  res.status(200).json(pointsBalance);
});

// Helper function to calculate total points
function getTotalPoints() {
  return Object.values(pointsBalance).reduce((total, points) => total + points, 0);
}

// Helper function to spend points based on rules
function spendPoints(pointsToSpend) {
  const spendResults = [];

  let remainingPoints = pointsToSpend;

  // Sort transactions by timestamp (oldest first)
  transactions.sort((a, b) => a.timestamp - b.timestamp);

  for (const transaction of transactions) {
    const { payer, points, timestamp } = transaction;
    const pointsToDeduct = Math.min(points, remainingPoints);

    if (pointsToDeduct > 0) {
      spendResults.push({ payer, points: -pointsToDeduct });
      pointsBalance[payer] -= pointsToDeduct;
      remainingPoints -= pointsToDeduct;
    }

    if (remainingPoints === 0) {
      break;
    }
  }

  return spendResults;
}

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

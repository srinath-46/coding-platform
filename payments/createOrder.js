const razorpay = require('../backend/config/razorpay');
const Tournament = require('../backend/models/Tournament');
const pool = require('../backend/config/db');

/**
 * Creates a Razorpay order for tournament entry
 */
const createOrder = async (req, res, next) => {
  try {
    const { tournamentId } = req.body;
    const tournament = await Tournament.getById(tournamentId);

    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    const amount = Math.floor(tournament.entry_fee * 100); // Amount in paise
    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `receipt_t${tournamentId}_u${req.user.id}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Record order in DB
    await pool.execute(
      `INSERT INTO payments (user_id, tournament_id, order_id, amount, status)
       VALUES (?, ?, ?, ?, 'created')`,
      [req.user.id, tournamentId, order.id, tournament.entry_fee]
    );

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    next(err);
  }
};

module.exports = createOrder;

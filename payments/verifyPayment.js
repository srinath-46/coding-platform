const crypto = require('crypto');
const pool = require('../backend/config/db');

const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const signatureBody = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(signatureBody.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      await pool.execute(
        `UPDATE payments 
         SET payment_id = ?, signature = ?, status = 'captured' 
         WHERE order_id = ?`,
        [razorpay_payment_id, razorpay_signature, razorpay_order_id]
      );

      res.status(200).json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = verifyPayment;

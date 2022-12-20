const Stripe = require('stripe')
const Order = require('../Models/Order')
require('dotenv').config()
const OrderDetail = require('../Models/OrderDetail')
const Payment = require('../Models/Payment')
const PaymentMethod = require('../Models/PaymentMethod')
const stripe = Stripe(process.env.STRIPE_KEY)

const checkout = async (req, res) => {
  const line_items = []

  const result = req.body.purchaseItem

  let totalQuantity = 0
  result.forEach((a) => {
    totalQuantity = totalQuantity + a.quantity
  })

  result.forEach((item) => {
    line_items.push({
      price_data: {
        currency: 'vnd',
        product_data: {
          name: item.price_data.name,
          metadata: {
            id: item.price_data.id,
          },
        },
        unit_amount: parseInt(req.body.discounted / totalQuantity),
      },
      quantity: item.quantity,
    })
  })

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items,
    mode: 'payment',
    success_url: 'http://localhost:3000/checkout-success',
    cancel_url: 'http://localhost:3000/cart',
  })
  console.log(session)
  return res.status(200).json({
    url: session.url,
    id: session.id,
  })
}

const checkSession = async (req, res) => {
  const { sessionId, order, shippingAddress, totalPrice } = req.body
  // console.log(req.user.id)
  // console.log(shippingAddress)
  let session
  session = await stripe.checkout.sessions.retrieve(sessionId)
  if (session.payment_status === 'paid' && session.status === 'complete') {
    console.log(order)
    const newOrder = await Order.create({
      cancelOrder: 0,
      shippingAddress: shippingAddress,
      status: 'Pending',
      userId: req.user.id
    })
    order.forEach(async(item) => {
     OrderDetail.create({
      quantity: item.quantity,
      productId: item.productId,
      orderId: newOrder.id
     })
    })
     const payment = Payment.create({
      totalPrice: totalPrice,
      orderId: newOrder.id,
      paymentMethodId: 1
     })
    return res.status(200).json({ msg: 'Order-paid' })
  } else {
    session = await stripe.checkout.sessions.expire(sessionId)
  }
}
module.exports = { checkout, checkSession }

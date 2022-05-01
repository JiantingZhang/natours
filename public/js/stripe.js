/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  const stripe = Stripe(
    'pk_test_51KtRv1Hy4pgR2d8pydOVwXBkhsW9O051wnDfIA5OW7NWxAw7UDGbP8SsWDAVS94NYVRbJ90g56im4tSJphifVDQ700CntuPMKn'
  );
  try {
    //!) get checkout session from API
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );

    console.log(session);
    //2)create check out form & charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};

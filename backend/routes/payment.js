/**
 * payment.js  —  Authorize.net Accept.js charge route
 *
 * Flow:
 *  1. Frontend tokenises card details with Authorize.net Accept.js
 *     (card data never touches our server — fully PCI-compliant)
 *  2. Frontend POSTs the opaque nonce + order data here
 *  3. We call Authorize.net's createTransactionRequest
 *  4. We return the transaction result to the frontend
 */

const express = require('express');
const router = express.Router();
const AuthorizenetSDK = require('authorizenet');

const ApiContracts = AuthorizenetSDK.APIContracts;
const ApiControllers = AuthorizenetSDK.APIControllers;
const SDKConstants = AuthorizenetSDK.Constants;

// ─────────────────────────────────────────────────────────────────────────────
// Helper — pick sandbox vs production environment
// ─────────────────────────────────────────────────────────────────────────────
function getEnvironment() {
  return (process.env.AUTHORIZENET_ENVIRONMENT || 'SANDBOX').toUpperCase() === 'PRODUCTION'
    ? SDKConstants.endpoint.production
    : SDKConstants.endpoint.sandbox;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payment/charge
//
// Body (JSON):
// {
//   opaqueDataDescriptor: "COMMON.ACCEPT.INAPP.PAYMENT",
//   opaqueDataValue:      "<nonce from Accept.js>",
//   amount:               "99.99",          // string, two decimal places
//   firstName:            "John",
//   lastName:             "Smith",
//   email:                "john@example.com",
//   phone:                "5551234567",
//   address:              "123 Main St",
//   city:                 "Nashville",
//   state:                "TN",
//   zip:                  "37201",
//   company:              "ACME LLC",       // optional
//   invoiceNumber:        "KJR-123456",     // optional, for records
//   description:          "KJR Product Order"
// }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/charge', async (req, res) => {
  const {
    opaqueDataDescriptor,
    opaqueDataValue,
    amount,
    firstName,
    lastName,
    email,
    phone,
    address,
    city,
    state,
    zip,
    company,
    invoiceNumber,
    description,
    cartItems        // array of { name, part, qty, price } for line items
  } = req.body;

  // ── Basic input validation ──────────────────────────────────────────────
  if (!opaqueDataDescriptor || !opaqueDataValue) {
    return res.status(400).json({ success: false, message: 'Payment token is missing. Please try again.' });
  }
  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid payment amount.' });
  }
  if (!firstName || !lastName || !email) {
    return res.status(400).json({ success: false, message: 'Customer information is incomplete.' });
  }

  // ── Merchant authentication ─────────────────────────────────────────────
  const merchantAuth = new ApiContracts.MerchantAuthenticationType();
  merchantAuth.setName(process.env.AUTHORIZENET_API_LOGIN_ID);
  merchantAuth.setTransactionKey(process.env.AUTHORIZENET_TRANSACTION_KEY);

  // ── Payment — Accept.js opaque data ────────────────────────────────────
  const opaqueData = new ApiContracts.OpaqueDataType();
  opaqueData.setDataDescriptor(opaqueDataDescriptor);
  opaqueData.setDataValue(opaqueDataValue);

  const paymentType = new ApiContracts.PaymentType();
  paymentType.setOpaqueData(opaqueData);

  // ── Order ───────────────────────────────────────────────────────────────
  const orderDetails = new ApiContracts.OrderType();
  orderDetails.setInvoiceNumber(invoiceNumber || `KJR-${Date.now()}`);
  orderDetails.setDescription(description || 'KJR Interior Designs Order');

  // ── Line items (optional but professional) ──────────────────────────────
  const lineItemsArr = new ApiContracts.ArrayOfLineItem();
  if (Array.isArray(cartItems) && cartItems.length > 0) {
    const items = cartItems.slice(0, 30).map((item, idx) => { // API max = 30
      const li = new ApiContracts.LineItemType();
      li.setItemId(String(idx + 1));
      li.setName((item.name || 'Item').substring(0, 31));           // max 31 chars
      li.setDescription((item.part || '').substring(0, 255));
      li.setQuantity(String(item.qty || 1));
      li.setUnitPrice(String(parseFloat((item.price || '0').replace(/[^0-9.]/g, '')) || 0));
      return li;
    });
    lineItemsArr.setLineItem(items);
  }

  // ── Customer info ───────────────────────────────────────────────────────
  const customerData = new ApiContracts.CustomerDataType();
  customerData.setType(ApiContracts.CustomerTypeEnum.individual);
  customerData.setEmail(email);

  // ── Billing address ─────────────────────────────────────────────────────
  const billTo = new ApiContracts.CustomerAddressType();
  billTo.setFirstName(firstName.substring(0, 50));
  billTo.setLastName(lastName.substring(0, 50));
  if (company) billTo.setCompany(company.substring(0, 50));
  if (address) billTo.setAddress(address.substring(0, 60));
  if (city) billTo.setCity(city.substring(0, 40));
  if (state) billTo.setState(state.substring(0, 40));
  if (zip) billTo.setZip(zip.substring(0, 20));
  billTo.setCountry('US');
  if (phone) billTo.setPhoneNumber(phone.replace(/\D/g, '').substring(0, 25));

  // ── Transaction request ─────────────────────────────────────────────────
  const transactionRequest = new ApiContracts.TransactionRequestType();
  transactionRequest.setTransactionType(ApiContracts.TransactionTypeEnum.authCaptureTransaction);
  transactionRequest.setPayment(paymentType);
  transactionRequest.setAmount(parsedAmount.toFixed(2));
  transactionRequest.setOrder(orderDetails);
  transactionRequest.setCustomer(customerData);
  transactionRequest.setBillTo(billTo);
  if (Array.isArray(cartItems) && cartItems.length > 0) {
    transactionRequest.setLineItems(lineItemsArr);
  }

  // ── Create the full API request ─────────────────────────────────────────
  const createRequest = new ApiContracts.CreateTransactionRequest();
  createRequest.setMerchantAuthentication(merchantAuth);
  createRequest.setTransactionRequest(transactionRequest);

  // ── Execute ─────────────────────────────────────────────────────────────
  const ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON());
  ctrl.setEnvironment(getEnvironment());

  return new Promise((resolve) => {
    ctrl.execute(() => {
      try {
        const apiResponse = ctrl.getResponse();
        const response = new ApiContracts.CreateTransactionResponse(apiResponse);

        if (!response) {
          console.error('[Payment] No response from Authorize.net');
          res.status(502).json({ success: false, message: 'No response from payment gateway. Please try again.' });
          return resolve();
        }

        const messages = response.getMessages();
        const resultCode = messages.getResultCode();

        if (resultCode === ApiContracts.MessageTypeEnum.OK) {
          const txnResponse = response.getTransactionResponse();
          const txnMsgs = txnResponse ? txnResponse.getMessages() : null;

          if (txnResponse && txnMsgs) {
            const transId = txnResponse.getTransId();
            const authCode = txnResponse.getAuthCode();
            const msgCode = txnMsgs.getMessage()[0].getCode();
            const msgText = txnMsgs.getMessage()[0].getDescription();

            console.log(`[Payment] ✅ Approved — TransID: ${transId}  AuthCode: ${authCode}  Msg: ${msgCode} – ${msgText}`);

            res.json({
              success: true,
              transactionId: transId,
              authCode,
              message: msgText,
              invoiceNumber: invoiceNumber || `KJR-${Date.now()}`
            });
          } else {
            // ResultCode OK but transaction declined
            const errMsgs = txnResponse ? txnResponse.getErrors() : null;
            const errText = errMsgs
              ? errMsgs.getError()[0].getErrorText()
              : 'Transaction declined.';
            console.warn('[Payment] ⚠️  Declined:', errText);
            res.status(402).json({ success: false, message: errText });
          }
        } else {
          // API-level error
          const errText = messages.getMessage()[0].getText();
          console.error('[Payment] ❌ API error:', resultCode, errText);
          res.status(400).json({ success: false, message: errText });
        }
      } catch (err) {
        console.error('[Payment] Exception processing response:', err);
        res.status(500).json({ success: false, message: 'Internal server error processing payment.' });
      }
      resolve();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/payment/config
// Returns the public client key so the frontend can initialise Accept.js
// (Safe to expose — this is designed to be public-facing)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/config', (req, res) => {
  res.json({
    apiLoginId: process.env.AUTHORIZENET_API_LOGIN_ID,
    publicClientKey: process.env.AUTHORIZENET_PUBLIC_CLIENT_KEY,
    environment: (process.env.AUTHORIZENET_ENVIRONMENT || 'SANDBOX').toUpperCase()
  });
});

module.exports = router;

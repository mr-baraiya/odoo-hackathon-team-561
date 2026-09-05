const express = require("express");
const seed = require("../db/dealflow360_seed");
const {
  authenticateJWT,
  authorizeRoles,
} = require("../middleware/auth.middleware");

const router = express.Router();
const customerOnly = [authenticateJWT, authorizeRoles("customer")];

const findOwnedQuote = (req, id) =>
  seed.QUOTATIONS.find(
    (quote) =>
      (quote.id === id || quote.quote_number === id) &&
      quote.customer_id === req.user.customer_id,
  );

router.get("/quotes", customerOnly, (req, res) => {
  res.json(
    seed.QUOTATIONS.filter(
      (quote) => quote.customer_id === req.user.customer_id,
    ),
  );
});

router.get("/quotes/:id", customerOnly, (req, res) => {
  const quote = findOwnedQuote(req, req.params.id);
  if (!quote) return res.status(404).json({ message: "Quotation not found" });
  res.json({
    quote,
    negotiations: seed.NEGOTIATION_REQUESTS.filter(
      (item) => item.quotation_id === quote.id,
    ),
  });
});

router.post("/negotiate", customerOnly, (req, res) => {
  const { quotationId, requestType, message, proposedDiscountPct } = req.body;
  const quote = findOwnedQuote(req, quotationId);
  if (!quote) return res.status(404).json({ message: "Quotation not found" });
  if (!message || !String(message).trim())
    return res
      .status(400)
      .json({ message: "A negotiation message is required." });

  const negEntry = {
    id: `neg_${Date.now()}`,
    quotation_id: quote.id,
    customer_user_id: req.user.id,
    request_type: requestType || "counter_discount",
    message: String(message).trim(),
    proposed_discount_pct:
      proposedDiscountPct === undefined ? null : Number(proposedDiscountPct),
    status: "open",
    created_at: new Date().toISOString(),
  };
  seed.NEGOTIATION_REQUESTS.push(negEntry);
  quote.status = "under_negotiation";
  quote.last_activity_at = new Date().toISOString();
  return res
    .status(201)
    .json({
      message: "Negotiation request submitted to sales rep.",
      negEntry,
      quote,
    });
});

router.post("/quotes/:id/confirm", customerOnly, (req, res) => {
  const quote = findOwnedQuote(req, req.params.id);
  if (!quote) return res.status(404).json({ message: "Quotation not found" });
  quote.status = "confirmed";
  quote.confirmed_at = new Date().toISOString();
  quote.confirmed_by_user_id = req.user.id;
  quote.last_activity_at = new Date().toISOString();
  return res.json({
    message: "Quotation confirmed!",
    status: quote.status,
    quote,
  });
});

router.get("/products", customerOnly, (req, res) => {
  res.json(seed.PRODUCTS.filter((product) => product.is_active));
});

router.get("/orders", customerOnly, (req, res) => {
  res.json(
    seed.QUOTATIONS.filter(
      (quote) =>
        quote.customer_id === req.user.customer_id &&
        ["confirmed", "in_fulfillment", "fulfilled"].includes(quote.status),
    ),
  );
});

module.exports = router;

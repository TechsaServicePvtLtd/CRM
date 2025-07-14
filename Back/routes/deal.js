const express = require("express");
const {   showDeal,
  addDeal,
  deleteDeal,
  editDeal,
  showOneDeal,
showCustomerDeal,
customerentity,
showOpportunityDeal
} = require("../controller/Deal");

const { authenticateToken } = require("../utils/authenticateToken");

const router = express.Router();
router.get("/showDeal", authenticateToken,  showDeal);
router.post("/addDeal",authenticateToken, addDeal);
router.get("/showOneDeal/:id", authenticateToken,  showOneDeal);
router.post("/showCustomerDeal", authenticateToken,  showCustomerDeal);
router.post("/showOpportunityDeal", authenticateToken,  showOpportunityDeal);
router.put("/editDeal/:id", authenticateToken,  editDeal);
router.delete("/deleteDeal", authenticateToken, deleteDeal)
router.get("/customerentity", authenticateToken,  customerentity);

module.exports = router;
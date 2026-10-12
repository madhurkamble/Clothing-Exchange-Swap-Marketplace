/**
 * Sustainable Clothing Swap Value Calculator
 * 
 * Evaluates fair barter trade value balance between two garments based on:
 * - Stated estimated values
 * - Garment Condition multiplier (New with tags, Like new, Gently used, Well worn)
 * - Garment Category baseline
 * - Brand positioning
 * 
 * Resulting categories:
 * - 'Balanced' (Difference <= $15 or <= 20%)
 * - 'Slight Difference' (Difference <= $35 or <= 40%)
 * - 'Large Difference' (Difference > $35 or > 40%)
 */

// Condition weight factors
const CONDITION_WEIGHTS = {
  'New with tags': 1.0,
  'Like new': 0.9,
  'Gently used': 0.75,
  'Well worn': 0.55
};

// Category baseline multipliers
const CATEGORY_MULTIPLIERS = {
  'Outerwear': 1.2,
  'Dresses': 1.1,
  'Activewear': 1.0,
  'Tops': 0.95,
  'Bottoms': 1.0,
  'Footwear': 1.15,
  'Accessories': 0.85,
  'Other': 1.0
};

/**
 * Calculate trade balance between an offered garment and a requested garment
 * @param {Object} offeredItem
 * @param {Object} requestedItem
 * @returns {Object} Analysis with estimated values, difference, and balance status
 */
function calculateSwapBalance(offeredItem, requestedItem) {
  if (!offeredItem || !requestedItem) {
    throw new Error('Both offered and requested items are required for swap evaluation');
  }

  const valOffered = Number(offeredItem.estimatedValue) || 0;
  const valRequested = Number(requestedItem.estimatedValue) || 0;

  // Condition adjustments
  const condWeightOffered = CONDITION_WEIGHTS[offeredItem.condition] || 0.75;
  const condWeightRequested = CONDITION_WEIGHTS[requestedItem.condition] || 0.75;

  // Category weight
  const catWeightOffered = CATEGORY_MULTIPLIERS[offeredItem.category] || 1.0;
  const catWeightRequested = CATEGORY_MULTIPLIERS[requestedItem.category] || 1.0;

  // Adjusted benchmark scores
  const scoreOffered = Math.round(valOffered * (condWeightOffered / 0.8) * catWeightOffered);
  const scoreRequested = Math.round(valRequested * (condWeightRequested / 0.8) * catWeightRequested);

  const difference = Math.abs(valOffered - valRequested);
  const maxVal = Math.max(valOffered, valRequested, 1);
  const diffPercentage = Math.round((difference / maxVal) * 100);

  let balanceStatus = 'Balanced';
  let badgeColor = 'success';
  let advice = 'This exchange is very well-balanced! Both swappers receive equivalent wardrobe value.';

  if (difference <= 15 || diffPercentage <= 20) {
    balanceStatus = 'Balanced';
    badgeColor = 'success';
    advice = 'Fair & balanced trade. Garments have matching utility and condition.';
  } else if (difference <= 35 || diffPercentage <= 45) {
    balanceStatus = 'Slight Difference';
    badgeColor = 'warning';
    if (valOffered > valRequested) {
      advice = `Your ${offeredItem.title} carries slightly higher estimated value than the requested item, but it is still a fair trade if you love the piece!`;
    } else {
      advice = `The requested item (${requestedItem.title}) has slightly higher estimated value. A friendly barter message can help confirm the swap!`;
    }
  } else {
    balanceStatus = 'Large Difference';
    badgeColor = 'danger';
    if (valOffered > valRequested) {
      advice = `Your item is valued significantly higher (~$${difference} difference). Consider if this exchange suits your wardrobe refresh goals.`;
    } else {
      advice = `The requested garment is valued significantly higher (~$${difference} difference). The owner may consider if they are passionate about your offer.`;
    }
  }

  return {
    offeredItem: {
      id: offeredItem._id,
      title: offeredItem.title,
      brand: offeredItem.brand,
      condition: offeredItem.condition,
      estimatedValue: valOffered,
      benchmarkScore: scoreOffered
    },
    requestedItem: {
      id: requestedItem._id,
      title: requestedItem.title,
      brand: requestedItem.brand,
      condition: requestedItem.condition,
      estimatedValue: valRequested,
      benchmarkScore: scoreRequested
    },
    difference,
    diffPercentage,
    balanceStatus,
    badgeColor,
    advice
  };
}

module.exports = {
  calculateSwapBalance,
  CONDITION_WEIGHTS,
  CATEGORY_MULTIPLIERS
};

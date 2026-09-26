// ==============================================================================
// JanUrja Agentic Pricing & Smart Matching Engine
// Simulates autonomous AI agent negotiation and multi-criteria grid matching.
// ==============================================================================

/**
 * Evaluates natural language pricing rules and grid conditions to compute dynamic rates
 */
export function evaluateAgenticPricing({
  basePrice = 6.20,
  rule = 'Auto-price dynamically: Undercut grid tariff by 15% and stay above ₹5.50/unit.',
  gridTariff = 7.80,
  feedInRate = 2.90,
  zoneCongestion = 0.42
}) {
  let negotiatedPrice = basePrice;
  const lowerRule = (rule || '').toLowerCase();
  const reasoning = [];

  // 1. Grid undercutting rule
  if (lowerRule.includes('undercut') || lowerRule.includes('below grid')) {
    const discountMatch = lowerRule.match(/(\d+)%/);
    const discountPercent = discountMatch ? parseInt(discountMatch[1], 10) / 100 : 0.15;
    const discountedPrice = gridTariff * (1 - discountPercent);
    reasoning.push(`Agent applied ${Math.round(discountPercent * 100)}% discount beneath MESCOM peak tariff (₹${gridTariff.toFixed(2)}) -> ₹${discountedPrice.toFixed(2)}/kWh`);
    negotiatedPrice = discountedPrice;
  }

  // 2. Minimum floor price check
  const floorMatch = lowerRule.match(/above ₹?(\d+(\.\d+)?)/) || lowerRule.match(/> ₹?(\d+(\.\d+)?)/);
  if (floorMatch) {
    const floor = parseFloat(floorMatch[1]);
    if (negotiatedPrice < floor) {
      reasoning.push(`Floor threshold triggered: Raised price to user's defined floor of ₹${floor.toFixed(2)}/kWh`);
      negotiatedPrice = floor;
    }
  }

  // 3. Zone congestion dynamic delta
  if (zoneCongestion > 0.6) {
    negotiatedPrice += 0.30;
    reasoning.push(`High demand in local zone (+₹0.30/kWh congestion premium added)`);
  } else if (zoneCongestion < 0.25) {
    negotiatedPrice -= 0.15;
    reasoning.push(`High solar surplus in zone (-₹0.15/kWh incentive for rapid neighborhood clearance)`);
  }

  // Keep within reasonable bounds
  negotiatedPrice = Math.max(feedInRate + 0.50, Math.min(gridTariff - 0.20, negotiatedPrice));
  const finalPrice = Number(negotiatedPrice.toFixed(2));
  const buyerSavingsPercent = Math.round(((gridTariff - finalPrice) / gridTariff) * 100);
  const sellerSurplusGainPercent = Math.round(((finalPrice - feedInRate) / feedInRate) * 100);

  return {
    finalPrice,
    buyerSavingsPercent,
    sellerSurplusGainPercent,
    reasoning,
    summary: `Autonomous clearing price locked at ₹${finalPrice}/kWh — Buyer saves ${buyerSavingsPercent}% vs DISCOM, Seller earns ${sellerSurplusGainPercent}% above standard net-metering!`
  };
}

/**
 * Multi-criteria Smart Matching Algorithm (Price + Distance + Congestion + Renewable %)
 */
export function findBestEnergyForMe({
  offers = [],
  consumerZone = 'S2-East',
  userLocationKm = 0,
  weights = { price: 0.40, distance: 0.30, renewable: 0.20, congestion: 0.10 }
}) {
  if (!offers || offers.length === 0) return null;

  const scoredOffers = offers.map((offer) => {
    // 1. Price Score (normalized between 5.0 and 8.0, lower is better)
    const price = Number(offer.price_per_kwh || 6.5);
    const priceScore = Math.max(0, Math.min(100, ((8.0 - price) / (8.0 - 5.0)) * 100));

    // 2. Distance Score (closer is better)
    const dist = Number(offer.distance_km || 1.0);
    const distanceScore = Math.max(0, Math.min(100, ((5.0 - dist) / 5.0) * 100));

    // 3. Renewable purity score
    const renewableScore = Number(offer.renewable_percentage || 90);

    // 4. Grid Locality Bonus (same zone gets 100, adjacent gets 70)
    const isSameZone = offer.grid_zone === consumerZone;
    const localityScore = isSameZone ? 100 : 70;

    // Total composite score (0 - 100)
    const totalScore = Number((
      priceScore * weights.price +
      distanceScore * weights.distance +
      renewableScore * weights.renewable +
      localityScore * weights.congestion
    ).toFixed(1));

    return {
      ...offer,
      scores: {
        total: totalScore,
        priceScore: Math.round(priceScore),
        distanceScore: Math.round(distanceScore),
        renewableScore: Math.round(renewableScore),
        localityScore
      },
      matchReason: isSameZone
        ? `Ultra-local match: Located within ${dist} km in ${offer.grid_zone} — minimizes wheeling transmission loss with ${offer.renewable_percentage}% solar purity.`
        : `Inter-zone clean match: ${dist} km away via Surathkal Substation Feeder.`
    };
  });

  // Sort descending by composite score
  scoredOffers.sort((a, b) => b.scores.total - a.scores.total);

  return {
    bestMatch: scoredOffers[0],
    rankedOffers: scoredOffers
  };
}

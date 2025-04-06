export function computeScore(deal, relatedSales) {
    if (!deal || !deal.price || deal.price <= 0) return 0;
  
    const score = {
      percentile: 0,
      profit: 0,
      match: 0,
      quality: 0,
      liquidity: 0,
      risk: 0
    };
  
    // 1. Match : lego_id présent
    if (deal.lego_id && deal.lego_id.trim() !== "") score.match = 10;
  
    // 2. Quality (discount)
    if (deal.discount && deal.discount > 0) {
      score.quality = Math.min(deal.discount, 100) * 0.2;
    }
  
    // 3. Percentile
    if (relatedSales.length > 0) {
      const prices = relatedSales
        .map(s => parseFloat(s.price))
        .filter(p => !isNaN(p) && p > 0)
        .sort((a, b) => a - b);
  
      const index = prices.findIndex(p => deal.price <= p);
      score.percentile = (1 - index / prices.length) * 30;
      score.percentile = Math.max(0, Math.min(score.percentile, 30));
  
      // 4. Profit : différence moyenne
      const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;
      const profit = avg - deal.price;
      if (profit > 0) score.profit = Math.min(profit * 2, 20);
    }
  
    // 5. Liquidité
    if (relatedSales.length > 0) {
      score.liquidity = Math.min(relatedSales.length, 10);
    }
  
    // 6. Risque (moins il y a de ventes, plus c'est risqué)
    score.risk = 10 - score.liquidity;
  
    const totalScore = Object.values(score).reduce((a, b) => a + b, 0);
    return Math.round(totalScore * 10) / 10;
  }
  
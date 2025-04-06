export function computeScore(deal, relatedSales) {
  if (!deal || !deal.price) return 0;
  return deal.price < 20 ? 100 : 50;
}

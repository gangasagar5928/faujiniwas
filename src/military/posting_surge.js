export function isPostingOrderSeason(date = new Date()) {
  const month = date.getMonth() + 1; // 1-12
  // General turnover season runs April to July
  return month >= 4 && month <= 7;
}

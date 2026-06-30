export function matchTransferExchange(departureStation, arrivalStation, inventoryList) {
  return inventoryList.filter(item => 
    item.currentStation === departureStation && 
    item.urgentRelocation === true
  );
}

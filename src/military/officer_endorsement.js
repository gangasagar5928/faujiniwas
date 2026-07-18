export function verifyEndorsementBadge(listing) {
  return listing.officerEndorsementCount >= 2 ? 'Garrison Trusted ⭐' : 'Member Verified';
}

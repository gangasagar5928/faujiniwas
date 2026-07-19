export function filterSpamReviews(reviews) {
  return reviews.filter(r => r.isServicemanVerified === true && r.text.length >= 10);
}

// Everything that changes over time lives here.
// Update `subscribers` whenever the channel grows. The stat counter, the
// milestone branch, the "next goal" headline and the "to go" number all
// recalculate from it. Add bigger milestones to the list as he passes them.
export const SKELL = {
  subscribers: 14000,
  milestones: [1000, 5000, 10000, 15000, 20000],
};

// 14000 -> "14K", 3360 -> "3.4K" (digits = 1), 850 -> "850"
export const formatK = (n, digits = 1) =>
  n < 1000 ? `${Math.round(n)}` : `${parseFloat((n / 1000).toFixed(digits))}K`;

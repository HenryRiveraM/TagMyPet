export async function expirePremiumIfNeeded(user) {
  if (user.plan === 'PREMIUM' && user.premiumExpiresAt && user.premiumExpiresAt <= new Date()) {
    user.plan = 'FREE';
    user.premiumStartedAt = undefined;
    user.premiumExpiresAt = undefined;
    await user.save({ validateBeforeSave: false });
  }
  return user;
}

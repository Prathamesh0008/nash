export function calculatePriceBreakup({ service, selectedAddons = [] }) {
  const addonMap = new Map((service.addons || []).map((addon) => [addon.title, addon.price]));
  const addons = selectedAddons.reduce((sum, addonTitle) => sum + (addonMap.get(addonTitle) || 0), 0);
  const base = Number(service.basePrice || 0);
  const visit = Number(service.visitFee || 0);
  const subTotal = base + visit + addons;
  const tax = Math.round((subTotal * Number(service.taxPercent || 0)) / 100);
  const total = subTotal + tax;

  return {
    base,
    visit,
    addons,
    tax,
    total,
    currency: "INR",
  };
}

export function hoursBetween(fromDate, toDate) {
  return (new Date(toDate).getTime() - new Date(fromDate).getTime()) / (1000 * 60 * 60);
}

export function calculateRescheduleFee({ policy, bookingStatus, oldSlot, newSlot }) {
  if (new Date(newSlot).getTime() <= Date.now()) {
    throw new Error("New slot must be in the future");
  }

  if (policy.blockStatuses?.includes(bookingStatus)) {
    throw new Error("Reschedule is blocked at current booking stage");
  }

  if (policy.highFeeStatuses?.includes(bookingStatus)) {
    return policy.highFeeAmount ?? 299;
  }

  const hoursLeft = hoursBetween(new Date(), oldSlot);

  for (const tier of policy.tiers || []) {
    if (hoursLeft >= tier.minHoursBefore && hoursLeft < tier.maxHoursBefore) {
      return tier.fee;
    }
  }

  const sorted = [...(policy.tiers || [])].sort((a, b) => a.minHoursBefore - b.minHoursBefore);
  return sorted[0]?.fee || 0;
}

export function calculateCancellationFee({ policy, bookingStatus, slotTime }) {
  if (policy.blockStatuses?.includes(bookingStatus)) {
    throw new Error("Cancellation is blocked at current booking stage");
  }

  if (policy.highFeeStatuses?.includes(bookingStatus)) {
    return policy.highFeeAmount ?? 299;
  }

  const hoursLeft = hoursBetween(new Date(), slotTime);
  for (const tier of policy.tiers || []) {
    if (hoursLeft >= tier.minHoursBefore && hoursLeft < tier.maxHoursBefore) {
      return tier.fee;
    }
  }
  const sorted = [...(policy.tiers || [])].sort((a, b) => a.minHoursBefore - b.minHoursBefore);
  return sorted[0]?.fee || 0;
}

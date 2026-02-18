import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10).max(15).optional().default(""),
  password: z.string().min(6),
  role: z.enum(["user", "worker"]).default("user"),
  gender: z.enum(["male", "female", "other"]).optional().default("other"),
  referralCode: z.string().trim().max(32).optional().default(""),
});

export const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const serviceQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  city: z.string().optional(),
  pincode: z.string().optional(),
});

export const bookingCreateSchema = z.object({
  serviceId: z.string().optional().default(""),
  address: z.object({
    line1: z.string().min(3),
    line2: z.string().optional().default(""),
    landmark: z.string().optional().default(""),
    city: z.string().min(2),
    state: z.string().optional().default(""),
    pincode: z.string().min(4),
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
  }),
  slotTime: z.string().datetime(),
  notes: z.string().optional().default(""),
  images: z.array(z.string().url()).optional().default([]),
  addons: z.array(z.string()).optional().default([]),
  paymentMethod: z.enum(["online", "wallet", "cod"]).default("online"),
  assignmentMode: z.enum(["auto", "manual"]).default("auto"),
  manualWorkerId: z.string().optional(),
  strictWorker: z.boolean().optional().default(false),
  promoCode: z.string().trim().max(32).optional().default(""),
  referralCode: z.string().trim().max(32).optional().default(""),
});

export const bookingStatusSchema = z.object({
  status: z.enum(["confirmed", "assigned", "onway", "working", "completed", "cancelled"]),
  note: z.string().optional().default(""),
});

export const rescheduleSchema = z.object({
  newSlotTime: z.string().datetime(),
  payVia: z.enum(["wallet", "online"]).default("online"),
});

export const workerOnboardingSchema = z.object({
  gender: z.enum(["male", "female", "other"]).optional(),
  profilePhoto: z.string().url().optional().default(""),
  galleryPhotos: z.array(z.string().url()).min(3).max(8),
  bio: z.string().min(20),
  skills: z.array(z.string()).min(1),
  categories: z.array(z.string()).min(1),
  serviceAreas: z
    .array(
      z.object({
        city: z.string().min(2),
        pincode: z.string().min(4),
        lat: z.number().min(-90).max(90).optional(),
        lng: z.number().min(-180).max(180).optional(),
      })
    )
    .min(1),
  address: z.string().min(5),
  pricing: z
    .object({
      basePrice: z.number().nonnegative().default(0),
      extraServices: z
        .array(
          z.object({
            title: z.string().min(2),
            price: z.number().nonnegative(),
          })
        )
        .max(30)
        .optional()
        .default([]),
    })
    .optional()
    .default({ basePrice: 0, extraServices: [] }),
  docs: z.object({
    idProof: z.string().url(),
    selfie: z.string().url(),
    certificates: z.array(z.string().url()).optional().default([]),
  }),
});

const weeklyAvailabilitySchema = z.object({
  day: z.number().int().min(0).max(6),
  start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  end: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  isOff: z.boolean().optional().default(false),
});

export const availabilitySchema = z
  .object({
    isOnline: z.boolean().optional(),
    weekly: z.array(weeklyAvailabilitySchema).max(7).optional(),
    blockedSlots: z.array(z.string().datetime()).max(200).optional(),
    minNoticeMinutes: z.number().int().min(0).max(1440).optional(),
  })
  .refine(
    (value) =>
      typeof value.isOnline === "boolean" ||
      Array.isArray(value.weekly) ||
      Array.isArray(value.blockedSlots) ||
      typeof value.minNoticeMinutes === "number",
    "No availability changes provided"
  );

export const reportSchema = z.object({
  bookingId: z.string().min(1),
  category: z.enum(["misbehavior", "no-show", "fraud", "payment", "safety", "other"]),
  message: z.string().min(10).max(2000),
  evidence: z.array(z.string().url()).optional().default([]),
});

export const reportActionSchema = z.object({
  status: z.enum(["open", "investigating", "resolved", "closed"]),
  adminAction: z.enum(["warning", "tempBan", "permaBan", "noAction"]),
  adminNotes: z.string().optional().default(""),
  falseReport: z.boolean().optional().default(false),
});

export const reportDisputeSchema = z.object({
  message: z.string().min(10).max(2000),
});

export const reportDisputeAdminSchema = z.object({
  status: z.enum(["reviewing", "closed"]),
  resolutionNote: z.string().optional().default(""),
});

export const boostBuySchema = z.object({
  planId: z.string().min(1),
  area: z.string().optional().default(""),
  category: z.string().optional().default(""),
  paymentMethod: z.enum(["online", "wallet"]).default("online"),
});

export const membershipBuySchema = z.object({
  planId: z.string().min(1),
  paymentMethod: z.enum(["online", "wallet"]).default("online"),
});

export const paymentCreateSchema = z.object({
  type: z.enum(["booking", "reschedule", "boost", "membership", "verification", "wallet"]),
  amount: z.number().positive(),
  bookingId: z.string().optional(),
  workerId: z.string().optional(),
  metadata: z.record(z.any()).optional().default({}),
});

export const paymentVerifySchema = z.object({
  paymentId: z.string().min(1),
  paymentToken: z.string().min(6).optional().default(""),
  providerOrderId: z.string().optional().default(""),
  providerPaymentId: z.string().optional().default(""),
  providerSignature: z.string().optional().default(""),
  provider: z.string().optional().default(""),
});

export const refundSchema = z.object({
  paymentId: z.string().min(1),
  amount: z.number().positive().optional(),
  note: z.string().optional().default(""),
});

export const boostPlanSchema = z.object({
  name: z.string().min(2),
  price: z.number().nonnegative(),
  durationDays: z.number().int().positive(),
  boostScore: z.number().int().nonnegative(),
  areaLimited: z.boolean().default(true),
  categoryLimited: z.boolean().default(true),
  slotLimit: z.number().int().positive(),
  active: z.boolean().default(true),
});

export const reschedulePolicySchema = z.object({
  name: z.string().min(2),
  tiers: z
    .array(
      z.object({
        minHoursBefore: z.number().nonnegative(),
        maxHoursBefore: z.number().positive(),
        fee: z.number().nonnegative(),
      })
    )
    .min(1),
  blockStatuses: z.array(z.string()).default(["working"]),
  highFeeStatuses: z.array(z.string()).default(["onway"]),
  highFeeAmount: z.number().nonnegative().default(299),
});

export function parseOrThrow(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
    const err = new Error(errors.join("; "));
    err.status = 400;
    throw err;
  }
  return result.data;
}

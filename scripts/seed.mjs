import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import User from "../models/User.js";
import WorkerProfile from "../models/WorkerProfile.js";
import Service from "../models/Service.js";
import Booking from "../models/Booking.js";
import BoostPlan from "../models/BoostPlan.js";
import ActiveBoost from "../models/ActiveBoost.js";
import ReschedulePolicy from "../models/ReschedulePolicy.js";
import Payment from "../models/Payment.js";
import Report from "../models/Report.js";

dotenv.config({ path: ".env.local" });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || "home_service_platform";

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI");
}

const workerPhotos = [
  "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1545167622-3a6ac756afa4?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=1000&q=80",
];

const workerNames = [
  "Rahul Patil",
  "Sandeep Jadhav",
  "Kavita More",
  "Sneha Shinde",
  "Ajay Chavan",
  "Nisha Mane",
  "Rohit Sawant",
  "Komal Kadam",
  "Prasad Salunkhe",
  "Tejaswini Patil",
  "Mahesh Pawar",
  "Pooja Jagtap",
  "Aniket More",
  "Amruta Chorge",
  "Vinod Gawade",
  "Bhagyashree Rane",
  "Harshal Bhosale",
  "Jyoti Patankar",
  "Kunal Deshmukh",
  "Rutuja Patil",
];

const servicesData = [
  {
    title: "Worker Visit Basic",
    slug: "worker-visit-basic",
    category: "All-Rounder Basic",
    description: "General home visit support by all-rounder worker.",
    basePrice: 399,
    visitFee: 99,
    taxPercent: 18,
    addons: [
      { title: "Extra task support", price: 249 },
      { title: "Priority slot", price: 199 },
    ],
  },
  {
    title: "Worker Visit Standard",
    slug: "worker-visit-standard",
    category: "All-Rounder Standard",
    description: "Flexible at-home support for common household needs.",
    basePrice: 449,
    visitFee: 99,
    taxPercent: 18,
    addons: [
      { title: "Extended visit", price: 299 },
      { title: "Quick revisit", price: 199 },
    ],
  },
  {
    title: "Worker Visit Plus",
    slug: "worker-visit-plus",
    category: "All-Rounder Plus",
    description: "Longer support window for multi-task household assistance.",
    basePrice: 799,
    visitFee: 149,
    taxPercent: 18,
    addons: [
      { title: "Additional helper time", price: 299 },
      { title: "Priority completion", price: 199 },
    ],
  },
  {
    title: "Worker Visit Priority",
    slug: "worker-visit-priority",
    category: "All-Rounder Priority",
    description: "Priority assignment with faster response expectations.",
    basePrice: 699,
    visitFee: 149,
    taxPercent: 18,
    addons: [
      { title: "Urgent dispatch", price: 999 },
      { title: "Extended support", price: 249 },
    ],
  },
  {
    title: "Worker Visit Premium",
    slug: "worker-visit-premium",
    category: "All-Rounder Premium",
    description: "Premium worker visit for high-priority household assistance.",
    basePrice: 499,
    visitFee: 129,
    taxPercent: 18,
    addons: [
      { title: "Extra support block", price: 349 },
      { title: "Follow-up visit", price: 199 },
    ],
  },
];

const areas = [
  { city: "Nerul", pincode: "400706" },
  { city: "Vashi", pincode: "400703" },
  { city: "Belapur", pincode: "400614" },
  { city: "Kharghar", pincode: "410210" },
  { city: "Panvel", pincode: "410206" },
];

const categories = [
  "All-Rounder Basic",
  "All-Rounder Standard",
  "All-Rounder Plus",
  "All-Rounder Priority",
  "All-Rounder Premium",
];

async function seed() {
  await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
  console.log("Connected to MongoDB");

  // Reset primary collections for deterministic seed
  async function dropIfExists(model) {
    const exists = await mongoose.connection.db
      .listCollections({ name: model.collection.name })
      .hasNext();
    if (exists) {
      await model.collection.drop();
    }
  }

  await dropIfExists(User);
  await dropIfExists(WorkerProfile);
  await dropIfExists(Service);
  await dropIfExists(Booking);
  await dropIfExists(BoostPlan);
  await dropIfExists(ActiveBoost);
  await dropIfExists(ReschedulePolicy);
  await dropIfExists(Payment);
  await dropIfExists(Report);

  const admin = await User.create({
    name: "Admin",
    email: process.env.ADMIN_EMAIL || "admin@nashworkforce.com",
    phone: "9999999999",
    passwordHash: await bcrypt.hash("Admin@123", 10),
    role: "admin",
    status: "active",
    walletBalance: 0,
  });

  const customer = await User.create({
    name: "Demo Customer",
    email: "user@nashworkforce.com",
    phone: "9000000001",
    passwordHash: await bcrypt.hash("User@123", 10),
    role: "user",
    status: "active",
    walletBalance: 5000,
    addresses: [
      {
        label: "Home",
        line1: "Sector 10",
        line2: "Flat 301",
        landmark: "Near Station",
        city: "Nerul",
        state: "Maharashtra",
        pincode: "400706",
        isDefault: true,
      },
    ],
  });

  const services = await Service.insertMany(servicesData.map((item) => ({ ...item, active: true })));

  const workerUsers = [];
  const workerProfiles = [];

  for (let i = 0; i < 20; i += 1) {
    const name = workerNames[i];
    const category = categories[i % categories.length];
    const primaryArea = areas[i % areas.length];
    const secondaryArea = areas[(i + 1) % areas.length];
    const photos = [
      workerPhotos[i % workerPhotos.length],
      workerPhotos[(i + 1) % workerPhotos.length],
      workerPhotos[(i + 2) % workerPhotos.length],
      workerPhotos[(i + 3) % workerPhotos.length],
    ];

    const workerUser = await User.create({
      name,
      email: `worker${i + 1}@nashworkforce.com`,
      phone: `98${String(10000000 + i).slice(0, 8)}`,
      passwordHash: await bcrypt.hash("Worker@123", 10),
      role: "worker",
      status: "active",
      walletBalance: 1000,
    });

    workerUsers.push(workerUser);

    const profile = await WorkerProfile.create({
      userId: workerUser._id,
      profilePhoto: photos[0],
      galleryPhotos: photos,
      bio: `${name} provides all-rounder home support with quick response and reliable service quality.`,
      skills: [category, "On-time service", "Customer support"],
      categories: [category],
      serviceAreas: [primaryArea, secondaryArea],
      address: `${primaryArea.city} service hub`,
      docs: {
        idProof: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        selfie: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        certificates: ["https://res.cloudinary.com/demo/image/upload/sample.jpg"],
      },
      accountStatus: "LIVE",
      verificationStatus: "APPROVED",
      verificationFeePaid: true,
      verificationFeeAmount: 299,
      verificationFeePaidAt: new Date(),
      verificationExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      ratingAvg: Number((4 + Math.random()).toFixed(2)),
      jobsCompleted: Math.floor(Math.random() * 100),
      cancelRate: Number((Math.random() * 5).toFixed(2)),
      responseTimeAvg: Number((5 + Math.random() * 20).toFixed(2)),
      isOnline: i % 2 === 0,
      penalties: {
        reportFlags: Math.floor(Math.random() * 2),
        noShows: Math.floor(Math.random() * 2),
        strikes: 0,
      },
      payoutWalletBalance: 2000 + i * 100,
      totalEarnings: 5000 + i * 500,
    });

    workerProfiles.push(profile);
  }

  const boostPlans = await BoostPlan.insertMany([
    {
      name: "Starter 1 Day",
      price: 199,
      durationDays: 1,
      boostScore: 100,
      areaLimited: true,
      categoryLimited: true,
      slotLimit: 12,
      active: true,
    },
    {
      name: "Growth 7 Days",
      price: 899,
      durationDays: 7,
      boostScore: 300,
      areaLimited: true,
      categoryLimited: true,
      slotLimit: 10,
      active: true,
    },
    {
      name: "Pro 30 Days",
      price: 2499,
      durationDays: 30,
      boostScore: 600,
      areaLimited: true,
      categoryLimited: true,
      slotLimit: 8,
      active: true,
    },
  ]);

  for (let i = 0; i < 8; i += 1) {
    const worker = workerProfiles[i];
    const plan = boostPlans[i % boostPlans.length];
    const area = worker.serviceAreas[0];

    await ActiveBoost.create({
      workerId: worker.userId,
      planId: plan._id,
      area: area.city,
      category: worker.categories[0],
      boostScore: plan.boostScore,
      startAt: new Date(),
      endAt: new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000),
      status: "active",
    });
  }

  await ReschedulePolicy.create({
    name: "Default Reschedule Policy",
    tiers: [
      { minHoursBefore: 24, maxHoursBefore: 9999, fee: 0 },
      { minHoursBefore: 6, maxHoursBefore: 24, fee: 99 },
      { minHoursBefore: 0, maxHoursBefore: 6, fee: 199 },
    ],
    blockStatuses: ["working"],
    highFeeStatuses: ["onway"],
    highFeeAmount: 299,
    active: true,
  });

  const bookingStatuses = ["confirmed", "assigned", "onway", "working", "completed"];
  const sampleBookings = [];

  for (let i = 0; i < 8; i += 1) {
    const service = services[i % services.length];
    const worker = workerProfiles[i];
    const status = bookingStatuses[i % bookingStatuses.length];

    const base = service.basePrice;
    const visit = service.visitFee;
    const addons = service.addons[0]?.price || 0;
    const tax = Math.round((base + visit + addons) * (service.taxPercent / 100));
    const total = base + visit + addons + tax;

    const booking = await Booking.create({
      userId: customer._id,
      workerId: worker.userId,
      serviceId: service._id,
      address: {
        line1: "Sector 10",
        line2: "Flat 301",
        landmark: "Near Station",
        city: worker.serviceAreas[0].city,
        state: "Maharashtra",
        pincode: worker.serviceAreas[0].pincode,
      },
      slotTime: new Date(Date.now() + (i + 1) * 6 * 60 * 60 * 1000),
      notes: "Demo seeded booking",
      images: [],
      selectedAddons: [service.addons[0]?.title].filter(Boolean),
      status,
      statusLogs: [
        { status: "confirmed", actorRole: "user", actorId: customer._id, note: "Seed booking" },
        ...(status !== "confirmed" ? [{ status, actorRole: "system", note: "Auto seeded status" }] : []),
      ],
      assignmentMode: "auto",
      assignmentReason: "Seeded",
      priceBreakup: { base, visit, addons, tax, total, currency: "INR" },
      paymentMethod: "online",
      paymentStatus: "paid",
      reportWindowEndsAt: status === "completed" ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : null,
      rescheduleCount: 0,
    });

    sampleBookings.push(booking);

    const payment = await Payment.create({
      userId: customer._id,
      workerId: worker.userId,
      bookingId: booking._id,
      type: "booking",
      amount: total,
      currency: "INR",
      provider: "demo",
      status: "paid",
      providerOrderId: `seed_order_${i + 1}`,
      providerPaymentId: `demo_seed_${i + 1}`,
      verifiedAt: new Date(),
    });

    booking.paymentId = payment._id;
    await booking.save();
  }

  if (sampleBookings.length > 0) {
    await Report.create({
      bookingId: sampleBookings[sampleBookings.length - 1]._id,
      reporterId: customer._id,
      reporterType: "user",
      targetId: sampleBookings[sampleBookings.length - 1].workerId,
      targetType: "worker",
      category: "misbehavior",
      message: "Worker arrived very late and communication was poor.",
      evidence: ["https://res.cloudinary.com/demo/image/upload/sample.jpg"],
      severity: "medium",
      status: "open",
      adminAction: "",
    });
  }

  console.log("Seed complete");
  console.log(`Admin: ${admin.email} / Admin@123`);
  console.log(`User: ${customer.email} / User@123`);
  console.log("Workers: worker1@nashworkforce.com .. worker20@nashworkforce.com / Worker@123");

  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});

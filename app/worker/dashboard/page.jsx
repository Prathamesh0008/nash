"use client";

import { useState } from "react";

export default function WorkerDashboard() {
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([1]);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [profile, setProfile] = useState({
    fullName: "",
    title: "",
    email: "",
    phone: "",
    about: "",
    zip: "",
    city: "",
    gender: "",
    sex: "",
    birthdate: "",
    bodyType: "",
    hairColor: "",
    heightCm: "",
  });

  const [services, setServices] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [availability, setAvailability] = useState({
    workingDays: [],
    startTime: "",
    endTime: "",
  });

  const [contactPreferences, setContactPreferences] = useState({
    call: false,
    whatsapp: false,
    platform: false,
  });

  const [verification, setVerification] = useState({
    phoneCountry: "+31",
    phoneNumber: "",
    phoneVerified: false,
    identityPhoto: "",
    bodyPhoto: "",
  });

  const [promotion, setPromotion] = useState({
    plan: "",
  });

  const [advertisement, setAdvertisement] = useState({
    promoSticker: "",
  });

  // ✅ Validation errors (no UI change needed; only blocks Next Step)
  const [errors, setErrors] = useState({});

  const isValidEmail = (email) => {
    // simple email check
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
  };

  const is10DigitPhone = (phone) => {
    // allow only 10 digits (no spaces, no +, no dashes)
    return /^[0-9]{10}$/.test(String(phone || "").trim());
  };

  const validateStep = (currentStep) => {
    const nextErrors = {};

    // Step 1: Profile + Availability (both are rendered in step 1)
    if (currentStep === 1) {
      if (!services || services.length === 0) nextErrors.services = "Select at least one service.";

      if (!String(profile.fullName || "").trim()) nextErrors.fullName = "Full Name is required.";
      if (!String(profile.title || "").trim()) nextErrors.title = "Profile Title is required.";

      if (!String(profile.email || "").trim()) nextErrors.email = "Email is required.";
      else if (!isValidEmail(profile.email)) nextErrors.email = "Enter a valid email address.";

      if (!String(profile.phone || "").trim()) nextErrors.phone = "Phone Number is required.";
      else if (!is10DigitPhone(profile.phone)) nextErrors.phone = "Phone Number must be exactly 10 digits.";

      if (!String(profile.about || "").trim()) nextErrors.about = "About Me is required.";

      if (!String(availability.startTime || "").trim()) nextErrors.startTime = "Start Time is required.";
      if (!String(availability.endTime || "").trim()) nextErrors.endTime = "End Time is required.";
      if (!availability.workingDays || availability.workingDays.length === 0)
        nextErrors.workingDays = "Select at least one working day.";

      if (!String(profile.zip || "").trim()) nextErrors.zip = "ZIP Code is required.";
      if (!String(profile.city || "").trim()) nextErrors.city = "City is required.";

      if (!String(profile.gender || "").trim()) nextErrors.gender = "Gender is required.";
      if (!String(profile.sex || "").trim()) nextErrors.sex = "Sex is required.";
      if (!String(profile.birthdate || "").trim()) nextErrors.birthdate = "Birthdate is required.";

      if (!String(profile.bodyType || "").trim()) nextErrors.bodyType = "Body Type is required.";
      if (!String(profile.hairColor || "").trim()) nextErrors.hairColor = "Hair Color is required.";

      if (!String(profile.heightCm || "").trim()) nextErrors.heightCm = "Height is required.";
      else if (!/^\d+(\.\d+)?$/.test(String(profile.heightCm).trim()))
        nextErrors.heightCm = "Height must be a number.";
    }

    // Step 2: Verification (at least phone number validation)
    if (currentStep === 2) {
      if (!String(verification.phoneNumber || "").trim())
        nextErrors.verificationPhoneNumber = "Verification phone number is required.";
      else if (!is10DigitPhone(verification.phoneNumber))
        nextErrors.verificationPhoneNumber = "Verification phone number must be exactly 10 digits.";
    }

    // Step 3: Promotion selection (already in your canProceed, keep same behavior)
    if (currentStep === 3) {
      if (!selectedPlan) nextErrors.selectedPlan = "Please select a promotion plan.";
    }

    // Step 4: Terms acceptance (already in your canProceed, keep same behavior)
    if (currentStep === 4) {
      if (!acceptedTerms) nextErrors.acceptedTerms = "Please accept Terms & Conditions.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const canProceed = () => {
    if (step === 3 && !selectedPlan) return false;
    if (step === 4 && !acceptedTerms) return false;
    return true;
  };

  const steps = [
    { id: 1, title: "Profile" },
    { id: 2, title: "Verification" },
    { id: 3, title: "Promotion" },
    { id: 4, title: "Agree & Pay" },
  ];

  const handleNext = () => {
    // ✅ block next step until current step validates
    const ok = validateStep(step);
    if (!ok) return;

    const nextStep = step + 1;
    setStep(nextStep);

    // ✅ mark steps as completed so stepper unlocks
    setCompletedSteps((prev) => (prev.includes(nextStep) ? prev : [...prev, nextStep]));
  };

  const handleBack = () => {
    setErrors({});
    setStep(step - 1);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0b0214] to-black text-white flex">
      {/* SIDEBAR */}
      <aside className="w-72 bg-black/60 border-r border-white/10 hidden md:flex flex-col px-6 py-8">
        {/* BRAND */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold tracking-tight">
            Worker<span className="text-pink-500">Panel</span>
          </h2>
          <p className="text-sm text-white/50 mt-1">Profile & Job Management</p>
        </div>

        {/* SETUP STATUS */}
        <div className="mb-8">
          <div className="text-xs uppercase text-white/40 mb-3 tracking-wider">Setup Progress</div>

          <SidebarItem label="Profile Setup" active description="Complete your profile" />
        </div>

        {/* WORK SECTION */}
        <SidebarSection title="Work">
          <SidebarItem label="Jobs" />
          <SidebarItem label="Availability" />
          <SidebarItem label="Earnings" />
        </SidebarSection>

        {/* ACCOUNT SECTION */}
        <SidebarSection title="Account">
          <SidebarItem label="Settings" />
        </SidebarSection>

        {/* FOOTER */}
        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="text-sm text-white/60 mb-2">Logged in as</div>
          <div className="font-medium text-white mb-4">Worker Account</div>

          <button className="w-full text-left text-sm text-white/60 hover:text-white transition">
            Logout →
          </button>
        </div>
      </aside>

      {/* CONTENT */}
      <section className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* STEP HEADER */}
        <div className="sticky top-0 z-30 bg-gradient-to-b from-[#0b0214] to-[#0b0214]/90 backdrop-blur border-b border-white/10 py-4 mb-10">
          <Stepper
            steps={steps}
            currentStep={step}
            completedSteps={completedSteps}
            onStepChange={(next) => {
              if (completedSteps.includes(next)) setStep(next);
            }}
          />
        </div>

        {/* CARD */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 max-w-4xl">
          {/* ✅ Optional error text (no UI change; just shows message if invalid) */}
          {Object.keys(errors).length > 0 && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              Please fix the required fields to continue.
            </div>
          )}

          <AnimatedStep step={step} active={1}>
            <StepProfile
              profile={profile}
              setProfile={setProfile}
              services={services}
              setServices={setServices}
              languages={languages}
              setLanguages={setLanguages}
              contactPreferences={contactPreferences}
              setContactPreferences={setContactPreferences}
              advertisement={advertisement}
              setAdvertisement={setAdvertisement}
            />

            <StepAvailability availability={availability} setAvailability={setAvailability} />
          </AnimatedStep>

          <AnimatedStep step={step} active={2}>
            <StepVerification verification={verification} setVerification={setVerification} />
          </AnimatedStep>

          <AnimatedStep step={step} active={3}>
            <StepPromotion selectedPlan={selectedPlan} setSelectedPlan={setSelectedPlan} />
          </AnimatedStep>

          <AnimatedStep step={step} active={4}>
            <StepTermsAndPayment
              selectedPlan={selectedPlan}
              acceptedTerms={acceptedTerms}
              setAcceptedTerms={setAcceptedTerms}
              profile={profile}
              services={services}
              languages={languages}
              availability={availability}
              contactPreferences={contactPreferences}
              verification={verification}
              advertisement={advertisement}
            />
          </AnimatedStep>

          {/* ACTIONS */}
          <div className="flex justify-between mt-10">
            <button
              disabled={step === 1}
              onClick={handleBack}
              className="px-6 py-3 rounded-xl border border-white/20 hover:bg-white/5 transition disabled:opacity-40"
            >
              Back
            </button>

            <button
              disabled={step === 4 || !canProceed()}
              onClick={handleNext}
              className={`px-8 py-3 rounded-xl font-semibold transition shadow-lg
    ${
      canProceed()
        ? "bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-90 shadow-purple-600/20"
        : "bg-white/10 text-white/40 cursor-not-allowed"
    }`}
            >
              {step === 3 ? "Continue to Payment" : "Next Step"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ---------------- STEPS ---------------- */

function StepProfile({
  profile,
  setProfile,
  services,
  setServices,
  languages,
  setLanguages,
  contactPreferences,
  setContactPreferences,
  advertisement,
  setAdvertisement,
}) {
  const toggleService = (service) => {
    setServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  };

  return (
    <>
      {/* SERVICES */}
      <SectionTitle title="Services Offered" />
      <Grid3>
        <Checkbox
          label="Cleaning (Jhadu Pocha)"
          checked={services.includes("cleaning")}
          onChange={() => toggleService("cleaning")}
        />
        <Checkbox
          label="Cooking"
          checked={services.includes("cooking")}
          onChange={() => toggleService("cooking")}
        />
        <Checkbox
          label="Utensil Cleaning"
          checked={services.includes("utensils")}
          onChange={() => toggleService("utensils")}
        />
        <Checkbox
          label="Elder Support"
          checked={services.includes("elder")}
          onChange={() => toggleService("elder")}
        />
        <Checkbox
          label="Full-time Maid"
          checked={services.includes("fulltime")}
          onChange={() => toggleService("fulltime")}
        />
      </Grid3>

      {/* TIP — SHOW ONLY WHEN ANY SERVICE IS SELECTED */}
      {services.length > 0 && (
        <div className="mb-6 mt-2 rounded-xl border border-pink-500/30 bg-gradient-to-r from-pink-600/10 to-purple-600/10 px-4 py-3 text-sm text-white/80">
          💡 <span className="font-medium">Tip:</span>
          Workers offering multiple services get more profile views and job requests.
        </div>
      )}

      {/* BASIC INFO */}
      <SectionTitle title="Basic Information" />
      <Grid2>
        <Input
          placeholder="Full Name"
          value={profile.fullName}
          onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
        />

        <Input
          placeholder="Profile Title (eg. Experienced Home Cook)"
          value={profile.title}
          onChange={(e) => setProfile({ ...profile, title: e.target.value })}
        />

        <Input
          placeholder="Email Address"
          value={profile.email}
          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
        />

        <Input
          placeholder="Phone Number"
          value={profile.phone}
          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
        />
      </Grid2>

      {/* ABOUT */}
      <SectionTitle title="About Me" />
      <Textarea
        placeholder="Describe your experience, skills, and work style"
        value={profile.about}
        onChange={(e) => setProfile({ ...profile, about: e.target.value })}
      />

      {/* WORKING HOURS */}
      <SectionTitle title="Working Hours" />
      <Grid2>
        <Input placeholder="Start Time (eg. 07:00)" />
        <Input placeholder="End Time (eg. 19:00)" />
      </Grid2>

      {/* CONTACT PREFERENCE */}
      <SectionTitle title="How can visitors contact you?" />
      <Grid3>
        <Checkbox
          label="Call"
          checked={contactPreferences.call}
          onChange={() =>
            setContactPreferences({ ...contactPreferences, call: !contactPreferences.call })
          }
        />

        <Checkbox
          label="WhatsApp"
          checked={contactPreferences.whatsapp}
          onChange={() =>
            setContactPreferences({
              ...contactPreferences,
              whatsapp: !contactPreferences.whatsapp,
            })
          }
        />

        <Checkbox
          label="Platform Message"
          checked={contactPreferences.platform}
          onChange={() =>
            setContactPreferences({
              ...contactPreferences,
              platform: !contactPreferences.platform,
            })
          }
        />
      </Grid3>

      {/* LOCATION */}
      <SectionTitle title="Location (Netherlands only)" />
      <Grid2>
        <Input
          placeholder="ZIP Code (eg. 1012 AB)"
          value={profile.zip}
          onChange={(e) => setProfile({ ...profile, zip: e.target.value })}
        />

        <Input
          placeholder="City"
          value={profile.city}
          onChange={(e) => setProfile({ ...profile, city: e.target.value })}
        />
      </Grid2>
      <p className="text-xs text-white/50 mb-6">Only Netherlands ZIP codes are allowed.</p>

      {/* PERSONAL DATA */}
      <SectionTitle title="Personal Data" />
      <Grid3>
        <Select
          placeholder="Gender"
          options={["Male", "Female", "Other"]}
          value={profile.gender}
          onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
        />

        <Select
          placeholder="Sex"
          options={["Man", "Woman", "Non-binary"]}
          value={profile.sex}
          onChange={(e) => setProfile({ ...profile, sex: e.target.value })}
        />

        <Input
          placeholder="Birthdate (DD-MM-YYYY)"
          value={profile.birthdate}
          onChange={(e) => setProfile({ ...profile, birthdate: e.target.value })}
        />
      </Grid3>

      {/* APPEARANCE */}
      <SectionTitle title="Appearance" />
      <Grid3>
        <Select
          placeholder="Body Type"
          options={["Slim", "Average", "Athletic", "Curvy"]}
          value={profile.bodyType}
          onChange={(e) => setProfile({ ...profile, bodyType: e.target.value })}
        />

        <Select
          placeholder="Hair Color"
          options={["Black", "Brown", "Blonde", "Red", "Other"]}
          value={profile.hairColor}
          onChange={(e) => setProfile({ ...profile, hairColor: e.target.value })}
        />

        <Input
          placeholder="Height (cm)"
          value={profile.heightCm}
          onChange={(e) => setProfile({ ...profile, heightCm: e.target.value })}
        />
      </Grid3>

      {/* LANGUAGES */}
      <SectionTitle title="Languages Spoken" />
      <Grid3>
        <Checkbox
          label="English"
          checked={languages.includes("English")}
          onChange={() =>
            setLanguages((prev) =>
              prev.includes("English") ? prev.filter((l) => l !== "English") : [...prev, "English"]
            )
          }
        />
        <Checkbox
          label="Dutch"
          checked={languages.includes("Dutch")}
          onChange={() =>
            setLanguages((prev) =>
              prev.includes("Dutch") ? prev.filter((l) => l !== "Dutch") : [...prev, "Dutch"]
            )
          }
        />
        <Checkbox
          label="Hindi"
          checked={languages.includes("Hindi")}
          onChange={() =>
            setLanguages((prev) =>
              prev.includes("Hindi") ? prev.filter((l) => l !== "Hindi") : [...prev, "Hindi"]
            )
          }
        />

        <Checkbox
          label="Arabic"
          checked={languages.includes("Arabic")}
          onChange={() =>
            setLanguages((prev) =>
              prev.includes("Arabic") ? prev.filter((l) => l !== "Arabic") : [...prev, "Arabic"]
            )
          }
        />
        <Checkbox
          label="Other"
          checked={languages.includes("Other")}
          onChange={() =>
            setLanguages((prev) =>
              prev.includes("Other") ? prev.filter((l) => l !== "Other") : [...prev, "Other"]
            )
          }
        />
      </Grid3>

      {/* ADVERTISEMENT */}
      <SectionTitle title="Advertisement Preview" />
      <Input
        placeholder="Promo sticker (max 15 characters)"
        value={advertisement.promoSticker}
        onChange={(e) => setAdvertisement({ promoSticker: e.target.value })}
      />

      <div className="mt-6 bg-black/40 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
        <div className="w-24 h-24 bg-white/10 rounded-xl flex items-center justify-center text-white/40">
          Photo
        </div>
        <div className="flex-1">
          <p className="font-semibold">Your Name</p>
          <p className="text-sm text-white/70">Profile Title</p>
          <p className="text-xs text-white/50 mt-1">Available • City • Call now</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-green-600 text-sm">Call now</button>
      </div>
    </>
  );
}

function StepAvailability({ availability, setAvailability }) {
  return (
    <>
      <SectionTitle title="Working Days" />
      <Grid cols={4}>
        <Checkbox
          label="Monday"
          checked={availability.workingDays.includes("Monday")}
          onChange={() =>
            setAvailability((prev) => ({
              ...prev,
              workingDays: prev.workingDays.includes("Monday")
                ? prev.workingDays.filter((d) => d !== "Monday")
                : [...prev.workingDays, "Monday"],
            }))
          }
        />
        <Checkbox
          label="Tuesday"
          checked={availability.workingDays.includes("Tuesday")}
          onChange={() =>
            setAvailability((prev) => ({
              ...prev,
              workingDays: prev.workingDays.includes("Tuesday")
                ? prev.workingDays.filter((d) => d !== "Tuesday")
                : [...prev.workingDays, "Tuesday"],
            }))
          }
        />
        <Checkbox
          label="Wednesday"
          checked={availability.workingDays.includes("Wednesday")}
          onChange={() =>
            setAvailability((prev) => ({
              ...prev,
              workingDays: prev.workingDays.includes("Wednesday")
                ? prev.workingDays.filter((d) => d !== "Wednesday")
                : [...prev.workingDays, "Wednesday"],
            }))
          }
        />
        <Checkbox
          label="Thursday"
          checked={availability.workingDays.includes("Thursday")}
          onChange={() =>
            setAvailability((prev) => ({
              ...prev,
              workingDays: prev.workingDays.includes("Thursday")
                ? prev.workingDays.filter((d) => d !== "Thursday")
                : [...prev.workingDays, "Thursday"],
            }))
          }
        />
        <Checkbox
          label="Friday"
          checked={availability.workingDays.includes("Friday")}
          onChange={() =>
            setAvailability((prev) => ({
              ...prev,
              workingDays: prev.workingDays.includes("Friday")
                ? prev.workingDays.filter((d) => d !== "Friday")
                : [...prev.workingDays, "Friday"],
            }))
          }
        />
        <Checkbox
          label="Saturday"
          checked={availability.workingDays.includes("Saturday")}
          onChange={() =>
            setAvailability((prev) => ({
              ...prev,
              workingDays: prev.workingDays.includes("Saturday")
                ? prev.workingDays.filter((d) => d !== "Saturday")
                : [...prev.workingDays, "Saturday"],
            }))
          }
        />

        <Checkbox
          label="Sunday"
          checked={availability.workingDays.includes("Sunday")}
          onChange={() =>
            setAvailability((prev) => ({
              ...prev,
              workingDays: prev.workingDays.includes("Sunday")
                ? prev.workingDays.filter((d) => d !== "Sunday")
                : [...prev.workingDays, "Sunday"],
            }))
          }
        />
      </Grid>

      <SectionTitle title="Working Hours" />
      <Grid cols={2}>
        <Input
          placeholder="Start Time (eg. 7:00 AM)"
          value={availability.startTime}
          onChange={(e) => setAvailability({ ...availability, startTime: e.target.value })}
        />
        <Input
          placeholder="End Time (eg. 7:00 PM)"
          value={availability.endTime}
          onChange={(e) => setAvailability({ ...availability, endTime: e.target.value })}
        />
      </Grid>
    </>
  );
}

function StepPhotos() {
  return (
    <>
      <SectionTitle title="Upload Photos (Minimum 2)" />
      <div className="flex gap-4 flex-wrap">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-32 h-32 border border-dashed border-white/20 rounded-xl flex items-center justify-center text-white/50"
          >
            + Add
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-white/60">Clear face photos increase chances of getting jobs.</p>
    </>
  );
}

function StepPreview() {
  return (
    <>
      <SectionTitle title="Profile Preview" />
      <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
        <p className="text-lg font-semibold mb-2">Worker Name</p>
        <p className="text-white/70 mb-4">Experienced Home Cook</p>
        <p className="text-sm text-white/60">Available: Mon – Sat • City Area</p>
      </div>
    </>
  );
}

/* ---------------- COMPONENTS ---------------- */

function StepBadge({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm transition ${
        active
          ? "bg-gradient-to-r from-pink-600 to-purple-600 font-semibold"
          : "bg-white/10 text-white/60 hover:bg-white/20"
      }`}
    >
      {children}
    </button>
  );
}

function SectionTitle({ title }) {
  return (
    <h3 className="text-lg font-semibold mb-4 mt-8 border-b border-white/10 pb-2">{title}</h3>
  );
}

function Grid({ cols, children }) {
  return <div className={`grid md:grid-cols-${cols} gap-6 mb-6`}>{children}</div>;
}

function Input({ placeholder, value, onChange }) {
  return (
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500/20"
    />
  );
}

function Textarea({ placeholder, value, onChange }) {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full h-28 mb-6 bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none"
    />
  );
}

function Checkbox({ label, checked = false, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange || (() => {})}
        className="accent-pink-500"
      />
      {label}
    </label>
  );
}

function Stepper({ steps, currentStep, completedSteps, onStepChange }) {
  return (
    <div className="flex w-full overflow-hidden rounded-xl border border-white/10">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = completedSteps.includes(step.id);
        const isLocked = !isCompleted && step.id !== currentStep;

        return (
          <button
            key={step.id}
            disabled={isLocked}
            onClick={() => onStepChange(step.id)}
            className={`
              relative flex-1 px-6 py-4 text-sm font-medium text-left transition
              ${
                isActive
                  ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white"
                  : isCompleted
                  ? "bg-white/10 text-white hover:bg-white/20"
                  : "bg-black/40 text-white/40 cursor-not-allowed"
              }
            `}
          >
            <span className="relative z-10">
              {step.id}. {step.title}
            </span>

            {index !== steps.length - 1 && (
              <span
                className={`
                  absolute right-0 top-0 h-full w-6
                  ${isActive ? "bg-gradient-to-r from-pink-600 to-purple-600" : isCompleted ? "bg-white/10" : "bg-black/40"}
                `}
                style={{
                  clipPath: "polygon(0 0, 100% 50%, 0 100%)",
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

function AnimatedStep({ step, active, children }) {
  if (step !== active) return null;
  return <div className="animate-fade-slide">{children}</div>;
}

function SidebarSection({ title, children }) {
  return (
    <div className="mb-8">
      <div className="text-xs uppercase text-white/40 mb-3 tracking-wider">{title}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function SidebarItem({ label, active, description }) {
  return (
    <div
      className={`
        relative rounded-xl px-4 py-3 cursor-pointer transition
        ${active ? "bg-gradient-to-r from-pink-600/20 to-purple-600/20" : "hover:bg-white/5"}
      `}
    >
      {/* Active Indicator */}
      {active && (
        <span className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-gradient-to-b from-pink-600 to-purple-600" />
      )}

      <div className="font-medium">{label}</div>
      {description && <div className="text-xs text-white/50 mt-1">{description}</div>}
    </div>
  );
}

function Grid2({ children }) {
  return <div className="grid md:grid-cols-2 gap-6 mb-6">{children}</div>;
}

function Grid3({ children }) {
  return <div className="grid md:grid-cols-3 gap-6 mb-6">{children}</div>;
}

function Select({ placeholder, options, value, onChange }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none text-white"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function StepVerification({ verification, setVerification }) {
  return (
    <>
      {/* PHONE VERIFICATION */}
      <SectionTitle title="Phone Number Verification" />
      <p className="text-sm text-white/70 mb-4">
        Before your profile can be activated, please verify your phone number.
      </p>

      <div className="flex gap-4 mb-8">
        <select
          value={verification.phoneCountry}
          onChange={(e) => setVerification({ ...verification, phoneCountry: e.target.value })}
        />
        <input
          placeholder="Phone number"
          value={verification.phoneNumber}
          onChange={(e) => setVerification({ ...verification, phoneNumber: e.target.value })}
        />

        <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 font-semibold">
          Send SMS
        </button>
      </div>

      {/* PERSONAL VERIFICATION */}
      <SectionTitle title="Personal Verification" />
      <p className="text-sm text-white/70 mb-6">
        To protect visitors and ensure genuine profiles, we require two verification photos.
      </p>

      <div className="space-y-6">
        {/* PHOTO 1 */}
        <VerificationCard
          number={1}
          title="Identity Photo"
          description="Upload a clear photo of yourself holding a Dutch newspaper or receipt with today’s date visible."
        />

        {/* PHOTO 2 */}
        <VerificationCard
          number={2}
          title="Full Body Photo"
          description="Upload an unedited photo where your body is visible at least up to your waist."
        />
      </div>
    </>
  );
}

function VerificationCard({ number, title, description }) {
  return (
    <div className="flex gap-6 bg-black/40 border border-white/10 rounded-2xl p-4">
      {/* DEMO IMAGE PLACEHOLDER */}
      <div className="relative w-28 h-28 bg-white/10 rounded-xl flex items-center justify-center">
        {/* Step number */}
        <span className="absolute top-2 left-2 text-xs bg-black/60 px-2 py-0.5 rounded">
          {number}
        </span>

        {/* Demo Icon */}
        <svg
          className="w-12 h-12 text-white/40"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h18M3 19h18M5 5v14M19 5v14M9 12h6" />
        </svg>

        {/* Plus icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl text-white/40">+</span>
        </div>
      </div>

      {/* TEXT */}
      <div className="flex-1">
        <p className="font-semibold mb-1">{title}</p>
        <p className="text-sm text-white/60 mb-3">{description}</p>

        <button className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/5 transition">
          Upload Photo
        </button>
      </div>
    </div>
  );
}

function StepPromotion({ selectedPlan, setSelectedPlan }) {
  return (
    <>
      {/* HEADER */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-2">Promote Your Profile</h2>
        <p className="text-white/60">
          Increase visibility and get more job requests by choosing a promotion plan.
        </p>
      </div>

      {/* PRICING GRID */}
      <div className="grid md:grid-cols-3 gap-8 mb-14">
        {/* STANDARD */}
        <PremiumCard
          title="Standard"
          price="Free"
          subtitle="Basic visibility"
          active={selectedPlan === "standard"}
          onSelect={() => setSelectedPlan("standard")}
          features={["Profile visible in listings", "Limited exposure", "No promotion boost"]}
        />

        {/* PREMIUM */}
        <PremiumCard
          title="Premium"
          price="€6.49 / day"
          subtitle="Most popular"
          highlight
          active={selectedPlan === "premium"}
          onSelect={() => setSelectedPlan("premium")}
          features={[
            "Higher placement in search",
            "Direct contact visibility",
            "Unlimited photos & videos",
            "Better profile exposure",
          ]}
        />

        {/* EXCLUSIVE */}
        <PremiumCard
          title="Exclusive"
          price="€11.95 / day"
          subtitle="Maximum exposure"
          active={selectedPlan === "exclusive"}
          onSelect={() => setSelectedPlan("exclusive")}
          features={[
            "Top position in listings",
            "Highlighted profile badge",
            "Rotating promotion image",
            "Maximum daily visibility",
          ]}
        />
      </div>

      {/* SELECTED PLAN SUMMARY */}
      {selectedPlan && (
        <div className="rounded-2xl border border-pink-500/30 bg-gradient-to-r from-pink-600/10 to-purple-600/10 p-6">
          <p className="text-sm text-white/60 mb-1">Selected plan</p>
          <p className="text-xl font-semibold capitalize">{selectedPlan}</p>
        </div>
      )}
      {!selectedPlan && (
        <div className="mt-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
          ⚠ Please select a promotion plan to continue.
        </div>
      )}
    </>
  );
}

function PromoCard({ title, price, features, active, onSelect, highlight }) {
  return (
    <div
      className={`
        relative rounded-2xl border p-6 transition
        ${
          active
            ? "border-pink-500 bg-gradient-to-b from-pink-600/20 to-purple-600/10"
            : "border-white/10 bg-black/40"
        }
      `}
    >
      {highlight && (
        <span className="absolute -top-3 right-4 text-xs bg-pink-600 px-3 py-1 rounded-full">
          Popular
        </span>
      )}

      <h3 className="text-xl font-semibold mb-1">{title}</h3>
      <p className="text-white/70 mb-4">{price}</p>

      <ul className="space-y-2 mb-6">
        {features.map((f, i) => (
          <li key={i} className={`text-sm ${f.ok ? "text-white" : "text-white/40"}`}>
            {f.ok ? "✔" : "✖"} {f.label}
          </li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        className={`w-full py-2 rounded-xl font-semibold transition ${
          active ? "bg-gradient-to-r from-pink-600 to-purple-600" : "border border-white/20 hover:bg-white/5"
        }`}
      >
        {active ? "Selected" : "Choose"}
      </button>
    </div>
  );
}

function PremiumCard({ title, price, subtitle, features, active, onSelect, highlight }) {
  return (
    <div
      className={`
        relative rounded-3xl p-6 border transition-all duration-300
        ${
          active
            ? "border-pink-500 bg-gradient-to-b from-pink-600/20 to-purple-600/10 shadow-xl shadow-pink-600/20 scale-[1.02]"
            : "border-white/10 bg-black/40 hover:scale-[1.02]"
        }
      `}
    >
      {/* BADGE */}
      {highlight && (
        <span className="absolute -top-3 right-6 text-xs bg-gradient-to-r from-pink-600 to-purple-600 px-3 py-1 rounded-full shadow">
          Most Popular
        </span>
      )}

      {/* TITLE */}
      <h3 className="text-xl font-semibold mb-1">{title}</h3>
      <p className="text-white/60 text-sm mb-4">{subtitle}</p>

      {/* PRICE */}
      <div className="text-3xl font-bold mb-6">{price}</div>

      {/* FEATURES */}
      <ul className="space-y-3 mb-8">
        {features.map((f, i) => (
          <li key={i} className="text-sm text-white/80 flex gap-2">
            <span className="text-pink-400">✔</span> {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={onSelect}
        className={`w-full py-3 rounded-xl font-semibold transition ${
          active ? "bg-gradient-to-r from-pink-600 to-purple-600 shadow-lg" : "border border-white/20 hover:bg-white/5"
        }`}
      >
        {active ? "Selected" : "Choose Plan"}
      </button>
    </div>
  );
}

function StepTermsAndPayment({
  selectedPlan,
  acceptedTerms,
  setAcceptedTerms,
  profile,
  services,
  languages,
  availability,
  contactPreferences,
  verification,
  advertisement,
}) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const prices = {
    standard: "Free",
    premium: "€6.49 / day",
    exclusive: "€11.95 / day",
  };

  const handleSaveAndPay = async () => {
    setMsg("");

    if (!selectedPlan) {
      setMsg("Please select a plan first.");
      return;
    }
    if (!acceptedTerms) {
      setMsg("Please accept Terms & Conditions.");
      return;
    }
    if (!profile.email) {
      setMsg("Email is required (Step 1).");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        profile,
        services,
        languages,
        availability,
        contactPreferences,
        verification,
        advertisement,
        promotionPlan: selectedPlan,
        acceptedTerms,
      };

      const res = await fetch("/api/worker/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data?.ok) {
        setMsg(data?.message || "Failed to save. Try again.");
        return;
      }

      // ✅ Next step will be payment integration later
      setMsg("Saved ✅ Now redirecting to payment...");
      // window.location.href = `/payment?workerId=${data.workerId}`; // later
    } catch (e) {
      setMsg("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!selectedPlan) {
    return <div className="text-white/60">Please select a promotion plan to continue.</div>;
  }

  return (
    <>
      <h2 className="text-2xl font-semibold mb-2">Terms & Payment</h2>
      <p className="text-white/60 mb-8">
        Review your selection and agree to the terms before proceeding to payment.
      </p>

      <div className="mb-8 rounded-2xl border border-pink-500/30 bg-gradient-to-r from-pink-600/10 to-purple-600/10 p-6">
        <p className="text-sm text-white/60 mb-1">Selected Plan</p>
        <p className="text-xl font-semibold capitalize">{selectedPlan}</p>
        <p className="text-white/70 mt-1">Price: {prices[selectedPlan]}</p>
      </div>

      <div className="bg-black/40 border border-white/10 rounded-2xl p-6 mb-8 max-h-64 overflow-y-auto text-sm text-white/70 space-y-4">
        <p>By purchasing a promotion plan, you agree your advertisement will be visible as per plan rules.</p>
        <p>Payments are non-refundable once the promotion has started.</p>
        <p>Misuse or fake info may result in suspension without refund.</p>
        <p>The platform reserves the right to review and approve all profiles.</p>
      </div>

      <label className="flex items-center gap-3 text-sm mb-6 cursor-pointer">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={() => setAcceptedTerms(!acceptedTerms)}
          className="accent-pink-500"
        />
        I agree to the Terms & Conditions
      </label>

      {msg && (
        <div className="mb-6 text-sm text-white/70 border border-white/10 bg-white/5 rounded-xl px-4 py-3">
          {msg}
        </div>
      )}

      <button
        onClick={handleSaveAndPay}
        disabled={!acceptedTerms || loading}
        className={`w-full py-4 rounded-xl font-semibold transition ${
          acceptedTerms && !loading
            ? "bg-gradient-to-r from-pink-600 to-purple-600 shadow-lg"
            : "bg-white/10 text-white/40 cursor-not-allowed"
        }`}
      >
        {loading ? "Saving..." : "Save & Proceed to Payment"}
      </button>
    </>
  );
}

// /components/ActivateRankForm.jsx
import { useState } from "react";

export default function ActivateRankForm({ workerId }) {
  const [paymentToken, setPaymentToken] = useState("");
  const [rankDuration, setRankDuration] = useState(7); // Default to 7 days

  async function handleSubmit() {
    const res = await fetch(`/api/workers/${workerId}/activate-rank`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentToken, rankDuration }),
    });
    const data = await res.json();
    if (data.ok) {
      alert("Paid rank activated successfully!");
    } else {
      alert("Error activating rank");
    }
  }

  return (
    <div>
      <h2>Activate Paid Rank</h2>
      <div>
        <label>Rank Duration (days):</label>
        <input
          type="number"
          value={rankDuration}
          onChange={(e) => setRankDuration(Number(e.target.value))}
        />
      </div>
      {/* Add a Stripe/PayPal button here to get a payment token */}
      <button onClick={handleSubmit}>Activate Rank</button>
    </div>
  );
}

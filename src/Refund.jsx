import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function Refund() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 20, maxWidth: 720, margin: "0 auto" }}>
      <button onClick={() => navigate(-1)}>← Back</button>

      <h1>Refund Policy</h1>

      <p><strong>Last updated:</strong> {new Date().toLocaleDateString()}</p>

      <h3>1. Digital Products</h3>
      <p>
        All purchases on this platform are for digital content (coins, chapters, or VIP access).
        Once a purchase is completed and content is accessible, it is considered delivered instantly.
      </p>

      <h3>2. No Refund After Access</h3>
      <p>
        Due to the nature of digital content, all sales are final once:
      </p>
      <ul>
        <li>Coins have been credited to your account</li>
        <li>Chapters have been unlocked</li>
        <li>VIP access has been activated</li>
      </ul>
      <p>
        We do not offer refunds for change of mind or accidental purchases after content has been accessed.
      </p>

      <h3>3. Eligible Refund Cases</h3>
      <p>
        Refunds may be considered only in the following situations:
      </p>
      <ul>
        <li>Duplicate payments</li>
        <li>Technical issues preventing access to purchased content</li>
        <li>Unauthorized transactions (subject to verification)</li>
      </ul>

      <h3>4. Contact Before Disputes</h3>
      <p>
        If you experience any issue, please contact our support team before opening a PayPal or bank dispute.
        We are committed to resolving issues quickly and fairly.
      </p>

      <h3>5. Abuse & Fraud Prevention</h3>
      <p>
        Accounts that attempt to abuse the refund system, including repeated refund requests after content access,
        may be restricted or permanently suspended.
      </p>

      <h3>6. Processing Time</h3>
      <p>
        Approved refunds will be processed within 3–7 business days to the original payment method.
      </p>

      <h3>7. Contact Us</h3>
      <p>
        For refund requests, please contact us via the Feedback Center inside the app.
      </p>
    </div>
  );
}

export default Refund;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, Send } from "lucide-react";
import BottomNav from "./BottomNav";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function Feedback() {
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/user/me`, {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          return;
        }

        if (data?.user?.email) {
          setEmail(data.user.email);
        }
      } catch (err) {
        console.error("loadUser error:", err);
      }
    };

    loadUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedMessage = message.trim();
    const trimmedEmail = email.trim();

    setError("");
    setSubmitSuccess(false);

    if (!trimmedMessage) {
      setError("Please enter your feedback.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/api/feedback`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedMessage,
          email: trimmedEmail,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.error || "Failed to submit feedback.");
        return;
      }

      setSubmitSuccess(true);
      setMessage("");
    } catch (err) {
      console.error("submit feedback error:", err);
      setError("Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #0f172a 0%, #111827 45%, #0b1120 100%)",
        color: "#fff",
        paddingBottom: "90px",
      }}
    >
      <div
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          padding: "20px 16px 32px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "18px",
          }}
        >
          <button
            onClick={() => navigate("/my")}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <div
              style={{
                fontSize: "22px",
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              Feedback Center
            </div>
            <div
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.65)",
                marginTop: "2px",
              }}
            >
              Share bugs, suggestions, or feature requests
            </div>
          </div>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
            padding: "18px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "14px",
                background: "rgba(168,85,247,0.16)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#d8b4fe",
              }}
            >
              <MessageSquare size={20} />
            </div>

            <div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                }}
              >
                Tell us what you think
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.65)",
                  marginTop: "2px",
                  lineHeight: 1.5,
                }}
              >
                Your feedback helps us improve reading experience, unlock flow,
                payments, and app features.
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
            padding: "18px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          }}
        >
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 600,
                marginBottom: "8px",
                color: "rgba(255,255,255,0.9)",
              }}
            >
              Feedback Message
            </label>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what you like, what is confusing, what is not working, or what feature you want next..."
              rows={8}
              maxLength={2000}
              style={{
                width: "100%",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.04)",
                color: "#fff",
                padding: "14px 15px",
                fontSize: "14px",
                lineHeight: 1.6,
                outline: "none",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />

            <div
              style={{
                marginTop: "8px",
                fontSize: "12px",
                color: "rgba(255,255,255,0.5)",
                textAlign: "right",
              }}
            >
              {message.length}/2000
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 600,
                marginBottom: "8px",
                color: "rgba(255,255,255,0.9)",
              }}
            >
              Email (Optional)
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email if you want us to contact you"
              style={{
                width: "100%",
                height: "48px",
                borderRadius: "14px",
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.04)",
                color: "#fff",
                padding: "0 14px",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {error ? (
            <div
              style={{
                marginBottom: "14px",
                borderRadius: "14px",
                padding: "12px 14px",
                background: "rgba(239,68,68,0.14)",
                border: "1px solid rgba(239,68,68,0.22)",
                color: "#fecaca",
                fontSize: "13px",
                lineHeight: 1.5,
              }}
            >
              {error}
            </div>
          ) : null}

          {submitSuccess ? (
            <div
              style={{
                marginBottom: "14px",
                borderRadius: "14px",
                padding: "12px 14px",
                background: "rgba(34,197,94,0.14)",
                border: "1px solid rgba(34,197,94,0.22)",
                color: "#bbf7d0",
                fontSize: "13px",
                lineHeight: 1.5,
              }}
            >
              Thank you. Your feedback has been submitted successfully.
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              height: "50px",
              border: "none",
              borderRadius: "14px",
              background: submitting
                ? "rgba(168,85,247,0.45)"
                : "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)",
              color: "#fff",
              fontSize: "15px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              cursor: submitting ? "not-allowed" : "pointer",
              boxShadow: submitting
                ? "none"
                : "0 10px 24px rgba(124,58,237,0.28)",
            }}
          >
            <Send size={16} />
            {submitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}

export default Feedback;
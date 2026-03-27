import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Shield, Receipt } from "lucide-react";
import BottomNav from "./BottomNav";

function Settings() {
  const navigate = useNavigate();

  const items = [
    {
      icon: <FileText size={20} />,
      label: "Terms of Service",
      onClick: () => navigate("/terms"),
    },
    {
      icon: <Shield size={20} />,
      label: "Privacy Policy",
      onClick: () => navigate("/privacy"),
    },
    {
      icon: <Receipt size={20} />,
      label: "Refund Policy",
      onClick: () => navigate("/refund"),
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        color: "#111",
        paddingBottom: "90px",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "16px",
            fontSize: "20px",
            fontWeight: "600",
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              marginRight: "12px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            <ArrowLeft />
          </button>
          Setting
        </div>

        {/* List */}
        <div>
          {items.map((item, index) => (
            <div
              key={index}
              onClick={item.onClick}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "18px 16px",
                borderBottom: "1px solid #eee",
                cursor: "pointer",
              }}
            >
              <div style={{ marginRight: 16 }}>{item.icon}</div>
              <div style={{ fontSize: 16 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

export default Settings;
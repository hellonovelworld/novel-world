import { useNavigate } from "react-router-dom";
import { Home as HomeIcon, Library, User } from "lucide-react";

function BottomNav({ active = "home" }) {
  const navigate = useNavigate();

  return (
    <div style={styles.bottomNav}>
      <button
        style={active === "home" ? styles.navItemActive : styles.navItem}
        onClick={() => navigate("/")}
      >
        <HomeIcon size={22} />
        <span
          style={active === "home" ? styles.navLabelActive : styles.navLabel}
        >
          Home
        </span>
      </button>

      <button
        style={active === "bookshelf" ? styles.navItemActive : styles.navItem}
        onClick={() => navigate("/bookshelf")}
      >
        <Library size={22} />
        <span
          style={
            active === "bookshelf" ? styles.navLabelActive : styles.navLabel
          }
        >
          Bookshelf
        </span>
      </button>

      <button
        style={active === "my" ? styles.navItemActive : styles.navItem}
        onClick={() => navigate("/my")}
      >
        <User size={22} />
        <span
          style={active === "my" ? styles.navLabelActive : styles.navLabel}
        >
          My
        </span>
      </button>
    </div>
  );
}

const styles = {
  bottomNav: {
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: "430px",
    height: "60px",
    background: "#fff",
    borderTop: "1px solid #eee",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    zIndex: 50,
  },

  navItem: {
    border: "none",
    background: "transparent",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: "#bbb",
    fontSize: "10px",
    cursor: "pointer",
  },

  navItemActive: {
    border: "none",
    background: "transparent",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: "#111",
    fontSize: "10px",
    cursor: "pointer",
  },

  navLabel: {
    color: "#bbb",
    fontSize: "10px",
  },

  navLabelActive: {
    color: "#111",
    fontSize: "10px",
    fontWeight: "600",
  },
};

export default BottomNav;
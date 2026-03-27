import { useNavigate } from "react-router-dom";

function Privacy() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => navigate(-1)}>Back</button>
      <h1>Privacy Policy</h1>
      <p>Privacy page</p>
    </div>
  );
}

export default Privacy;
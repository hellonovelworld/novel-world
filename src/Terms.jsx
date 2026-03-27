import { useNavigate } from "react-router-dom";

function Terms() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => navigate(-1)}>Back</button>
      <h1>Terms of Service</h1>
      <p>Terms page</p>
    </div>
  );
}

export default Terms;
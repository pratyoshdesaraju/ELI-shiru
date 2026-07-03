import { useState } from "react";

const EXPLANATION_LEVELS = ["ELI1", "ELI5", "ELI10", "ELI15"];

function App() {
  const [question, setQuestion] = useState("");
  const [level, setLevel] = useState("ELI5");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
  event.preventDefault();

  if (!question.trim()) {
    return;
  }

  setIsLoading(true);
  setResponse("");

  try {
    const res = await fetch("http://127.0.0.1:8000/explain", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        level,
      }),
    });

    if (!res.ok) {
      throw new Error(`Backend error: ${res.status}`);
    }

    const data = await res.json();
    setResponse(data.explanation || "No explanation returned.");
  } catch (err) {
    console.error(err);
    setResponse(
      "Sorry, something went wrong talking to the backend. Check the console and that uvicorn is running."
    );
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        color: "#e5e7eb",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        padding: "2rem",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ maxWidth: "800px", width: "100%" }}>
        <header style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>
            eli‑shiru · Phase 1
          </h1>
          <p style={{ fontSize: "0.95rem", color: "#9ca3af" }}>
            Ask about a topic and choose how deep you want the explanation.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            marginBottom: "1.5rem",
          }}
        >
          <label style={{ fontSize: "0.9rem" }}>
            Topic or question
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              style={{
                marginTop: "0.35rem",
                width: "100%",
                padding: "0.6rem",
                borderRadius: "0.5rem",
                border: "1px solid #374151",
                backgroundColor: "#020617",
                color: "#e5e7eb",
                resize: "vertical",
              }}
              placeholder="e.g., Explain database transactions"
            />
          </label>

          <label style={{ fontSize: "0.9rem" }}>
            Explanation level
            <div style={{ marginTop: "0.35rem", display: "flex", gap: "0.5rem" }}>
              {EXPLANATION_LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevel(lvl)}
                  style={{
                    padding: "0.45rem 0.9rem",
                    borderRadius: "9999px",
                    border:
                      level === lvl ? "1px solid #38bdf8" : "1px solid #374151",
                    backgroundColor:
                      level === lvl ? "#0f766e" : "transparent",
                    color: "#e5e7eb",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </label>

          <button
            type="submit"
            disabled={!question.trim() || isLoading}
            style={{
              marginTop: "0.75rem",
              alignSelf: "flex-start",
              padding: "0.55rem 1.1rem",
              borderRadius: "0.5rem",
              border: "none",
              backgroundColor: isLoading ? "#4b5563" : "#38bdf8",
              color: "#020617",
              fontWeight: 600,
              fontSize: "0.95rem",
              cursor: isLoading ? "default" : "pointer",
            }}
          >
            {isLoading ? "Thinking…" : "Ask eli‑shiru"}
          </button>
        </form>

        <section>
          <h2 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
            Explanation
          </h2>
          <div
            style={{
              minHeight: "150px",
              padding: "0.9rem",
              borderRadius: "0.75rem",
              border: "1px solid #374151",
              backgroundColor: "#020617",
              whiteSpace: "pre-wrap",
              fontSize: "0.95rem",
              color: response ? "#e5e7eb" : "#6b7280",
            }}
          >
            {response || "Your explanation will appear here."}
          </div>
          <p
            style={{
              marginTop: "0.4rem",
              fontSize: "0.8rem",
              color: "#9ca3af",
            }}
          >
            Level selected: <strong>{level}</strong>
          </p>
        </section>
      </div>
    </div>
  );
}

export default App;
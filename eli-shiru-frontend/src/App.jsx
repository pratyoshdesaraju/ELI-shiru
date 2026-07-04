// App.jsx
import { useState, useEffect } from "react";

const EXPLANATION_LEVELS = ["ELI1", "ELI5", "ELI10", "ELI15"];

function App() {
  const [question, setQuestion] = useState("");
  const [level, setLevel] = useState("ELI5");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = "ELI-Shiru";
  }, []);

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
        width: "100vw",
        position: "relative",
        overflow: "auto",
        background:
          "linear-gradient(135deg, #0a0f1f 0%, #05070f 50%, #0a0f1f 100%)",
        color: "#f1f5f9",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(4vw, 6vh) scale(1.1); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-5vw, -4vh) scale(1.15); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(3vw, -5vh) scale(0.95); }
        }
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        ::placeholder { color: rgba(148, 163, 184, 0.5); }
      `}</style>

      {/* Layered ambient orbs — increased intensity + animation */}
      <div
        style={{
          position: "fixed",
          top: "-15%",
          left: "-10%",
          width: "50vw",
          height: "50vw",
          borderRadius: "50%",
          background: "rgba(56, 189, 248, 0.4)",
          filter: "blur(100px)",
          animation: "float1 18s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "-20%",
          right: "-15%",
          width: "55vw",
          height: "55vw",
          borderRadius: "50%",
          background: "rgba(139, 92, 246, 0.4)",
          filter: "blur(120px)",
          animation: "float2 22s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "40%",
          left: "50%",
          width: "35vw",
          height: "35vw",
          borderRadius: "50%",
          background: "rgba(6, 182, 212, 0.3)",
          filter: "blur(110px)",
          animation: "float3 15s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "10%",
          right: "10%",
          width: "25vw",
          height: "25vw",
          borderRadius: "50%",
          background: "rgba(236, 72, 153, 0.25)",
          filter: "blur(100px)",
          animation: "float3 20s ease-in-out infinite reverse",
          pointerEvents: "none",
        }}
      />

      {/* Grain/noise overlay for extra glass texture */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)",
          backgroundSize: "3px 3px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: "1100px",
          minHeight: "100vh",
          padding: "clamp(1.5rem, 5vw, 4rem)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          zIndex: 1,
          position: "relative",
        }}
      >
        {/* Header */}
        <header style={{ marginBottom: "2.5rem", textAlign: "center" }}>
          <h1
            style={{
              fontSize: "clamp(2.4rem, 5.5vw, 3.8rem)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.3,
              padding: "0.15em 0",
              marginBottom: "0.5rem",
              display: "inline-block",
              backgroundImage:
                "linear-gradient(120deg, #ffffff 0%, #93c5fd 25%, #c4b5fd 50%, #38bdf8 75%, #ffffff 100%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "shimmer 6s linear infinite",
              filter: "drop-shadow(0 0 30px rgba(56, 189, 248, 0.35))",
            }}
          >
            ELI-Shiru
          </h1>
          <p
            style={{
              fontSize: "1.05rem",
              color: "rgba(226, 232, 240, 0.65)",
              fontWeight: 400,
            }}
          >
            Ask about a topic and choose how deep you want the explanation.
          </p>
        </header>

        {/* Glass Form Card */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
            padding: "2.25rem",
            borderRadius: "2rem",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)",
            backdropFilter: "blur(40px) saturate(200%)",
            WebkitBackdropFilter: "blur(40px) saturate(200%)",
            border: "1px solid rgba(255, 255, 255, 0.18)",
            boxShadow:
              "0 8px 40px rgba(0, 0, 0, 0.45), 0 1.5px 0 rgba(255,255,255,0.25) inset, 0 -1px 0 rgba(255,255,255,0.05) inset",
            marginBottom: "2rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* top specular sheen */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
              pointerEvents: "none",
            }}
          />

          <label style={{ fontSize: "0.95rem", fontWeight: 500 }}>
            Topic or question
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={4}
              style={{
                marginTop: "0.6rem",
                width: "100%",
                padding: "1rem 1.1rem",
                borderRadius: "1.2rem",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                backgroundColor: "rgba(2, 6, 23, 0.45)",
                backdropFilter: "blur(10px)",
                color: "#f1f5f9",
                resize: "vertical",
                fontSize: "1rem",
                outline: "none",
                fontFamily: "inherit",
                transition: "border-color 0.25s ease, box-shadow 0.25s ease",
                boxSizing: "border-box",
                boxShadow: "inset 0 2px 8px rgba(0,0,0,0.3)",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(56, 189, 248, 0.7)";
                e.target.style.boxShadow =
                  "0 0 0 5px rgba(56, 189, 248, 0.2), inset 0 2px 8px rgba(0,0,0,0.3)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255, 255, 255, 0.18)";
                e.target.style.boxShadow = "inset 0 2px 8px rgba(0,0,0,0.3)";
              }}
              placeholder="e.g., Explain database transactions"
            />
          </label>

          <label style={{ fontSize: "0.95rem", fontWeight: 500 }}>
            Explanation level
            <div
              style={{
                marginTop: "0.6rem",
                display: "flex",
                gap: "0.65rem",
                flexWrap: "wrap",
              }}
            >
              {EXPLANATION_LEVELS.map((lvl) => {
                const active = level === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    aria-pressed={active}
                    style={{
                      padding: "0.6rem 1.3rem",
                      borderRadius: "9999px",
                      border: active
                        ? "1px solid rgba(56, 189, 248, 0.9)"
                        : "1px solid rgba(255, 255, 255, 0.18)",
                      background: active
                        ? "linear-gradient(135deg, rgba(56,189,248,0.45), rgba(139,92,246,0.45))"
                        : "rgba(255, 255, 255, 0.07)",
                      backdropFilter: "blur(16px) saturate(180%)",
                      WebkitBackdropFilter: "blur(16px) saturate(180%)",
                      color: "#f1f5f9",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: active
                        ? "0 6px 20px rgba(56, 189, 248, 0.35), inset 0 1px 0 rgba(255,255,255,0.3)"
                        : "inset 0 1px 0 rgba(255,255,255,0.08)",
                      transform: active ? "translateY(-1px)" : "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.background =
                          "rgba(255, 255, 255, 0.13)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.background =
                          "rgba(255, 255, 255, 0.07)";
                        e.currentTarget.style.transform = "none";
                      }
                    }}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
          </label>

          <button
            type="submit"
            disabled={!question.trim() || isLoading}
            style={{
              marginTop: "0.5rem",
              alignSelf: "flex-start",
              padding: "0.8rem 1.9rem",
              borderRadius: "1.1rem",
              border: "1px solid rgba(255,255,255,0.25)",
              background: isLoading
                ? "rgba(75, 85, 99, 0.6)"
                : "linear-gradient(135deg, #38bdf8, #818cf8, #c4b5fd)",
              backgroundSize: "200% auto",
              color: isLoading ? "#cbd5e1" : "#020617",
              fontWeight: 600,
              fontSize: "1rem",
              cursor: isLoading || !question.trim() ? "default" : "pointer",
              boxShadow: isLoading
                ? "none"
                : "0 8px 28px rgba(56, 189, 248, 0.45), inset 0 1px 0 rgba(255,255,255,0.4)",
              transition: "transform 0.15s ease, box-shadow 0.15s ease, background-position 0.4s ease",
              opacity: !question.trim() ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.backgroundPosition = "100% center";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundPosition = "0% center";
            }}
            onMouseDown={(e) => {
              if (!isLoading) e.currentTarget.style.transform = "scale(0.97)";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {isLoading ? "Thinking…" : "Ask ELI-Shiru"}
          </button>
        </form>

        {/* Glass Response Card */}
        <section
          style={{
            padding: "2.25rem",
            borderRadius: "2rem",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.02) 100%)",
            backdropFilter: "blur(40px) saturate(200%)",
            WebkitBackdropFilter: "blur(40px) saturate(200%)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow:
              "0 8px 40px rgba(0, 0, 0, 0.4), 0 1.5px 0 rgba(255,255,255,0.2) inset",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
              pointerEvents: "none",
            }}
          />

          <h2
            style={{
              fontSize: "1.15rem",
              fontWeight: 600,
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            Explanation
          </h2>
          <div
            style={{
              minHeight: "180px",
              padding: "1.2rem",
              borderRadius: "1.3rem",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              background: "rgba(2, 6, 23, 0.4)",
              backdropFilter: "blur(10px)",
              whiteSpace: "pre-wrap",
              fontSize: "1rem",
              lineHeight: 1.6,
              color: response ? "#f1f5f9" : "rgba(148, 163, 184, 0.7)",
              boxShadow: "inset 0 2px 10px rgba(0,0,0,0.35)",
            }}
          >
            {response || "Your explanation will appear here."}
          </div>
          <p
            style={{
              marginTop: "0.75rem",
              fontSize: "0.85rem",
              color: "rgba(148, 163, 184, 0.8)",
            }}
          >
            Level selected:{" "}
            <strong style={{ color: "#93c5fd" }}>{level}</strong>
          </p>
        </section>
      </div>
    </div>
  );
}

export default App;
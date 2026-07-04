// App.jsx
import { useState, useEffect, useRef } from "react";

const EXPLANATION_LEVELS = ["ELI1", "ELI5", "ELI10", "ELI15"];

function App() {
  const [question, setQuestion] = useState("");
  const [level, setLevel] = useState("ELI5");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    document.title = "ELI-Shiru";
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!question.trim() || isLoading) {
      return;
    }

    const currentQuestion = question;
    const currentLevel = level;

    const userMessage = {
      role: "user",
      text: currentQuestion,
      level: currentLevel,
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setIsLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: currentQuestion,
          level: currentLevel,
        }),
      });

      if (!res.ok) {
        throw new Error(`Backend error: ${res.status}`);
      }

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.explanation || "No explanation returned.",
          level: currentLevel,
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry, something went wrong talking to the backend. Check the console and that uvicorn is running.",
          level: currentLevel,
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        position: "relative",
        overflowX: "hidden",
        overflowY: "hidden",
        background:
          "linear-gradient(135deg, #0a0f1f 0%, #05070f 50%, #0a0f1f 100%)",
        color: "#f1f5f9",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif",
        display: "flex",
        justifyContent: "center",
        alignItems: "stretch",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(4vw, 6vh) scale(1.08); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-4vw, -5vh) scale(1.08); }
        }
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        * {
          box-sizing: border-box;
        }
        html, body, #root {
          margin: 0;
          width: 100%;
          min-height: 100%;
          overflow: hidden;
        }
        ::placeholder {
          color: rgba(148, 163, 184, 0.5);
        }
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.14);
          border-radius: 999px;
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          overflow: "hidden",
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-10%",
            left: "-8%",
            width: "42vw",
            height: "42vw",
            borderRadius: "50%",
            background: "rgba(56, 189, 248, 0.30)",
            filter: "blur(110px)",
            animation: "float1 18s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-12%",
            right: "-8%",
            width: "42vw",
            height: "42vw",
            borderRadius: "50%",
            background: "rgba(139, 92, 246, 0.30)",
            filter: "blur(110px)",
            animation: "float2 18s ease-in-out infinite",
          }}
        />
      </div>

      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          padding: "clamp(1rem, 2vw, 2rem)",
          display: "flex",
          flexDirection: "column",
          zIndex: 1,
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        <header
          style={{
            marginBottom: "1rem",
            textAlign: "center",
            flexShrink: 0,
          }}
        >
          <h1
            style={{
              fontSize: "clamp(1.9rem, 4vw, 2.8rem)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.3,
              padding: "0.15em 0",
              marginBottom: "0.25rem",
              display: "inline-block",
              backgroundImage:
                "linear-gradient(120deg, #ffffff 0%, #93c5fd 25%, #c4b5fd 50%, #38bdf8 75%, #ffffff 100%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "shimmer 6s linear infinite",
              filter: "drop-shadow(0 0 25px rgba(56, 189, 248, 0.28))",
            }}
          >
            ELI-Shiru
          </h1>
          <p
            style={{
              fontSize: "0.95rem",
              color: "rgba(226, 232, 240, 0.64)",
              fontWeight: 400,
              margin: 0,
            }}
          >
            Ask, follow up, and adjust the depth anytime.
          </p>
        </header>

        <section
          style={{
            flex: 1,
            width: "100%",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            borderRadius: "2rem",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.02) 100%)",
            backdropFilter: "blur(40px) saturate(200%)",
            WebkitBackdropFilter: "blur(40px) saturate(200%)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow:
              "0 8px 40px rgba(0, 0, 0, 0.4), 0 1.5px 0 rgba(255,255,255,0.2) inset",
            overflow: "hidden",
            minHeight: 0,
            boxSizing: "border-box",
          }}
        >
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              minHeight: 0,
              minWidth: 0,
            }}
          >
            {messages.length === 0 && !isLoading && (
              <div
                style={{
                  margin: "auto",
                  color: "rgba(148, 163, 184, 0.6)",
                  fontSize: "0.95rem",
                  textAlign: "center",
                }}
              >
                Your conversation will appear here.
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "78%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.25rem",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    padding: "0.9rem 1.1rem",
                    borderRadius: "1.25rem",
                    borderBottomRightRadius:
                      msg.role === "user" ? "0.35rem" : "1.25rem",
                    borderBottomLeftRadius:
                      msg.role === "assistant" ? "0.35rem" : "1.25rem",
                    background:
                      msg.role === "user"
                        ? "linear-gradient(135deg, rgba(56,189,248,0.34), rgba(139,92,246,0.34))"
                        : msg.isError
                        ? "rgba(239, 68, 68, 0.14)"
                        : "rgba(2, 6, 23, 0.42)",
                    border:
                      msg.role === "user"
                        ? "1px solid rgba(56, 189, 248, 0.38)"
                        : msg.isError
                        ? "1px solid rgba(239, 68, 68, 0.35)"
                        : "1px solid rgba(255, 255, 255, 0.10)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    whiteSpace: "pre-wrap",
                    fontSize: "0.98rem",
                    lineHeight: 1.58,
                    color: "#f1f5f9",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)",
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                  }}
                >
                  {msg.text}
                </div>
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "rgba(148, 163, 184, 0.55)",
                    alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                    padding: "0 0.35rem",
                  }}
                >
                  {msg.role === "user" ? "You" : "ELI-Shiru"} · {msg.level}
                </span>
              </div>
            ))}

            {isLoading && (
              <div
                style={{
                  alignSelf: "flex-start",
                  maxWidth: "78%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.25rem",
                }}
              >
                <div
                  style={{
                    padding: "0.9rem 1.1rem",
                    borderRadius: "1.25rem",
                    borderBottomLeftRadius: "0.35rem",
                    background: "rgba(2, 6, 23, 0.42)",
                    border: "1px solid rgba(255, 255, 255, 0.10)",
                    color: "rgba(148, 163, 184, 0.85)",
                    fontSize: "0.95rem",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                  }}
                >
                  Thinking…
                </div>
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "rgba(148, 163, 184, 0.55)",
                    padding: "0 0.35rem",
                  }}
                >
                  ELI-Shiru · {level}
                </span>
              </div>
            )}
          </div>

          <div
            style={{
              borderTop: "1px solid rgba(255, 255, 255, 0.10)",
              padding: "1rem 1.5rem 1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.85rem",
              flexShrink: 0,
              background: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "0.55rem",
                flexWrap: "wrap",
                alignItems: "center",
                minWidth: 0,
              }}
            >
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "rgba(148, 163, 184, 0.72)",
                  marginRight: "0.2rem",
                }}
              >
                Level:
              </span>
              {EXPLANATION_LEVELS.map((lvl) => {
                const active = level === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    aria-pressed={active}
                    style={{
                      padding: "0.42rem 1rem",
                      borderRadius: "9999px",
                      border: active
                        ? "1px solid rgba(56, 189, 248, 0.9)"
                        : "1px solid rgba(255, 255, 255, 0.16)",
                      background: active
                        ? "linear-gradient(135deg, rgba(56,189,248,0.42), rgba(139,92,246,0.42))"
                        : "rgba(255, 255, 255, 0.06)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      color: "#f1f5f9",
                      fontSize: "0.82rem",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.25s ease",
                      boxShadow: active
                        ? "0 4px 14px rgba(56, 189, 248, 0.28), inset 0 1px 0 rgba(255,255,255,0.25)"
                        : "inset 0 1px 0 rgba(255,255,255,0.05)",
                    }}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>

            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                gap: "0.75rem",
                alignItems: "flex-end",
                width: "100%",
                minWidth: 0,
              }}
            >
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                rows={2}
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: "0.82rem 1rem",
                  borderRadius: "1rem",
                  border: "1px solid rgba(255, 255, 255, 0.18)",
                  backgroundColor: "rgba(2, 6, 23, 0.45)",
                  color: "#f1f5f9",
                  resize: "none",
                  fontSize: "0.95rem",
                  outline: "none",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                  boxShadow: "inset 0 2px 8px rgba(0,0,0,0.28)",
                }}
                placeholder="Ask a follow-up question…"
              />
              <button
                type="submit"
                disabled={!question.trim() || isLoading}
                style={{
                  padding: "0.82rem 1.45rem",
                  borderRadius: "1rem",
                  border: "1px solid rgba(255,255,255,0.22)",
                  background: isLoading
                    ? "rgba(75, 85, 99, 0.58)"
                    : "linear-gradient(135deg, #38bdf8, #818cf8)",
                  color: isLoading ? "#cbd5e1" : "#020617",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  cursor: isLoading || !question.trim() ? "default" : "pointer",
                  boxShadow: isLoading
                    ? "none"
                    : "0 6px 18px rgba(56, 189, 248, 0.38)",
                  opacity: !question.trim() ? 0.5 : 1,
                  flexShrink: 0,
                }}
              >
                {isLoading ? "…" : "Send"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
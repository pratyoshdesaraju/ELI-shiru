// App.jsx
import { useState, useEffect, useRef } from "react";

const EXPLANATION_LEVELS = ["ELI1", "ELI5", "ELI10", "ELI15"];

function App() {
  const [question, setQuestion] = useState("");
  const [level, setLevel] = useState("ELI5");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState(null);
  const [regeneratingIndex, setRegeneratingIndex] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    document.title = "ELI-Shiru";
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, regeneratingIndex]);

  const fetchExplanation = async (questionText, levelValue) => {
    const res = await fetch("http://127.0.0.1:8000/explain", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: questionText,
        level: levelValue,
      }),
    });

    if (!res.ok) {
      throw new Error(`Backend error: ${res.status}`);
    }

    const data = await res.json();
    return data.explanation || "No explanation returned.";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!question.trim() || isLoading || regeneratingIndex !== null) {
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
      const explanation = await fetchExplanation(currentQuestion, currentLevel);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: explanation,
          level: currentLevel,
          question: currentQuestion,
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
          question: currentQuestion,
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyResponse = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageIndex(index);
      setTimeout(() => {
        setCopiedMessageIndex((current) => (current === index ? null : current));
      }, 1500);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const handleRegenerate = async (assistantIndex) => {
    if (isLoading || regeneratingIndex !== null) {
      return;
    }

    const assistantMessage = messages[assistantIndex];
    if (!assistantMessage || assistantMessage.role !== "assistant") {
      return;
    }

    let relatedQuestion = assistantMessage.question;
    let relatedLevel = assistantMessage.level;

    if (!relatedQuestion) {
      for (let i = assistantIndex - 1; i >= 0; i -= 1) {
        if (messages[i].role === "user") {
          relatedQuestion = messages[i].text;
          relatedLevel = messages[i].level;
          break;
        }
      }
    }

    if (!relatedQuestion) {
      return;
    }

    setRegeneratingIndex(assistantIndex);

    try {
      const explanation = await fetchExplanation(relatedQuestion, relatedLevel);

      setMessages((prev) =>
        prev.map((msg, idx) =>
          idx === assistantIndex
            ? {
                ...msg,
                text: explanation,
                level: relatedLevel,
                question: relatedQuestion,
                isError: false,
              }
            : msg
        )
      );
    } catch (err) {
      console.error(err);
      setMessages((prev) =>
        prev.map((msg, idx) =>
          idx === assistantIndex
            ? {
                ...msg,
                text: "Sorry, something went wrong talking to the backend. Check the console and that uvicorn is running.",
                isError: true,
              }
            : msg
        )
      );
    } finally {
      setRegeneratingIndex(null);
    }
  };

  const iconButtonStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    padding: "0.42rem 0.7rem",
    borderRadius: "9999px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    color: "rgba(226, 232, 240, 0.88)",
    fontSize: "0.78rem",
    fontWeight: 500,
    cursor: "pointer",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
    transition: "all 0.2s ease",
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        position: "relative",
        overflow: "hidden",
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
          height: 100%;
          overflow: hidden;
        }
        ::placeholder {
          color: rgba(203, 213, 225, 0.5);
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
          height: "100vh",
          padding: "clamp(1rem, 2vw, 2rem)",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          zIndex: 1,
          position: "relative",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        <header
          style={{
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
              margin: "0 0 0.25rem 0",
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
            minHeight: 0,
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
          }}
        >
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              overflowX: "hidden",
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
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

            {messages.map((msg, idx) => {
              const isAssistant = msg.role === "assistant";
              const isRegeneratingThis = regeneratingIndex === idx;

              return (
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

                  {isAssistant && (
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        flexWrap: "wrap",
                        padding: "0 0.25rem",
                        marginTop: "0.15rem",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleRegenerate(idx)}
                        disabled={isLoading || regeneratingIndex !== null}
                        style={{
                          ...iconButtonStyle,
                          opacity:
                            isLoading || regeneratingIndex !== null ? 0.55 : 1,
                          cursor:
                            isLoading || regeneratingIndex !== null
                              ? "default"
                              : "pointer",
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M21 2v6h-6" />
                          <path d="M3 22v-6h6" />
                          <path d="M21 8a9 9 0 0 0-15.5-3.36L3 8" />
                          <path d="M3 16a9 9 0 0 0 15.5 3.36L21 16" />
                        </svg>
                        {isRegeneratingThis ? "Regenerating..." : "Regenerate"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyResponse(msg.text, idx)}
                        style={iconButtonStyle}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        {copiedMessageIndex === idx ? "Copied" : "Copy"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

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
              flexShrink: 0,
              borderTop: "1px solid rgba(255, 255, 255, 0.16)",
              padding: "1rem 1.5rem 1.4rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.9rem",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
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
                  fontSize: "0.82rem",
                  color: "rgba(203, 213, 225, 0.78)",
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
                      padding: "0.46rem 1rem",
                      borderRadius: "9999px",
                      border: active
                        ? "1px solid rgba(56, 189, 248, 0.9)"
                        : "1px solid rgba(255, 255, 255, 0.18)",
                      background: active
                        ? "linear-gradient(135deg, rgba(56,189,248,0.42), rgba(139,92,246,0.42))"
                        : "rgba(255, 255, 255, 0.08)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      color: "#f1f5f9",
                      fontSize: "0.82rem",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.25s ease",
                      boxShadow: active
                        ? "0 4px 14px rgba(56, 189, 248, 0.28), inset 0 1px 0 rgba(255,255,255,0.25)"
                        : "inset 0 1px 0 rgba(255,255,255,0.06)",
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
                alignItems: "stretch",
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
                rows={3}
                style={{
                  flex: 1,
                  minWidth: 0,
                  minHeight: "72px",
                  padding: "1rem",
                  borderRadius: "1rem",
                  border: "1px solid rgba(255, 255, 255, 0.22)",
                  background:
                    "linear-gradient(180deg, rgba(15, 23, 42, 0.88) 0%, rgba(2, 6, 23, 0.76) 100%)",
                  color: "#f8fafc",
                  resize: "none",
                  fontSize: "0.96rem",
                  outline: "none",
                  fontFamily: "inherit",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px rgba(255,255,255,0.02)",
                }}
                placeholder="Ask a follow-up question…"
              />
              <button
                type="submit"
                disabled={!question.trim() || isLoading || regeneratingIndex !== null}
                style={{
                  minWidth: "96px",
                  padding: "0.95rem 1.45rem",
                  borderRadius: "1rem",
                  border: "1px solid rgba(255,255,255,0.22)",
                  background:
                    isLoading || regeneratingIndex !== null
                      ? "rgba(75, 85, 99, 0.58)"
                      : "linear-gradient(135deg, #38bdf8, #818cf8)",
                  color:
                    isLoading || regeneratingIndex !== null
                      ? "#cbd5e1"
                      : "#020617",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  cursor:
                    isLoading || regeneratingIndex !== null || !question.trim()
                      ? "default"
                      : "pointer",
                  boxShadow:
                    isLoading || regeneratingIndex !== null
                      ? "none"
                      : "0 6px 18px rgba(56, 189, 248, 0.38)",
                  opacity: !question.trim() ? 0.5 : 1,
                  flexShrink: 0,
                }}
              >
                {isLoading ? "..." : "Send"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
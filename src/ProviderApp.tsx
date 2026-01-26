import { use } from "react";

type ProviderProps = {
  platformInitialized: Promise<void>;
};

function ProviderApp(props: ProviderProps) {
  use(props.platformInitialized);

  async function handleQuit() {
    if (typeof fin !== "undefined") {
      const platform = fin.Platform.getCurrentSync();
      await platform.quit();
    }
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#1a1a1a",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <button
        onClick={handleQuit}
        style={{
          backgroundColor: "#dc2626",
          color: "#a32a2a",
          border: "none",
          padding: "24px 48px",
          fontSize: "24px",
          fontWeight: "bold",
          borderRadius: "12px",
          cursor: "pointer",
          boxShadow: "0 4px 14px rgba(220, 38, 38, 0.4)",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#b91c1c";
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#dc2626";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        QUIT APPLICATION
      </button>
    </div>
  );
}

export default ProviderApp;

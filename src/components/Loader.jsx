export default function Loader({ text = "Loading..." }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(255,255,255,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
        backdropFilter: "blur(2px)",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: "54px",
            height: "54px",
            border: "5px solid #ddd",
            borderTop: "5px solid #4CAF50",
            borderRadius: "50%",
            margin: "0 auto 14px",
            animation: "spin 0.9s linear infinite",
          }}
        />
        <p style={{ fontSize: "14px", color: "#444", fontWeight: "600" }}>
          {text}
        </p>

        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </div>
  );
}

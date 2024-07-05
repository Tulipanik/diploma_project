export default function HoverMenu({ children }) {
  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        top: 0,
        left: "50%",
        width: "80%",
        transform: "translate(-50%)",
        zIndex: 2,
      }}
    >
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: "50px solid transparent",
          borderTop: "50px solid white",
          borderRight: "50px solid white",
          borderBottom: "50px solid transparent",
        }}
      />
      <div
        style={{
          background: "white",
          padding: "12px",
        }}
      >
        {children}
      </div>
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: "50px solid white",
          borderTop: "50px solid white",
          borderRight: "50px solid transparent",
          borderBottom: "50px solid transparent",
        }}
      />
    </div>
  );
}

export default function PageShell({ children }) {
  return (
    <div style={{ paddingTop: "var(--nav-h)" }}>
      {children}
    </div>
  );
}

export default function Footer() {
    return (
        <>
            <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: "linear-gradient(135deg,#7C3AED,#A855F7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M7 1L13 4v6l-6 3L1 10V4L7 1z" stroke="#fff" strokeWidth="1.2" fill="none" /></svg>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>Settlement Tracker</span>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", marginLeft: 8 }}>© 2025</span>
                </div>
                <div style={{ display: "flex", gap: "2rem" }}>
                    {["Privacy", "Terms", "Contact"].map(l => (
                        <a key={l} href="#" style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>{l}</a>
                    ))}
                </div>
            </footer>
        </>
    )
}
import { getFanbases } from "@/data/wayfinder-fanbases";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Daftar Link Undangan Fanbase | CAVALLERY",
  robots: "noindex, nofollow",
};

export default function LinksPage() {
  const fanbases = getFanbases();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b0f0d",
        color: "#ece3d0",
        fontFamily: "Montserrat, system-ui, sans-serif",
        padding: "48px 24px",
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h1
          style={{
            fontSize: 16,
            letterSpacing: "0.2em",
            textTransform: "uppercase" as const,
            color: "#c9a84c",
            margin: 0,
          }}
        >
          Daftar Link Undangan Fanbase
        </h1>
        <a
          href="/undangan/scan"
          style={{
            background: "#10b981",
            color: "#fff",
            padding: "8px 14px",
            borderRadius: 8,
            textDecoration: "none",
            fontSize: 13,
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          📷 Buka Scanner
        </a>
      </div>
      <p style={{ fontSize: 13, color: "#a09882", marginBottom: 32 }}>
        Salin link undangan untuk masing-masing fanbase penerima. Total: {fanbases.length} undangan.
      </p>

      <table
        style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
      >
        <thead>
          <tr
            style={{
              borderBottom: "1px solid rgba(236,227,208,0.15)",
              textAlign: "left",
            }}
          >
            <th style={{ padding: "10px 8px", width: 40 }}>#</th>
            <th style={{ padding: "10px 8px" }}>Nama Fanbase</th>
            <th style={{ padding: "10px 8px" }}>Link Undangan</th>
          </tr>
        </thead>
        <tbody>
          {fanbases.map((f, i) => (
            <tr
              key={f.slug}
              style={{
                borderBottom: "1px solid rgba(236,227,208,0.06)",
              }}
            >
              <td style={{ padding: "12px 8px", opacity: 0.4 }}>{i + 1}</td>
              <td style={{ padding: "12px 8px", fontWeight: 600 }}>{f.name}</td>
              <td style={{ padding: "12px 8px" }}>
                <a
                  href={`/undangan/${f.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#f0be53",
                    textDecoration: "none",
                    wordBreak: "break-all",
                  }}
                >
                  /undangan/{f.slug}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

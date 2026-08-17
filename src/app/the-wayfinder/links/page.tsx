import { FANBASES } from "@/data/wayfinder-fanbases";

export const metadata = {
  title: "Link Generator — The Wayfinder | Cavallery",
  robots: "noindex, nofollow",
};

export default function LinksPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b0f0d",
        color: "#ece3d0",
        fontFamily: "Montserrat, system-ui, sans-serif",
        padding: "48px 24px",
        maxWidth: 700,
        margin: "0 auto",
      }}
    >
      <h1
        style={{
          fontSize: 14,
          letterSpacing: "0.3em",
          textTransform: "uppercase" as const,
          color: "#c9a84c",
          marginBottom: 8,
        }}
      >
        The Wayfinder — Link Generator
      </h1>
      <p style={{ fontSize: 12, color: "#a09882", marginBottom: 32 }}>
        Salin link undangan untuk masing-masing fanbase. Total:{" "}
        {FANBASES.length} fanbase.
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
            <th style={{ padding: "10px 8px", color: "#c9a84c", fontWeight: 600 }}>#</th>
            <th style={{ padding: "10px 8px", color: "#c9a84c", fontWeight: 600 }}>Fanbase</th>
            <th style={{ padding: "10px 8px", color: "#c9a84c", fontWeight: 600 }}>Link</th>
          </tr>
        </thead>
        <tbody>
          {FANBASES.map((fb, i) => (
            <tr
              key={fb.slug}
              style={{ borderBottom: "1px solid rgba(236,227,208,0.06)" }}
            >
              <td
                style={{
                  padding: "10px 8px",
                  color: "#a09882",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {i + 1}
              </td>
              <td style={{ padding: "10px 8px", fontWeight: 500 }}>
                {fb.name}
              </td>
              <td style={{ padding: "10px 8px" }}>
                <code
                  style={{
                    fontSize: 12,
                    color: "#c9a84c",
                    background: "rgba(201,168,76,0.08)",
                    padding: "3px 8px",
                    wordBreak: "break-all",
                  }}
                >
                  /the-wayfinder/{fb.slug}
                </code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function test() {
  const API_KEY = "sJbpVqLinYlp";
  const BASE = "https://v2.jkt48connect.com/api/jkt48";
  try {
    const res = await fetch(`${BASE}/theater?priority_token=${API_KEY}`, {
      headers: { "x-priority-token": API_KEY, "Accept": "application/json" },
    });
    const data = await res.json();
    const shows = data.data || data;
    if (Array.isArray(shows)) {
      shows.forEach(s => {
        const dateStr = s.date || s.showDate || "";
        if (dateStr.includes("2026-05-13") || dateStr.includes("2026-05-14") || dateStr.includes("2026-05-15")) {
          console.log(`DATE MATCH: ${dateStr} - ${s.title || s.showName}`);
          console.log("Lineup:", (s.lineup || []).map(m => m.name || m.slug).join(", "));
        }
      });
    }
  } catch (e) {
    console.error(e);
  }
}
test();

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
      console.log(`Found ${shows.length} shows.`);
      shows.forEach(s => {
        const title = s.title || s.showName || "";
        const date = s.date || s.showDate || "";
        if (title.toLowerCase().includes("passion") || date.includes("2026-05-14")) {
          console.log(`MATCH: ${date} - ${title}`);
          console.log(JSON.stringify(s, null, 2));
        }
      });
    }
  } catch (e) {
    console.error(e);
  }
}
test();

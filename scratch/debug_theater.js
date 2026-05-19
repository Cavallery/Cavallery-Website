async function test() {
  const API_KEY = "sJbpVqLinYlp";
  const BASE = "https://v2.jkt48connect.com/api/jkt48";
  try {
    console.log("Fetching with priority_token...");
    const res = await fetch(`${BASE}/theater?priority_token=${API_KEY}`, {
      headers: { 
        "x-priority-token": API_KEY,
        "Accept": "application/json"
      },
    });
    const data = await res.json();
    console.log("Data count:", Array.isArray(data.data || data) ? (data.data || data).length : "Not an array");
    if (Array.isArray(data.data || data)) {
      const shows = data.data || data;
      console.log("Upcoming shows found:");
      shows.slice(0, 3).forEach(s => console.log(`- ${s.date || s.showDate}: ${s.title || s.showName}`));
    } else {
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (e) {
    console.error(e);
  }
}
test();

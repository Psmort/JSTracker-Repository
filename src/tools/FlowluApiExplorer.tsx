import { useState } from "react";

const BASE_URL = "https://cncjobtrackertest.flowlu.com/api/v1";

export default function FlowluApiExplorer() {
const [apiKey, setApiKey] = useState("");
const [response, setResponse] = useState<any>(null);
const [loading, setLoading] = useState(false);

const request = async (endpoint: string, method = "GET", body?: Record<string, any>) => {
setLoading(true);
try {
let url = `${BASE_URL}${endpoint}?api_key=${apiKey}`;

```
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  };

  if (method === "POST" && body) {
    const formBody = Object.entries(body)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");

    options.body = formBody;
  }

  const res = await fetch(url, options);
  const data = await res.json();

  setResponse(data);
  console.log("Flowlu Response:", data);
} catch (err) {
  console.error(err);
  setResponse({ error: "Request failed" });
} finally {
  setLoading(false);
}
```

};

return (
<div style={{ padding: 20 }}> <h2>Flowlu API Explorer</h2>

```
  <input
    type="text"
    placeholder="Enter API Key"
    value={apiKey}
    onChange={(e) => setApiKey(e.target.value)}
    style={{ width: "100%", marginBottom: 10 }}
  />

  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>

    <button onClick={() => request("/module/crm/pipeline/list")}>
      Get Pipelines
    </button>

    <button onClick={() => request("/module/crm/pipeline_stage/list")}>
      Get Pipeline Stages
    </button>

    <button onClick={() => request("/module/crm/lead/list")}>
      Get Leads (Jobs)
    </button>

    <button
      onClick={() =>
        request("/module/crm/lead/create", "POST", {
          name: "TEST JOB FROM API EXPLORER",
          pipeline_id: 2,
          pipeline_stage_id: 5
        })
      }
    >
      Create Test Job
    </button>

    <button
      onClick={() =>
        request("/module/crm/lead/delete", "POST", {
          id: 1
        })
      }
    >
      Delete Job (ID 1)
    </button>

  </div>

  <div style={{ marginTop: 20 }}>
    <h3>Response</h3>
    {loading ? (
      <p>Loading...</p>
    ) : (
      <pre style={{ background: "#111", color: "#0f0", padding: 10 }}>
        {JSON.stringify(response, null, 2)}
      </pre>
    )}
  </div>
</div>
```

);
}

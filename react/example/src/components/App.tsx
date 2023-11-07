import * as React from "react";
import "./../assets/scss/App.scss";
import "canvas-embed/dist/index.css";
import { Chart } from "canvas-embed";

const App = () => {
  const [embedId, setEmbedId] = React.useState<string>("");
  const [selectedBackend, setSelectedBackend] = React.useState<string>("rails");
  const [scopes, setScopes] = React.useState<string>("");
  const [token, setToken] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const getTokenUrl = () => {
    if (selectedBackend === "rails") {
      const url = encodeURI(
        `http://localhost:3001/generate_token?scopes=${scopes}`,
      );
      return url;
    }
  };
  React.useEffect(() => {
    const url = getTokenUrl();
    if (!scopes) {
      setError("No scopes set");
      return;
    }
    setError(null);
    setLoading(true);
    fetch(url, {
      method: "GET",
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          console.error(`Error getting token: ${text}`);
          setToken(null);
          setError(text);
        } else {
          const token = (await res.json())["token"];
          console.log("set token", token);
          setToken(token);
          setError(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(`${err}`);
        setToken(null);
        setLoading(false);
      });
  }, [scopes, selectedBackend]);
  return (
    <div className="app">
      <h1>Embed tester</h1>
      <h3>Enter Embed ID</h3>
      <input value={embedId} onChange={(e) => setEmbedId(e.target.value)} />
      <h3>Enter scopes</h3>
      <input value={scopes} onChange={(e) => setScopes(e.target.value)} />
      <h3>Select backend</h3>
      <div>
        <label>
          <input
            type="radio"
            value="rails"
            name="backend"
            checked={selectedBackend === "rails"}
            onChange={() => setSelectedBackend("rails")}
          />{" "}
          Rails
        </label>
      </div>
      <h1>Chart</h1>
      {token && embedId ? (
        <Chart
          chartId={embedId}
          authToken={token}
          disableExport={true}
          host={"http://localhost:3000"}
        />
      ) : loading ? (
        "Loading"
      ) : error ? (
        error
      ) : !token ? (
        "No token set"
      ) : "No embedId set"}
    </div>
  );
};

export default App;

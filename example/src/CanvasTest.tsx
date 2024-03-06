import * as React from "react";
import { Canvas } from "canvas-embed";

const AUTH_TOKEN = process.env.AUTH_TOKEN;
const CANVAS_HOST = "https://api.canvasapp.com";
const HOST = process.env.HOST || CANVAS_HOST;

const CanvasTest = (): React.ReactElement => {
  const [canvasId, setCanvasId] = React.useState<string>(
    process.env.CANVAS_ID || ""
  );
  const [authToken, setAuthToken] = React.useState<string>(
    process.env.AUTH_TOKEN || ""
  );
  return (
    <div className="app py-8 px-16">
      <div className="flex items-center gap-3">
        <h3>Enter Canvas ID:</h3>
        <input
          value={canvasId}
          onChange={(e) => setCanvasId(e.target.value)}
          className="border py-1 px-2"
        />
        <h3>Enter Auth token:</h3>
        <input
          value={authToken}
          onChange={(e) => setAuthToken(e.target.value)}
          className="border py-1 px-2"
        />
      </div>
      <br />
      {authToken.trim() !== "" && (
        <Canvas canvasId={canvasId} host={HOST} authToken={authToken} />
      )}
    </div>
  );
};

export default CanvasTest;

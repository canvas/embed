import * as React from "react";
import { Canvas } from "canvas-embed";

const AUTH_TOKEN = process.env.AUTH_TOKEN;

const CanvasTest = (): React.ReactElement => {
  const [canvasId, setCanvasId] = React.useState<string>("qtjuwN");
  return (
    <div className="app py-8 px-16">
      <div className="flex items-center gap-3">
        <h3>Enter Canvas ID:</h3>
        <input
          value={canvasId}
          onChange={(e) => setCanvasId(e.target.value)}
          className="border py-1 px-2"
        />
      </div>
      <br />
      {AUTH_TOKEN && (
        <Canvas
          canvasId={canvasId}
          host={"http://localhost:3000"}
          authToken={AUTH_TOKEN}
        />
      )}
    </div>
  );
};

export default CanvasTest;

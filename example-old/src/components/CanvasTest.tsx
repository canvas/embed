import * as React from "react";
import { Canvas } from "canvas-embed";

const CanvasTest = (): React.ReactElement => {
  const [canvasId, setCanvasId] = React.useState<string>("qtjuwN");
  return (
    <div className="app">
      <h3>Enter Canvas ID</h3>
      <input value={canvasId} onChange={(e) => setCanvasId(e.target.value)} />
      <br />
      <Canvas
        canvasId={canvasId}
        host={"http://localhost:3000"}
        authToken={process.env.AUTH_TOKEN}
      />
    </div>
  );
};

export default CanvasTest;

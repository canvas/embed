import * as React from "react";
import "./../assets/scss/App.scss";
// import { Canvas } from "canvas-embed";
import { CanvasDev } from "./CanvasDev";

const CanvasTest = (): React.ReactElement => {
  const [canvasId, setCanvasId] = React.useState<string>("kaNQwv");
  return (
    <div className="app">
      <h3>Enter Chart ID</h3>
      <input value={canvasId} onChange={(e) => setCanvasId(e.target.value)} />
      <br />
      <CanvasDev
        canvasId={canvasId}
        host={"http://localhost:3000"}
        authToken={process.env.AUTH_TOKEN}
      />
    </div>
  );
};

export default CanvasTest;

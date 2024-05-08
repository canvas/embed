import * as React from "react";
import { Canvas } from "canvas-embed";

const CANVAS_HOST = "https://api.canvasapp.com";
const HOST = process.env.HOST || CANVAS_HOST;

const CanvasTest = (): React.ReactElement => {
  const [canvasId, _setCanvasId] = React.useState<string>(
    localStorage.getItem("canvasId") || ""
  );
  const [authToken, _setAuthToken] = React.useState<string>(
    localStorage.getItem("authToken") || ""
  );
  const [isPublic, setPublic] = React.useState<boolean>(false);
  const setCanvasId = (id: string) => {
    _setCanvasId(id);
    localStorage.setItem("canvasId", id);
  };
  const setAuthToken = (token: string) => {
    _setAuthToken(token);
    localStorage.setItem("authToken", token);
  };
  return (
    <div className="app py-8 px-16">
      <div className="flex items-center gap-3">
        <h3>Enter Canvas ID:</h3>
        <input
          value={canvasId}
          onChange={(e) => setCanvasId(e.target.value)}
          className="border py-1 px-2"
        />
        <h3>Public</h3>
        <input
          type="checkbox"
          checked={isPublic}
          onChange={() => setPublic(!isPublic)}
        />
        {!isPublic && (
          <>
            <h3>Enter Auth token:</h3>
            <input
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              className="border py-1 px-2"
            />
          </>
        )}
      </div>
      <br />
      {(authToken.trim() !== "" || isPublic) && (
        <Canvas
          canvasId={canvasId}
          host={HOST}
          authToken={isPublic ? undefined : authToken}
        />
      )}
    </div>
  );
};

export default CanvasTest;

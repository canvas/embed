import * as React from "react";
import { Canvas } from "canvas-embed";

const AUTH_TOKEN = 'eyJtZXNzYWdlIjoiZjYwZDhjZTdiODNiYWRjNjhjMWNhMDQxZmE3ODE3ZjRlYjRjNmEzYTM3ZDQyMjE1NDYyNDhmNmJmM2ZhNTgxOGIwODlkYjcxODVjNTliMjk3OTYyMjg0MDRkOTBmNzE3NTNhYTRhM2Y4ZDg1YWM0ZGJlMzJmNTI5ZDlmNTJhMDdiNzMxYzQzMSIsIm5vbmNlIjoiZGVjZDNiYTM0YWYxZmI4Y2VkNjM3Mzk5OGU3MTQ0YjlkNTUzN2RhYTRmNDM4OTRlIiwia2V5SWQiOiJlbWtfanJPT1JnQ2gifQ==';

const CanvasTest = (): React.ReactElement => {
  const [canvasId, setCanvasId] = React.useState<string>("7WrUZU");
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

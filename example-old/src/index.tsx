import "./styles/tailwind.css";
import "./styles/index.less";

import * as React from "react";
import ChartTest from "./components/ChartTest";
import { createRoot } from "react-dom/client";
import CanvasTest from "./components/CanvasTest";

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<CanvasTest />);

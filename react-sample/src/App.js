// import logo from "./logo.svg";
import "./App.css";
// import { Canvas } from "canvas-embed";
// import "sample-react-component/dist/output.css";
import SampleComponent, { Element } from "sample-react-component";

function App() {
  console.log("Element", Element);
  // console.log("Canvas", Canvas);
  return (
    <div className="App">
      <header className="App-header">
        <SampleComponent />
        <Element />
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <div className="text-blue-300">Tailwind sample</div>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;

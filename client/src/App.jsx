import Balance from "./Balance";
import Transfer from "./Transfer";
import GenerateWallet from "./GenerateWallet";
import "./App.scss";

function App() {
  return (
    <>
      <div className="app">
        <div className="row">
          <GenerateWallet/>
        </div>
        <div className="row">
          <Balance/>
          <Transfer/>
        </div>
      </div>
    </>
  );
}

export default App;

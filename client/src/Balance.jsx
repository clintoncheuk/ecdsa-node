import { useState, useEffect } from "react";
import server from "./server";

function Balance() {
  const [address, setAddress] = useState();
  const [balance, setBalance]= useState();

  const onChange = (evt) => {
    setAddress(evt.target.value);
  }

  useEffect(() => {
    const getBalance = async () => {
      if (address) {
        const {
          data: { balance },
        } = await server.get(`balance/${address}`);
        setBalance(balance);
      } else {
        setBalance(0);
      }
    }
    getBalance();
  }, [address])

  return (
    <div className="container wallet">
      <h1>Balance</h1>

      <label>
        Wallet Address
        <input placeholder="Type an address, for example: 0x1" value={address} onChange={onChange}></input>
      </label>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Balance;

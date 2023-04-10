import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { toHex } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";
import { useEffect, useState } from "react";

function GenerateWallet() {
  const [address, setAddress] = useState();
  const [privateKey, setPrivateKey] = useState();
  const [balance, setBalance] = useState();

  const generate = () => {
    setPrivateKey(toHex(secp.utils.randomPrivateKey()));
    setBalance(undefined);
  };

  const getFaucet = async () => {
    if (!address) return;
    try {
      const {
        data: { balance },
      } = await server.post(`faucet/0x${address}`);
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  };

  useEffect(() => {
    if (privateKey)
      setAddress(
        toHex(keccak256(secp.getPublicKey(privateKey).slice(1)).slice(-20))
      );
  }, [privateKey]);

  return (
    <div className="container generate-wallet">
      <h1>Generate Wallet</h1>

      <label>
        Private Key
        <input
          value={privateKey ? "0x" + privateKey : undefined}
          readOnly
        ></input>
      </label>
      <label>
        Wallet Address
        <input value={address ? "0x" + address : undefined} readOnly></input>
      </label>

      <input
        type="submit"
        className="button"
        value="Generate"
        onClick={() => generate()}
      ></input>

      {address && (
        <input
          type="submit"
          className="button secondary"
          value={`Get Faucet for ${address}`}
          onClick={() => getFaucet()}
        ></input>
      )}

      {balance && <div className="balance">Balance: {balance}</div>}
    </div>
  );
}

export default GenerateWallet;

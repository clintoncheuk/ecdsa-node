import { useEffect, useState } from "react";
import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import { toHex, utf8ToBytes } from "ethereum-cryptography/utils";

function Transfer() {
  const [senderAddress, setSenderAddress] = useState();
  const [senderPrivateKey, setSenderPrivateKey] = useState();
  const [senderBalance, setSenderBalance] = useState();
  const [recipientBalance, setRecipientBalance] = useState();
  const [sendAmount, setSendAmount] = useState();
  const [recipient, setRecipient] = useState();
  const [nonce, setNonce] = useState(0);
  const [signature, setSignature] = useState();
  const [recoveryBit, setRecoveryBit] = useState();

  const setValue = (setter) => (evt) => setter(evt.target.value);

  const hashMessage = (message) => {
    return keccak256(utf8ToBytes(message));
  };

  const signMessage = async (msg) => {
    const [signature, recoveryBit] = await secp.sign(
      hashMessage(msg),
      senderPrivateKey.replace("0x", ""),
      {
        recovered: true,
      }
    );
    return {
      signature: toHex(signature),
      recoveryBit,
    };
  };

  useEffect(() => {
    const sign = async () => {
      if (
        senderPrivateKey &&
        senderAddress &&
        recipient &&
        sendAmount > 0 &&
        nonce >= 0
      ) {
        try {
          const data = {
            action: "transfer",
            amount: parseInt(sendAmount),
            from: senderAddress,
            to: recipient,
            nonce,
          };
          const { signature, recoveryBit } = await signMessage(
            JSON.stringify(data)
          );

          setSignature(signature);
          setRecoveryBit(recoveryBit);
        } catch (e) {
          console.error(e);
          setSignature(undefined);
          setRecoveryBit(undefined);
        }
      }
    };
    sign();
  }, [senderPrivateKey, senderAddress, sendAmount, recipient, nonce]);

  const transfer = async (evt) => {
    evt.preventDefault();

    if (!signature) return;

    try {
      const {
        data: { sender_balance, recipient_balance },
      } = await server.post(`send`, {
        sender: senderAddress,
        recipient,
        amount: parseInt(sendAmount),
        nonce,
        signature,
        recovery_bit: recoveryBit,
      });
      setSenderBalance(sender_balance);
      setRecipientBalance(recipient_balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  };

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>Sender Wallet Address</label>
      <input
        placeholder="Type an wallet address"
        value={senderAddress}
        onChange={setValue(setSenderAddress)}
      />

      <label>Sender Private Key</label>
      <input
        placeholder="Type your private key"
        value={senderPrivateKey}
        onChange={setValue(setSenderPrivateKey)}
      />

      <label>Nonce</label>
      <input
        type="number"
        min={0}
        step={1}
        placeholder="Starting from 0, add 1 for every new transaction"
        value={nonce}
        onChange={setValue(setNonce)}
      />

      <label>
        Send Amount
        <input
          type="number"
          min={0}
          step={1}
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an wallet address"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      {signature && (
        <>
          <label>Signature</label>
          <textarea rows="5" readOnly disabled value={signature}></textarea>
        </>
      )}

      <input type="submit" className="button" value="Transfer" />

      {senderBalance && (
        <div className="balance">Sender Balance: {senderBalance}</div>
      )}

      {recipientBalance && (
        <div className="balance">Recipient Balance: {recipientBalance}</div>
      )}
    </form>
  );
}

export default Transfer;

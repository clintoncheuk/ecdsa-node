const express = require("express");
const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes } = require("ethereum-cryptography/utils");
const { toHex } = require("ethereum-cryptography/utils");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {};
const transactions = [];

app.post("/faucet/:address", (req, res) => {
  const { address } = req.params;
  balances[address] = balances[address] ? balances[address] + 100 : 100;
  res.send({ balance: balances[address] });
});

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", async (req, res) => {
  const { sender, recipient, amount, nonce, signature, recovery_bit } =
    req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
    return;
  }

  if (amount <= 0) {
    res.status(400).send({ message: "Invalid amount" });
    return;
  }

  if (transactions.find((x) => x.from === sender && x.nonce === nonce)) {
    res
      .status(400)
      .send({ message: "Nonce already used, please try another number" });
    return;
  }

  const data = {
    action: "transfer",
    amount,
    from: sender,
    to: recipient,
    nonce,
  };

  const recoveredAddress = await secp.recoverPublicKey(
    hashMessage(JSON.stringify(data)),
    signature,
    recovery_bit
  );

  if (
    "0x" + toHex(keccak256(recoveredAddress.slice(1)).slice(-20)) !==
    sender
  ) {
    res.status(400).send({ message: "Unmatched signature" });
    return;
  }

  transactions.push(data);

  balances[sender] -= amount;
  balances[recipient] += amount;

  res.send({
    sender_balance: balances[sender],
    recipient_balance: balances[recipient],
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

const hashMessage = (message) => {
  return keccak256(utf8ToBytes(message));
};

const ethers = require("ethers");
const zksync = require("zksync");
const axios = require("axios");
const { utils, BigNumber } = ethers;
const { formatEther } = utils;
const { wallet } = zksync;
const { submitSignedTransactionsBatch } = wallet;

require("dotenv").config();

const privateKey = process.env.ZKSYNC_DEV_PRIVATE_KEY;

async function setupWallet() {
  const syncProvider = await zksync.getDefaultProvider("rinkeby");
  const ethersProvider = ethers.getDefaultProvider("rinkeby");

  // wallet
  const ethWallet = new ethers.Wallet(privateKey, ethersProvider);
  const syncWallet = await zksync.Wallet.fromEthSigner(ethWallet, syncProvider);

  return { syncWallet, syncProvider };
}

(async () => {
  const interval = setInterval(async () => {
    const res = await axios.get("http://localhost:3000/order/42");
    if (res.data) {
      console.log(res.data);
      const order = res.data;
      clearInterval(interval);
      orderFound(order.transaction);
    }
  }, 2000);
})();

const orderFound = async tx => {
  const { syncWallet, syncProvider } = await setupWallet();
  const tx2 = await signTransaction(syncWallet, syncProvider);
  // submit signed transactions batch
  const batchTxs = await submitSignedTransactionsBatch(syncProvider, [tx, tx2]);
  await batchTxs[0].awaitReceipt();
  await batchTxs[1].awaitReceipt();

  console.log("submitted success");
  await settle(42);
};

async function settle(id) {
  try {
    await axios.post("http://localhost:3000/settle", {
      id: id,
    });
  } catch (e) {
    throw new Error(e);
  }
}

async function signTransaction(wallet, syncProvider) {
  const tx = await wallet.signSyncTransfer({
    to: wallet.address(),
    token: "ETH",
    amount: ethers.utils.parseEther("0"),
    fee: await syncProvider.getTransactionsBatchFee(
      ["Transfer", "Transfer"],
      [wallet.address(), wallet.address()],
      "ETH"
    ),
    nonce: await wallet.getNonce(),
  });

  return tx;
}

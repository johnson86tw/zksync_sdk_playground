const ethers = require("ethers");
const zksync = require("zksync");
require("dotenv").config();

// transfer 0.001, 0.002, and 0.001 ETH simultaneously from wallet to wallet2

const privateKey = process.env.ZKSYNC_DEV_PRIVATE_KEY;
const privateKey2 = process.env.ZKSYNC_DEV2_PRIVATE_KEY;

const main = async () => {
  const syncProvider = await zksync.getDefaultProvider("rinkeby");
  const ethersProvider = ethers.getDefaultProvider("rinkeby");

  // wallet
  const ethWallet = new ethers.Wallet(privateKey, ethersProvider);
  const syncWallet = await zksync.Wallet.fromEthSigner(ethWallet, syncProvider);

  // wallet2
  const ethWallet2 = new ethers.Wallet(privateKey2, ethersProvider);
  const syncWallet2 = await zksync.Wallet.fromEthSigner(
    ethWallet2,
    syncProvider
  );

  const tx1 = {
    to: syncWallet2.address(),
    token: "ETH",
    amount: ethers.utils.parseEther("0.001"),
  };

  const tx2 = {
    to: syncWallet2.address(),
    token: "ETH",
    amount: ethers.utils.parseEther("0.002"),
  };

  const tx3 = {
    to: syncWallet2.address(),
    token: "ETH",
    amount: ethers.utils.parseEther("0.001"),
  };

  const transactions = [tx1, tx2, tx3];
  const batchBuilder = syncWallet.batchBuilder();

  for (let i = 0; i < transactions.length; i++) {
    batchBuilder.addTransfer(transactions[i]);
  }

  const { txs, signature, totalFee } = await batchBuilder.build("ETH");

  console.log("Total Fee: ", ethers.utils.formatEther(totalFee.get("ETH")));

  //   async submitTxsBatch(
  //   transactions: { tx: any; signature?: TxEthSignature }[],
  //   ethSignatures?: TxEthSignature | TxEthSignature[]
  // ): Promise<string[]>;

  const transfers = await zksync.wallet.submitSignedTransactionsBatch(
    syncProvider,
    txs,
    [signature]
  );

  console.log("tracking transfer status...");
  for (let i = 0; i < transfers.length; i++) {
    await transfers[i].awaitReceipt();
    console.log(`tx${i} committed`);
  }

  const committedETHBalance = await syncWallet.getBalance("ETH");
  console.log(
    "wallet 1 committed balance: ",
    ethers.utils.formatEther(committedETHBalance)
  );

  const committedETHBalance2 = await syncWallet2.getBalance("ETH");
  console.log(
    "wallet 2 committed balance: ",
    ethers.utils.formatEther(committedETHBalance2)
  );
};

main();

const ethers = require("ethers");
const zksync = require("zksync");
const { utils, BigNumber } = ethers;
const { formatEther } = utils;
const { wallet } = zksync;
const { submitSignedTransactionsBatch } = wallet;

require("dotenv").config();

// wallet2 transfer 0.004 ETH to wallet without gas fee which is paid by wallet

const privateKey = process.env.ZKSYNC_DEV_PRIVATE_KEY;
const privateKey2 = process.env.ZKSYNC_DEV2_PRIVATE_KEY;

(async () => {
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

  const tx = await syncWallet.signSyncTransfer({
    to: syncWallet2.address(),
    token: "ETH",
    amount: ethers.utils.parseEther("0.001"),
    fee: await syncProvider.getTransactionsBatchFee(
      ["Transfer"],
      [syncWallet2.address()],
      "ETH"
    ),
    nonce: await syncWallet.getNonce(),
  });

  const batchTxs = await submitSignedTransactionsBatch(syncProvider, [tx]);
  await batchTxs[0].awaitReceipt();

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
})();

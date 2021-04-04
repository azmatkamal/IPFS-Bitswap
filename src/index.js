const app = require("./app");

const run = async () => {
  const ipfs = await app.initIPFSObject();

  console.log(
    "\n****** THIS SECTIONS SHOWS THE WANTED LIST OF THE PEERS ******"
  );
  console.log("=============== WANT LIST ==================");
  const wantList = await app.getWantList(ipfs);
  console.log("=============== WANT LIST END ==================\n");

  console.log("\n****** THIS SECTIONS SHOWS STATS ******");
  console.log("=============== STATS ==================");
  const stats = await app.getStats(ipfs);
  console.log("=============== STATS ENDS ==================\n");

  let peers = stats.peers;

  console.log("\n****** THIS SECTIONS SHOWS HOW MUCH PEERS CONTRIBUTED ******");
  console.log("=============== PEER INFO STARTS ==================");
  if (peers) {
    for (let i = 0; i < peers.length; i++) {
      await app.getPeerLedger(peers[i], true);
    }
  }
  console.log("=============== PEER INFO END ==================\n");

  console.log("\n****** THIS SECTIONS SHOWS BLOCK INFO ******");
  console.log("=============== BLOCK INFO STARTS ==================");
  if (wantList) {
    for (let i = 0; i < wantList.length; i++) {
      await await app.getBlockStats(ipfs, wantList[i]);
    }
  }
  console.log("=============== BLOCK INFO END ==================\n");
};

run();

if (process.env.npm_config_loop && process.env.npm_config_loop == "true") {
  let sec = 5000;

  if (
    process.env.npm_config_sec &&
    parseInt(process.env.npm_config_sec) > 5000
  ) {
    sec = parseInt(process.env.npm_config_sec);
  }

  setInterval(async () => {
    await run();
  }, sec);
}

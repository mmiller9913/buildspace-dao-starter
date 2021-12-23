import sdk from "./1-initialize-sdk.js";

// deploying our token contract 

// In order to deploy the new contract we need our old friend the app module again.
const app = sdk.getAppModule("0x298d60bd72EE8dF019dFA66f414D857C2CBde358");

(async () => {
  try {
    // Deploy a standard ERC-20 contract.
    const tokenModule = await app.deployTokenModule({
      // What's your token's name? Ex. "Ethereum"
      name: "AnjunaDAO Governance Token",
      // What's your token's symbol? Ex. "ETH"
      symbol: "ANJUNA",
    });
    console.log(
      "✅ Successfully deployed token module, address:",
      tokenModule.address,
    );
  } catch (error) {
    console.error("failed to deploy token module", error);
  }
})();
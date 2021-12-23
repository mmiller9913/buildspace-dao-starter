import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

//creating + deploying an ERC-1155 contract to Rinkeby

const app = sdk.getAppModule('0x298d60bd72EE8dF019dFA66f414D857C2CBde358');
//above is the app address logged when running "node .\scripts\1-initialize-sdk.js"

(async () => {
  try {
    const bundleDropModule = await app.deployBundleDropModule({
      // The collection's name
      name: "AnjunaDAO Membership",
      // A description for the collection.
      description: "A DAO for fans of the Anjunabeats & Anjunadeep record labels",
      // The image for the collection that will show up on OpenSea.
      image: readFileSync("scripts/assets/Anjuna-logo.JPG"),
      // We need to pass in the address of the person who will be receiving the proceeds from sales of nfts in the module.
      // We're planning on not charging people for the drop, so we'll pass in the 0x0 address
      // you can set this to your own wallet address if you want to charge for the drop.
      primarySaleRecipientAddress: ethers.constants.AddressZero,
    });
    
    console.log(
      "✅ Successfully deployed bundleDrop module, address:",
      bundleDropModule.address,
    );
    console.log(
      "✅ bundleDrop metadata:",
      await bundleDropModule.getMetadata(),
    );
  } catch (error) {
    console.log("failed to deploy bundleDrop module", error);
  }
})()
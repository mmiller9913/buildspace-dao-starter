import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

// setting up our actual NFT on our ERC-1155 contract using createBatch 

const bundleDrop = sdk.getBundleDropModule(
"0x5194915CD3f7d8d039b0fBc19Eb8db3eF6Ee21Ae", //the bundleDrop address, AKA the ERC-1155 NFT contract 
);

(async () => {
  try {
    await bundleDrop.createBatch([
      {
        name: "AnjunaDAO Membership NFT",
        description: "This NFT will give you access to AnjunaDAO!",
        image: readFileSync("scripts/assets/Ampersand.JPG"),
      },
    ]);
    console.log("✅ Successfully created a new NFT in the drop!");
  } catch (error) {
    console.error("failed to create the new NFT", error);
  }
})()
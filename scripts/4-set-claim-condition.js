import sdk from "./1-initialize-sdk.js";

// setting the claim conditions for our nft

const bundleDrop = sdk.getBundleDropModule(
    "0x5194915CD3f7d8d039b0fBc19Eb8db3eF6Ee21Ae", //the bundleDrop address, AKA the ERC-1155 NFT contract
);

//setting up claim conditions
//interacting with our deployed contract on-chain and changing the conditions
(async () => {
    try {
        const claimConditionFactory = bundleDrop.getClaimConditionFactory();
        // Specify conditions.
        claimConditionFactory.newClaimPhase({
            startTime: new Date(),
            maxQuantity: 10_000,
            maxQuantityPerTransaction: 1,
        });

        await bundleDrop.setClaimCondition(0, claimConditionFactory);
            //our membership NFT has a tokenId = 0 (since it's the first one in our ERC-1155 contract)
        console.log("✅ Sucessfully set claim condition!");
    } catch (error) {
        console.error("Failed to set claim condition", error);
    }
})()
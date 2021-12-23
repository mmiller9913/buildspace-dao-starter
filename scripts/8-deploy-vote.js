import sdk from "./1-initialize-sdk.js";

//deploying a voting contract which utilizes our token 

// Grab the app module address.
const appModule = sdk.getAppModule(
  "0x298d60bd72EE8dF019dFA66f414D857C2CBde358",
);

(async () => {
  try {
    const voteModule = await appModule.deployVoteModule({
      // Give your governance contract a name.
      name: "AnjunaoDAO's Governance Contract",

      // This is the location of our governance token, our ERC-20 contract!
      votingTokenAddress: "0xfc9f056B1fD7e99A7cb5CFfba99E3d895E0870C6",

      // After a proposal is created, when can members start voting?
      // For now, we set this to immediately.
      proposalStartWaitTimeInSeconds: 0,

      // How long do members have to vote on a proposal when it's created?
      // Here, we set it to 24 hours (86400 seconds)
      proposalVotingTimeInSeconds: 24 * 60 * 60,

      // Min. percentage of the token supply that must be used for a proposal to pass
      // This prevents one DAO member (unless they hold a large token supply) from creating a proposal while no one else is around to vote on it
      votingQuorumFraction: 0, //means the proposal will pass regardless of what % of token was used on the vote.

      // What's the minimum # of tokens a user needs to be allowed to create a proposal?
      // I set it to 0. Meaning no tokens are required for a user to be allowed to
      // create a proposal.
      minimumNumberOfTokensNeededToPropose: "0",
    });

    console.log(
      "✅ Successfully deployed vote module, address:",
      voteModule.address,
    );
  } catch (err) {
    console.log("Failed to deploy vote module", err);
  }
})();

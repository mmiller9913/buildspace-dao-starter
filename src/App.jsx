import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import logo from './Anjuna-logo-transparent.JPG';

// import thirdweb
import { useWeb3 } from "@3rdweb/hooks";
import { ThirdwebSDK } from "@3rdweb/sdk";

// We instatiate the sdk on Rinkeby.
const sdk = new ThirdwebSDK("rinkeby");

// Grab reference to our contratcs 
const bundleDropModule = sdk.getBundleDropModule(
  "0x5194915CD3f7d8d039b0fBc19Eb8db3eF6Ee21Ae",
);
const tokenModule = sdk.getTokenModule(
  "0xfc9f056B1fD7e99A7cb5CFfba99E3d895E0870C6",
);
const voteModule = sdk.getVoteModule(
  "0xD8A81A36AFc8A5B4c42e9e1C998501D1623F5E0B",
);


const App = () => {

  // Use the connectWallet hook thirdweb gives us.
  const { connectWallet, address, provider } = useWeb3();

  // console.log(connectWallet);
  console.log("👋 You're using Address:", address)

  // The signer is required to sign transactions on the blockchain.
  // Without it we can only read data, not write.
  const signer = provider ? provider.getSigner() : undefined;

  // State variable for us to know if user has our NFT.
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  // isClaiming lets us easily keep a loading state while the NFT is minting.
  const [isClaiming, setIsClaiming] = useState(false);

  // Holds the amount of token each member has in state.
  const [memberTokenAmounts, setMemberTokenAmounts] = useState({});
  // The array holding all of our members addresses.
  const [memberAddresses, setMemberAddresses] = useState([]);

  //added these to prevent flashes of the wrong UI 
  const [isFetchingAddress, setIsFetchingAddress] = useState(true);
  const [checkingNFTClaimStatus, setIsCheckingNFTClaimStatus] = useState(false);

  // state variables for voting on proposals 
  const [proposals, setProposals] = useState([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const [network, setNetwork] = useState("");
  const [currentAccount, setCurrentAccount] = useState("");

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      //check to make sure on the right checkNetwork
      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log("Connected to chain " + chainId);
      // String, hex code of the chainId of the Rinkebey test network
      const rinkebyChainId = "0x4";
      if (chainId === rinkebyChainId) {
        setNetwork("Rinkeby")
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  //listen for chain changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      })

      window.ethereum.on('accountsChanged', () => {
        window.location.reload();
      })
    }
  })

  // Retreive all our existing proposals from the contract.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }
    // A simple call to voteModule.getAll() to grab the proposals.
    voteModule
      .getAll()
      .then((proposals) => {
        // Set state!
        setProposals(proposals);
        console.log("🌈 Proposals:", proposals)
      })
      .catch((err) => {
        console.error("failed to get proposals", err);
      });
  }, [hasClaimedNFT]);

  // We also need to check if the user already voted.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }
    // If we haven't finished retreieving the proposals from the useEffect above
    // then we can't check if the user voted yet!
    if (!proposals.length) {
      return;
    }
    // Check if the user has already voted on the first proposal.
    voteModule
      .hasVoted(proposals[0].proposalId, address)
      .then((hasVoted) => {
        if (hasVoted) {
          setHasVoted(hasVoted);
          console.log("🥵 User has already voted")
        }
      })
      .catch((err) => {
        console.error("failed to check if wallet has voted", err);
      });
  }, [hasClaimedNFT, proposals, address]);

  // This useEffect grabs all our the addresses of our members holding our NFT.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }
    // Just like we did in the 7-airdrop-token.js file! Grab the users who hold our NFT
    // with tokenId 0.
    bundleDropModule
      .getAllClaimerAddresses("0")
      .then((addresess) => {
        console.log("🚀 Members addresses", addresess) //this is every address that holds the NFT
        setMemberAddresses(addresess);
      })
      .catch((err) => {
        console.error("failed to get member list", err);
      });
  }, [hasClaimedNFT]); //second argument means this runs on render & whenever hasClaimedNFT changes

  // A fancy function to shorten someones wallet address, no need to show the whole thing. 
  const shortenAddress = (str) => {
    return str.substring(0, 6) + "..." + str.substring(str.length - 4);
  };

  // This useEffect grabs the # of token each member holds.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }
    // Grab all the balances.
    tokenModule
      .getAllHolderBalances()
      .then((amounts) => {
        console.log("👜 Amounts", amounts)
        setMemberTokenAmounts(amounts);
      })
      .catch((err) => {
        console.error("failed to get token amounts", err);
      });
  }, [hasClaimedNFT]); //second argument means this runs on render and whenever hasClaimedNFT changes

  useEffect(() => {
    if (address !== undefined) {
      console.log('no longer fetching address, setting isFetchingAddress from true to false')
      setIsFetchingAddress(false);
    }
  }, [address])

  // Now, we combine the memberAddresses and memberTokenAmounts into a single array
  // useMemo is a method in React for storying a computer variable
  const memberList = useMemo(() => {
    return memberAddresses.map((address) => {
      return {
        address,
        tokenAmount: ethers.utils.formatUnits(
          // If the address isn't in memberTokenAmounts, it means they don't
          // hold any of our token.
          memberTokenAmounts[address] || 0,
          18,
        ),
      };
    });
  }, [memberAddresses, memberTokenAmounts]);

  useEffect(() => {
    // We pass the signer to the sdk, which enables us to interact with
    // our deployed contract!
    sdk.setProviderOrSigner(signer);
  }, [signer]);

  useEffect(() => {
    setIsCheckingNFTClaimStatus(true);
    // If they don't have an connected wallet, exit!
    if (!address) {
      setIsCheckingNFTClaimStatus(false);
      return;
    }
    // Check if the user has the NFT by using bundleDropModule.balanceOf
    return bundleDropModule
      .balanceOf(address, "0") //this means: "does this user own an nft with tokenid = 0?"
      .then((balance) => {
        // If balance is greater than 0, they have our NFT!
        if (balance.gt(0)) {
          setHasClaimedNFT(true);
          console.log("🌟 this user has a membership NFT!");
          setIsCheckingNFTClaimStatus(false);
        } else {
          setHasClaimedNFT(false);
          console.log("😭 this user doesn't have a membership NFT.")
          setIsCheckingNFTClaimStatus(false);
        }
      })
      .catch((error) => {
        setHasClaimedNFT(false);
        console.error("failed to nft balance", error);
        setIsCheckingNFTClaimStatus(false);
      });
  }, [address]);  //second argument means this runs on render and whenever address changes

  console.log(`Youre using the ${network} -- ${currentAccount}`);

  //Case where user isn't connected to Rinkeyby
  if (currentAccount && network === "") {
    return (
      <div className="landing">
        <h1>Welcome to AnjunaDAO</h1>
        <img src={logo} alt='anjuna-logo' height="100" width="200" />
        <div className="unsupported-network">
          <h2>Please connect to Rinkeby</h2>
          <p>
            This dapp only works on the Rinkeby network, please switch networks
            in your connected wallet.
          </p>
        </div>
      </div>
    );
  }

  //needed this for error case when user doesn't have mestamask installed
  const connectWalletStart = (str) => {
    const { ethereum } = window;
    if (!ethereum) {
      alert("Please download MetaMask to use this dapp");
      return;
    }
    connectWallet(str);
  }

  // This is the case where the user hasn't connected their wallet
  // Let them call connectWallet.
  if (!address) {
    return (
      <div className="landing">
        <h1>Welcome to AnjunaDAO</h1>
        <img src={logo} alt='anjuna-logo' height="100" width="200" />
        <button onClick={() => connectWalletStart("injected")} className="btn-hero">
          Click Here to Connect your wallet using the Rinkeby Test Network.
        </button>
      </div>
    );
  }

  // If the user has already claimed their NFT we want to display the interal DAO page to them
  // only DAO members will see this. Render all the members + token amounts.
  if (hasClaimedNFT) {
    return (
      <div className="member-page">
        <h1>AnjunaDAO Member Page</h1>
        <img src={logo} alt='anjuna-logo' height="100" width="200" />
        <p>Congratulations on being a member</p>
        <div>
          <div>
            <h2>Member List (Tokens Previously Distributed Via Airdrop, Next Airdrop TBD)</h2>
            <table className="card">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Token Amount</th>
                </tr>
              </thead>
              <tbody>
                {memberList.map((member) => {
                  return (
                    <tr key={member.address}>
                      <td>{shortenAddress(member.address)}</td>
                      <td>{member.tokenAmount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div>
            <h2>Active Proposals</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                e.stopPropagation();

                //before we do async things, we want to disable the button to prevent double clicks
                setIsVoting(true);

                // lets get the votes from the form for the values
                // this gets the vote for each proposal, stored as voteResult
                const votes = proposals.map((proposal) => {
                  let voteResult = {
                    proposalId: proposal.proposalId,
                    //abstain by default
                    vote: 2,
                  };
                  proposal.votes.forEach((vote) => {
                    const elem = document.getElementById(
                      proposal.proposalId + "-" + vote.type
                    );

                    if (elem.checked) {
                      voteResult.vote = vote.type;
                      return;
                    }
                  });
                  return voteResult;
                });

                // first we need to make sure the user delegates their token to vote
                try {
                  //we'll check if the wallet still needs to delegate their tokens before they can vote
                  const delegation = await tokenModule.getDelegationOf(address);
                  // if the delegation is the 0x0 address that means they have not delegated their governance tokens yet
                  if (delegation === ethers.constants.AddressZero) {
                    //if they haven't delegated their tokens yet, we'll have them delegate them before voting
                    await tokenModule.delegateTo(address);
                  }
                  // then we need to vote on the proposals
                  try {
                    await Promise.all(
                      votes.map(async (vote) => {
                        // before voting we first need to check whether the proposal is open for voting
                        // we first need to get the latest state of the proposal
                        const proposal = await voteModule.get(vote.proposalId);
                        // then we check if the proposal is open for voting (state === 1 means it is open)
                        if (proposal.state === 1) {
                          // if it is open for voting, we'll vote on it
                          return voteModule.vote(vote.proposalId, vote.vote);
                        }
                        // if the proposal is not open for voting we just return nothing, letting us continue
                        return;
                      })
                    );
                    try {
                      // if any of the propsals are ready to be executed we'll need to execute them
                      // a proposal is ready to be executed if it is in state 4
                      await Promise.all(
                        votes.map(async (vote) => {
                          // we'll first get the latest state of the proposal again, since we may have just voted before
                          const proposal = await voteModule.get(
                            vote.proposalId
                          );

                          //if the state is in state 4 (meaning that it is ready to be executed), we'll execute the proposal
                          if (proposal.state === 4) {
                            return voteModule.execute(vote.proposalId);
                          }
                        })
                      );
                      // if we get here that means we successfully voted, so let's set the "hasVoted" state to true
                      setHasVoted(true);
                      // and log out a success message
                      console.log("successfully voted");
                    } catch (err) {
                      console.error("failed to execute votes", err);
                    }
                  } catch (err) {
                    console.error("failed to vote", err);
                  }
                } catch (err) {
                  console.error("failed to delegate tokens");
                } finally {
                  // in *either* case we need to set the isVoting state to false to enable the button again
                  setIsVoting(false);
                }
              }}
            >
              {proposals.map((proposal, index) => (
                <div key={proposal.proposalId} className="card">
                  <h5>{proposal.description}</h5>
                  <div>
                    {proposal.votes.map((vote) => (
                      <div key={vote.type}>
                        <input
                          type="radio"
                          id={proposal.proposalId + "-" + vote.type}
                          name={proposal.proposalId}
                          value={vote.type}
                          //default the "abstain" vote to chedked
                          defaultChecked={vote.type === 2}
                        />
                        <label htmlFor={proposal.proposalId + "-" + vote.type}>
                          {vote.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button disabled={isVoting || hasVoted} type="submit">
                {isVoting
                  ? "Voting..."
                  : hasVoted
                    ? "You Already Voted"
                    : "Submit Votes"}
              </button>
              <small>
                This will trigger multiple transactions that you will need to
                sign.
              </small>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const mintNft = async () => {
    setIsClaiming(true);
    try {
      // Call bundleDropModule.claim("0", 1) to mint nft to user's wallet.
      await bundleDropModule.claim("0", 1);
    }
    catch (err) {
      if (err.code === 4001) {
        window.alert('Failed to mint the NFT, you rejected the transaction!')
      }
      setIsClaiming(false);
      return;
    }
    // Stop loading state.
    setIsClaiming(false);
    // Set claim state.
    setHasClaimedNFT(true);
    // Show user their fancy new NFT!
    window.alert(
      `🌊 Successfully Minted! Check it out on Rarible: https://rinkeby.rarible.com/token/${bundleDropModule.address}:0`
    );

  }

  const renderLoader = () => {
    if (isClaiming) {
      return (
        <div className="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
      )
    }
  }

  // Render mint nft screen.
  if (!hasClaimedNFT && !isFetchingAddress && !checkingNFTClaimStatus) {
    return (
      <div className="mint-nft">
        <h1>Mint your free AnjunaDAO Membership NFT</h1>
        <img src={logo} alt='anjuna-logo' height="100" width="200" />
        <button
          disabled={isClaiming}
          onClick={() => mintNft()}
        >
          {isClaiming ? "Minting... This may take a few minutes. Please confirm the transaction." : "CLICK HERE"}
        </button>
        {renderLoader()}
        <small class="rinkeby-warning">Make sure you're using the Rinkby test network and have ETH in your wallet. You can get ETH using <a href="https://faucets.chain.link/rinkeby">this faucet</a>.</small>
      </div>
    );
  }

  return (null);
};

export default App
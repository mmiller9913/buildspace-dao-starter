import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

// Import ThirdWeb
import { ThirdwebWeb3Provider } from '@3rdweb/hooks';

// Include what chains you wanna support.
// 4 = Rinkeby.
const supportedChainIds = [4];

// Include what type of wallet you want to support.
// In this case, we support Metamask which is an "injected wallet".
const connectors = {
  injected: {},
};

// Finally, wrap App with ThirdwebWeb3Provider.
ReactDOM.render(
  <React.StrictMode>
    <ThirdwebWeb3Provider
      connectors={connectors}
      supportedChainIds={supportedChainIds}
    >
      <div className="landing">
        <App />
      </div>
    </ThirdwebWeb3Provider>
  </React.StrictMode>,
  document.getElementById('root')
);


//to fix: 
// failure case after minting nft -- done
// on initial load, briefly flashed connect wallet page even if wallet already connected
//  Successfully Minted! Check it out on Rarible: https://rinkeby.rarible.com/token/0x5194915CD3f7d8d039b0fBc19Eb8db3eF6Ee21Ae:0 
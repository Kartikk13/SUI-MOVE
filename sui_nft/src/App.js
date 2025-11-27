import React, { useState } from 'react';
import { Transaction } from '@mysten/sui/transactions';
import {
  useSignAndExecuteTransaction,
  ConnectButton,
  useCurrentAccount
} from '@mysten/dapp-kit';
import './App.css';

const LoyaltyCardPage = () => {
  // Get currently connected wallet account
  const currentAccount = useCurrentAccount();
  // Track loading state during transaction
  const [loading, setLoading] = useState(false);
  // Store the deployed smart contract's Package ID
  const [packageId, setPackageId] = useState('');

  // Form states for minting
  const [mintForm, setMintForm] = useState({
    customerId: '',  // Recipient wallet address
    imageUrl: ''     // NFT image URL
  });

  // Hook to sign and execute transactions on Sui blockchain
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  // Handle input changes for mint form fields
  const handleMintChange = (e) => {
    setMintForm({ ...mintForm, [e.target.name]: e.target.value });
  };

  // Action: mint a new Loyalty card NFT
  const mintLoyalty = async () => {
    // Check if wallet is connected
    if (!currentAccount) {
      alert('Please connect your wallet');
      return;
    }
    try {
      setLoading(true);
      // Create a new blockchain transaction
      const tx = new Transaction();
      // Call the smart contract's mint_loyalty function
      tx.moveCall({
        target: `${packageId}::loyalty_card::mint_loyalty`,  // Contract function path
        arguments: [
          tx.pure.address(mintForm.customerId),  // Pass recipient address
          tx.pure.string(mintForm.imageUrl)      // Pass NFT image URL
        ]
      });
      // Sign with wallet and submit to blockchain
      await signAndExecute({ transaction: tx });
      // Clear form after successful mint
      setMintForm({ customerId: '', imageUrl: '' });
    } catch (error) {
      console.error('Error minting loyalty card:', error);
      alert(`Minting failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Mint Your NFT on SUI</h1>
      <ConnectButton />

      <div className="package-input">
        <label>Package ID</label>
        <input
          type="text"
          value={packageId}
          onChange={(e) => setPackageId(e.target.value)}
          placeholder="Enter Package ID"
        />
      </div>

      {/* Mint Loyalty Card */}
      <section className="form-section">
        <label>Wallet Address</label>
        <input
          type="text"
          name="customerId"
          value={mintForm.customerId}
          onChange={handleMintChange}
          placeholder="Enter Customer Sui Address"
        />
        <label>Image URL</label>
        <input
          type="text"
          name="imageUrl"
          value={mintForm.imageUrl}
          onChange={handleMintChange}
          placeholder="Enter Image URL"
        />
        <button 
          onClick={mintLoyalty} 
          disabled={
            loading || 
            !mintForm.customerId.trim() || 
            !mintForm.imageUrl.trim()
          }
        >
          Mint your NFT
        </button>
      </section>
    </div>
  );
};

export default LoyaltyCardPage;

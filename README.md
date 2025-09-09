# @wdk/wallet-evm-erc-4337

**Note**: This package is currently in beta. Please test thoroughly in development environments before using in production.

A simple and secure package to manage ERC-4337 compliant wallets for EVM-compatible blockchains. This package provides a clean API for creating, managing, and interacting with account abstraction wallets using BIP-39 seed phrases and EVM-specific derivation paths.

## 🔍 About WDK

This module is part of the [**WDK (Wallet Development Kit)**](https://wallet.tether.io/) project, which empowers developers to build secure, non-custodial wallets with unified blockchain access, stateless architecture, and complete user control. 

For detailed documentation about the complete WDK ecosystem, visit [docs.wallet.tether.io](https://docs.wallet.tether.io).

## 🌟 Features

- **BIP-39 Seed Phrase Support**: Generate and validate BIP-39 mnemonic seed phrases
- **EVM Derivation Paths**: Support for BIP-44 standard derivation paths for Ethereum (m/44'/60')
- **Multi-Account Management**: Create and manage multiple account abstraction wallets from a single seed phrase
- **ERC-4337 Support**: Full implementation of ERC-4337 account abstraction standard
- **UserOperation Management**: Create and send UserOperations through bundlers
- **ERC20 Support**: Query native token and ERC20 token balances using smart contract interactions

## ⬇️ Installation

To install the `@wdk/wallet-evm-erc-4337` package, follow these instructions:

You can install it using npm:

```bash
npm install @wdk/wallet-evm-erc-4337
```

## 🚀 Quick Start

### Importing from `@wdk/wallet-evm-erc-4337`

### Creating a New Wallet

```javascript
import WalletManagerEvmErc4337, { 
  WalletAccountEvmErc4337, 
  WalletAccountReadOnlyEvmErc4337 
} from '@wdk/wallet-evm-erc-4337'

// Use a BIP-39 seed phrase (replace with your own secure phrase)
const seedPhrase = 'test only example nut use this real life secret phrase must random'

// Create wallet manager with ERC-4337 config
const wallet = new WalletManagerEvmErc4337(seedPhrase, {
  // Required parameters
  chainId: 1, // Ethereum Mainnet
  provider: 'https://eth-mainnet.g.alchemy.com/v2/your-api-key', // RPC endpoint
  bundlerUrl: 'https://api.stackup.sh/v1/bundler/your-api-key', // ERC-4337 bundler
  entryPointAddress: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789', // EntryPoint contract
  factoryAddress: '0x3F51274DfD7c51Ac1C4C798B21f295611560d511',  // Account factory contract
  
  // Optional parameters
  paymasterUrl: 'https://api.paymaster.com', // Optional: Paymaster service URL
  transferMaxFee: 100000000000000 // Optional: Maximum fee in wei
})

// Get a full access account
const account = await wallet.getAccount(0)

// Convert to a read-only account
const readOnlyAccount = await account.toReadOnlyAccount()
```

### Managing Multiple Accounts

```javascript
import WalletManagerEvmErc4337 from '@wdk/wallet-evm-erc-4337'

// Assume wallet is already created
// Get the first account (index 0)
const account = await wallet.getAccount(0)
const address = await account.getAddress()
console.log('Account 0 address:', address)

// Get the second account (index 1)
const account1 = await wallet.getAccount(1)
const address1 = await account1.getAddress()
console.log('Account 1 address:', address1)

// Get account by custom derivation path
// Full path will be m/44'/60'/0'/0/5
const customAccount = await wallet.getAccountByPath("0'/0/5")
const customAddress = await customAccount.getAddress()
console.log('Custom account address:', customAddress)

// Note: All addresses are checksummed Ethereum addresses (0x...)
// All accounts inherit the provider configuration from the wallet manager
```

### Checking Balances

#### Owned Account

For accounts where you have the seed phrase and full access:

```javascript
import WalletManagerEvmErc4337 from '@wdk/wallet-evm-erc-4337'

// Assume wallet and account are already created
// Get native token balance (in wei)
const balance = await account.getBalance()
console.log('Native balance:', balance, 'wei') // 1 ETH = 1000000000000000000 wei

// Get ERC20 token balance
const tokenContract = '0x...'; // ERC20 contract address

const tokenBalance = await account.getTokenBalance(tokenContract);
console.log('Token balance:', tokenBalance);

// Note: Provider is required for balance checks
// Make sure wallet was created with a provider configuration
```

#### Read-Only Account

For addresses where you don't have the seed phrase:

```javascript
import { WalletAccountReadOnlyEvmErc4337 } from '@wdk/wallet-evm-erc-4337'

// Create a read-only account
const readOnlyAccount = new WalletAccountReadOnlyEvmErc4337('0x636e9c21f27d9401ac180666bf8DC0D3FcEb0D24', { // Smart contract wallet address
  provider: 'https://eth-mainnet.g.alchemy.com/v2/your-api-key',
  bundlerUrl: 'https://api.stackup.sh/v1/bundler/your-api-key',
  entryPointAddress: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'
})

// Check native token balance
const balance = await readOnlyAccount.getBalance()
console.log('Native balance:', balance, 'wei')

// Check ERC20 token balance using contract
const tokenBalance = await readOnlyAccount.getTokenBalance('0xdAC17F958D2ee523a2206206994597C13D831ec7') // USDT contract address
console.log('Token balance:', tokenBalance)

// Note: ERC20 balance checks use the standard balanceOf(address) function
// Make sure the contract address is correct and implements the ERC20 standard
```

### Sending Transactions

Send transactions using UserOperations through the bundler service. All transactions are handled via the EntryPoint contract.

```javascript
// Send native tokens via UserOperation
const result = await account.sendTransaction({
  to: '0x636e9c21f27d9401ac180666bf8DC0D3FcEb0D24', // Recipient address
  value: 1000000000000000000n, // 1 ETH in wei
  data: '0x', // Optional: transaction data
})
console.log('UserOperation hash:', result.hash)
console.log('Transaction fee:', result.fee, 'wei')

// Get transaction fee estimate
const quote = await account.quoteSendTransaction({
  to: '0x636e9c21f27d9401ac180666bf8DC0D3FcEb0D24',
  value: 1000000000000000000n
});
console.log('Estimated fee:', quote.fee, 'wei');

// Note: Fees are calculated by the bundler and may include paymaster costs
```

### Token Transfers

Transfer ERC20 tokens using UserOperations. Uses standard ERC20 `transfer` function.

```javascript
// Transfer ERC20 tokens via UserOperation
const transferResult = await account.transfer({
  token: '0xdAC17F958D2ee523a2206206994597C13D831ec7',      // USDT contract address
  recipient: '0x636e9c21f27d9401ac180666bf8DC0D3FcEb0D24',  // Recipient's address
  amount: 1000000n     // Amount in token's base units (1 USDT = 1000000 for 6 decimals)
});
console.log('UserOperation hash:', transferResult.hash);
console.log('Transfer fee:', transferResult.fee, 'wei');

// Quote token transfer fee
const transferQuote = await account.quoteTransfer({
  token: '0xdAC17F958D2ee523a2206206994597C13D831ec7',      // USDT contract address
  recipient: '0x636e9c21f27d9401ac180666bf8DC0D3FcEb0D24',  // Recipient's address
  amount: 1000000n     // Amount in token's base units
})
console.log('Transfer fee estimate:', transferQuote.fee, 'wei')
```

### Message Signing and Verification

Sign and verify messages using `WalletAccountEvmErc4337`.

```javascript
// Sign a message
const message = 'Hello, Account Abstraction!'
const signature = await account.sign(message)
console.log('Signature:', signature)

// Verify a signature
const isValid = await account.verify(message, signature)
console.log('Signature valid:', isValid)
```

### Fee Management

Retrieve current fee rates using `WalletManagerEvmErc4337`. Uses bundler service for fee estimation.

```javascript
// Get current bundler fee rates
const feeRates = await wallet.getFeeRates();
console.log('Normal fee rate:', feeRates.normal, 'wei'); // Base bundler fee
console.log('Fast fee rate:', feeRates.fast, 'wei');     // Priority bundler fee
```

### Memory Management

Clear sensitive data from memory using `dispose` methods in `WalletAccountEvmErc4337` and `WalletManagerEvmErc4337`.

```javascript
// Dispose wallet accounts to clear private keys from memory
account.dispose()

// Dispose entire wallet manager
wallet.dispose()
```

## 📚 API Reference

### Table of Contents

| Class | Description | Methods |
|-------|-------------|---------|
| [WalletManagerEvmErc4337](#walletmanagerevmerc4337) | Main class for managing ERC-4337 wallets. Extends `WalletManager` from `@wdk/wallet`. | [Constructor](#constructor), [Methods](#methods) |
| [WalletAccountEvmErc4337](#walletaccountevmerc4337) | Individual ERC-4337 wallet account implementation. Extends `WalletAccountReadOnlyEvmErc4337` and implements `IWalletAccount` from `@wdk/wallet`. | [Constructor](#constructor-1), [Methods](#methods-1), [Properties](#properties) |
| [WalletAccountReadOnlyEvmErc4337](#walletaccountreadonlyevmerc4337) | Read-only ERC-4337 wallet account. Extends `WalletAccountReadOnly` from `@wdk/wallet`. | [Constructor](#constructor-2), [Methods](#methods-2) |

### WalletManagerEvmErc4337

The main class for managing ERC-4337 compliant wallets.  
Extends `WalletManager` from `@wdk/wallet`.

#### Constructor

```javascript
new WalletManagerEvmErc4337(seed, config)
```

**Parameters:**
- `seed` (string | Uint8Array): BIP-39 mnemonic seed phrase or seed bytes
- `config` (object): Configuration object
  - `provider` (string | Eip1193Provider): RPC endpoint URL or EIP-1193 provider instance
  - `bundlerUrl` (string): URL of the ERC-4337 bundler service
  - `entryPointAddress` (string): Address of the EntryPoint contract
  - `factoryAddress` (string): Address of the account factory contract
  - `chainId` (number): Chain ID of the target network
  - `paymasterUrl` (string, optional): URL of the paymaster service
  - `transferMaxFee` (number | bigint, optional): Maximum fee amount for transfer operations (in wei)

**Example:**
```javascript
const wallet = new WalletManagerEvmErc4337(seedPhrase, {
  provider: 'https://eth-mainnet.g.alchemy.com/v2/your-api-key',
  bundlerUrl: 'https://api.stackup.sh/v1/bundler/your-api-key',
  entryPointAddress: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
  factoryAddress: '0x3F51274DfD7c51Ac1C4C798B21f295611560d511',
  chainId: 1,
  transferMaxFee: '100000000000000' // Maximum fee in wei
})
```

#### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getAccount(index)` | Returns a wallet account at the specified index | `Promise<WalletAccountEvmErc4337>` |
| `getAccountByPath(path)` | Returns a wallet account at the specified BIP-44 derivation path | `Promise<WalletAccountEvmErc4337>` |
| `getFeeRates()` | Returns current bundler fee rates for UserOperations | `Promise<{normal: bigint, fast: bigint}>` |
| `dispose()` | Disposes all wallet accounts, clearing private keys from memory | `void` |

### WalletAccountEvmErc4337

Represents an individual ERC-4337 wallet account. Implements `IWalletAccount` from `@wdk/wallet`.

#### Constructor

```javascript
new WalletAccountEvmErc4337(seed, path, config)
```

**Parameters:**
- `seed` (string | Uint8Array): BIP-39 mnemonic seed phrase or seed bytes
- `path` (string): BIP-44 derivation path (e.g., "0'/0/0")
- `config` (object): Configuration object
  - `provider` (string | Eip1193Provider): RPC endpoint URL or EIP-1193 provider instance
  - `bundlerUrl` (string): URL of the ERC-4337 bundler service
  - `entryPointAddress` (string): Address of the EntryPoint contract
  - `factoryAddress` (string): Address of the account factory contract
  - `chainId` (number): Chain ID of the target network
  - `paymasterUrl` (string, optional): URL of the paymaster service
  - `transferMaxFee` (number | bigint, optional): Maximum fee amount for transfer operations (in wei)

#### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getAddress()` | Returns the smart contract wallet address | `Promise<string>` |
| `sign(message)` | Signs a message using the account's private key | `Promise<string>` |
| `verify(message, signature)` | Verifies a message signature | `Promise<boolean>` |
| `sendTransaction(tx)` | Sends a transaction via UserOperation | `Promise<{hash: string, fee: bigint}>` |
| `quoteSendTransaction(tx)` | Estimates the fee for a UserOperation | `Promise<{fee: bigint}>` |
| `transfer(options)` | Transfers ERC20 tokens via UserOperation | `Promise<{hash: string, fee: bigint}>` |
| `quoteTransfer(options)` | Estimates the fee for an ERC20 transfer | `Promise<{fee: bigint}>` |
| `getBalance()` | Returns the native token balance (in wei) | `Promise<bigint>` |
| `getTokenBalance(tokenAddress)` | Returns the balance of a specific ERC20 token | `Promise<bigint>` |
| `dispose()` | Disposes the wallet account, clearing private keys from memory | `void` |

##### `sendTransaction(tx)`
Sends a transaction via UserOperation through the bundler.

**Parameters:**
- `tx` (object): The transaction object
  - `to` (string): Recipient address
  - `value` (number | bigint): Amount in wei
  - `data` (string, optional): Transaction data in hex format

**Returns:** `Promise<{hash: string, fee: bigint}>` - Object containing UserOperation hash and fee (in wei)

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `index` | `number` | The derivation path's index of this account |
| `path` | `string` | The full derivation path of this account |
| `keyPair` | `object` | The account's key pair (⚠️ Contains sensitive data) |

⚠️ **Security Note**: The `keyPair` property contains sensitive cryptographic material. Never log, display, or expose the private key.

### WalletAccountReadOnlyEvmErc4337

Represents a read-only ERC-4337 wallet account.

#### Constructor

```javascript
new WalletAccountReadOnlyEvmErc4337(address, config)
```

**Parameters:**
- `address` (string): The smart contract wallet address
- `config` (object): Configuration object
  - `provider` (string | Eip1193Provider): RPC endpoint URL or EIP-1193 provider instance
  - `bundlerUrl` (string): URL of the ERC-4337 bundler service
  - `entryPointAddress` (string): Address of the EntryPoint contract

#### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getBalance()` | Returns the native token balance (in wei) | `Promise<bigint>` |
| `getTokenBalance(tokenAddress)` | Returns the balance of a specific ERC20 token | `Promise<bigint>` |
| `quoteSendTransaction(tx)` | Estimates the fee for a UserOperation | `Promise<{fee: bigint}>` |
| `quoteTransfer(options)` | Estimates the fee for an ERC20 transfer | `Promise<{fee: bigint}>` |

## 🌐 Supported Networks

This package works with any EVM-compatible blockchain that supports ERC-4337, including:

- **Ethereum Mainnet**
- **Ethereum Testnets** (Sepolia, etc.)
- **Layer 2 Networks** (Arbitrum, Optimism, etc.)
- **Other EVM Chains** (Polygon, Avalanche C-Chain, etc.)

## 🔒 Security Considerations

- **Seed Phrase Security**: Always store your seed phrase securely and never share it
- **Private Key Management**: The package handles private keys internally with memory safety features
- **Smart Contract Security**: 
  - Verify EntryPoint contract addresses
  - Use audited account implementation contracts
  - Validate factory contract addresses
- **Bundler Security**: 
  - Use trusted bundler services
  - Validate UserOperation contents before signing
  - Monitor bundler responses for unexpected behavior
- **Memory Cleanup**: Use the `dispose()` method to clear private keys from memory when done
- **Fee Limits**: Set `transferMaxFee` to prevent excessive transaction fees
- **Gas Estimation**: Always estimate gas before sending UserOperations
- **Contract Interactions**: 
  - Verify contract addresses and token decimals before transfers
  - Review UserOperation calldata before signing
- **Network Validation**: Ensure correct EntryPoint and factory addresses for each network

## 🛠️ Development

### Building

```bash
# Install dependencies
npm install

# Build TypeScript definitions
npm run build:types

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📜 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🆘 Support

For support, please open an issue on the GitHub repository.

---
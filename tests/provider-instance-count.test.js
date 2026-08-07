/**
 * Runtime count of ethers.JsonRpcProvider instances created for one
 * ERC-4337 manager on one chain through construct → getAccount(0) → getBalance().
 *
 * Uses the real @tetherto/wdk-wallet-evm dependency (not mocked).
 */
import { beforeEach, describe, expect, jest, test } from '@jest/globals'

const actualEthers = await import('ethers')

const JsonRpcProviderMock = jest.fn().mockImplementation((url) => ({
  url,
  send: jest.fn().mockResolvedValue('0x0'),
  getBalance: jest.fn().mockResolvedValue(0n),
  getFeeData: jest.fn().mockResolvedValue({ maxFeePerGas: 1n, gasPrice: 1n }),
  getNetwork: jest.fn().mockResolvedValue({ chainId: 1n }),
  destroy: jest.fn()
}))

const BrowserProviderMock = jest.fn().mockImplementation(() => ({
  send: jest.fn().mockResolvedValue('0x0'),
  getBalance: jest.fn().mockResolvedValue(0n),
  getFeeData: jest.fn().mockResolvedValue({ maxFeePerGas: 1n, gasPrice: 1n }),
  getNetwork: jest.fn().mockResolvedValue({ chainId: 1n }),
  destroy: jest.fn()
}))

jest.unstable_mockModule('ethers', () => ({
  ...actualEthers,
  JsonRpcProvider: JsonRpcProviderMock,
  BrowserProvider: BrowserProviderMock
}))

const { default: WalletManagerEvmErc4337 } = await import('../src/wallet-manager-evm-erc-4337.js')

const SEED = 'cook voyage document eight skate token alien guide drink uncle term abuse'
const CONFIG = {
  chainId: 1,
  provider: 'https://example-rpc.test/',
  bundlerUrl: 'https://example-bundler.test/',
  paymasterUrl: 'https://example-paymaster.test/',
  paymasterAddress: '0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba',
  safeModulesVersion: '0.3.0',
  paymasterToken: {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
  },
  isSponsored: true
}

describe('shared manager provider (one 4337 wallet, one chain)', () => {
  beforeEach(() => {
    JsonRpcProviderMock.mockClear()
    BrowserProviderMock.mockClear()
  })

  test('manager → getAccount → getBalance creates only one JsonRpcProvider', async () => {
    const manager = new WalletManagerEvmErc4337(SEED, CONFIG)
    expect(JsonRpcProviderMock).toHaveBeenCalledTimes(1)

    const account = await manager.getAccount(0)
    expect(JsonRpcProviderMock).toHaveBeenCalledTimes(1)

    try {
      await account.getBalance()
    } catch (err) {
      // Incomplete mocks may fail the RPC call; construction count still matters.
      console.log(`getBalance threw: ${err.message}`)
    }

    expect(JsonRpcProviderMock).toHaveBeenCalledTimes(1)
    // Read-only helper may wrap the shared EIP-1193 in BrowserProvider (evm package).
    expect(BrowserProviderMock.mock.calls.length).toBeGreaterThanOrEqual(1)

    manager.dispose()
  })

  test('two accounts from the same manager still share one JsonRpcProvider', async () => {
    const manager = new WalletManagerEvmErc4337(SEED, CONFIG)
    await manager.getAccount(0)
    await manager.getAccount(1)
    expect(JsonRpcProviderMock).toHaveBeenCalledTimes(1)
    manager.dispose()
  })
})

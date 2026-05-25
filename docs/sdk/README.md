# @baseshield/sdk

Privacy-first AI API client with end-to-end encryption. Built for **Base**.

## Installation

```bash
npm install @baseshield/sdk
```

## Quick Start

```typescript
import { BaseShield } from '@baseshield/sdk';

const client = new BaseShield({
  apiKey: 'sk_baseshield_your_key_here'
});

// Your prompt is encrypted client-side before being sent
const response = await client.chat('Explain quantum computing');
console.log(response.message);
```

## Testing Your Setup

### Verify API Key

Check if your API key is valid by fetching your balance:

```typescript
import { BaseShield } from '@baseshield/sdk';

const client = new BaseShield({
  apiKey: 'sk_baseshield_your_key_here',
});

async function main() {
  try {
    const balance = await client.getBalance();
    console.log('API key valid! Balance:', balance.balanceFormatted);
  } catch (error) {
    console.error('Invalid API key');
  }
}
main();
```

### Test Script

The SDK includes a connection test script. After installing, copy it from `node_modules`:

```bash
# Copy the test script
cp node_modules/@baseshield/sdk/examples/test-connection.ts ./

# Run with your API key
BASESHIELD_API_KEY=sk_baseshield_xxx npx ts-node test-connection.ts
```

The test script will verify:
1. API key validity
2. Encrypted chat functionality
3. Live web search

Example output:
```
==================================================
  BaseShield SDK Connection Test
==================================================
Base URL: https://api.baseshield.xyz
API Key: sk_baseshield_xxx****

[1/3] Testing API Key...
  ✓ API key is valid
  Balance: $10.5000 USDC

[2/3] Testing Encrypted Chat...
  ✓ Encrypted chat working
  Response: "4"
  Encrypted: true

[3/3] Testing Live Search...
  ✓ Live search working
  Response: "ETH on Base is currently trading at $3,420 USD."

==================================================
  Results
==================================================
  API Key:        ✓
  Encrypted Chat: ✓
  Live Search:    ✓

  3/3 tests passed
```

## How It Works

1. **Client-side Encryption**: Your prompt is sealed with libsodium (X25519 + XSalsa20-Poly1305) to the TEE's attested public key before leaving your device
2. **Blind Backend**: The server only sees encrypted data — it cannot read your prompt
3. **TEE Processing**: Decryption only happens inside an Intel TDX Trusted Execution Environment (hardware-isolated, running on Phala dStack)
4. **Encrypted Response**: The AI response is encrypted back to you with your ephemeral session key

## API Reference

### `new BaseShield(config)`

Create a new BaseShield client.

```typescript
const client = new BaseShield({
  apiKey: 'sk_baseshield_...',  // Required: Your API key
  baseUrl: 'https://...',        // Optional: Custom API URL
  encrypted: true,               // Optional: Enable encryption (default: true)
});
```

### `client.chat(prompt, options?)`

Send a chat message.

```typescript
const response = await client.chat('Hello!', {
  model: 'gpt-oss-20b',          // Model to use
  encrypted: true,                // Override encryption setting
  systemPrompt: 'You are...',     // System prompt
  chatId: 'conv-123',             // For multi-turn conversations
  useRAG: false,                  // Enable knowledge retrieval
  useLiveSearch: false,           // Enable web search
});

console.log(response.message);        // AI response
console.log(response.encrypted);      // Was request encrypted?
console.log(response.usage);          // Token usage
console.log(response.cost);           // Cost in USDC
```

### Available Models

| Model | Description |
|-------|-------------|
| `gpt-oss-20b` | Open-source GPT 20B (default, cheapest) |
| `qwen3-8b` | Qwen 3 8B parameters |
| `gemini-flash` | Google Gemini Flash |
| `claude-sonnet` | Anthropic Claude Sonnet |
| `gpt-4o-mini` | OpenAI GPT-4o Mini |

### `client.getBalance()`

Check your account balance.

```typescript
const balance = await client.getBalance();
console.log(balance.balanceFormatted); // "$10.5000"
```

## Pricing

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|-------|----------------------|------------------------|
| gpt-oss-20b | $0.15 | $0.30 |
| qwen3-8b | $0.05 | $0.10 |
| gemini-flash | $0.075 | $0.30 |
| claude-sonnet | $3.00 | $15.00 |
| gpt-4o-mini | $0.15 | $0.60 |

## Privacy Guarantee

When encryption is enabled (default):

- Your prompts are sealed on your device to a TEE-attested public key
- The BaseShield backend NEVER sees your plaintext prompts
- Decryption only happens inside a hardware-isolated Intel TDX enclave
- On-chain privacy attestations on Base are available for verification

## Get an API Key

1. Visit [baseshield.xyz/api](https://baseshield.xyz/api)
2. Connect your wallet (Coinbase Wallet, Rainbow, MetaMask — anything that supports Base)
3. Generate an API key
4. Deposit USDC on Base to fund your account

## Links

- [Documentation](https://docs.baseshield.xyz)
- [API Dashboard](https://baseshield.xyz/api)
- [GitHub](https://github.com/baseshield/sdk)

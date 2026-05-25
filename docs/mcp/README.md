# @baseshield/mcp-server

Private AI research for any MCP client. Every query is E2E encrypted to a TEE — BaseShield's backend never sees your plaintext.

## Why BaseShield?

Other MCP tools give you raw data. BaseShield gives you **private intelligence** — encrypted multi-source research combining web data, DEX analytics, on-chain intelligence on Base, and AI synthesis. Nobody sees what you're researching.

## Quick Start

```bash
npx @baseshield/mcp-server
```

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BASESHIELD_API_KEY` | Yes | Your API key (`sk_baseshield_...`) |
| `BRAVE_API_KEY` | No | Brave Search for web research |
| `BASE_RPC_URL` | No | Base RPC for on-chain data (defaults to public endpoint) |

### Claude Desktop

```json
{
  "mcpServers": {
    "baseshield": {
      "command": "npx",
      "args": ["@baseshield/mcp-server"],
      "env": {
        "BASESHIELD_API_KEY": "sk_baseshield_..."
      }
    }
  }
}
```

## Tools

### Research

| Tool | Description |
|------|-------------|
| `private_research` | **Flagship** — Encrypted multi-source research (web + DEX + on-chain + AI synthesis) |
| `encrypted_chat` | Direct encrypted AI query via TEE-sealed transport |
| `private_token_analysis` | Deep token research (DEX + web + price + AI analysis), all private |
| `private_wallet_audit` | Encrypted wallet intelligence and portfolio analysis on Base |

### Utility

| Tool | Description |
|------|-------------|
| `list_models` | Available AI models with privacy levels and pricing |
| `account_balance` | Check your BaseShield USDC credit balance |

## How Privacy Works

1. Your query is sealed client-side with **libsodium** (X25519 key exchange + XSalsa20-Poly1305 AEAD)
2. Encrypted payload sent to BaseShield's **Intel TDX Trusted Execution Environment** (Phala dStack)
3. Decrypted only inside the TEE — BaseShield backend never sees plaintext
4. Response encrypted back to you with your session key
5. On-chain privacy attestation on **Base** proves the process was tamper-free

## License

MIT

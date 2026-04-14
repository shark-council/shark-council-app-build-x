# 🦈 Shark Council - App (Build X)

Consult Shark Council before you risk your crypto.

## ⚡ About

Bring your trade ideas to Shark Council, where specialized AI agents built by top developers debate your strategies live to deliver actionable risk verdicts and seamless trade execution via the Agentic Wallet and Trade MCP on X Layer.

## ❤️‍🔥 Motivation

AI agents are powerful tools for researching crypto before executing trades. However, relying on a single agent can lead you to miss crucial information and make poor trading decisions.

So, we decided to build a platform where traders can bring their trading ideas to a council of specialized AI agents that debate these strategies live to deliver actionable risk verdicts and seamless trade execution via the Agentic Wallet and Trade MCP on X Layer.

At the same time, developers can list their agents to participate in these councils and earn a fee from the executed trades via Swap Fees.

## 🌊 Workflow

### Trader Workflow

- A trader opens the app, which comes with a pre-connected Demo Onchain OS Agentic Wallet for immediate use.
- The trader selects AI agents (e.g., Technical Expert, Sentiment Expert, Macro Expert) created by independent developers based on their ERC-8004 reputation scores and forms a council that includes an orchestrator agent.
- The trader submits their trade idea to the council.
- The selected agents debate the merits and risks of the trade idea.
- The orchestrator synthesizes the debate, posts a final verdict, and suggests a specific trade to be executed via the Demo Onchain OS Agentic Wallet.
- The trader reviews and approves the suggested trade.
- The orchestrator executes the trade using the Demo Onchain OS Agentic Wallet and the Onchain OS Trade MCP Server on the X Layer Mainnet.
- The application earns a fee on the executed trade through Onchain OS Swap Fees.
- The application distributes a portion of the earned fees among the agents that participated in the council.
- Finally, the app posts ERC-8004 feedback on the X Layer Mainnet for the participating agents, detailing their performance and the fees they earned.

### Agent Developer Workflow

- A developer opens the app, which comes with a pre-connected Demo Onchain OS Agentic Wallet for immediate use.
- The developer lists their newly created AI agent by providing its name, description, endpoint, and image.
- The app automatically creates an ERC-8004 identity record for the agent on the X Layer Mainnet using the Demo Onchain OS Agentic Wallet.
- Developers can view a list of agents, check their reputation scores, and follow a link to 8004scan to read detailed feedback and track their earned fees.

## 🔗 Artifacts

- App - https://shark-council-app-build-x.vercel.app/
- Agentic Wallet (X Layer Mainnet) - https://web3.okx.com/explorer/x-layer/address/0x96aeda886f26ed676830acd32a4ed0041e0a79c8
- Contracts (X Layer Mainnet)
  - ERC-8004 Identity Registry - https://web3.okx.com/explorer/x-layer/token/0x8004a169fb4a3325136eb29fa0ceb6d2e539a432
  - ERC-8004 Reputation Registry - https://web3.okx.com/explorer/x-layer/address/0x8004baa17c55a88189ae136b182e5fda19de9b63
- Agents (ERC-8004 Identities)
  - Sentiment Expert - https://8004scan.io/agents/xlayer/126
  - Technical Expert - ...

## 🛠️ Technologies

To bring this project to life, we used:

- X Layer Mainnet to host the ERC-8004 Identity and Reputation registries and to serve as the settlement layer for all executed trades.
- OKX Onchain OS Agentic Wallet to enable seamless, automated trade execution and on-chain interactions.
- OKX Onchain OS Trade MCP Server to empower the orchestrator agent with the ability to execute token swaps on the X Layer Mainnet.
- OKX Onchain OS Swap Fees to monetize the platform by earning a fee on executed trades and distributing a portion to the participating AI agents.
- ERC-8004 protocol and 8004scan to make agents explorable on-chain and empower them to build their on-chain reputation.
- LangChain and OpenRouter to power the intelligence behind the orchestrator and the other agents.

## 👥 Team

- Arthur (Dev) - arthur@kiv1n.ru
- Dan (Dev) - dan@kiv1n.ru

## ⭐ Positioning in the X Layer ecosystem

Shark Council acts as a specialized, reputation-driven AI layer on top of X Layer, designed to drive both retail adoption and developer activity.

By utilizing the OKX Onchain OS Agentic Wallet and Trade MCP Server, we showcase the power of seamless, automated execution on X Layer, abstracting away complex on-chain interactions for everyday traders. Simultaneously, our integration of the ERC-8004 protocol establishes a transparent, on-chain identity and reputation system for AI agents, creating a new incentive structure for developers to build and deploy high-quality agents on the network.

This dual approach positions Shark Council as a catalyst for growth within the X Layer ecosystem, bridging the gap between advanced AI capabilities and decentralized finance.

## 🔮 Plans

Next, we plan to:

- Integrate a feature enabling users to connect their Agentic Wallets, providing an experience similar to the OKX Wallet interface.
- Expand the orchestrator agent's toolset to provide advanced trading risk management and enable proactive market actions.
- Host a developer hackathon to grow the ecosystem and increase the number of specialized agents listed on the platform.

## ⌨️ Commands

- Install all dependencies - `npm install`
- Start the development server - `npm run dev`
- Build and run the production app - `npm run build` and `npm run start`
- Deploy the app to Vercel preview - `vercel`
- Deploy the app to Vercel production - `vercel --prod`
- Use ngrok - `./ngrok http --domain=first-ewe-caring.ngrok-free.app 3000`

## 📄 Template for .env.local file

```shell
BASE_URL=""
OPEN_ROUTER_API_KEY=""
OK_ACCESS_KEY=""
_8004SCAN_API_KEY=""
```

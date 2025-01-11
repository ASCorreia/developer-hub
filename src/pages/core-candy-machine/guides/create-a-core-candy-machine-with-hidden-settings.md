---
title: Create a Core Candy Machine with Hidden Settings
metaTitle: Create a Core Candy Machine with Hidden Settings | Core Candy Machine
description: How to create a Core Candy Machine with hidden settings to create a hide-and-reveal NFT drop.
---

If you are looking to create a hide-and-reveal NFT drop, you can use Core Candy Machine to achieve that goal.
A hide-and-reveal NFT drop can be useful when you want to reveal all the NFTs after they have been minted.

In this guide, we’ll walk you through the step-by-step process of setting up, minting, revealing, and validating your hide-and-reveal NFT drop using Core Candy Machine. Whether you’re an experienced developer or new to NFT drops, this guide will provide you with everything you need

How this works, is that when setting up your Core Candy Machine, you’ll configure the hidden settings field. This field will contain placeholder metadata (generic name and URI) that will be applied to all minted NFTs prior to the reveal. Additionally, it includes a pre-calculated hash of the metadata.
Every NFT that will be minted pre-reveal will have the same name and URI. After the collection has been minted, the assets will be updated with the correct name and URI

After minting our collection, we will perform a reveal process where we will update the assets with the proper metadata.

To ensure that the assets were correctly updated, a validation step is performed. This involves hashing the updated metadata (name and URI) of the revealed assets and comparing it with the original hash stored in the hidden settings. This ensures that every NFT has been updated accurately.

## Required Packages

You'll need to install the following packages for interacting with the Core Candy Machine:

{% packagesUsed packages=["umi", "umiDefaults", "core", "candyMachineCore", "mpl-toolbox"] type="npm" /%}

```ts
npm i @metaplex-foundation/umi @metaplex-foundation/umi-bundle-defaults @metaplex-foundation/mpl-core-candy-machine
```

## Setting up umi

After setting up your environment, let's start by setting up umi.

While setting up Umi, you can create new wallets for testing, import wallets from you filesystem or even use `walletAdapter`.
For this example, we will be creating a Keypair from a json file (wallet.json) containing a secret key.

```ts
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { generateSigner, some, none, createSignerFromKeypair, signerIdentity, transactionBuilder, dateTime } from "@metaplex-foundation/umi";
import { mplCandyMachine as mplCoreCandyMachine } from '@metaplex-foundation/mpl-core-candy-machine';
import * as fs from 'fs';

// We will be using Solana Devnet as endpoint, and loading the mplCoreCandyMachine plugin
const umi = createUmi("https://api.devnet.solana.com")
            .use(mplCoreCandyMachine());

// Let's create a Keypair from our wallet json file that contains a secret key, and create a signer based on the created keypair
const walletFile = fs.readFileSync('./wallet.json');

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(walletFile));
const signer = createSignerFromKeypair(umi, keypair);
console.log("Signer: ", signer.publicKey);

// Set the identity and the payer to the given signer
umi.use(signerIdentity(signer));
```

You can find more details about setting up UMI [here](https://developers.metaplex.com/core/guides/javascript/how-to-create-a-core-nft-asset-with-javascript#setting-up-umi)

### Prepare Reveal Data
Now, let’s prepare the reveal data, which will include the metadata for the final revealed NFTs. This data contains the name and URI for each NFT in the collection and will be used to update the placeholder metadata after minting.

In this example, we will work with a collection of five assets, so our reveal data will include an array of five objects, each representing an individual NFT’s name and URI.

We’ll also generate a hash of the reveal data. This hash will be stored in the hidden settings of the Core Candy Machine and used during the validation step to confirm that the metadata was updated correctly.

```ts
import crypto from 'crypto';

// Reveal data of our assets, to be used during the reveal process
const revealData = [
      { name: 'Nft #1', uri: 'http://example.com/1.json' },
      { name: 'Nft #2', uri: 'http://example.com/2.json' },
      { name: 'Nft #3', uri: 'http://example.com/3.json' },
      { name: 'Nft #4', uri: 'http://example.com/4.json' },
      { name: 'Nft #5', uri: 'http://example.com/5.json' },
    ]

let string = JSON.stringify(revealData)
let hash = crypto.createHash('sha256').update(string).digest()
```

Please note that you will need to upload the reveal data yoursel. In order to do it in a determenistic way, you can use [turbo](https://developers.metaplex.com/guides/general/create-deterministic-metadata-with-turbo)

### Create a Collection

Let's now create a Collection asset. 
For that, the mpl-core library provides a `createCollection` method will help us performing that action

You can learn more about collections [here](https://developers.metaplex.com/core/collections)

```ts
import { createCollection, ruleSet } from '@metaplex-foundation/mpl-core';

const collectionMint = generateSigner(umi);
const collectionUpdateAuthority = generateSigner(umi);

const creator1 = generateSigner(umi).publicKey;
const creator2 = generateSigner(umi).publicKey;

console.log("collection update authority: ", collectionUpdateAuthority.publicKey);
await createCollection(umi, {
    collection: collectionMint,
    updateAuthority: collectionUpdateAuthority.publicKey,
    name: 'My NFT',
    uri: 'https://example.com/my-nft.json',
    plugins: [
        {
            type: 'Royalties',
            basisPoints: 500,
            creators: [
            {
                address: creator1,
                percentage: 20,
            },
            {
                address: creator2,
                percentage: 80,
            },
        ],
        ruleSet: ruleSet('None'),
        },
    ],
}).sendAndConfirm(umi)
```

We added a plugin of type `Royalties` and added 2 different creators that will share those royalties

Let's now fetch our created collection and print the details of it

```ts
import { fetchCollection } from '@metaplex-foundation/mpl-core';

const collection = await fetchCollection(umi, collectionMint.publicKey);

console.log("Collection Details: \n", collection);
```

### Create a Core Candy Machine with Hidden Settings

Next step is to create our Core Candy Machine with the Hidden Settings.

To achieve that, we will use the `create` method from the mpl-core-candy-machine library, and we will set the `hiddenSettings` with the placeholder name, URI, and pre-calculated hash from the `revealData`

More details on the Core Candy Machine creation and guards can be found [here](https://developers.metaplex.com/core-candy-machine/create).

Additionally, we’ll configure a startDate guard, which determines when minting begins. This is only one of the many guards available and you can find the list of all available guards [here](https://developers.metaplex.com/candy-machine/guards).

```ts
import { create } from '@metaplex-foundation/mpl-core-candy-machine';

const candyMachine = generateSigner(umi);

const res = await create(umi, {
    candyMachine,
    collection: collectionMint.publicKey,
    collectionUpdateAuthority: collectionUpdateAuthority,
    itemsAvailable: 5,
    configLineSettings: none(),
    hiddenSettings: some({
        name: 'My Hidden NFT Project',
        uri: 'https://example.com/path/to/teaser.json',
        hash: hash,
    }),
    guards: {
        startDate: some({ date: dateTime('2024-01-01T16:00:00Z') }),
    }
});
let tx = await res.sendAndConfirm(umi);
```

Let's now fetch our created candy machine and print the details of it. 
To achieve that, we will use the `fetchCandyMachine` method from the mpl-core-candy-machine library

```ts
import { fetchCandyMachine } from '@metaplex-foundation/mpl-core-candy-machine';

let candyMachineDetails = await fetchCandyMachine(umi, candyMachine.publicKey);

console.log("Candy Machine Details: \n", candyMachineDetails);
```

This would return the Candy Machine Data like this:

```json
{
  "publicKey": "FVQYpQxtT4ZqCmq3MNiWY1mZcEJsVA6DaaW6bMhERoVY",
  "header": {
    "executable": false,
    "owner": "CMACYFENjoBMHzapRXyo1JZkVS6EtaDDzkjMrmQLvr4J",
    "lamports": { "basisPoints": 5428800, "identifier": "SOL", "decimals": 9 },
    "rentEpoch": 18446744073709551616,
    "exists": true
  },
  "discriminator": [
    51, 173, 177, 113,
    25, 241, 109, 189
  ],
  "authority": "Cce2qGViiD1SqAiJMDJVJQrGfxcb3DMyLgyhaqYB8uZr",
  "mintAuthority": "4P6VhHmNi9Qt5eRuQsE9SaE5bYWoLxpdPwmfNZeiU2mv",
  "collectionMint": "3RLCk7G2ckGHt7XPNfzUYKLriME2BmMoumF8N4H5LvsS",
  "itemsRedeemed": 0,
  "data": {
    "itemsAvailable": 5,
    "maxEditionSupply": 0,
    "isMutable": true,
    "configLineSettings": { "__option": "None" },
    "hiddenSettings": { "__option": "Some", "value": "[Object]" }
  },
  "items": [],
  "itemsLoaded": 0
}
"Candy Guard Account": 
 {
  "publicKey": "4P6VhHmNi9Qt5eRuQsE9SaE5bYWoLxpdPwmfNZeiU2mv",
  "header": {
    "executable": false,
    "owner": "CMAGAKJ67e9hRZgfC5SFTbZH8MgEmtqazKXjmkaJjWTJ",
    "lamports": { "basisPoints": 1538160, "identifier": "SOL", "decimals": 9 },
    "rentEpoch": 18446744073709551616,
    "exists": true
  },
  "discriminator": [
     44, 207, 199, 184,
    112, 103,  34, 181
  ],
  "base": "FVQYpQxtT4ZqCmq3MNiWY1mZcEJsVA6DaaW6bMhERoVY",
  "bump": 251,
  "authority": "Cce2qGViiD1SqAiJMDJVJQrGfxcb3DMyLgyhaqYB8uZr",
  "guards": {
    "botTax": { "__option": "None" },
    "solPayment": { "__option": "None" },
    "tokenPayment": { "__option": "None" },
    "startDate": { "__option": "Some", "value": "[Object]" },
    "thirdPartySigner": { "__option": "None" },
    "tokenGate": { "__option": "None" },
    "gatekeeper": { "__option": "None" },
    "endDate": { "__option": "None" },
    "allowList": { "__option": "None" },
    "mintLimit": { "__option": "None" },
    "nftPayment": { "__option": "None" },
    "redeemedAmount": { "__option": "None" },
    "addressGate": { "__option": "None" },
    "nftGate": { "__option": "None" },
    "nftBurn": { "__option": "None" },
    "tokenBurn": { "__option": "None" },
    "freezeSolPayment": { "__option": "None" },
    "freezeTokenPayment": { "__option": "None" },
    "programGate": { "__option": "None" },
    "allocation": { "__option": "None" },
    "token2022Payment": { "__option": "None" },
    "solFixedFee": { "__option": "None" },
    "nftMintLimit": { "__option": "None" },
    "edition": { "__option": "None" },
    "assetPayment": { "__option": "None" },
    "assetBurn": { "__option": "None" },
    "assetMintLimit": { "__option": "None" },
    "assetBurnMulti": { "__option": "None" },
    "assetPaymentMulti": { "__option": "None" },
    "assetGate": { "__option": "None" },
    "vanityMint": { "__option": "None" },
  },
  "groups": []
}
```

As you can see, it also prints the Candy Guard Account where we can check that actually only the `startDate` is set, as intended.

### Mint the collection

Let's now mint the 5 NFTs from our Core Candy Machine.

All these minted assets will have the placeholder name and URI that we set in the `hiddenSettings` field of the Core Candy machine that we created.

These placeholder elements will be updated during the reveal process

```ts
import { mintV1 } from '@metaplex-foundation/mpl-core-candy-machine';

const nftMint = [
    generateSigner(umi),
    generateSigner(umi),
    generateSigner(umi),
    generateSigner(umi),
    generateSigner(umi),
];

for(let i = 0; i < nftMint.length; i++) {
    let mintNFT = await transactionBuilder()
    .add(setComputeUnitLimit(umi, { units: 800_000 }))
    .add(
        mintV1(umi, {
            candyMachine: candyMachine.publicKey,
            asset: nftMint[i],
            collection: collectionMint.publicKey,
        })
    ).sendAndConfirm(umi);

    console.log("NFT minted!");
};
```

### Reveal the Collection

Let's now reveal the collection.

To reveal the collection, we will fetch the collection assets using the `fetchAssetsByCollection` method and will update those same minted assets by invoking the method `update` with the `revealData` that we prepared in the beggining of this guide.

As we only want to reveal our assets after all items have been minted, we will validate the mint completion by fetching the Core Candy Machine details using the `fetchCandyMachine` method and making sure that the items available are the same as the items redeemed. This unsures us that all assets have been minted

```ts
import { update, fetchAssetsByCollection } from '@metaplex-foundation/mpl-core';

candyMachineDetails = await fetchCandyMachine(umi, candyMachine.publicKey);
assert(candyMachineDetails.data.itemsAvailable == candyMachineDetails.itemsRedeemed);

let collectionDetails = await fetchCollection(umi, collectionMint.publicKey);
let collectionAssets = await fetchAssetsByCollection(umi,collectionMint.publicKey);

for(let i = 0; i < candyMachineDetails.itemsRedeemed; i++) {
    await update(umi, {
        asset: collectionAssets[i],
        collection: collectionDetails,
        authority: collectionUpdateAuthority,
        name: revealData[i].name,
        uri: revealData[i].uri,
    }).sendAndConfirm(umi);

    console.log("NFT revealed");
}
```

### Validation of the revealed assets

Now that the we revealed our assets, it is time to confirm that the assets integrity.

For that, we will again fetch the assets of our collection using the `fetchAssetsByCollection` method and, for each asset, we will extract the name and URI and store them in a new array.

After that, we will log both arrays (`revealData` and `fetchedAssets`) to help visualize and verify that the metadata has been updated as expected and will also hash the `fetchedAssets` data and compare to the initial hash

```ts
let fetchedAssets = [];

collectionAssets = await fetchAssetsByCollection(umi,collectionMint.publicKey);
for(let i = 0; i < collectionAssets.length; i++) {
    fetchedAssets[i] = {name: collectionAssets[i].name, uri: collectionAssets[i].uri};
}

console.log(revealData);
console.log(fetchedAssets);

let string2 = JSON.stringify(fetchedAssets);
let hash2 = crypto.createHash('sha256').update(string2).digest();
assert(hash == hash2);
```

### Conclusion
Congratulations! You just created your Core Candy Machine with hiddens settings.

Let's revise all that we did:
- We started by setting up UMI
- After setting up UMI, we created an array containing the metadata (name and URI) that would be used to update the assets after the initial mint. This included calculating a hash for validation purposes.
- We created a Collection asset to where our minted assets will belong to
- We create a Core Candy Machine with hidden setting, 5 items available, and a start time guard
- We minted all the assets from our Core Candy Machine with a the placeholder valuee stored in the hidden setting of our Core Candy Machine
- After verifying that all assets were minted, we fetched the collection assets and updated their metadata with the prepared reveal data.
- We confirmed that the reveal of our collection was correct by hashing the metadata (name and URI) of the revealed assets and comparing it to the expected hash
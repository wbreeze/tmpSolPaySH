import { NextApiRequest, NextApiResponse } from "next"
import { Keypair, PublicKey, Transaction } from "@solana/web3.js"
import { getAssociatedTokenAddress } from "@solana/spl-token"
import { Metaplex } from "@metaplex-foundation/js"
import { program } from "../../utils/nftProgram"
import { connection } from "../../utils/anchorSetup"
import { IDL, Nft } from "../../idl/nft"

// metaplex token metadata program
const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
)

// nft test data
const nft = {
  uri: "https://arweave.net/XfydVQOpCJaBHiDzgg60vg3IRWLROdp0338atyv_Cl4",
  name: "Pikachu",
  symbol: "",
}

type InputData = {
  account: string
}

type GetResponse = {
  label: string
  icon: string
}

export type PostResponse = {
  transaction: string
  message: string
}

export type PostError = {
  error: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetResponse | PostResponse | PostError>
) {
  if (req.method === "GET") {
    return get(res)
  } else if (req.method === "POST") {
    return await post(req, res)
  } else {
    return res.status(405).json({ error: "Method not allowed" })
  }
}

function get(res: NextApiResponse<GetResponse>) {
  res.status(200).json({
    label: "Mint Nft",
    icon: "https://solana.com/src/img/branding/solanaLogoMark.svg",
  })
}

async function post(
  req: NextApiRequest,
  res: NextApiResponse<PostResponse | PostError>
) {
  const { account } = req.body as InputData
  console.log(req.body)
  if (!account) {
    res.status(400).json({ error: "No account provided" })
    return
  }

  const { reference } = req.query
  if (!reference) {
    res.status(400).json({ error: "No reference provided" })
    return
  }

  try {
    const postResponse = await buildTransaction(
      new PublicKey(account),
      new PublicKey(reference)
    )
    res.status(200).json(postResponse)
    return
  } catch (error) {
    res.status(500).json({ error: "error creating transaction" })
    return
  }
}

async function buildTransaction(
  account: PublicKey,
  reference: PublicKey
): Promise<PostResponse> {
  // Metaplex setup
  const metaplex = Metaplex.make(connection).nfts().pdas()

  // Create new mint for NFT
  const mintKeypair = Keypair.generate()

  // Master edition PDA for mint
  const masterEditionPda = metaplex.masterEdition({
    mint: mintKeypair.publicKey,
  })

  // Token metadata PDA for mint
  const metadataPda = metaplex.metadata({ mint: mintKeypair.publicKey })

  // Anchor program mint authority PDA
  const [auth] = await PublicKey.findProgramAddress(
    [Buffer.from("auth")],
    program.programId
  )

  // token account address for user minting NFT
  const tokenAccount = await getAssociatedTokenAddress(
    mintKeypair.publicKey,
    account
  )

  const instruction = await program.methods
    .initialize(nft.uri, nft.name, nft.symbol)
    .accounts({
      mint: mintKeypair.publicKey,
      metadata: metadataPda,
      masterEdition: masterEditionPda,
      auth: auth,
      tokenAccount: tokenAccount,
      user: account,
      payer: account,
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
    })
    .instruction()

  instruction.keys.push({
    pubkey: reference,
    isSigner: false,
    isWritable: false,
  })

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash()

  const transaction = new Transaction({
    feePayer: account,
    blockhash,
    lastValidBlockHeight,
  })

  // add instruction to transaction
  transaction.add(instruction)

  // add new mintKeypair as signer
  transaction.sign(mintKeypair)

  // Serialize the transaction and convert to base64 to return it
  const serializedTransaction = transaction.serialize({
    requireAllSignatures: false, // account is a missing signature
  })
  const base64 = serializedTransaction.toString("base64")

  const message = "Please approve the transaction to mint your NFT!"

  // Return the serialized transaction
  return {
    transaction: base64,
    message,
  }
}

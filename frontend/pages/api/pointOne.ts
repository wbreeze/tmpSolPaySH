import { ScavengerHunt } from "../../idl/scavenger_hunt"
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey"
import { NextApiRequest, NextApiResponse } from "next"
import { Keypair, PublicKey, Transaction } from "@solana/web3.js"
import { connection } from "../../utils/anchorSetup"
import { program } from "../../utils/scavengerHuntProgram"
import { IdlAccounts } from "@project-serum/anchor"

type UserState = IdlAccounts<ScavengerHunt>["userState"]

// Public key of wallet scanning QR code
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

// API endpoint
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

// "res" is Text and Image that displays when wallet first scans
function get(res: NextApiResponse<GetResponse>) {
  res.status(200).json({
    label: "Scavenger Hunt!",
    icon: "https://solana.com/src/img/branding/solanaLogoMark.svg",
  })
}

// "req" is public key of wallet scanning QR code
// "res" is transaction built for wallet to approve, along with a message
async function post(
  req: NextApiRequest,
  res: NextApiResponse<PostResponse | PostError>
) {
  const { account } = req.body as InputData
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

// build the transaction
async function buildTransaction(
  account: PublicKey,
  reference: PublicKey
): Promise<PostResponse> {
  let message: string

  const eventOrganizer = JSON.parse(
    process.env.EVENT_ORGANIZER ?? ""
  ) as number[]
  if (!eventOrganizer) throw new Error("EVENT_ORGANIZER not found")
  const eventOrganizerKeypair = Keypair.fromSecretKey(
    Uint8Array.from(eventOrganizer)
  )

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash()

  const transaction = new Transaction({
    feePayer: account,
    blockhash,
    lastValidBlockHeight,
  })

  const initializeInstruction = await program.methods
    .initialize()
    .accounts({ user: account })
    .instruction()

  const checkInInstruction = await program.methods
    .checkIn()
    .accounts({
      user: account,
      eventOrganizer: eventOrganizerKeypair.publicKey,
    })
    .instruction()

  const [userStatePDA] = findProgramAddressSync(
    [account.toBuffer()],
    program.programId
  )

  let userState: UserState
  try {
    userState = await program.account.userState.fetch(userStatePDA)
    console.log(userState.lastPoint)
    if (userState.lastPoint != 0) {
      return {
        transaction: "",
        message: "You've already been here! Find the next point",
      }
    }
  } catch (e) {
    transaction.add(initializeInstruction)
  }

  checkInInstruction.keys.push({
    pubkey: reference,
    isSigner: false,
    isWritable: false,
  })

  transaction.add(checkInInstruction)
  transaction.partialSign(eventOrganizerKeypair)

  const serializedTransaction = transaction.serialize({
    requireAllSignatures: false,
  })
  const base64 = serializedTransaction.toString("base64")
  message = "You are at point 1. Find the next point!"

  return {
    transaction: base64,
    message,
  }
}

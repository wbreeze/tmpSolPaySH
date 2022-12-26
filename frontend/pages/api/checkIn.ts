import { ScavengerHunt } from "../../idl/scavenger_hunt"
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey"
import { NextApiRequest, NextApiResponse } from "next"
import { Keypair, PublicKey, Transaction } from "@solana/web3.js"
import { connection, program } from "../../utils/anchorSetup"
import { IdlAccounts } from "@project-serum/anchor"
import { locations } from "../../utils/locations"

const gameId = Keypair.generate().publicKey
const eventOrganizer = JSON.parse(process.env.EVENT_ORGANIZER ?? "") as number[]
if (!eventOrganizer) throw new Error("EVENT_ORGANIZER not found")
const eventOrganizerKeypair = Keypair.fromSecretKey(
  Uint8Array.from(eventOrganizer)
)

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
  const { reference, id } = req.query

  if (!account || !reference || !id) {
    res.status(400).json({ error: "Missing required parameter(s)" })
    return
  }

  try {
    const postResponse = await buildTransaction(
      new PublicKey(account),
      new PublicKey(reference),
      id.toString()
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
  reference: PublicKey,
  id: string
): Promise<PostResponse> {
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash()

  const transaction = new Transaction({
    feePayer: account,
    blockhash,
    lastValidBlockHeight,
  })

  // Find the current location
  const currentLocation = locations.find(
    (location) => location.id.toString() === id
  )!

  // Fetch the user state or add the `initialize` instruction if necessary
  const userState = await fetchOrInitializeUserState(account, transaction)

  // Verify that the user is at the correct location
  const errorMessage = verifyCorrectLocation(userState, currentLocation)
  if (errorMessage) {
    return errorMessage
  }

  // Check in at the current location
  const checkInInstruction = await program.methods
    .checkIn(gameId, currentLocation.key)
    .accounts({
      user: account,
      eventOrganizer: eventOrganizerKeypair.publicKey,
    })
    .instruction()
  checkInInstruction.keys.push({
    pubkey: reference,
    isSigner: false,
    isWritable: false,
  })
  transaction.add(checkInInstruction)

  // Sign the transaction with the event organizer's keypair
  transaction.partialSign(eventOrganizerKeypair)

  // Serialize the transaction and return it along with a message
  const serializedTransaction = transaction.serialize({
    requireAllSignatures: false,
  })

  const base64 = serializedTransaction.toString("base64")
  const message = `You've found location ${currentLocation.id}!`
  return {
    transaction: base64,
    message,
  }
}

async function fetchOrInitializeUserState(
  account: PublicKey,
  transaction: Transaction
): Promise<UserState | void> {
  const userStatePDA = findProgramAddressSync(
    [gameId.toBuffer(), account.toBuffer()],
    program.programId
  )[0]

  try {
    return await program.account.userState.fetch(userStatePDA)
  } catch (e) {
    const initializeInstruction = await program.methods
      .initialize(gameId)
      .accounts({ user: account })
      .instruction()
    transaction.add(initializeInstruction)
  }
}

function verifyCorrectLocation(
  userState: UserState | void,
  currentLocation: any
): PostResponse | undefined {
  if (!userState) {
    if (currentLocation.id === 1) {
      return
    }
    return {
      transaction: "",
      message: "You missed the first location, go back!",
    }
  }

  const lastLocation = locations.find(
    (location) => location.key.toString() === userState.lastLocation.toString()
  )

  if (!lastLocation) {
    return {
      transaction: "",
      message: "Unrecognized previous location, where did you go?",
    }
  }

  if (currentLocation.id !== lastLocation.id + 1) {
    return {
      transaction: "",
      message: "You're at the wrong location, keep looking!",
    }
  }
}

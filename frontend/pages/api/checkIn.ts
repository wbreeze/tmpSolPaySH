import { ScavengerHunt } from "../../idl/scavenger_hunt"
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey"
import { NextApiRequest, NextApiResponse } from "next"
import { Keypair, PublicKey, Transaction } from "@solana/web3.js"
import { connection, program } from "../../utils/anchorSetup"
import { IdlAccounts } from "@project-serum/anchor"
import { locations } from "../../utils/locations"

// Generate a new public key for the game
const gameId = Keypair.generate().publicKey

// Get the event organizer's secret key from the environment variables
const eventOrganizer = JSON.parse(process.env.EVENT_ORGANIZER ?? "") as number[]

// If the event organizer's secret key is not found, throw an error
if (!eventOrganizer) throw new Error("EVENT_ORGANIZER not found")

// Create a Keypair object from the event organizer's secret key
const eventOrganizerKeypair = Keypair.fromSecretKey(
  Uint8Array.from(eventOrganizer)
)

// Declare type aliases for the user state, input data, and responses
type UserState = IdlAccounts<ScavengerHunt>["userState"]

type InputData = {
  account: string
}
type GetResponse = {
  label: string
  icon: string
}
type PostResponse = {
  transaction: string
  message: string
}
type PostError = {
  error: string
}

// API endpoint function
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetResponse | PostResponse | PostError>
) {
  // If the request method is "GET", handle the request with the `get` function
  if (req.method === "GET") {
    return get(res)
  }
  // If the request method is "POST", handle the request asynchronously with the `post` function
  else if (req.method === "POST") {
    return await post(req, res)
  }
  // If the request method is not "GET" or "POST", return a "Method not allowed" error
  else {
    return res.status(405).json({ error: "Method not allowed" })
  }
}

// Handle a "GET" request
function get(res: NextApiResponse<GetResponse>) {
  // Return a "Scavenger Hunt!" label and Solana logo icon in the response
  res.status(200).json({
    label: "Scavenger Hunt!",
    icon: "https://solana.com/src/img/branding/solanaLogoMark.svg",
  })
}

// Handle a "POST" request
async function post(
  req: NextApiRequest,
  res: NextApiResponse<PostResponse | PostError>
) {
  // Get the "account" from the request body
  // Get the "id" and "reference" parameters from the request query string
  const { account } = req.body as InputData
  const { reference, id } = req.query

  // If any of the required parameters are missing, return a "Missing required parameter(s)" error
  if (!account || !reference || !id) {
    res.status(400).json({ error: "Missing required parameter(s)" })
    return
  }

  try {
    // Attempt to build a transaction using the "account", "reference", and "id" parameters
    const postResponse = await buildTransaction(
      new PublicKey(account),
      new PublicKey(reference),
      id.toString()
    )
    // If the transaction is successful, return the response in the API response
    res.status(200).json(postResponse)
    return
  } catch (error) {
    // If an error occurs, return a "error creating transaction" error in the API response
    res.status(500).json({ error: "error creating transaction" })
    return
  }
}

// Build and sign a check-in transaction for the scavenger hunt game
async function buildTransaction(
  account: PublicKey,
  reference: PublicKey,
  id: string
): Promise<PostResponse> {
  // Get the latest blockhash and last valid block height from the connection
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash()

  // Create a new transaction object
  const transaction = new Transaction({
    feePayer: account,
    blockhash,
    lastValidBlockHeight,
  })

  // Find the current location based on the "id" parameter
  const currentLocation = locations.find(
    (location) => location.id.toString() === id
  )!

  // Fetch the user state or add the "initialize" instruction if necessary
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

  // Add the reference public key to the instruction
  checkInInstruction.keys.push({
    pubkey: reference,
    isSigner: false,
    isWritable: false,
  })

  // Add the instruction to the transaction
  transaction.add(checkInInstruction)

  // Sign the transaction with the event organizer's keypair
  transaction.partialSign(eventOrganizerKeypair)

  // Serialize the transaction
  const serializedTransaction = transaction.serialize({
    requireAllSignatures: false,
  })

  // Encode the serialized transaction in base64 and return it along with a message in the API response
  const base64 = serializedTransaction.toString("base64")
  const message = `You've found location ${currentLocation.id}!`

  return {
    transaction: base64,
    message,
  }
}

// Fetch the user state or add the "initialize" instruction if necessary
async function fetchOrInitializeUserState(
  account: PublicKey,
  transaction: Transaction
): Promise<UserState | void> {
  // Calculate the program derived address for the user state account
  const userStatePDA = findProgramAddressSync(
    [gameId.toBuffer(), account.toBuffer()],
    program.programId
  )[0]

  try {
    // Try to fetch the user state account
    return await program.account.userState.fetch(userStatePDA)
  } catch (e) {
    // If the user state account does not exist, add an "initialize" instruction to the transaction
    const initializeInstruction = await program.methods
      .initialize(gameId)
      .accounts({ user: account })
      .instruction()
    transaction.add(initializeInstruction)
  }
}

// Verify that the user is at the correct location
function verifyCorrectLocation(
  userState: UserState | void,
  currentLocation: any
): PostResponse | undefined {
  // If userState is undefined
  if (!userState) {
    // Check if current location is first location
    if (currentLocation.id === 1) {
      // If the user is at the first location, return undefined to continue building transaction
      return
    } else {
      // If the current location is not the first location, return with an error message
      return {
        transaction: "",
        message: "You missed the first location, go back!",
      }
    }
  }

  // If userState is defined, find the last location based on the user state's "lastLocation" field
  const lastLocation = locations.find(
    (location) => location.key.toString() === userState.lastLocation.toString()
  )

  // If the last location is not found, return an error message
  if (!lastLocation) {
    return {
      transaction: "",
      message: "Unrecognized previous location, where did you go?",
    }
  }

  // If the current location is not immediately following the last location recorded in the user state, return an error message
  if (currentLocation.id !== lastLocation.id + 1) {
    return {
      transaction: "",
      message: "You're at the wrong location, keep looking!",
    }
  }
}

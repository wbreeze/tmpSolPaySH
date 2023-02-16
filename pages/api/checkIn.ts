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
function get(res: NextApiResponse<GetResponse>) {}

// Handle a "POST" request
async function post(
  req: NextApiRequest,
  res: NextApiResponse<PostResponse | PostError>
) {}

import { NextApiRequest, NextApiResponse } from "next"
import { Keypair } from "@solana/web3.js"

const eventOrganizer = getEventOrganizer()

function getEventOrganizer() {
  const eventOrganizer = JSON.parse(
    process.env.EVENT_ORGANIZER ?? ""
  ) as number[]
  if (!eventOrganizer) throw new Error("EVENT_ORGANIZER not found")

  return Keypair.fromSecretKey(Uint8Array.from(eventOrganizer))
}

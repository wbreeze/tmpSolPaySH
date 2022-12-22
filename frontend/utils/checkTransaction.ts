import { utils } from "@project-serum/anchor"
import {
  createQR,
  encodeURL,
  findReference,
  FindReferenceError,
  TransactionRequestURLFields,
} from "@solana/pay"
import { Keypair, PublicKey } from "@solana/web3.js"
import { connection } from "./anchorSetup"

export const checkTransaction = async (
  reference: PublicKey,
  setReference: (newReference: PublicKey) => void
) => {
  try {
    // Check for transactions including the reference public key
    await findReference(connection, reference, {
      finality: "confirmed",
    })
    // If a transaction is confirmed, generate a new reference and display an alert
    setReference(Keypair.generate().publicKey)
    window.alert("Transaction Confirmed")
  } catch (e) {
    // If current reference not found, ignore error
    if (e instanceof FindReferenceError) {
      console.log(reference.toString(), "not confirmed")
      return
    }
    console.error("Unknown error", e)
  }
}

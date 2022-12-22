import { Program, Idl } from "@project-serum/anchor"
import { PublicKey } from "@solana/web3.js"
import { IDL, Nft } from "../idl/nft"

const programId = new PublicKey("5aia16UteFJBDNNW3RBqtxRqVKULCBKgppjPafEvTzG1")

export const program = new Program(
  IDL as Idl,
  programId
) as unknown as Program<Nft>

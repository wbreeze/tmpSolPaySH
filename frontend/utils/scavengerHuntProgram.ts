import { Program, Idl } from "@project-serum/anchor"
import { PublicKey } from "@solana/web3.js"
import { IDL, ScavengerHunt } from "../idl/scavenger_hunt"

const programId = new PublicKey("9gQfxMKfELeAjLmAoriLpkVPSHd7xb36cBfYXDXX27xE")

export const program = new Program(
  IDL as Idl,
  programId
) as unknown as Program<ScavengerHunt>

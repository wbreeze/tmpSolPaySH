import * as anchor from "@project-serum/anchor"
import { Program } from "@project-serum/anchor"
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey"
import { expect } from "chai"
import { ScavengerHunt } from "../target/types/scavenger_hunt"
const fs = require("fs")

describe("scavenger-hunt", () => {
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)

  const program = anchor.workspace.ScavengerHunt as Program<ScavengerHunt>

  const rawdata = fs.readFileSync(
    "tests/keys/fun8eenPrVMJtiQNE7q1iBVDNuY2Lbnc3x8FFgCt43N.json"
  )
  const keyData = JSON.parse(rawdata)
  const eventOrganizer = anchor.web3.Keypair.fromSecretKey(
    new Uint8Array(keyData)
  )

  const [userStatePDA] = findProgramAddressSync(
    [provider.wallet.publicKey.toBuffer()],
    program.programId
  )

  it("Initialized", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc()
  })

  it("Check In", async () => {
    // Add your test here.
    const tx = await program.methods
      .checkIn()
      .accounts({ eventOrganizer: eventOrganizer.publicKey })
      .signers([eventOrganizer])
      .rpc()

    const userState = await program.account.userState.fetch(userStatePDA)
    expect(userState.lastPoint).to.equal(1)

    await new Promise((resolve) => setTimeout(resolve, 1000))
  })

  it("Check In", async () => {
    // Add your test here.
    const tx = await program.methods
      .checkIn()
      .accounts({ eventOrganizer: eventOrganizer.publicKey })
      .signers([eventOrganizer])
      .rpc()

    const userState = await program.account.userState.fetch(userStatePDA)
    expect(userState.lastPoint).to.equal(2)
  })
})

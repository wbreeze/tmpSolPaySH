import { createQR, encodeURL, TransactionRequestURLFields } from "@solana/pay"
import { PublicKey } from "@solana/web3.js"
import { RefObject } from "react"

export const createQRCode = (
  qrRef: RefObject<HTMLDivElement>,
  reference: PublicKey
) => {
  const { location } = window

  const params = new URLSearchParams()

  params.append("reference", reference.toString())
  console.log(reference.toString(), "new reference")

  const apiUrl = `${location.protocol}//${
    location.host
  }/api/pointOne?${params.toString()}`

  const urlFields: TransactionRequestURLFields = {
    link: new URL(apiUrl),
  }

  const url = encodeURL(urlFields)

  const qr = createQR(url, 400, "transparent")
  if (qrRef.current) {
    qrRef.current.innerHTML = ""
    qr.append(qrRef.current)
  }
}

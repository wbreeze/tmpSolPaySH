import { Flex, Heading, VStack } from "@chakra-ui/react"
import { Keypair } from "@solana/web3.js"
import { useEffect, useRef, useState } from "react"
import { createQRCode } from "../../utils/createQrCode/pointOne"
import { checkTransaction } from "../../utils/checkTransaction"

const PointOne = () => {
  const qrRef = useRef<HTMLDivElement>(null)
  const [reference, setReference] = useState(Keypair.generate().publicKey)

  useEffect(() => {
    createQRCode(qrRef, reference)
  }, [reference])

  useEffect(() => {
    const interval = setInterval(() => {
      checkTransaction(reference, setReference)
    }, 1500)

    return () => {
      clearInterval(interval)
    }
  }, [reference])

  return (
    <VStack justifyContent="center">
      <Heading>Scavenger Hunt</Heading>
      <Flex ref={qrRef} />
    </VStack>
  )
}

export default PointOne

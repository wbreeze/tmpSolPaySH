import { Flex, Heading, VStack } from "@chakra-ui/react"
import { useRouter } from "next/router"
import { locations } from "../../utils/locations"
import { Keypair } from "@solana/web3.js"
import { useEffect, useRef, useState } from "react"
import { createQRCode } from "../../utils/createQrCode/checkIn"
import { checkTransaction } from "../../utils/checkTransaction"

const TestPage = () => {
  const router = useRouter()
  const { id } = router.query
  const locationKey = locations.find((location) => location.id === id)?.key
  console.log(locationKey?.toString(), "test page")

  const qrRef = useRef<HTMLDivElement>(null)
  const [reference, setReference] = useState(Keypair.generate().publicKey)

  useEffect(() => {
    createQRCode(qrRef, reference, locationKey!)
  }, [reference, locationKey])

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
      <Heading>Point {id}</Heading>
      <Flex ref={qrRef} />
    </VStack>
  )
}

export default TestPage

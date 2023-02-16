import { Keypair } from "@solana/web3.js"

// Export an array of locations created by the createLocationsArray function
export const locations = createLocationsArray(3)

// Function that creates an array of locations with a specified number of locations
function createLocationsArray(numLocations: number) {
  // Initialize empty array
  let locations = []

  // Loop through the specified number of locations
  for (let i = 1; i <= numLocations; i++) {
    // Generate a new public key and push a new location object to the array
    locations.push({
      id: i,
      key: Keypair.generate().publicKey,
    })
  }

  // Return the array of locations
  return locations
}

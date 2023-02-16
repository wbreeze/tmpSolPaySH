import {
  MenuButton,
  Flex,
  Menu,
  MenuItem,
  MenuList,
  IconButton,
} from "@chakra-ui/react"
import { HamburgerIcon } from "@chakra-ui/icons"
import { locations } from "../utils/locations"
import Link from "next/link"

const Navbar = () => {
  return (
    <Flex px={4} py={4}>
      <Menu>
        <MenuButton
          as={IconButton}
          icon={<HamburgerIcon />}
          variant="outline"
        />
        <MenuList>
          <MenuItem as={Link} href="/">
            Home
          </MenuItem>
          {locations.map((location) => (
            <MenuItem
              as={Link}
              href={`/location/${location.id}`}
              key={location.id}
            >
              Location {location.id}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </Flex>
  )
}

export default Navbar

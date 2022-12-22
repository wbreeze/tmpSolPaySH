import {
  MenuButton,
  Flex,
  Menu,
  MenuItem,
  MenuList,
  IconButton,
} from "@chakra-ui/react"
import { HamburgerIcon } from "@chakra-ui/icons"
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
          <MenuItem as={Link} href="/pointOne">
            Scavenger Hunt
          </MenuItem>
          <MenuItem as={Link} href="/pointTwo">
            Mint Nft
          </MenuItem>
        </MenuList>
      </Menu>
    </Flex>
  )
}

export default Navbar

import React from "react";
import {
  Button,
  Center,
  Flex,
  Grid,
  GridItem,
  IconButton,
  HStack,
  Link,
  Text,
  VStack,
  // useBreakpointValue,
  SkipNavLink,
  SkipNavContent,
} from "@chakra-ui/react";
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@/components/ui/menu";
import { Avatar } from "@/components/ui/avatar";

import { HiOutlineMail } from "react-icons/hi";
import { BsDiscord } from "react-icons/bs";
import { Outlet, useLoaderData } from "react-router";
import { NavLink } from "react-router";
import RouterLogo from "../RouterLogo";
import { ExternalLinkIcon, HamburgerIcon } from "@chakra-ui/icons";
import axios from "axios";
import { createFullName } from "../../../_utils/names";

export type User =
  | {
      email: string;
      userId: string;
      firstNames: string | null;
      lastNames: string;
      isAnonymous: boolean;
      isAdmin: boolean;
    }
  | undefined;

export async function loader() {
  const {
    data: { user },
  } = await axios.get("/api/getUser");

  return { user };
}

function NavLinkTab({ to, children, dataTest }) {
  // TODO: use end only when path is "/"
  return (
    <NavLink to={to} end data-test={dataTest}>
      {({ isActive }) => {
        // let spinner = null;
        // if (isPending) {
        //   spinner = <Spinner size="sm" />;
        // }
        let color = "doenet.canvastext";
        let borderBottomStyle: "none" | "solid" = "none";
        let borderBottomWidth = "0px";
        if (isActive) {
          color = "doenet.mainBlue";
          borderBottomWidth = "2px";
          borderBottomStyle = "solid";
        }

        return (
          <Center
            h="40px"
            borderBottomStyle={borderBottomStyle}
            borderBottomWidth={borderBottomWidth}
            borderBottomColor={color}
            p="4px"
          >
            <Text fontSize="md" color={color}>
              {children}
            </Text>
            {/* {spinner} */}
          </Center>
        );
      }}
    </NavLink>
  );
}

function NavLinkDropdownTab({ to, children, dataTest }) {
  // TODO: use end only when path is "/"
  return (
    <MenuItem asChild value={to}>
      <NavLink to={to} end data-test={dataTest}>
        {({ isActive }) => {
          let color = "doenet.canvastext";
          if (isActive) {
            color = "doenet.mainBlue";
          }

          return (
            <Center
              h="40px"
              borderBottomStyle="none"
              borderBottomWidth="0px"
              borderBottomColor={color}
              p="4px"
            >
              <Text fontSize="md" color={color}>
                {children}
              </Text>
            </Center>
          );
        }}
      </NavLink>
    </MenuItem>
  );
}

export function SiteHeader() {
  const { user } = useLoaderData() as { user: User };

  // const helpMenuShouldFocusFirst = useBreakpointValue(
  //   { base: false, md: true },
  //   { ssr: false },
  // );

  return (
    <>
      <SkipNavLink zIndex="2000">Skip to content</SkipNavLink>
      <Grid
        templateAreas={`"siteHeader"
        "main"`}
        gridTemplateRows="40px auto"
        width="100vw"
        height="100vh"
      >
        <GridItem
          area="siteHeader"
          as="header"
          width="100vw"
          m="0"
          backgroundColor="#fff"
          color="#000"
          height="40px"
        >
          <Grid
            height="40px"
            position="fixed"
            top="0"
            zIndex="1000"
            borderBottom="1px solid var(--mainGray)"
            // paddingBottom="2px"
            width="100%"
            margin="0"
            display="flex"
            justifyContent="space-between"
            templateAreas={`"leftHeader menus rightHeader"
        "main"`}
            gridTemplateColumns="1f auto 1f"
          >
            <GridItem area="leftHeader">
              <Center h="100%">
                {/* <Button display={{ base: "flex", md: "none" }}>
                  TABS HERE
                </Button> */}
                <RouterLogo />
              </Center>
            </GridItem>
            <GridItem area="menus" hideBelow="md">
              <HStack gap={8}>
                <NavLinkTab to="/" dataTest="Home">
                  Home
                </NavLinkTab>
                <NavLinkTab to="explore" dataTest="Explore">
                  Explore
                </NavLinkTab>
                {!user || user.isAnonymous ? (
                  <NavLinkTab to="code" dataTest="Class Code">
                    Class Code
                  </NavLinkTab>
                ) : null}
                {user && !user.isAnonymous && (
                  <>
                    <NavLinkTab
                      to={`activities/${user.userId}`}
                      dataTest="Activities"
                    >
                      My Activities
                    </NavLinkTab>
                    <NavLinkTab to={`assigned`} dataTest="Assigned">
                      Assigned to Me
                    </NavLinkTab>
                    {user.isAdmin && (
                      <NavLinkTab to="admin" dataTest="Admin">
                        Admin
                      </NavLinkTab>
                    )}
                  </>
                )}
              </HStack>
            </GridItem>
            <GridItem area="rightHeader">
              <Flex columnGap="10px">
                {/* <MenuRoot autoSelect={helpMenuShouldFocusFirst}> */}
                <MenuRoot>
                  <MenuTrigger
                    as={Button}
                    color="doenet.canvastext"
                    backgroundColor="doenet.mainGray"
                  >
                    Help
                  </MenuTrigger>
                  <MenuContent>
                    <MenuItem value="mailto:info@doenet.org">
                      <HStack>
                        <HiOutlineMail fontSize="12pt" />
                        <Text>Email us</Text>
                      </HStack>
                    </MenuItem>
                    <MenuItem value="https://discord.gg/PUduwtKJ5h">
                      <HStack>
                        <BsDiscord fontSize="12pt" />
                        <Text>Join our Discord</Text>
                      </HStack>
                    </MenuItem>

                    <MenuItem value="https://www.doenet.org/activityViewer/_7KL7tiBBS2MhM6k1OrPt4">
                      <HStack>
                        <ExternalLinkIcon />
                        <Text>Authoring Docs</Text>
                      </HStack>
                    </MenuItem>
                  </MenuContent>
                </MenuRoot>

                {user ? (
                  <Center h="40px" mr="10px">
                    <MenuRoot>
                      <MenuTrigger>
                        <Avatar size="sm" name={`${createFullName(user)}`} />
                      </MenuTrigger>
                      <MenuContent>
                        <VStack mb="20px">
                          <Avatar size="xl" name={`${createFullName(user)}`} />
                          <Text>{createFullName(user)}</Text>
                          <Text>
                            {user.isAnonymous ? "(anonymous)" : user.email}
                          </Text>
                          {user.isAnonymous ? (
                            <Link href={`/signIn`}>Sign in to save work</Link>
                          ) : null}
                        </VStack>
                        <MenuItem as={Link} value="/changeName">
                          Update name
                        </MenuItem>
                        <MenuItem as="a" value="/api/logout">
                          Log Out
                        </MenuItem>
                      </MenuContent>
                    </MenuRoot>
                  </Center>
                ) : (
                  <Center h="40px" mr="10px">
                    <NavLinkTab to="/signIn" dataTest="signIn">
                      Log In
                    </NavLinkTab>
                  </Center>
                )}
                <Center h="40px" mr="10px" hideFrom="md">
                  {/* <MenuRoot autoSelect={false}> */}
                  <MenuRoot>
                    <MenuTrigger as={IconButton} aria-label="Menu">
                      <HamburgerIcon boxSize="30px" />
                    </MenuTrigger>
                    <MenuContent>
                      <NavLinkDropdownTab to="/" dataTest="Home">
                        Home
                      </NavLinkDropdownTab>
                      <NavLinkDropdownTab to="explore" dataTest="Explore">
                        Explore
                      </NavLinkDropdownTab>
                      {!user || user.isAnonymous ? (
                        <NavLinkDropdownTab to="code" dataTest="Class Code">
                          Class Code
                        </NavLinkDropdownTab>
                      ) : null}
                      {user && !user.isAnonymous && (
                        <>
                          <NavLinkDropdownTab
                            to={`activities/${user.userId}`}
                            dataTest="Activities"
                          >
                            Activities
                          </NavLinkDropdownTab>
                          <NavLinkDropdownTab
                            to={`assigned`}
                            dataTest="Assigned"
                          >
                            Assigned
                          </NavLinkDropdownTab>
                          {user.isAdmin && (
                            <NavLinkDropdownTab to="admin" dataTest="Admin">
                              Admin
                            </NavLinkDropdownTab>
                          )}
                        </>
                      )}
                    </MenuContent>
                  </MenuRoot>
                </Center>
              </Flex>
            </GridItem>
          </Grid>
        </GridItem>
        <GridItem area="main" as="main" margin="0" overflowY="auto">
          <SkipNavContent />
          <Outlet context={user} />
        </GridItem>
      </Grid>
    </>
  );
}

import {
  Alert,
  AlertIcon,
  Box,
  Flex,
  LinkBox,
  LinkOverlay,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import React from "react";

import { Card, CardContent, CardHeader } from "../../components/cardComponents";
import colors from "../../theme/colors";

const StepsWhileLoading = () => {
  const linkColor = useColorModeValue("purple.600", "purple.200");
  const hoverColor = useColorModeValue(
    `${colors.purple[500]}66`,
    `${colors.purple[300]}99`
  );

  const interimStepStyles = {
    borderRadius: "lg",
    sx: {
      ":hover": {
        boxShadow: `0px 1px 6px ${hoverColor}`,
        h2: {
          color: linkColor,
        },
      },
    },
  };

  return (
    <Flex flexDirection="column" alignItems="flex-start">
      <Alert status="info" rounded="md" width="fit-content" p={4}>
        <AlertIcon />
        New regions can take a few minutes to set up. In the meantime, here are
        some next steps!
      </Alert>
      <Box py={8} margin="auto" width="100%">
        <VStack spacing={8}>
          <Card>
            <LinkBox as="article" {...interimStepStyles}>
              <LinkOverlay
                href="/access"
                target="_blank"
                rel="noopener noreferrer"
              >
                <CardHeader>1. Create a password</CardHeader>
                <CardContent>
                  App passwords are now available! Click here to generate one.
                </CardContent>
              </LinkOverlay>
            </LinkBox>
          </Card>
          <Card>
            <LinkBox as="article" {...interimStepStyles}>
              <LinkOverlay
                href="https://materialize.com/docs/get-started/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <CardHeader>2. Follow our Get Started guide</CardHeader>
                <CardContent>
                  Connect a streaming source and create your first materialized
                  view in seconds.
                </CardContent>
              </LinkOverlay>
            </LinkBox>
          </Card>
          <Card>
            <LinkBox as="article" {...interimStepStyles}>
              <LinkOverlay
                href="https://materialize.com/blog"
                target="_blank"
                rel="noopener noreferrer"
              >
                <CardHeader>3. Check our latest blog posts</CardHeader>
                <CardContent>
                  Stay up to date with our latest updates and releases!
                </CardContent>
              </LinkOverlay>
            </LinkBox>
          </Card>
        </VStack>
      </Box>

      <Flex textAlign="center" alignItems="center" margin="auto">
        Looking for help?
        <LinkBox
          width="fit-content"
          padding={4}
          rounded="md"
          as="button"
          bottom={0}
        >
          <LinkOverlay
            href="https://materialize.com/s/chat"
            display="flex"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              width="21"
              height="21"
              viewBox="0 0 21 21"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M4.31717 13.238C4.31717 14.4012 3.37517 15.3432 2.21199 15.3432C1.04881 15.3432 0.106812 14.4012 0.106812 13.238C0.106812 12.0748 1.04881 11.1328 2.21199 11.1328H4.31717V13.238Z"></path>
              <path d="M5.37042 13.238C5.37042 12.0748 6.31242 11.1328 7.4756 11.1328C8.63878 11.1328 9.58078 12.0748 9.58078 13.238V18.5017C9.58078 19.6649 8.63878 20.6069 7.4756 20.6069C6.31242 20.6069 5.37042 19.6649 5.37042 18.5017V13.238Z"></path>
              <path d="M7.4756 4.81729C6.31242 4.81729 5.37042 3.87529 5.37042 2.71211C5.37042 1.54893 6.31242 0.606934 7.4756 0.606934C8.63878 0.606934 9.58078 1.54893 9.58078 2.71211V4.81729H7.4756Z"></path>
              <path d="M7.47574 5.87061C8.63891 5.87061 9.58091 6.81261 9.58091 7.97578C9.58091 9.13896 8.63891 10.081 7.47574 10.081H2.21199C1.04881 10.081 0.106812 9.13737 0.106812 7.97578C0.106812 6.8142 1.04881 5.87061 2.21199 5.87061H7.47574Z"></path>
              <path d="M15.8955 7.97578C15.8955 6.81261 16.8375 5.87061 18.0007 5.87061C19.1639 5.87061 20.1059 6.81261 20.1059 7.97578C20.1059 9.13896 19.1639 10.081 18.0007 10.081H15.8955V7.97578Z"></path>
              <path d="M14.8423 7.97586C14.8423 9.13904 13.9003 10.081 12.7372 10.081C11.574 10.081 10.632 9.13904 10.632 7.97586V2.71211C10.632 1.54893 11.574 0.606934 12.7372 0.606934C13.9003 0.606934 14.8423 1.54893 14.8423 2.71211V7.97586Z"></path>
              <path d="M12.7371 16.3967C13.9003 16.3967 14.8423 17.3387 14.8423 18.5019C14.8423 19.6651 13.9003 20.6071 12.7371 20.6071C11.574 20.6071 10.632 19.6651 10.632 18.5019V16.3967H12.7371Z"></path>
              <path d="M12.7372 15.3432C11.574 15.3432 10.632 14.4012 10.632 13.238C10.632 12.0748 11.574 11.1328 12.7372 11.1328H18.0009C19.1641 11.1328 20.1061 12.0748 20.1061 13.238C20.1061 14.4012 19.1641 15.3432 18.0009 15.3432H12.7372Z"></path>
            </svg>
            <Text
              className="inline-on-desktop"
              marginLeft={1}
              fontWeight="bold"
            >
              Join the Community
            </Text>
          </LinkOverlay>
        </LinkBox>
      </Flex>
    </Flex>
  );
};

export default StepsWhileLoading;

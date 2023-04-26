import { Box, Button, ButtonProps, Text } from "@chakra-ui/react";
import React from "react";
import { Link, LinkProps } from "react-router-dom";

export type IconNavLinkProps = LinkProps &
  ButtonProps & {
    iconSource?: string;
  };

const IconNavLink = ({ iconSource, children, ...props }: IconNavLinkProps) => {
  return (
    <Button
      as={Link}
      variant="outline"
      p="4"
      height="auto"
      justifyContent="left"
      {...props}
    >
      <Box as="img" src={iconSource} mr="4" />
      <Text textStyle="text-ui-med">{children}</Text>
    </Button>
  );
};

export default IconNavLink;

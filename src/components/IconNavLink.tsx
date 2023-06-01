import { Box, Button, ButtonProps, Text } from "@chakra-ui/react";
import React from "react";
import { Link, LinkProps } from "react-router-dom";

export type IconNavLinkProps = LinkProps &
  ButtonProps & {
    icon?: React.ReactNode;
  };

const IconNavLink = ({ icon, children, ...props }: IconNavLinkProps) => {
  return (
    <Button
      as={Link}
      variant="outline"
      p="4"
      height="auto"
      justifyContent="left"
      {...props}
    >
      {icon && (
        <Box mr="4" flexShrink="0">
          {icon}
        </Box>
      )}
      <Text textStyle="text-ui-med" textOverflow="ellipsis" overflow="hidden">
        {children}
      </Text>
    </Button>
  );
};

export default IconNavLink;

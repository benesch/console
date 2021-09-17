import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
} from "@chakra-ui/react";
import React from "react";

type Props = {
  title: string;
};

const TextCollapse: React.FC<Props> = ({ title, children }) => {
  return (
    <Accordion allowMultiple w="100%">
      <AccordionItem border="none">
        <AccordionButton>
          <Box flex="1" textAlign="left">
            {title}
            <AccordionIcon />
          </Box>
        </AccordionButton>
        <AccordionPanel pb={4}>{children}</AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

export default TextCollapse;

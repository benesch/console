import { Flex } from "@chakra-ui/layout";
import { Tab, TabList, TabListProps, TabProps, Tabs } from "@chakra-ui/tabs";
import React from "react";

/** a drop in replacement to the tab component that can be used in a card header */
export const CardTab: React.FC<TabProps> = (props) => {
  return <Tab py={4} {...props} />;
};

/** a drop in replacement to the TabList component that can be used in a card header container */
export const CardTabList: React.FC<TabListProps> = (props) => {
  return (
    <TabList
      as={Flex}
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      px="2"
      {...props}
    ></TabList>
  );
};

export const CardTabs = Tabs;

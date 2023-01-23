import {
  Heading,
  Table,
  TableCellProps,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useTheme,
  VStack,
} from "@chakra-ui/react";
import React from "react";

import data from "~/access/pricing.json";
import TextLink from "~/components/TextLink";
import { PageHeader, PageHeading } from "~/layouts/BaseLayout";
import { MaterializeTheme } from "~/theme";

const PricingPage = () => {
  const {
    colors: { semanticColors },
    shadows,
  } = useTheme<MaterializeTheme>();
  const { pricingTerms, consumptionTable } = data;

  const capacityPricingNotice = (
    <Td
      rowSpan={3}
      borderLeftStyle="solid"
      borderLeftWidth="1px"
      borderLeftColor={semanticColors.border.primary}
      borderBottom="none"
      textAlign="center"
      fontSize="xs"
    >
      For information on capacity pricing,
      <br />
      contact{" "}
      <TextLink href="mailto:sales@materialize.com">
        sales@materialize.com
      </TextLink>
    </Td>
  );

  const cellStyle = (firstCell: boolean): Partial<TableCellProps> => {
    if (firstCell) {
      return {
        color: semanticColors.foreground.secondary,
        fontWeight: 500,
        fontSize: "sm",
      };
    }

    return {};
  };
  return (
    <>
      <PageHeader>
        <PageHeading>Pricing</PageHeading>
      </PageHeader>
      <VStack alignItems="flex-start" spacing={8} mb={8}>
        <Table variant="rounded" width="100%" shadow={shadows.level2}>
          <Thead>
            <Tr>
              <Th colSpan={4}>
                <Text
                  fontWeight={500}
                  fontSize="md"
                  lineHeight="20px"
                  py={4}
                  textTransform="none"
                  color={semanticColors.foreground.primary}
                >
                  On Demand Terms
                </Text>
              </Th>
            </Tr>
            <Tr>
              <Th></Th>
              {pricingTerms.cols.map((region) => (
                <Th
                  key={region}
                  textAlign="left"
                  width="25%"
                  fontSize="sm"
                  fontWeight={500}
                  textTransform="lowercase"
                  color={semanticColors.foreground.secondary}
                >
                  {region}
                </Th>
              ))}
              <Th
                textAlign="center"
                fontWeight={500}
                color={semanticColors.foreground.secondary}
                textTransform="none"
              >
                Capacity
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {pricingTerms.rows.map((row, i) => (
              <Tr key={i}>
                {row.map((val, j) => (
                  <Td key={j} textAlign="left" {...cellStyle(j === 0)}>
                    {val}
                  </Td>
                ))}
                {i === 0 && capacityPricingNotice}
              </Tr>
            ))}
          </Tbody>
        </Table>
        <VStack width="100%" alignItems="flex-start" spacing={2}>
          <Heading
            as="h2"
            fontSize="xl"
            fontWeight={500}
            lineHeight="24px"
            color={semanticColors.foreground.primary}
            mb={2}
          >
            Credit Consumption
          </Heading>
          <Table
            variant="rounded"
            width="100%"
            marginTop={2}
            shadow={shadows.level2}
          >
            <Thead>
              <Tr>
                <Th
                  colSpan={13}
                  fontWeight={500}
                  fontSize="md"
                  lineHeight="20px"
                  py={4}
                  textTransform="none"
                  color={semanticColors.foreground.primary}
                >
                  {consumptionTable.title}
                </Th>
              </Tr>
              <Tr></Tr>
              <Tr>
                {consumptionTable.values.map((val, i) => (
                  <Th key={i} {...cellStyle(true)}>
                    {val.title}
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                {consumptionTable.values.map((val, i) => (
                  <Td key={i}>{val.value}</Td>
                ))}
              </Tr>
            </Tbody>
          </Table>
        </VStack>
      </VStack>
    </>
  );
};

export default PricingPage;

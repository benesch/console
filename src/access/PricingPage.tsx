import {
  Button,
  Heading,
  HStack,
  Select,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { AdminPortal } from "@frontegg/react";
import React, { ChangeEvent } from "react";

import data from "~/access/pricing.json";
import { Card, CardContent, CardHeader } from "~/components/cardComponents";
import TextLink from "~/components/TextLink";
import { PageHeader, PageHeading } from "~/layouts/BaseLayout";
import { semanticColors } from "~/theme/colors";

type StaticRegion = "AWS/us-east-1" | "AWS/eu-west-1";

const showFronteggSubscriptionPortal = () => {
  window.location.href = "#/admin-box/subscriptions";
  AdminPortal.show();
};

const PricingPage = () => {
  const { pricingTerms, consumptionTables, regions } = data;
  const [region, setRegion] = React.useState<StaticRegion>(
    regions[0] as StaticRegion
  );
  const borderColor = useColorModeValue(
    semanticColors.divider.light,
    semanticColors.divider.dark
  );

  const capacityPricingNotice = (
    <Td
      rowSpan={3}
      borderLeftStyle="solid"
      borderLeftWidth="1px"
      borderLeftColor={borderColor}
      textAlign="center"
    >
      For information on
      <br />
      capacity pricing,
      <br />
      contact{" "}
      <TextLink href="mailto:sales@materialize.com">
        sales@materialize.com
      </TextLink>
    </Td>
  );

  const handleSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    setRegion(e.target.value as StaticRegion);
  };

  return (
    <>
      <PageHeader>
        <PageHeading>Pricing</PageHeading>
      </PageHeader>
      <HStack mb={5}>
        <Heading fontWeight="400" fontSize="lg">
          Region:
        </Heading>
        <Select value={region} onChange={handleSelect} maxWidth="300px">
          {regions.map((r) => (
            <option key={`region-${r}`} value={r}>
              {r}
            </option>
          ))}
        </Select>
      </HStack>
      <VStack alignItems="flex-start" spacing={8} mb={8}>
        <Card px="0" pb="6" maxWidth="800px" minWidth="fit-content">
          <CardHeader>Pricing terms: {region}</CardHeader>
          <Table
            borderRadius="xl"
            sx={{
              tableLayout: "fixed",
            }}
          >
            <Thead>
              <Tr>
                <Th></Th>
                {pricingTerms.cols.map((col) => (
                  <Th key={`price-header-${col.title}`} textAlign="center">
                    {col.title}
                  </Th>
                ))}
                <Th textAlign="center">Capacity</Th>
              </Tr>
            </Thead>
            <Tbody>
              {pricingTerms.rows.map((rowTitle, i) => (
                <Tr key={`priceType-${rowTitle}`}>
                  <Th>{rowTitle}</Th>
                  {pricingTerms.cols.map((col, j) => (
                    <Td
                      key={`price-${region}-${rowTitle}-${j}}`}
                      textAlign="center"
                    >
                      {col.values[region][i]}
                    </Td>
                  ))}
                  {i === 0 && capacityPricingNotice}
                </Tr>
              ))}
            </Tbody>
          </Table>
          <CardContent>
            <HStack justifyContent="flex-start" pt={2}>
              <Button
                variant="gradient-1"
                size="lg"
                onClick={showFronteggSubscriptionPortal}
              >
                Manage subscription
              </Button>
            </HStack>
          </CardContent>
        </Card>
        <Card minWidth="fit-content">
          <CardHeader>Credit consumption tables: {region}</CardHeader>
          <CardContent pt={1} px={0}>
            <VStack spacing={6}>
              {consumptionTables.map(({ title, values }) => (
                <Table key={`consumption-table-${title}`}>
                  <Thead>
                    <Tr>
                      <Th colSpan={values[region].length}>{title}</Th>
                    </Tr>
                    <Tr>
                      {values[region].map((val) => (
                        <Th key={`consumption-${title}-size-${val.title}`}>
                          {val.title}
                        </Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    <Tr>
                      {values[region].map((val) => (
                        <Td key={`consumption-${title}-cost-${val.value}`}>
                          {val.value}
                        </Td>
                      ))}
                    </Tr>
                  </Tbody>
                </Table>
              ))}
            </VStack>
          </CardContent>
        </Card>
      </VStack>
    </>
  );
};

export default PricingPage;

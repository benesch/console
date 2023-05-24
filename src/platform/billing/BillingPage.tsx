import {
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useTheme,
} from "@chakra-ui/react";
import { format } from "date-fns";
import React from "react";

import { useInvoices } from "~/api/auth";
import ErrorBox from "~/components/ErrorBox";
import StatusPill from "~/components/StatusPill";
import TextLink from "~/components/TextLink";
import { PageHeader, PageHeading } from "~/layouts/BaseLayout";
import { MaterializeTheme } from "~/theme";

import { INVOICE_FETCH_ERROR_MESSAGE } from "./constants";

const BillingPage = () => {
  const { invoices, loading, error } = useInvoices();
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  return (
    <>
      <PageHeader>
        <PageHeading>Invoices</PageHeading>
      </PageHeader>
      {loading ? (
        <Spinner data-testid="loading-spinner" />
      ) : error ? (
        <ErrorBox message={INVOICE_FETCH_ERROR_MESSAGE} />
      ) : (
        <Table
          variant="standalone"
          data-testid="invoices-table"
          borderRadius="xl"
        >
          <Thead>
            <Tr>
              <Th>Issue date</Th>
              <Th>Status</Th>
              <Th>Amount due</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {invoices !== null &&
              invoices.map((invoice, i) => {
                // Orb sometimes gives us `hosted_invoice_url` (which the sync server calls `webUrl`)
                // and sometimes `invoice_pdf` (respecitvely `pdfUrl`).
                // The former has more detail, so expose it if possible.
                const link = invoice.webUrl || invoice.pdfUrl;
                const rendered_date = format(
                  new Date(invoice.issueDate),
                  "MMM d, yyyy"
                );
                let bg = undefined;
                let fg = undefined;
                switch (invoice.status) {
                  case "draft":
                    bg = semanticColors.background.tertiary;
                    fg = semanticColors.foreground.secondary;
                    break;
                  case "issued":
                    bg = semanticColors.accent.green;
                    fg = semanticColors.foreground.inverse;
                    break;
                  case "paid":
                    bg = semanticColors.background.info;
                    fg = semanticColors.foreground.secondary;
                    break;
                  case "void":
                    bg = semanticColors.background.inverse;
                    fg = semanticColors.foreground.inverse;
                    break;
                }
                return (
                  <Tr
                    key={i}
                    height="48px"
                    sx={{
                      _hover: {
                        bg: semanticColors.background.primary,
                      },
                    }}
                  >
                    <Td>
                      <Text textStyle="text-ui-med">{rendered_date}</Text>
                    </Td>
                    <Td>
                      <StatusPill
                        status={invoice.status}
                        backgroundColor={bg}
                        textColor={fg}
                        icon={null}
                      />
                    </Td>
                    <Td>{invoice.amountDue}</Td>
                    <Td textAlign="right">
                      {link && (
                        <TextLink
                          href={link}
                          isExternal={true}
                          py={2}
                          px={2}
                          fontWeight="500"
                          borderRadius="8px"
                          sx={{
                            _hover: {
                              bg: semanticColors.background.secondary,
                            },
                          }}
                        >
                          View invoice →
                        </TextLink>
                      )}
                    </Td>
                  </Tr>
                );
              })}
          </Tbody>
        </Table>
      )}
    </>
  );
};

export default BillingPage;

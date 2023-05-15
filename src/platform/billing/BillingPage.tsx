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
import StatusPill from "~/components/StatusPill";
import TextLink from "~/components/TextLink";
import { PageHeader, PageHeading } from "~/layouts/BaseLayout";
import { MaterializeTheme } from "~/theme";

const BillingPage = () => {
  const { invoices, loading } = useInvoices();
  const { colors } = useTheme<MaterializeTheme>();

  return (
    <>
      <PageHeader>
        <PageHeading>Invoices</PageHeading>
      </PageHeader>
      {loading ? (
        <Spinner data-testid="loading-spinner" />
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
                    bg = colors.semanticColors.background.tertiary;
                    fg = colors.semanticColors.foreground.tertiary;
                    break;
                  case "issued":
                    bg = colors.semanticColors.background.primary;
                    fg = colors.semanticColors.foreground.primary;
                    break;
                  case "paid":
                    bg = colors.semanticColors.background.info;
                    fg = colors.semanticColors.foreground.primary;
                    break;
                  case "void":
                    bg = colors.semanticColors.background.inverse;
                    fg = colors.semanticColors.foreground.inverse;
                    break;
                }
                return (
                  <Tr key={i}>
                    <Td>
                      <Text>{rendered_date}</Text>
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
                    <Td>
                      {link && (
                        <TextLink href={link} isExternal={true}>
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

import { Spinner, Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { format } from "date-fns";
import React from "react";

import { useInvoices } from "~/api/auth";
import TextLink from "~/components/TextLink";
import { PageHeader, PageHeading } from "~/layouts/BaseLayout";

const BillingPage = () => {
  const { invoices, loading } = useInvoices();
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
                return (
                  <Tr key={i}>
                    <Td>{rendered_date}</Td>
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

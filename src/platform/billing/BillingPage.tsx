import {
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import React from "react";

import { useInvoices } from "~/api/auth";
import TextLink from "~/components/TextLink";
import { PageHeader, PageHeading } from "~/layouts/BaseLayout";

const BillingPage = () => {
  const { invoices } = useInvoices();
  return (
    <>
      <PageHeader>
        <PageHeading>Invoices</PageHeading>
      </PageHeader>
      <Table
        variant="standalone"
        data-testid="invoices-table"
        borderRadius="xl"
      >
        <Thead>
          <Tr>
            <Th>Issue date</Th>
            <Th>Total amount</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {invoices !== null &&
            invoices.map((i) => {
              // Orb sometimes gives us `hosted_invoice_url` and sometimes `invoice_pdf`.
              // The former has more detail, so expose it if possible.
              const link = i.hostedInvoiceUrl || i.invoicePdf;
              // TODO[btv] -- This is a bit weird: we localize the
              // date, but not the total. Once we can get currency from the invoice, we should also localize that.
              // H/t Julian for pointing this out.
              //
              // E.g.:
              // const rendered_total = new Intl.NumberFormat(navigator.language, {
              //   style: "currency",
              //   currency: i.currency,
              // }).format(Number(i.total));
              const rendered_date = new Date(i.invoiceDate).toLocaleDateString(
                navigator.language,
                { month: "short", day: "numeric", year: "numeric" }
              );
              return (
                <Tr>
                  <Td>{rendered_date}</Td>
                  <Td>{i.total}</Td>
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
    </>
  );
};

export default BillingPage;

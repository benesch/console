import {
  BoxProps,
  Button,
  FormControl,
  FormErrorMessage,
  HStack,
  Input,
  Text,
  useTheme,
  VStack,
} from "@chakra-ui/react";
import {
  api as fronteggApi,
  fetch as fronteggFetch,
  ITeamUser,
  PaginationResult,
} from "@frontegg/rest-api";
import React, { useState } from "react";

import { useAuth } from "~/api/auth";
import useSuccessToast from "~/components/SuccessToast";
import config from "~/config";
import { MaterializeTheme } from "~/theme";

const memberRoleKey = "MaterializePlatform";

const GET_USERS_ENDPOINT = `${config.fronteggUrl}/identity/resources/users/v3`;
const RESET_INVITATION_ENDPOINT = `${config.fronteggUrl}/identity/resources/users/v1/invitation/reset`;

function normalizeFronteggError(error: string) {
  return error.charAt(0).toUpperCase() + error.slice(1).concat(".");
}

async function inviteUserOrResendInvitation(email: string, roleIds: string[]) {
  try {
    await fronteggApi.teams.addUser({
      email,
      roleIds,
    });
  } catch (e) {
    if (e instanceof Error && e.message.includes("User already exists")) {
      const getUsersResults: PaginationResult<ITeamUser> =
        await fronteggFetch.Get(GET_USERS_ENDPOINT, {
          _email: email.length > 0 ? email : undefined,
        });

      const existingUser = getUsersResults.items.find(
        (user) => user.email.toLowerCase() === email.toLowerCase()
      );
      if (!existingUser?.verified) {
        await fronteggFetch.Post(RESET_INVITATION_ENDPOINT, {
          email,
        });
        return;
      }
      throw new Error("User already verified");
    }
    throw e;
  }
}

export type InviteBoxProps = BoxProps;

const NEEDED_PERMISSIONS = [
  "fe.secure.write.tenantInvites",
  "fe.secure.read.roles",
  "fe.secure.read.users",
  "fe.secure.write.resendActivationEmail",
];

const InviteBox = (props: InviteBoxProps) => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  const { user } = useAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useSuccessToast();

  async function handleInviteUser() {
    try {
      setLoading(true);
      const roles = await fronteggApi.roles.getRoles();

      const memberRole = roles.find(({ key }) => key === memberRoleKey);

      if (!memberRole) {
        throw new Error("Member role does not exist");
      }

      await inviteUserOrResendInvitation(email, [memberRole.id]);

      setError(null);
      toast({ description: "Invitation sent" });
    } catch (e) {
      if (e instanceof Error) {
        setError(normalizeFronteggError(e.message));
      }
    } finally {
      setLoading(false);
    }
  }

  // TODO: Replace with Auth Route component
  if (
    NEEDED_PERMISSIONS.some(
      (neededPermission) =>
        !user.permissions.find(({ key }) => key === neededPermission)
    )
  ) {
    return null;
  }

  return (
    <VStack
      spacing="4"
      borderRadius="lg"
      background={semanticColors.background.primary}
      border="1px solid"
      borderColor={semanticColors.border.primary}
      padding="6"
      {...props}
    >
      <VStack alignItems="flex-start">
        <Text textStyle="text-ui-med">Don&apos;t have the credentials?</Text>
        <Text
          textStyle="text-ui-reg"
          color={semanticColors.foreground.secondary}
        >
          Invite a teammate with database access to connect your data.
        </Text>
      </VStack>
      <HStack spacing="4" alignItems="flex-start">
        <FormControl isInvalid={!!error}>
          <Input
            placeholder="Email address"
            flex="1 0"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant={error ? "error" : "default"}
          />
          {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
        </FormControl>

        <Button
          variant="primary"
          size="sm"
          flex="0 0 auto"
          onClick={handleInviteUser}
          isDisabled={loading}
        >
          Send invite
        </Button>
      </HStack>
    </VStack>
  );
};

export default InviteBox;

import { UserResource } from "@clerk/types";

export type SafeUser = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  emailAddresses: { emailAddress: string }[];
};

export function getSafeUser(user: UserResource): SafeUser | null {
  if (!user) return null;
  
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    emailAddresses: user.emailAddresses.map(email => ({ emailAddress: email.emailAddress })),
  };
}


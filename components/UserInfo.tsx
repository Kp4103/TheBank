import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserWithTransactions } from "@/app/actions";

interface UserInfoProps {
  user: UserWithTransactions;
}

export default function UserInfo({ user }: UserInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Information</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">Signed in as:</p>
        <p className="font-semibold">{user.email}</p>
      </CardContent>
    </Card>
  );
}


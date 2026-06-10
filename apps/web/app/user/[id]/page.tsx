import { getUser } from "@/features/user/api";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function UserPage({ params }: Props) {
  const { id } = await params;
  const user = await getUser(id);
  return <div>{user.name}</div>;
}
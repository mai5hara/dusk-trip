import { UserDetail } from './_components/UserDetail';

type UserDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function UserDetailPage({
  params,
}: UserDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params;
  return <UserDetail userId={id} />;
}

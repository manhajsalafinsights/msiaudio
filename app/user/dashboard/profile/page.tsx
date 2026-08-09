import { getCurrentUser } from "@/lib/auth/session";
import { Heading, Text } from "@/components/ui/typography";
import { Container } from "@/components/ui/container";

export const metadata = { title: "Profil" };

export default async function ProfilePage() {
  const user = await getCurrentUser();
  return (
    <Container size="wide">
      <Heading as="h1">Profil</Heading>
      <Text variant="muted" className="mt-2">
        Kelola profil Anda di sini.
      </Text>
      <dl className="mt-4 space-y-1 text-sm">
        <div>
          <dt className="text-muted">Nama</dt>
          <dd>{user?.name}</dd>
        </div>
        <div>
          <dt className="text-muted">Email</dt>
          <dd>{user?.email}</dd>
        </div>
        <div>
          <dt className="text-muted">Peran</dt>
          <dd>{user?.role}</dd>
        </div>
        <div>
          <dt className="text-muted">Status</dt>
          <dd>{user?.status}</dd>
        </div>
      </dl>
    </Container>
  );
}

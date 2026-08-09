import { getCurrentUser } from "@/lib/auth/session";
import { Heading, Text } from "@/components/ui/typography";
import { Container } from "@/components/ui/container";

export const metadata = { title: "Pengaturan" };

export default async function SettingsPage() {
  const user = await getCurrentUser();
  return (
    <Container size="wide">
      <Heading as="h1">Pengaturan</Heading>
      <Text variant="muted" className="mt-2">
        Pengaturan akun untuk {user?.name}.
      </Text>
    </Container>
  );
}

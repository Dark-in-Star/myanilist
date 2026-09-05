import type { Metadata } from "next";
import { getValidAccessToken } from "@/lib/session";
import { LoginPrompt } from "@/components/LoginPrompt";
import { SequelFinder } from "@/components/SequelFinder";

export const metadata: Metadata = { title: "Find sequels" };

export default async function SequelsPage() {
  const token = await getValidAccessToken();

  if (!token) {
    return (
      <LoginPrompt
        description="Log in to scan your list for sequels you haven't added yet."
        returnTo="/mylist/sequels"
      />
    );
  }

  return <SequelFinder />;
}

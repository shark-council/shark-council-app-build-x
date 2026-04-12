import { CouncilChat } from "@/components/councils/council-chat";
import { CouncilChatHero } from "@/components/councils/council-chat-hero";

export default function CouncilChatPage() {
  return (
    <main className="max-w-xl mx-auto px-4 py-8">
      <CouncilChatHero />
      <CouncilChat className="mt-4" />
    </main>
  );
}

// app/dashboard/messages/page.tsx
import { MessagesBrowser } from "@/components/dashboard/messages-browser";

export default function DashboardMessagesPage() {
  return (
    <div className="mx-auto">
      <div>
        <MessagesBrowser />
      </div>
    </div>
  );
}
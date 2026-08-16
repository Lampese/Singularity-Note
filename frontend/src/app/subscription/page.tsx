import { Suspense } from "react";
import { SubscriptionPageClient } from "./SubscriptionPageClient";

export default function SubscriptionPage() {
  return (
    <Suspense fallback={null}>
      <SubscriptionPageClient />
    </Suspense>
  );
}

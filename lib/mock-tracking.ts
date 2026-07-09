// lib/mock-tracking.ts
export type TrackingUpdate = {
  stage: string;
  timestamp: string;
  note: string;
  media?: { kind: "image" | "video"; url: string; caption: string }[];
};

export type TrackedOrder = {
  id: string;
  email: string;
  status: string;
  createdAt: string;
  estimatedDelivery: string;
  courier?: string;
  trackingNumber?: string;
  destination: string;
  items: { name: string; quantity: number }[];
  updates: TrackingUpdate[];
};

export const mockTrackedOrders: TrackedOrder[] = [
  {
    id: "EP-0241",
    email: "amaka@brightbox.ng",
    status: "Dispatch",
    createdAt: "Jul 1, 2026",
    estimatedDelivery: "Jul 12, 2026",
    courier: "GIG Logistics",
    trackingNumber: "GIG-88214460",
    destination: "Ibadan, Nigeria",
    items: [{ name: "Custom Nylon Packaging", quantity: 2000 }],
    updates: [
      {
        stage: "Order received",
        timestamp: "Jul 1, 9:14 AM",
        note: "Order confirmed and queued for design review.",
      },
      {
        stage: "Design",
        timestamp: "Jul 2, 11:02 AM",
        note: "Artwork prepped for proofing.",
      },
      {
        stage: "Approval",
        timestamp: "Jul 3, 4:40 PM",
        note: "Proof approved by customer.",
      },
      {
        stage: "Production",
        timestamp: "Jul 5, 10:20 AM",
        note: "Printing in progress on flexo line 2.",
        media: [
          {
            kind: "image",
            url: "/tracking/production-1.jpg",
            caption: "First pass off the press",
          },
        ],
      },
      {
        stage: "Finishing",
        timestamp: "Jul 7, 2:15 PM",
        note: "Lamination and slitting complete.",
      },
      {
        stage: "Packaging",
        timestamp: "Jul 8, 9:30 AM",
        note: "Rolls boxed for shipment.",
      },
      {
        stage: "Dispatch",
        timestamp: "Jul 9, 8:05 AM",
        note: "Handed to courier for delivery.",
      },
    ],
  },
  {
    id: "EP-1187",
    email: "tunde@例.com",
    status: "Production",
    createdAt: "Jul 6, 2026",
    estimatedDelivery: "Jul 16, 2026",
    destination: "Lagos, Nigeria",
    items: [{ name: "Premium Business Cards", quantity: 500 }],
    updates: [
      {
        stage: "Order received",
        timestamp: "Jul 6, 1:00 PM",
        note: "Order confirmed.",
      },
      {
        stage: "Design",
        timestamp: "Jul 6, 3:45 PM",
        note: "Artwork checked for print readiness.",
      },
      {
        stage: "Approval",
        timestamp: "Jul 7, 10:00 AM",
        note: "Proof approved by customer.",
      },
      {
        stage: "Production",
        timestamp: "Jul 8, 9:00 AM",
        note: "Currently on the press.",
        media: [
          {
            kind: "image",
            url: "/tracking/production-2.jpg",
            caption: "Sheet-fed run in progress",
          },
        ],
      },
    ],
  },
];

export function findTrackedOrder(orderId: string, email: string) {
  const normalizedId = orderId.trim().toUpperCase();
  const normalizedEmail = email.trim().toLowerCase();
  return mockTrackedOrders.find(
    (o) =>
      o.id.toUpperCase() === normalizedId &&
      o.email.toLowerCase() === normalizedEmail,
  );
}

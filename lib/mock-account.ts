export const mockUser = {
  name: "Amara Okafor",
  email: "amara@brightleafco.com",
  company: "Brightleaf Co.",
  phone: "+2348030000000",
  initials: "AO",
};

export const productionStages = [
  "Order Received",
  "Design Approved",
  "In Production",
  "Quality Check",
  "Dispatched",
  "Delivered",
] as const;

export type ProductionStage = (typeof productionStages)[number];

export type OrderItem = {
  productSlug: string;
  name: string;
  image: string;
  options: Record<string, string>;
  quantity: number;
  unitPrice: number;
};

export type TrackingEvent = {
  label: string;
  location: string;
  date: string;
  done: boolean;
};

export type Order = {
  id: string;
  createdAt: string;
  status: ProductionStage;
  items: OrderItem[];
  subtotal: number;
  delivery: number;
  total: number;
  deliveryAddress: string;
  estimatedDelivery: string;
  tracking: TrackingEvent[];
  artworkStatus: "Uploaded" | "Design Requested" | "Approved";
};

export const mockOrders: Order[] = [
  {
    id: "EP-24815",
    createdAt: "2026-06-28",
    status: "In Production",
    artworkStatus: "Approved",
    items: [
      {
        productSlug: "kraft-mailer-box",
        name: "Custom Kraft Mailer Box",
        image: "/products/kraft-mailer-box.png",
        options: { size: "medium", material: "recycled", finish: "matte" },
        quantity: 250,
        unitPrice: 610,
      },
    ],
    subtotal: 152500,
    delivery: 4500,
    total: 157000,
    deliveryAddress: "14 Admiralty Way, Lekki Phase 1, Lagos",
    estimatedDelivery: "2026-07-09",
    tracking: [
      {
        label: "Order placed",
        location: "Online",
        date: "2026-06-28",
        done: true,
      },
      {
        label: "Payment confirmed",
        location: "Paystack",
        date: "2026-06-28",
        done: true,
      },
      {
        label: "Artwork approved",
        location: "Design Studio",
        date: "2026-06-30",
        done: true,
      },
      {
        label: "Printing in progress",
        location: "Lagos Facility",
        date: "2026-07-03",
        done: true,
      },
      {
        label: "Quality check",
        location: "Lagos Facility",
        date: "",
        done: false,
      },
      { label: "Out for delivery", location: "", date: "", done: false },
    ],
  },
  {
    id: "EP-24790",
    createdAt: "2026-06-20",
    status: "Delivered",
    artworkStatus: "Approved",
    items: [
      {
        productSlug: "premium-business-cards",
        name: "Premium Business Cards",
        image: "/products/business-cards.png",
        options: { sides: "double", corners: "rounded", finish: "spot-uv" },
        quantity: 500,
        unitPrice: 26,
      },
      {
        productSlug: "product-labels",
        name: "Custom Product Labels",
        image: "/products/product-labels.png",
        options: { size: "medium", shape: "circle", finish: "gloss" },
        quantity: 1000,
        unitPrice: 55,
      },
    ],
    subtotal: 68000,
    delivery: 3500,
    total: 71500,
    deliveryAddress: "14 Admiralty Way, Lekki Phase 1, Lagos",
    estimatedDelivery: "2026-06-27",
    tracking: [
      {
        label: "Order placed",
        location: "Online",
        date: "2026-06-20",
        done: true,
      },
      {
        label: "Payment confirmed",
        location: "Paystack",
        date: "2026-06-20",
        done: true,
      },
      {
        label: "Artwork approved",
        location: "Design Studio",
        date: "2026-06-21",
        done: true,
      },
      {
        label: "Printed",
        location: "Lagos Facility",
        date: "2026-06-24",
        done: true,
      },
      {
        label: "Dispatched",
        location: "Lagos Facility",
        date: "2026-06-26",
        done: true,
      },
      {
        label: "Delivered",
        location: "Lekki, Lagos",
        date: "2026-06-27",
        done: true,
      },
    ],
  },
  {
    id: "EP-24752",
    createdAt: "2026-06-10",
    status: "Design Approved",
    artworkStatus: "Design Requested",
    items: [
      {
        productSlug: "roll-up-banner",
        name: "Roll-Up Banner",
        image: "/products/roll-up-banner.png",
        options: { size: "standard", material: "premium" },
        quantity: 3,
        unitPrice: 11200,
      },
    ],
    subtotal: 33600,
    delivery: 6000,
    total: 39600,
    deliveryAddress: "7 Ademola Adetokunbo Cres, Wuse 2, Abuja",
    estimatedDelivery: "2026-07-12",
    tracking: [
      {
        label: "Order placed",
        location: "Online",
        date: "2026-06-10",
        done: true,
      },
      {
        label: "Payment confirmed",
        location: "Paystack",
        date: "2026-06-10",
        done: true,
      },
      {
        label: "Design in review",
        location: "Design Studio",
        date: "2026-06-12",
        done: true,
      },
      {
        label: "Awaiting production",
        location: "Abuja Facility",
        date: "",
        done: false,
      },
    ],
  },
];

export type Message = {
  id: string;
  from: "support" | "customer";
  author: string;
  text: string;
  time: string;
  fromSupport?: boolean;
  read?: boolean;
  attachments?: Array<{
    url: string;
    name: string;
    kind: "image" | "video" | "file";
    size: string;
  }>;
};

export type MessageThread = {
  id: string;
  orderId: string;
  subject: string;
  agent: string;
  agentRole: string;
  unread: number;
  updatedAt: string;
  messages: Message[];
};

export const mockThreads: MessageThread[] = [
  {
    id: "thread-1",
    orderId: "EP-24815",
    subject: "Mailer box artwork proof",
    agent: "Tobi Adeyemi",
    agentRole: "Production Specialist",
    unread: 1,
    updatedAt: "2026-07-03T10:24:00",
    messages: [
      {
        id: "m1",
        from: "support",
        author: "Tobi Adeyemi",
        text: "Hi Amara! Your Kraft mailer boxes are now in production. We'll share photos before dispatch.",
        time: "2026-07-03T09:10:00",
      },
      {
        id: "m2",
        from: "customer",
        author: "Amara Okafor",
        text: "Great news, thank you! Can you confirm the interior print is included?",
        time: "2026-07-03T09:40:00",
      },
      {
        id: "m3",
        from: "support",
        author: "Tobi Adeyemi",
        text: "Yes, interior print is included as configured. Estimated dispatch is July 8th.",
        time: "2026-07-03T10:24:00",
      },
    ],
  },
  {
    id: "thread-2",
    orderId: "EP-24752",
    subject: "Banner design concepts",
    agent: "Ngozi Eze",
    agentRole: "Senior Designer",
    unread: 0,
    updatedAt: "2026-06-12T14:05:00",
    messages: [
      {
        id: "m1",
        from: "support",
        author: "Ngozi Eze",
        text: "Hi Amara, I've prepared two banner concepts based on your brief. Which direction do you prefer?",
        time: "2026-06-12T13:30:00",
      },
      {
        id: "m2",
        from: "customer",
        author: "Amara Okafor",
        text: "I love concept 2! Could we make the logo slightly larger?",
        time: "2026-06-12T14:05:00",
      },
    ],
  },
];

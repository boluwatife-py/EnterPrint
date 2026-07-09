// lib/mock-addresses.ts
export type Address = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
  isDefault: boolean;
};

export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT (Abuja)", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

export const mockAddresses: Address[] = [
  {
    id: "addr_1",
    label: "Home",
    fullName: "Ada Okafor",
    phone: "+234 803 555 0192",
    line1: "14 Awolowo Road",
    line2: "Flat 3B",
    city: "Ikoyi",
    state: "Lagos",
    postalCode: "101233",
    country: "Nigeria",
    isDefault: true,
  },
  {
    id: "addr_2",
    label: "Office",
    fullName: "Ada Okafor — Studio 12",
    phone: "+234 809 213 4477",
    line1: "42 Ademola Adetokunbo Crescent",
    city: "Wuse II, Abuja",
    state: "FCT (Abuja)",
    postalCode: "900288",
    country: "Nigeria",
    isDefault: false,
  },
];
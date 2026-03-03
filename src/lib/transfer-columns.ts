export type TransferColumn = {
  key: string;
  label: string;
  bankAccount: string;
  itemName: string;
  onlyMonth?: number;
};

export const TRANSFER_COLUMNS: TransferColumn[] = [
  { key: "mission_fee", label: "宣教会会費", bankAccount: "sbi_individual", itemName: "mission_fee" },
  { key: "dispatch_fee", label: "宣教会派遣宣教費", bankAccount: "sbi_individual", itemName: "dispatch_fee" },
  { key: "mission_offering", label: "宣教会献金(預り金)", bankAccount: "gmo", itemName: "mission_offering" },
  { key: "welfare_fee", label: "福利厚生分担金", bankAccount: "sbi_common", itemName: "welfare_fee", onlyMonth: 2 },
  { key: "broadcast_fee", label: "放送局分担金", bankAccount: "gmo", itemName: "broadcast_fee", onlyMonth: 2 },
  { key: "sbi_other", label: "その他", bankAccount: "sbi_individual", itemName: "other" },
  { key: "sbi_offset", label: "教団相殺分", bankAccount: "sbi_individual", itemName: "offset" },
  { key: "mufg_repay", label: "教団返済等", bankAccount: "mufg", itemName: "repayment" },
];

export type AccountItem = {
  code: string;
  name: string;
  description: string;
};

export type AccountCategory = {
  code: string;
  name: string;
  items: AccountItem[];
};

export type AccountSection = {
  section: "income" | "expense";
  label: string;
  categories: AccountCategory[];
};

export const INCOME_ACCOUNTS: AccountCategory[] = [
  {
    code: "1",
    name: "1 宗教活動収入",
    items: [
      { code: "sunday", name: "主日献金", description: "主日献金" },
      { code: "tithe", name: "十分の一献金", description: "十分の一献金" },
      { code: "thanks", name: "感謝献金", description: "感謝献金" },
      {
        code: "other_offering",
        name: "その他献金",
        description:
          "主日・十分の一・感謝献金以外の献金全般。ふるさと献金等を含む",
      },
      {
        code: "regional_support",
        name: "地方支援献金",
        description: "地方支援献金",
      },
      {
        code: "merger",
        name: "合併収入",
        description: "合併した際の被合併教会財政からの資金移転",
      },
      {
        code: "pioneer",
        name: "巣分け及び開拓献金",
        description: "母教会からの分担金、巣分けおよび開拓のための献金",
      },
      {
        code: "financial_support",
        name: "財政支援金",
        description: "宣教会・地域会・他教会等からの支援献金",
      },
      {
        code: "construction",
        name: "自教会聖殿建築献金",
        description:
          "自教会の聖殿建築のための目的献金。リフォームに対する献金も含む",
      },
      {
        code: "subsidy",
        name: "国庫補助金収入",
        description: "国・地方公共団体からの補助金",
      },
    ],
  },
  {
    code: "2",
    name: "2 資産管理収入",
    items: [
      {
        code: "realestate_sale",
        name: "不動産売却収入",
        description: "不動産売却時の収入",
      },
      {
        code: "vehicle_sale",
        name: "車両売却",
        description: "教会車両売却時の収入",
      },
    ],
  },
  {
    code: "3",
    name: "3 雑収入",
    items: [
      {
        code: "interest",
        name: "受取利息",
        description: "銀行預金や貸付金等からの受取利息",
      },
      {
        code: "misc_income",
        name: "雑収入",
        description: "その他収入、敷金・保証金等の回収等",
      },
    ],
  },
  {
    code: "4",
    name: "4 繰入金収入",
    items: [
      {
        code: "special_transfer",
        name: "特別会計繰入金収入",
        description: "法人化教会における収益事業への資金補填の返金",
      },
    ],
  },
  {
    code: "5",
    name: "5 貸付金回収収入",
    items: [
      {
        code: "loan_recovery",
        name: "貸付金回収収入",
        description: "貸付金の返済を受けた金額",
      },
    ],
  },
  {
    code: "6",
    name: "6 借入金収入",
    items: [
      {
        code: "borrowing",
        name: "借入金収入",
        description: "借入による収入",
      },
    ],
  },
  {
    code: "7",
    name: "7 特別預金取崩収入",
    items: [
      {
        code: "fixed_deposit_withdrawal",
        name: "定期預金引出",
        description:
          "定期預金から引き出した金額。聖殿建築・修繕等の積立から取り崩した場合",
      },
    ],
  },
  {
    code: "8",
    name: "8 預り金収入",
    items: [
      {
        code: "mission_offering_in",
        name: "宣教会献金収入",
        description: "そのまま教団財政に送る献金（365分の1献金など）",
      },
      {
        code: "nature_temple_in",
        name: "自然聖殿管理献金収入",
        description: "自然聖殿管理献金の一時預り金",
      },
      {
        code: "deposit_in",
        name: "預り金収入",
        description: "その他の一時預り金。源泉所得税および社会保険料の預り金",
      },
    ],
  },
];

export const EXPENSE_ACCOUNTS: AccountCategory[] = [
  {
    code: "1-1",
    name: "1 宗教活動支出 (1)宗教活動費",
    items: [
      {
        code: "mission_fee",
        name: "宣教会会費",
        description: "教会財政が毎月教団に送金する宣教会会費(運営費)の振込金額",
      },
      {
        code: "broadcast_fee",
        name: "放送局分担金",
        description: "教会負担のCTN＆明作放送局分担金",
      },
      {
        code: "regional_fee",
        name: "地域会分担金",
        description: "地域会での分担金",
      },
      {
        code: "dispatch_fee",
        name: "宣教会派遣宣教費",
        description: "牧会者・副牧会者・支部長の宣教費",
      },
      {
        code: "pastor_travel",
        name: "牧会者移動費",
        description: "牧会者・副牧会者・支部長の交通費・宿泊費及び引っ越し費用",
      },
      {
        code: "fulltime_travel",
        name: "フルタイム移動費",
        description: "フルタイムの交通費・宿泊費及び引っ越し費用",
      },
      {
        code: "member_travel",
        name: "会員旅費交通費",
        description: "一般信徒に対して教会が支払った交通費、宿泊費等",
      },
      {
        code: "temple_mgmt_fee",
        name: "聖殿管理団体会費",
        description: "教会財政からトンソに直接送った金額",
      },
      {
        code: "mission_support",
        name: "宣教支援費",
        description: "教会部署宣教支援費。宣教関連の行事等での支出",
      },
      {
        code: "external_lecturer",
        name: "外部講師費",
        description: "謝礼・交通費等、教会外から招いたゲストに関連する費用",
      },
      {
        code: "member_reward",
        name: "会員慰労費",
        description: "伝道等の功績者、教会運営に貢献したメンバーへの慰労費",
      },
      {
        code: "event_expense",
        name: "行事費",
        description: "宣教行事以外の、内部行事関連の支出",
      },
      {
        code: "mission_equipment",
        name: "宣教備品費",
        description: "単価5万円以上のもの（教団への確認が必要）",
      },
      {
        code: "mission_consumable",
        name: "宣教消耗品費",
        description: "単価5万円未満のもの（教団への確認が不要）",
      },
      {
        code: "books",
        name: "新聞図書費",
        description: "摂理歴史等、教会保有図書購入費用",
      },
      {
        code: "membership_fee",
        name: "諸会費",
        description: "商店街会費など、聖殿がある地域の関連支出",
      },
      {
        code: "outsource",
        name: "宣教外注費",
        description: "教会HP制作等の外注",
      },
      {
        code: "mission_comm",
        name: "宣教通信費",
        description: "Zoom使用料、ドメイン代、サーバー代等",
      },
      {
        code: "mission_handling",
        name: "宣教支払手数料",
        description: "銀行手数料、ごみ処理費用、弁護士・税理士等への顧問料",
      },
      {
        code: "mission_misc",
        name: "宣教雑費",
        description: "損害賠償費用、和解金等",
      },
      {
        code: "branch_support",
        name: "支部支援費",
        description: "教会内支部への支援金。教会内NPOへの支出",
      },
      {
        code: "other_church_support",
        name: "他教会支援費",
        description: "他教会への支援金。ふるさと献金を含む",
      },
      {
        code: "relief",
        name: "救済費",
        description: "経済的困窮者への生活支援金、災害被災者への見舞金",
      },
    ],
  },
  {
    code: "1-2",
    name: "1 宗教活動支出 (2)管理費(聖殿)",
    items: [
      {
        code: "temple_rent",
        name: "聖殿地代家賃",
        description: "賃料、礼金、更新料",
      },
      {
        code: "temple_comm",
        name: "聖殿通信費",
        description: "電話料金、インターネット料金",
      },
      {
        code: "temple_utility",
        name: "聖殿水道光熱費",
        description: "電気、ガス、水道料金",
      },
      {
        code: "temple_lease",
        name: "聖殿賃借料",
        description: "コピー機リース等の定期契約",
      },
      {
        code: "temple_repair",
        name: "聖殿修繕費",
        description: "聖殿の修繕工事・リフォーム等にかかる費用",
      },
      {
        code: "temple_tax",
        name: "聖殿租税公課",
        description: "固定資産税、法人の印鑑証明書等",
      },
      {
        code: "temple_insurance",
        name: "聖殿支払保険料",
        description: "火災保険料、地震保険料等",
      },
    ],
  },
  {
    code: "1-3",
    name: "1 宗教活動支出 (3)管理費(拠点)",
    items: [
      {
        code: "base_rent",
        name: "拠点地代家賃",
        description: "拠点の賃料、礼金、更新料",
      },
      {
        code: "base_comm",
        name: "拠点通信費",
        description: "拠点の電話料金、インターネット料金",
      },
      {
        code: "base_utility",
        name: "拠点水道光熱費",
        description: "拠点の電気、ガス、水道料金",
      },
      {
        code: "base_lease",
        name: "拠点賃借料",
        description: "拠点の定期契約",
      },
      {
        code: "base_repair",
        name: "拠点修繕費",
        description: "拠点の修繕工事等にかかる費用",
      },
      {
        code: "base_tax",
        name: "拠点租税公課",
        description: "拠点の固定資産税等",
      },
      {
        code: "base_insurance",
        name: "拠点支払保険料",
        description: "拠点の火災保険料等",
      },
    ],
  },
  {
    code: "2-1",
    name: "2 人件費 (1)給与手当",
    items: [
      {
        code: "housing_support",
        name: "住居支援費",
        description: "牧会者・副牧会者・支部長の住居支援費",
      },
      {
        code: "church_mission_fee",
        name: "教会内宣教費",
        description: "教会内宣教費",
      },
    ],
  },
  {
    code: "2-2",
    name: "2 人件費 (2)福利厚生費",
    items: [
      {
        code: "welfare_fee",
        name: "宣教会福利厚生分担金",
        description: "宣教会福利厚生分担金",
      },
      {
        code: "legal_welfare",
        name: "法定福利費",
        description: "法定福利費（社会保険料等の教会負担分）",
      },
    ],
  },
  {
    code: "3",
    name: "3 資産管理支出",
    items: [
      {
        code: "realestate_purchase",
        name: "不動産取得費",
        description: "不動産取得時の支出",
      },
      {
        code: "vehicle_purchase",
        name: "車両購入費",
        description: "教会車両購入時の支出",
      },
    ],
  },
  {
    code: "4",
    name: "4 繰入金支出",
    items: [
      {
        code: "special_transfer_out",
        name: "特別会計繰入金支出",
        description: "法人化教会における収益事業への資金補填",
      },
    ],
  },
  {
    code: "5",
    name: "5 貸付金支出",
    items: [
      {
        code: "loan_out",
        name: "貸付金支出",
        description: "貸付けた金額",
      },
    ],
  },
  {
    code: "6",
    name: "6 借入金返済支出",
    items: [
      {
        code: "loan_repay",
        name: "借入金返済支出",
        description: "借入金の返済",
      },
    ],
  },
  {
    code: "7",
    name: "7 特別預金支出",
    items: [
      {
        code: "fixed_deposit_in",
        name: "定期預金預入",
        description: "定期預金への預け入れ",
      },
    ],
  },
  {
    code: "8",
    name: "8 預り金支出",
    items: [
      {
        code: "mission_offering_out",
        name: "宣教会献金支出",
        description: "教団財政に送る献金の送金",
      },
      {
        code: "nature_temple_out",
        name: "自然聖殿管理献金支出",
        description: "自然聖殿管理献金の送金",
      },
      {
        code: "deposit_out",
        name: "預り金支出",
        description: "その他の預り金の送金",
      },
    ],
  },
];

export const BANK_ACCOUNTS = [
  {
    code: "sbi_individual",
    name: "住信SBIネット銀行（社団法人）各教会個別口座",
    items: [
      { code: "mission_fee", name: "宣教会会費" },
      { code: "dispatch_fee", name: "宣教会派遣宣教費" },
      { code: "other", name: "その他" },
      { code: "offset", name: "教団相殺分（マイナス入力）" },
    ],
  },
  {
    code: "sbi_common",
    name: "住信SBIネット銀行（社団法人）全教会共通口座",
    items: [{ code: "welfare_fee", name: "宣教会福利厚生分担金" }],
  },
  {
    code: "gmo",
    name: "GMOあおぞらネット銀行（社団法人）全教会共通口座",
    items: [
      { code: "broadcast_fee", name: "放送局分担金" },
      { code: "mission_offering", name: "宣教会献金（預り金）" },
    ],
  },
  {
    code: "special",
    name: "特別献金預かり金",
    items: [
      { code: "offering_316", name: "316特別献金（3月）" },
      { code: "offering_alpha", name: "アルパの日献金（6月）" },
      { code: "offering_christmas", name: "クリスマス献金（12月）" },
      { code: "holy_land", name: "聖地管理献金" },
    ],
  },
  {
    code: "mufg",
    name: "三菱UFJ銀行（従来の任意団体）",
    items: [{ code: "repayment", name: "教団への返済等" }],
  },
];

export function getAllIncomeItems(): {
  categoryCode: string;
  categoryName: string;
  item: AccountItem;
}[] {
  return INCOME_ACCOUNTS.flatMap((cat) =>
    cat.items.map((item) => ({
      categoryCode: cat.code,
      categoryName: cat.name,
      item,
    }))
  );
}

export function getAllExpenseItems(): {
  categoryCode: string;
  categoryName: string;
  item: AccountItem;
}[] {
  return EXPENSE_ACCOUNTS.flatMap((cat) =>
    cat.items.map((item) => ({
      categoryCode: cat.code,
      categoryName: cat.name,
      item,
    }))
  );
}

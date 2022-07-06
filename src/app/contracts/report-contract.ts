import { ILanguageKeys } from "@contracts/i-language-keys";

export interface ReportContract {
  id: number;
  url: string;
  langKey: keyof ILanguageKeys,
  context: string

}

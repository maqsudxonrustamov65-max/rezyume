import type { Lang, LevelId } from "./types";

/**
 * Everything printed on the CV that depends on the CV language.
 * Uzbek uses the proper characters: ʻ (U+02BB) in oʻ / gʻ and ʼ (U+02BC) for the tutuq belgisi.
 */
export interface CvLabels {
  /** Language name shown in the switcher. */
  name: string;
  /** BCP 47 tag written into the PDF. */
  locale: string;
  /** Used in the PDF title and file name. */
  cv: string;
  summary: string;
  experience: string;
  education: string;
  projects: string;
  skills: string;
  languages: string;
  certificates: string;
  contact: string;
  phone: string;
  email: string;
  city: string;
  telegram: string;
  linkedin: string;
  present: string;
  months: string[];
  levels: Record<LevelId, string>;
}

export const LABELS: Record<Lang, CvLabels> = {
  en: {
    name: "English",
    locale: "en",
    cv: "CV",
    summary: "Summary",
    experience: "Experience",
    education: "Education",
    projects: "Projects",
    skills: "Skills",
    languages: "Languages",
    certificates: "Certificates",
    contact: "Contact",
    phone: "Phone",
    email: "Email",
    city: "City",
    telegram: "Telegram",
    linkedin: "LinkedIn",
    present: "Present",
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    levels: {
      native: "Native",
      c2: "Proficient (C2)",
      c1: "Advanced (C1)",
      b2: "Upper-intermediate (B2)",
      b1: "Intermediate (B1)",
      a2: "Elementary (A2)",
      a1: "Beginner (A1)",
    },
  },
  uz: {
    name: "Oʻzbekcha",
    locale: "uz-Latn",
    cv: "Rezyume",
    summary: "Qisqacha maʼlumot",
    experience: "Ish tajribasi",
    education: "Taʼlim",
    projects: "Loyihalar",
    skills: "Koʻnikmalar",
    languages: "Tillar",
    certificates: "Sertifikatlar",
    contact: "Aloqa",
    phone: "Telefon",
    email: "Email",
    city: "Shahar",
    telegram: "Telegram",
    linkedin: "LinkedIn",
    present: "hozirgacha",
    months: ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"],
    levels: {
      native: "Ona tili",
      c2: "Mukammal (C2)",
      c1: "Yuqori (C1)",
      b2: "Oʻrtadan yuqori (B2)",
      b1: "Oʻrta (B1)",
      a2: "Elementar (A2)",
      a1: "Boshlangʻich (A1)",
    },
  },
  ru: {
    name: "Русский",
    locale: "ru",
    cv: "Резюме",
    summary: "О себе",
    experience: "Опыт работы",
    education: "Образование",
    projects: "Проекты",
    skills: "Навыки",
    languages: "Языки",
    certificates: "Сертификаты",
    contact: "Контакты",
    phone: "Телефон",
    email: "Эл. почта",
    city: "Город",
    telegram: "Telegram",
    linkedin: "LinkedIn",
    present: "настоящее время",
    months: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
    levels: {
      native: "Родной",
      c2: "Свободный (C2)",
      c1: "Продвинутый (C1)",
      b2: "Выше среднего (B2)",
      b1: "Средний (B1)",
      a2: "Элементарный (A2)",
      a1: "Начальный (A1)",
    },
  },
};

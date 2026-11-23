export type Lang = "en" | "uz" | "ru";
export type TemplateId = "classic" | "modern" | "minimal";
export type LevelId = "native" | "c2" | "c1" | "b2" | "b1" | "a2" | "a1";

export interface Personal {
  fullName: string;
  jobTitle: string;
  phone: string;
  email: string;
  city: string;
  telegram: string;
  linkedin: string;
  /** Square JPEG data URL, or null. */
  photo: string | null;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  city: string;
  /** "YYYY-MM" or "" */
  start: string;
  end: string;
  current: boolean;
  description: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  school: string;
  city: string;
  start: string;
  end: string;
  current: boolean;
  description: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  role: string;
  link: string;
  description: string;
}

export interface SkillItem {
  id: string;
  name: string;
}

export interface LanguageItem {
  id: string;
  name: string;
  level: LevelId;
}

export interface CertificateItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  link: string;
}

export interface CV {
  personal: Personal;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  skills: SkillItem[];
  languages: LanguageItem[];
  certificates: CertificateItem[];
}

export interface CvDoc {
  cv: CV;
  template: TemplateId;
  lang: Lang;
}

export type ListKey = "experience" | "education" | "projects" | "skills" | "languages" | "certificates";
export type ListItem<K extends ListKey> = CV[K][number];

export const LEVELS: LevelId[] = ["native", "c2", "c1", "b2", "b1", "a2", "a1"];
export const TEMPLATES: TemplateId[] = ["classic", "modern", "minimal"];
export const LANGS: Lang[] = ["en", "uz", "ru"];

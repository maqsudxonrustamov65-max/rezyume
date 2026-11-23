import type { CV, Lang } from "./types";

/**
 * A realistic example CV in each language. The person and the companies are
 * fictional; contact details use reserved example values.
 */
const shared = {
  phone: "+998 90 123 45 67",
  email: "aziza.karimova@example.com",
  telegram: "aziza_codes",
  linkedin: "linkedin.com/in/aziza-karimova-example",
};

const SAMPLES: Record<Lang, Omit<CV, "personal"> & { personal: Omit<CV["personal"], keyof typeof shared | "photo"> }> = {
  en: {
    personal: {
      fullName: "Aziza Karimova",
      jobTitle: "Senior Frontend Developer",
      city: "Tashkent, Uzbekistan",
    },
    summary:
      "Frontend developer with 6 years of experience building fast, accessible web applications for fintech and e-commerce. I lead a team of four engineers and work closely with designers to ship products people enjoy using.",
    experience: [
      {
        id: "x1",
        role: "Senior Frontend Developer",
        company: "Silk Road Fintech",
        city: "Tashkent",
        start: "2022-03",
        end: "",
        current: true,
        description:
          "- Lead a team of 4 engineers building the merchant dashboard used by 12,000 businesses\n- Cut page load time by 45% by moving to Next.js and server-side rendering\n- Introduced a shared component library and visual regression tests",
      },
      {
        id: "x2",
        role: "Frontend Developer",
        company: "Orient Commerce",
        city: "Tashkent",
        start: "2019-06",
        end: "2022-02",
        current: false,
        description:
          "- Built the checkout flow for an online marketplace with over 1 million monthly visitors\n- Raised mobile conversion by 18% through performance and UX improvements\n- Mentored three junior developers",
      },
    ],
    education: [
      {
        id: "e1",
        degree: "BSc in Computer Science",
        school: "Tashkent University of Information Technologies",
        city: "Tashkent",
        start: "2014-09",
        end: "2018-06",
        current: false,
        description: "Graduated with honors. Thesis on real-time web applications.",
      },
    ],
    projects: [
      {
        id: "p1",
        name: "Uzbek Typing Trainer",
        role: "Author",
        link: "github.com/aziza-codes/typing-trainer",
        description: "Open-source typing tutor for the Uzbek Latin alphabet with 3,000 monthly users.",
      },
    ],
    skills: [
      "TypeScript",
      "React",
      "Next.js",
      "Node.js",
      "Tailwind CSS",
      "GraphQL",
      "Testing (Jest, Playwright)",
      "Accessibility",
      "Figma",
    ].map((name, i) => ({ id: `s${i}`, name })),
    languages: [
      { id: "l1", name: "Uzbek", level: "native" },
      { id: "l2", name: "Russian", level: "c2" },
      { id: "l3", name: "English", level: "c1" },
    ],
    certificates: [
      { id: "c1", name: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services", date: "2023-04", link: "" },
      { id: "c2", name: "IELTS Academic, band 7.5", issuer: "British Council", date: "2021-08", link: "" },
    ],
  },

  uz: {
    personal: {
      fullName: "Aziza Karimova",
      jobTitle: "Katta frontend dasturchi",
      city: "Toshkent, Oʻzbekiston",
    },
    summary:
      "Fintech va elektron tijorat uchun tez va qulay veb-ilovalar yaratishda 6 yillik tajribaga ega frontend dasturchi. Toʻrt nafar muhandisdan iborat jamoaga rahbarlik qilaman va dizaynerlar bilan yaqin hamkorlikda ishlayman, sifatga alohida eʼtibor beraman.",
    experience: [
      {
        id: "x1",
        role: "Katta frontend dasturchi",
        company: "Silk Road Fintech",
        city: "Toshkent",
        start: "2022-03",
        end: "",
        current: true,
        description:
          "- 12 000 ta biznes foydalanadigan savdogar paneli ustida ishlovchi 4 kishilik jamoaga rahbarlik qilaman\n- Next.js va server tomonida render qilishga oʻtib, sahifa yuklanish vaqtini 45% ga qisqartirdim\n- Umumiy komponentlar kutubxonasi va vizual regressiya testlarini joriy qildim",
      },
      {
        id: "x2",
        role: "Frontend dasturchi",
        company: "Orient Commerce",
        city: "Toshkent",
        start: "2019-06",
        end: "2022-02",
        current: false,
        description:
          "- Oyiga 1 mln dan ortiq tashrif buyuruvchiga ega onlayn bozor uchun toʻlov jarayonini ishlab chiqdim\n- Unumdorlik va UX bilan bogʻliq yaxshilanishlar orqali mobil konversiyani 18% ga oshirdim\n- Uch nafar boshlovchi dasturchiga murabbiylik qildim",
      },
    ],
    education: [
      {
        id: "e1",
        degree: "Kompyuter fanlari bakalavri",
        school: "Muhammad al-Xorazmiy nomidagi Toshkent axborot texnologiyalari universiteti",
        city: "Toshkent",
        start: "2014-09",
        end: "2018-06",
        current: false,
        description: "Imtiyozli diplom. Bitiruv ishi: real vaqtdagi veb-ilovalar.",
      },
    ],
    projects: [
      {
        id: "p1",
        name: "Oʻzbekcha yozish trenajyori",
        role: "Muallif",
        link: "github.com/aziza-codes/typing-trainer",
        description: "Oʻzbek lotin alifbosi uchun ochiq kodli yozish trenajyori, oyiga 3 000 foydalanuvchi.",
      },
    ],
    skills: [
      "TypeScript",
      "React",
      "Next.js",
      "Node.js",
      "Tailwind CSS",
      "GraphQL",
      "Testlash (Jest, Playwright)",
      "Foydalanish qulayligi (a11y)",
      "Figma",
    ].map((name, i) => ({ id: `s${i}`, name })),
    languages: [
      { id: "l1", name: "Oʻzbek tili", level: "native" },
      { id: "l2", name: "Rus tili", level: "c2" },
      { id: "l3", name: "Ingliz tili", level: "c1" },
    ],
    certificates: [
      { id: "c1", name: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services", date: "2023-04", link: "" },
      { id: "c2", name: "IELTS Academic, 7.5 ball", issuer: "British Council", date: "2021-08", link: "" },
    ],
  },

  ru: {
    personal: {
      fullName: "Азиза Каримова",
      jobTitle: "Старший фронтенд-разработчик",
      city: "Ташкент, Узбекистан",
    },
    summary:
      "Фронтенд-разработчик с 6-летним опытом создания быстрых и доступных веб-приложений для финтеха и электронной коммерции. Руковожу командой из четырёх инженеров и тесно работаю с дизайнерами.",
    experience: [
      {
        id: "x1",
        role: "Старший фронтенд-разработчик",
        company: "Silk Road Fintech",
        city: "Ташкент",
        start: "2022-03",
        end: "",
        current: true,
        description:
          "- Руковожу командой из 4 инженеров, которая развивает панель для 12 000 компаний\n- Сократила время загрузки страниц на 45% благодаря переходу на Next.js и серверный рендеринг\n- Внедрила общую библиотеку компонентов и визуальные регрессионные тесты",
      },
      {
        id: "x2",
        role: "Фронтенд-разработчик",
        company: "Orient Commerce",
        city: "Ташкент",
        start: "2019-06",
        end: "2022-02",
        current: false,
        description:
          "- Разработала оформление заказа для маркетплейса с аудиторией более 1 млн посетителей в месяц\n- Повысила мобильную конверсию на 18% за счёт улучшений производительности и UX\n- Была наставником для трёх младших разработчиков",
      },
    ],
    education: [
      {
        id: "e1",
        degree: "Бакалавр компьютерных наук",
        school: "Ташкентский университет информационных технологий имени Мухаммада аль-Хорезми",
        city: "Ташкент",
        start: "2014-09",
        end: "2018-06",
        current: false,
        description: "Диплом с отличием. Тема выпускной работы: веб-приложения реального времени.",
      },
    ],
    projects: [
      {
        id: "p1",
        name: "Тренажёр узбекской печати",
        role: "Автор",
        link: "github.com/aziza-codes/typing-trainer",
        description: "Открытый тренажёр слепой печати для узбекского латинского алфавита, 3 000 пользователей в месяц.",
      },
    ],
    skills: [
      "TypeScript",
      "React",
      "Next.js",
      "Node.js",
      "Tailwind CSS",
      "GraphQL",
      "Тестирование (Jest, Playwright)",
      "Доступность (a11y)",
      "Figma",
    ].map((name, i) => ({ id: `s${i}`, name })),
    languages: [
      { id: "l1", name: "Узбекский", level: "native" },
      { id: "l2", name: "Русский", level: "c2" },
      { id: "l3", name: "Английский", level: "c1" },
    ],
    certificates: [
      { id: "c1", name: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services", date: "2023-04", link: "" },
      { id: "c2", name: "IELTS Academic, балл 7.5", issuer: "British Council", date: "2021-08", link: "" },
    ],
  },
};

/** A fresh copy of the example CV, with new ids so it never collides with existing items. */
export function sampleCv(lang: Lang, newId: () => string): CV {
  const s = SAMPLES[lang];
  const withIds = <T extends { id: string }>(items: T[]) => items.map((it) => ({ ...it, id: newId() }));
  return {
    personal: { ...s.personal, ...shared, photo: null },
    summary: s.summary,
    experience: withIds(s.experience),
    education: withIds(s.education),
    projects: withIds(s.projects),
    skills: withIds(s.skills),
    languages: withIds(s.languages),
    certificates: withIds(s.certificates),
  };
}

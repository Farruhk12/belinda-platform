export type Tool = {
  id: string;
  name: string;
  description: string;
  url: string;
  categoryId: string;
  isNew?: boolean;
  isExternal?: boolean;
};

export type Category = {
  id: string;
  name: string;
  icon: string;      // Lucide icon component name
  color: string;     // accent hex color
  bgColor: string;   // subtle background rgba
};

export const categories: Category[] = [
  {
    id: "analytics",
    name: "Аналитика",
    icon: "BarChart2",
    color: "#3b82f6",
    bgColor: "rgba(59, 130, 246, 0.1)",
  },
  {
    id: "medical",
    name: "Работа медицинских представителей",
    icon: "Activity",
    color: "#10b981",
    bgColor: "rgba(16, 185, 129, 0.1)",
  },
  {
    id: "learning",
    name: "Обучение и развитие",
    icon: "BookOpen",
    color: "#8b5cf6",
    bgColor: "rgba(139, 92, 246, 0.1)",
  },
  {
    id: "internal",
    name: "Внутренние сервисы",
    icon: "Building2",
    color: "#f59e0b",
    bgColor: "rgba(245, 158, 11, 0.1)",
  },
  {
    id: "automation",
    name: "Автоматизация",
    icon: "Zap",
    color: "#06b6d4",
    bgColor: "rgba(6, 182, 212, 0.1)",
  },
];

export const tools: Tool[] = [
  {
    id: "bdc",
    name: "База данных клиентов (БДК)",
    description: "Аналитика базы врачей, взаимодействия с ними, бонусов, групп и продуктов.",
    url: "https://belinda-lab-bdc-66063717455.us-west1.run.app/",
    categoryId: "analytics",
  },
  {
    id: "visit-analytics",
    name: "Аналитика визитов",
    description: "Аналитика визитов медицинских представителей по РТ.",
    url: "https://belinda-lab-mp-visit-analytics-66063717455.us-west1.run.app/",
    categoryId: "analytics",
  },
  {
    id: "lab-dashboard",
    name: "Belinda Lab Dashboard",
    description: "Подробная аналитика продаж, ABC анализ и сравнение показателей.",
    url: "https://belinda-dashboard-66063717455.us-west1.run.app/",
    categoryId: "analytics",
  },
  {
    id: "mp-analytics",
    name: "Аналитика МП",
    description: "AI-аналитика работы МП с врачами на основе визитов, бонусов и рецептов.",
    url: "https://belinda-analytics.vercel.app/",
    categoryId: "analytics",
  },
  {
    id: "crm",
    name: "CRM визитов",
    description: "Фиксация визитов и отслеживание маршрутов МП.",
    url: "https://crm.belinda.tj",
    categoryId: "medical",
  },
  {
    id: "checks",
    name: "Система проверки чеков",
    description: "Отправка чеков после выдачи бонусов врачам и контроль их проверки.",
    url: "https://uvk-all.vercel.app/",
    categoryId: "medical",
  },
  {
    id: "1c",
    name: "Платформа 1С",
    description: "Основная операционная система работы МП и аналитиков.",
    url: "https://1c.belinda.tj/Belinda/ru/",
    categoryId: "medical",
  },
  {
    id: "validation",
    name: "Аттестация сотрудников",
    description: "Система тестирования и проверки знаний сотрудников.",
    url: "https://belinda-66063717455.us-west1.run.app/#/validation",
    categoryId: "learning",
  },
  {
    id: "products",
    name: "Карманный справочник продуктов",
    description: "База знаний по продуктам с поддержкой AI.",
    url: "https://belindalab.github.io/products/",
    categoryId: "learning",
  },
  {
    id: "hr",
    name: "HR платформа",
    description: "Управление кандидатами, стажерами и сотрудниками.",
    url: "https://hr-platform-three.vercel.app/employees",
    categoryId: "internal",
  },
  {
    id: "feedback",
    name: "Belinda Feedback",
    description: "Анонимная система обратной связи.",
    url: "https://voicein-66063717455.us-west1.run.app/",
    categoryId: "internal",
  },
  {
    id: "contacts",
    name: "Контакты сотрудников",
    description: "База телефонов сотрудников.",
    url: "https://employee-contacts-66063717455.us-west1.run.app/",
    categoryId: "internal",
  },
  {
    id: "warehouse",
    name: "Склад",
    description: "Информация о складских остатках и сроках продукции.",
    url: "https://belinda-warehouse-66063717455.us-west1.run.app/",
    categoryId: "internal",
  },
  {
    id: "telegram-bot",
    name: "Корпоративный Telegram бот",
    description: "Цифровой помощник сотрудников с доступом к внутренним функциям.",
    url: "https://t.me/analitik_belinda_bot",
    categoryId: "automation",
    isExternal: true,
  },
];

export const newToolIds = ["mp-analytics", "products", "feedback"];

import AsyncStorage from '@react-native-async-storage/async-storage';

// Translation data
const translations = {
  en: {
    dashboard: {
      welcome: "Welcome back",
      daysWorked: "Days Worked",
      daysOff: "Days Off",
      totalEarned: "Total Earned",
      dailyRate: "Daily Rate",
      thisMonth: "this month",
      remaining: "remaining",
      perDay: "per day"
    },
    navigation: {
      dashboard: "Dashboard",
      salaryHistory: "Salary History",
      myReceipts: "My Receipts",
      settings: "Settings",
      support: "Support",
      back: "Back"
    },
    receipts: {
      title: "My Receipts",
      totalReceipts: "Total Receipts",
      paid: "Paid",
      pending: "Pending",
      loading: "Loading receipts...",
      noReceipts: "No Receipts",
      noReceiptsMessage: "Your receipts will appear here once they are generated"
    },
    salaryHistory: {
      title: "Salary History",
      loading: "Loading salary history...",
      noHistory: "No Salary History",
      noHistoryDescription: "Your salary history will appear here once you have attendance records",
      daysWorked: "Days Worked",
      dailyRate: "Daily Rate",
      totalEarned: "Total Earned",
      days: "days"
    },
    settings: {
      title: "Settings",
      userInfo: "User Information",
      language: "Language",
      appPreferences: "App Preferences",
      notifications: "Notifications",
      notificationsDesc: "Receive work updates and reminders",
      darkMode: "Dark Mode",
      darkModeDesc: "Use dark theme for better viewing",
      quickActions: "Quick Actions",
      contactSupport: "Contact Support",
      contactSupportDesc: "Get help with your account",
      privacyPolicy: "Privacy Policy",
      privacyPolicyDesc: "View our privacy policy",
      aboutApp: "About App",
      aboutAppDesc: "App version and information",
      logout: "Logout",
      logoutConfirm: "Are you sure you want to logout?",
      cancel: "Cancel",
      languageChanged: "Language Changed",
      languageChangedMessage: "Language set to"
    },
    support: {
      title: "Contact Support",
      subtitle: "Need help? Contact your administrator",
      email: "Email: support@mantaevert.com",
      phone: "Phone: +1 (555) 123-4567",
      hours: "Hours: Mon-Fri 9AM-5PM"
    },
    common: {
      loading: "Loading...",
      error: "Error",
      retry: "Retry",
      ok: "OK",
      yes: "Yes",
      no: "No"
    }
  },
  fr: {
    dashboard: {
      welcome: "Bon retour",
      daysWorked: "Jours Travaillés",
      daysOff: "Jours de Congé",
      totalEarned: "Total Gagné",
      dailyRate: "Tarif Journalier",
      thisMonth: "ce mois",
      remaining: "restant",
      perDay: "par jour"
    },
    navigation: {
      dashboard: "Tableau de Bord",
      salaryHistory: "Historique des Salaires",
      myReceipts: "Mes Reçus",
      settings: "Paramètres",
      support: "Support",
      back: "Retour"
    },
    receipts: {
      title: "Mes Reçus",
      totalReceipts: "Total des Reçus",
      paid: "Payé",
      pending: "En Attente",
      loading: "Chargement des reçus...",
      noReceipts: "Aucun Reçu",
      noReceiptsMessage: "Vos reçus apparaîtront ici une fois qu'ils seront générés"
    },
    salaryHistory: {
      title: "Historique des Salaires",
      loading: "Chargement de l'historique des salaires...",
      noHistory: "Aucun Historique de Salaire",
      noHistoryDescription: "Votre historique de salaire apparaîtra ici une fois que vous aurez des enregistrements de présence",
      daysWorked: "Jours Travaillés",
      dailyRate: "Tarif Journalier",
      totalEarned: "Total Gagné",
      days: "jours"
    },
    settings: {
      title: "Paramètres",
      userInfo: "Informations Utilisateur",
      language: "Langue",
      appPreferences: "Préférences de l'App",
      notifications: "Notifications",
      notificationsDesc: "Recevoir les mises à jour et rappels de travail",
      darkMode: "Mode Sombre",
      darkModeDesc: "Utiliser le thème sombre pour une meilleure visualisation",
      quickActions: "Actions Rapides",
      contactSupport: "Contacter le Support",
      contactSupportDesc: "Obtenir de l'aide avec votre compte",
      privacyPolicy: "Politique de Confidentialité",
      privacyPolicyDesc: "Voir notre politique de confidentialité",
      aboutApp: "À Propos de l'App",
      aboutAppDesc: "Version et informations de l'application",
      logout: "Déconnexion",
      logoutConfirm: "Êtes-vous sûr de vouloir vous déconnecter?",
      cancel: "Annuler",
      languageChanged: "Langue Modifiée",
      languageChangedMessage: "Langue définie sur"
    },
    support: {
      title: "Contacter le Support",
      subtitle: "Besoin d'aide? Contactez votre administrateur",
      email: "Email: support@mantaevert.com",
      phone: "Téléphone: +1 (555) 123-4567",
      hours: "Heures: Lun-Ven 9h-17h"
    },
    common: {
      loading: "Chargement...",
      error: "Erreur",
      retry: "Réessayer",
      ok: "OK",
      yes: "Oui",
      no: "Non"
    }
  },
  ar: {
    dashboard: {
      welcome: "مرحباً بعودتك",
      daysWorked: "أيام العمل",
      daysOff: "أيام الإجازة",
      totalEarned: "إجمالي الأرباح",
      dailyRate: "الأجر اليومي",
      thisMonth: "هذا الشهر",
      remaining: "متبقي",
      perDay: "في اليوم"
    },
    navigation: {
      dashboard: "لوحة التحكم",
      salaryHistory: "تاريخ الراتب",
      myReceipts: "إيصالاتي",
      settings: "الإعدادات",
      support: "الدعم",
      back: "رجوع"
    },
    receipts: {
      title: "إيصالاتي",
      totalReceipts: "إجمالي الإيصالات",
      paid: "مدفوع",
      pending: "في الانتظار",
      loading: "جاري تحميل الإيصالات...",
      noReceipts: "لا توجد إيصالات",
      noReceiptsMessage: "ستظهر إيصالاتك هنا بمجرد إنشائها"
    },
    salaryHistory: {
      title: "تاريخ الراتب",
      loading: "جاري تحميل تاريخ الراتب...",
      noHistory: "لا يوجد تاريخ راتب",
      noHistoryDescription: "سيظهر تاريخ راتبك هنا بمجرد وجود سجلات حضور",
      daysWorked: "أيام العمل",
      dailyRate: "الأجر اليومي",
      totalEarned: "إجمالي الأرباح",
      days: "أيام"
    },
    settings: {
      title: "الإعدادات",
      userInfo: "معلومات المستخدم",
      language: "اللغة",
      appPreferences: "تفضيلات التطبيق",
      notifications: "الإشعارات",
      notificationsDesc: "تلقي تحديثات العمل والتذكيرات",
      darkMode: "الوضع المظلم",
      darkModeDesc: "استخدام المظهر المظلم لرؤية أفضل",
      quickActions: "الإجراءات السريعة",
      contactSupport: "اتصل بالدعم",
      contactSupportDesc: "احصل على مساعدة بشأن حسابك",
      privacyPolicy: "سياسة الخصوصية",
      privacyPolicyDesc: "عرض سياسة الخصوصية الخاصة بنا",
      aboutApp: "حول التطبيق",
      aboutAppDesc: "إصدار ومعلومات التطبيق",
      logout: "تسجيل الخروج",
      logoutConfirm: "هل أنت متأكد من أنك تريد تسجيل الخروج؟",
      cancel: "إلغاء",
      languageChanged: "تم تغيير اللغة",
      languageChangedMessage: "تم تعيين اللغة إلى"
    },
    support: {
      title: "اتصل بالدعم",
      subtitle: "تحتاج مساعدة؟ اتصل بالمسؤول",
      email: "البريد الإلكتروني: support@mantaevert.com",
      phone: "الهاتف: +1 (555) 123-4567",
      hours: "ساعات العمل: الإثنين-الجمعة 9ص-5م"
    },
    common: {
      loading: "جاري التحميل...",
      error: "خطأ",
      retry: "إعادة المحاولة",
      ok: "موافق",
      yes: "نعم",
      no: "لا"
    }
  }
};

type Language = 'en' | 'fr' | 'ar';
type TranslationKey = keyof typeof translations.en;

class I18n {
  private currentLanguage: Language = 'en';

  async init() {
    try {
      const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
      if (savedLanguage && this.isValidLanguage(savedLanguage)) {
        this.currentLanguage = savedLanguage as Language;
      }
    } catch (error) {
      }
  }

  private isValidLanguage(lang: string): lang is Language {
    return ['en', 'fr', 'ar'].includes(lang);
  }

  async changeLanguage(language: Language) {
    try {
      await AsyncStorage.setItem('selectedLanguage', language);
      this.currentLanguage = language;
      } catch (error) {
      throw error;
    }
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  isRTL(): boolean {
    return this.currentLanguage === 'ar';
  }

  t(key: string): string {
    const keys = key.split('.');
    let value: any = translations[this.currentLanguage];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if key not found
        value = translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return key if not found in fallback
          }
        }
        break;
      }
    }
    
    return typeof value === 'string' ? value : key;
  }
}

export const i18n = new I18n();
export default i18n;
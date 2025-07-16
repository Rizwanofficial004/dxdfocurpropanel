import React, { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    // Common
    home: 'Home',
    dashboard: 'Dashboard',
    liveTracking: 'Live Tracking',
    quickView: 'Quick View',
    reports: 'Reports',
    site: 'Site',
    taskManagement: 'Task Management',
    attendance: 'Attendance',
    employees: 'Employees',
    teams: 'Teams',
    settings: 'Settings',
    search: 'Search',
    hello: 'Hello',
    
    // Login
    welcome: 'Welcome Back',
    subtitle: 'Sign in to your account to continue',
    email: 'Email Address',
    username: 'Username or Email',
    password: 'Password',
    remember: 'Remember me',
    forgot: 'Forgot password?',
    signIn: 'Sign In',
    signingIn: 'Signing in...',
    error: 'Invalid username/email or password. Try Admin / admin123',
    loginFailed: 'Login failed. Please try again.',
    enterEmail: 'Enter your email',
    enterUsername: 'Enter username or email',
    enterPassword: 'Enter your password',
    
    // Header
    searchHere: 'Search here...',
    notifications: 'Notifications',
    viewProfile: 'View Profile',
    accountSettings: 'Account Settings',
    helpSupport: 'Help & Support',
    signOut: 'Sign Out',
    active: 'Active',
    
    // Header notifications
    orderProcessed: 'Your order has been successfully processed',
    serverMaintenance: 'Server maintenance scheduled for tonight',
    weeklyReportAvailable: 'Weekly report is now available',
    syncDataFailed: 'Failed to sync data. Please try again',
    newUserRegistered: 'New user registered on your platform',
    viewAllNotifications: 'View All Notifications',
    noNotifications: 'No notifications yet',
    switchToLight: 'Switch to Light Mode',
    switchToDark: 'Switch to Dark Mode',
    
    // Dashboard Cards
    totalEmployee: 'Total Employee',
    onLeaveEmployee: 'On Leave Employee',
    totalProject: 'Total Project',
    completeProject: 'Complete Project',
    totalClient: 'Total Client',
    totalRevenue: 'Total Revenue',
    totalJobs: 'Total Jobs',
    totalTicket: 'Total Ticket',
    thanLastYear: 'Than Last Year',
    thanLastMonth: 'Than Last Month',
    
    // Live Tracking
    realTimeActivityStream: 'Real Time Activity Stream',
    totalActive: 'Total Active',
    online: 'Online',
    idle: 'Idle',
    offline: 'Offline',
    totalHours: 'Total Hours',
    allEmployees: 'All Employees',
    allDepartments: 'All Departments',
    allStatus: 'All Status',
    development: 'Development',
    design: 'Design',
    marketing: 'Marketing',
    today: 'Today',
    yesterday: 'Yesterday',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    customRange: 'Custom Range',
    searchEmployeeName: 'Search employee name...',
    advancedFilter: 'Advanced Filter',
    export: 'Export',
    loadMoreScreenshots: 'Load More Screenshots',
    previous: 'Previous',
    next: 'Next',
    
    // Quick View
    status: 'Status',
    employeeName: 'Employee Name',
    loggedTime: 'Logged Time',
    activeTime: 'Active Time',
    productive: 'Productive',
    distraction: 'Distraction',
    neutral: 'Neutral',
    meeting: 'Meeting',
    break: 'Break',
    selectDate: 'Select Date',
    showing: 'Showing',
    of: 'of',
    entries: 'entries',
    show: 'Show',
    
    // Quick View specific
    teamNA: 'Team N/A',
    off: 'OFF',
    
    // Sidebar
    main: 'Main',
    management: 'Management',
    system: 'System',
    
    // Announcements
    recentAnnouncements: 'Recent Announcements',
    title: 'Title',
    type: 'Type',
    date: 'Date',
    author: 'Author',
    description: 'Description',
    urgent: 'Urgent',
    important: 'Important',
    info: 'Info',
    
    // Activity Stream
    recentActivity: 'Recent Activity',
    newUserRegistered: 'New user registered',
    reportGenerated: 'Report generated',
    taskCompleted: 'Task completed',
    documentUpdated: 'Document updated',
    minutesAgo: 'minutes ago',
    hourAgo: 'hour ago',
    hoursAgo: 'hours ago',
    dayAgo: 'day ago',
    
    // Pagination
    page: 'Page',
    itemsOnThisPage: 'items on this page',
    
    // Live Tracking specific
    task: 'Task',
    results: 'results',
    screenshotPreview: 'Screenshot Preview',
    
    // FocusTimeline specific
    userActivity: 'User Activity',
    searchActivity: 'Search activity...',
    purchasedFromMediaTek: 'Purchased from MediaTek',
    loremIpsumShort: 'Lorem ipsum dolor sit amet consecte',
    daysLeftNotification: '3 days left notification to submit new products',
    minsAgo: '04 Mins Ago',
    
    // Announcement specific
    announcement: 'Announcement',
    startDate: 'Start Date',
    endDate: 'End Date',
    density: 'Density',
    filter: 'Filter',
    searchTitleOrDescription: 'Search title or description...',
    
    // Announcement titles and descriptions
    annualCompanyRetreat: 'Annual Company Retreat',
    annualRetreatDesc: 'A week-long retreat for team building and strategy sessions.',
    clientAppreciationEvent: 'Client Appreciation Event',
    clientAppreciationDesc: 'Event to show appreciation for our valued clients.',
    employeeTrainingProgram: 'Employee Training Program',
    trainingProgramDesc: 'Intensive training sessions for new employees.',
    endOfYearGala: 'End of Year Gala',
    yearEndGalaDesc: 'Celebration event to close out the year.',
    healthWellnessFair: 'Health and Wellness Fair',
    healthWellnessDesc: 'An event focused on promoting health and wellness among employees.',
    midYearPerformanceReview: 'Mid-Year Performance Review',
    performanceReviewDesc: 'Review of employee performance for the first half of the year.',
    productLaunch: 'Product Launch',
    productLaunchDesc: 'Official launch event for the new product line.',
    quarterlyBusinessReview: 'Quarterly Business Review',
    businessReviewDesc: 'Review of business performance for the past quarter.',
    teamBuildingWorkshop: 'Team Building Workshop',
    teamBuildingDesc: 'Workshop aimed at improving team collaboration and communication skills.',
  },
  
  tr: {
    // Common
    home: 'Ana Sayfa',
    dashboard: 'Kontrol Paneli',
    liveTracking: 'Canlı İzleme',
    quickView: 'Hızlı Görünüm',
    reports: 'Raporlar',
    site: 'Site',
    taskManagement: 'Görev Yönetimi',
    attendance: 'Devam',
    employees: 'Çalışanlar',
    teams: 'Takımlar',
    settings: 'Ayarlar',
    search: 'Ara',
    hello: 'Merhaba',
    
    // Login
    welcome: 'Tekrar Hoş Geldiniz',
    subtitle: 'Devam etmek için hesabınıza giriş yapın',
    email: 'E-posta Adresi',
    username: 'Kullanıcı Adı veya E-posta',
    password: 'Şifre',
    remember: 'Beni hatırla',
    forgot: 'Şifrenizi mi unuttunuz?',
    signIn: 'Giriş Yap',
    signingIn: 'Giriş yapılıyor...',
    error: 'Geçersiz kullanıcı adı/e-posta veya şifre. Admin / admin123 deneyin',
    loginFailed: 'Giriş başarısız. Lütfen tekrar deneyin.',
    enterEmail: 'E-posta adresinizi girin',
    enterUsername: 'Kullanıcı adı veya e-posta girin',
    enterPassword: 'Şifrenizi girin',
    
    // Header
    searchHere: 'Burada ara...',
    notifications: 'Bildirimler',
    viewProfile: 'Profili Görüntüle',
    accountSettings: 'Hesap Ayarları',
    helpSupport: 'Yardım ve Destek',
    signOut: 'Çıkış Yap',
    active: 'Aktif',
    
    // Header notifications
    orderProcessed: 'Siparişiniz başarıyla işlendi',
    serverMaintenance: 'Bu gece sunucu bakımı planlandı',
    weeklyReportAvailable: 'Haftalık rapor artık mevcut',
    syncDataFailed: 'Veri senkronizasyonu başarısız. Lütfen tekrar deneyin',
    newUserRegistered: 'Platformunuzda yeni kullanıcı kayıt oldu',
    viewAllNotifications: 'Tüm Bildirimleri Görüntüle',
    noNotifications: 'Henüz bildirim yok',
    switchToLight: 'Açık Moda Geç',
    switchToDark: 'Karanlık Moda Geç',
    
    // Dashboard Cards
    totalEmployee: 'Toplam Çalışan',
    onLeaveEmployee: 'İzinli Çalışan',
    totalProject: 'Toplam Proje',
    completeProject: 'Tamamlanan Proje',
    totalClient: 'Toplam Müşteri',
    totalRevenue: 'Toplam Gelir',
    totalJobs: 'Toplam İş',
    totalTicket: 'Toplam Bilet',
    thanLastYear: 'Geçen Yıldan',
    thanLastMonth: 'Geçen Aydan',
    
    // Live Tracking
    realTimeActivityStream: 'Gerçek Zamanlı Aktivite Akışı',
    totalActive: 'Toplam Aktif',
    online: 'Çevrimiçi',
    idle: 'Beklemede',
    offline: 'Çevrimdışı',
    totalHours: 'Toplam Saat',
    allEmployees: 'Tüm Çalışanlar',
    allDepartments: 'Tüm Departmanlar',
    allStatus: 'Tüm Durumlar',
    development: 'Geliştirme',
    design: 'Tasarım',
    marketing: 'Pazarlama',
    today: 'Bugün',
    yesterday: 'Dün',
    thisWeek: 'Bu Hafta',
    thisMonth: 'Bu Ay',
    customRange: 'Özel Aralık',
    searchEmployeeName: 'Çalışan adı ara...',
    advancedFilter: 'Gelişmiş Filtre',
    export: 'Dışa Aktar',
    loadMoreScreenshots: 'Daha Fazla Ekran Görüntüsü Yükle',
    previous: 'Önceki',
    next: 'Sonraki',
    
    // Quick View
    status: 'Durum',
    employeeName: 'Çalışan Adı',
    loggedTime: 'Giriş Saati',
    activeTime: 'Aktif Süre',
    productive: 'Üretken',
    distraction: 'Dikkat Dağıtıcı',
    neutral: 'Nötr',
    meeting: 'Toplantı',
    break: 'Mola',
    selectDate: 'Tarih Seç',
    showing: 'Gösteriliyor',
    of: '/',
    entries: 'kayıt',
    show: 'Göster',
    
    // Quick View specific
    teamNA: 'Takım Yok',
    off: 'KAPALI',
    
    // Sidebar
    main: 'Ana',
    management: 'Yönetim',
    system: 'Sistem',
    
    // Announcements
    recentAnnouncements: 'Son Duyurular',
    title: 'Başlık',
    type: 'Tür',
    date: 'Tarih',
    author: 'Yazar',
    description: 'Açıklama',
    urgent: 'Acil',
    important: 'Önemli',
    info: 'Bilgi',
    
    // Activity Stream
    recentActivity: 'Son Aktiviteler',
    newUserRegistered: 'Yeni kullanıcı kaydedildi',
    reportGenerated: 'Rapor oluşturuldu',
    taskCompleted: 'Görev tamamlandı',
    documentUpdated: 'Belge güncellendi',
    minutesAgo: 'dakika önce',
    hourAgo: 'saat önce',
    hoursAgo: 'saat önce',
    dayAgo: 'gün önce',
    
    // Pagination
    page: 'Sayfa',
    itemsOnThisPage: 'bu sayfadaki öğe',
    
    // Live Tracking specific
    task: 'Görev',
    results: 'sonuç',
    screenshotPreview: 'Ekran Görüntüsü Önizlemesi',
    
    // FocusTimeline specific
    userActivity: 'Kullanıcı Aktivitesi',
    searchActivity: 'Aktivite ara...',
    purchasedFromMediaTek: 'MediaTek\'ten satın alındı',
    loremIpsumShort: 'Lorem ipsum dolor sit amet consecte',
    daysLeftNotification: 'Yeni ürünleri göndermek için 3 gün kaldı bildirimi',
    minsAgo: '04 Dakika Önce',
    
    // Announcement specific
    announcement: 'Duyuru',
    startDate: 'Başlangıç Tarihi',
    endDate: 'Bitiş Tarihi',
    density: 'Yoğunluk',
    filter: 'Filtre',
    searchTitleOrDescription: 'Başlık veya açıklama ara...',
    
    // Announcement titles and descriptions
    annualCompanyRetreat: 'Yıllık Şirket Çekilişi',
    annualRetreatDesc: 'Takım oluşturma ve strateji oturumları için bir haftalık çekiliş.',
    clientAppreciationEvent: 'Müşteri Takdir Etkinliği',
    clientAppreciationDesc: 'Değerli müşterilerimize takdirini göstermek için etkinlik.',
    employeeTrainingProgram: 'Çalışan Eğitim Programı',
    trainingProgramDesc: 'Yeni çalışanlar için yoğun eğitim oturumları.',
    endOfYearGala: 'Yıl Sonu Galası',
    yearEndGalaDesc: 'Yılı kapatmak için kutlama etkinliği.',
    healthWellnessFair: 'Sağlık ve Wellness Fuarı',
    healthWellnessDesc: 'Çalışanlar arasında sağlık ve sağlıklı yaşamı teşvik etmeye odaklanan etkinlik.',
    midYearPerformanceReview: 'Yıl Ortası Performans Değerlendirmesi',
    performanceReviewDesc: 'Yılın ilk yarısı için çalışan performansının değerlendirilmesi.',
    productLaunch: 'Ürün Lansmanı',
    productLaunchDesc: 'Yeni ürün serisinin resmi lansman etkinliği.',
    quarterlyBusinessReview: 'Üç Aylık İş Değerlendirmesi',
    businessReviewDesc: 'Geçen çeyrek için iş performansının değerlendirilmesi.',
    teamBuildingWorkshop: 'Takım Oluşturma Atölyesi',
    teamBuildingDesc: 'Takım işbirliği ve iletişim becerilerini geliştirmeyi amaçlayan atölye.',
  }
};

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const t = (key) => {
    return translations[language][key] || key;
  };

  const value = {
    language,
    setLanguage,
    t,
    translations: translations[language]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

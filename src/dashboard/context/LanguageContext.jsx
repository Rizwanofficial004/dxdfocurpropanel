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
    jobs: 'Jobs',
    settings: 'Settings',
    search: 'Search',
    hello: 'Hello',
    liveChat: 'Live Chat',
    scheduleCall: 'Schedule Call',
    downloadClientApp: 'Download Client App',

    // Reports Submenu
    employeeReports: 'Employee Reports',
    activityPattern: 'Activity Pattern',
    advancedReport: 'Advanced Report',
    timeLogSummary: 'Time Log Summary',
    dormantEmployees: 'Dormant Employees',
    highIdleHours: 'High Idle Hours',
    clientAppActivity: 'Client App Activity',
    otReport: 'OT Report',

    // Settings Submenu
    styleSettings: 'Style Settings',
    credentialsSettings: 'Credentials Settings',
    
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
    
    // Idle Time Tracker
    idleTimeTracker: 'User Idle Time Tracker',
    refresh: 'Refresh',
    retry: 'Retry',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    customRange: 'Custom Range',
    searchEmployeeName: 'Search employee name...',
    searchEmployee: 'Search Employee',
    searchForEmployees: 'Search for employees to view their activity stream',
    selectUserToView: 'Select a user to view their activity stream',
    foundUsersFor: 'Found {{count}} user(s) for "{{query}}"',
    noData: 'No data',
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
    
    // Notification banner
    profileCreated: 'Your user profile has been successfully created.',
    downloadClient: 'You can now download the client app from',
    loginExplore: 'and log in with your password to explore the features.',
    
    // Dashboard specific translations
    currentStatus: 'CURRENT STATUS',
    companyAverage: 'COMPANY AVERAGE',
    atWork: 'At Work',
    inMeeting: 'In Meeting',
    atBreak: 'At Break',
    dailyBreaks: 'DAILY BREAKS',
    meetings: 'MEETINGS',
    avg: 'Avg',
    workTimeSpread: 'WORK TIME SPREAD',
    breaks: 'Breaks',
    totalEmployees: 'TOTAL EMPLOYEES',
    totalProjects: 'TOTAL PROJECTS',
    totalTasks: 'TOTAL TASKS',
    live: 'LIVE',
    growthRate: 'growth rate',
    totalCount: 'Total Count',
    activeUsers: 'Active Users',
    notStarted: 'Not Started',
    inProgress: 'In Progress',
    finished: 'Finished',
    onHold: 'On Hold',
    testing: 'Testing',
    completed: 'Completed',
    cancelled: 'Cancelled',
    breaksPerDay: 'Breaks/Day',
    minutesPerBreak: 'Minutes/Break',
    meetingsPerDay: 'Meetings/Day',
    minutesPerMeeting: 'Minutes/Meeting',
    s3Employees: 'S3 Employees',
    lastUpdated: 'Last Updated',
    thirtyDaysAvg: '30 D AVG',
    
    // StyleSettings
    stylingSettings: 'Styling Settings',
    styling: 'Styling',
    stylingConfiguration: 'Styling Configuration',
    customizeGlobalTheme: 'Customize the global theme and styling for your application',
    globalThemeConfiguration: 'Global Theme Configuration',
    themeSettings: 'Theme Settings',
    configureGlobalTheme: 'Configure global theme colors, typography, and styling preferences',
    basicInformation: 'Basic Information',
    themeName: 'Theme Name',
    enterThemeName: 'Enter theme name',
    describeTheme: 'Describe your theme',
    colorSettings: 'Color Settings',
    headerColor: 'Header Color',
    footerColor: 'Footer Color',
    backgroundColor: 'Background Color',
    buttonColor: 'Button Color',
    buttonTextColor: 'Button Text Color',
    textColor: 'Text Color',
    typographySettings: 'Typography Settings',
    fontFamily: 'Font Family',
    headingFontSize: 'Heading Font Size',
    bodyFontSize: 'Body Font Size',
    borderRadius: 'Border Radius',
    saveStyling: 'Save Styling',
    saving: 'Saving...',
    stylingConfigLoaded: 'Styling configuration loaded successfully!',
    stylingConfigSaved: 'Styling configuration saved successfully!',
    failedToLoadStyling: 'Failed to load styling configuration',
    failedToSaveStyling: 'Failed to save styling configuration',

    // Right Sidebar
    howItWorks: 'How it Works',
    claimLicense: 'Claim 2 more free licenses',
    employeesInfo: 'Here is some information about employees.',
  liveTrackingInfo: 'Here is some information about live tracking.',
  // Live Tracking help short paragraph
  liveTrackingHelpShort: 'This panel shows recent screenshots captured from users\' devices for quick visual monitoring. Click refresh to fetch the latest images.',
  // Activity Stream help short paragraph
  activityStreamHelpShort: 'Shows a quick overview of recent user activity and highlighted days. Select a date or user to load screenshots for that period.',
    quickViewInfo: 'Here is some information about quick view.',
    claimLicenseInfo: 'Information about claiming licenses.',

    // Documentation
    documentation: 'Documentation',
    completeGuide: 'Complete guide to using DXD Focus for employee monitoring and productivity tracking',
    searchDocumentation: 'Search documentation...',
    categories: 'Categories',
    gettingStarted: 'Getting Started',
    dashboardOverview: 'Dashboard Overview',
    liveTrackingDoc: 'Live Tracking',
    reportsAnalytics: 'Reports & Analytics',
    employeeManagement: 'Employee Management',
    settingsConfiguration: 'Settings & Configuration',
    apiDocumentation: 'API Documentation',
    troubleshooting: 'Troubleshooting',
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
    jobs: 'İşler',
    settings: 'Ayarlar',
    search: 'Ara',
    hello: 'Merhaba',
    liveChat: 'Canlı Sohbet',
    scheduleCall: 'Görüşme Planla',
    downloadClientApp: 'İstemci Uygulamasını İndir',

    // Reports Submenu
    employeeReports: 'Çalışan Raporları',
    activityPattern: 'Aktivite Modeli',
    advancedReport: 'Gelişmiş Rapor',
    timeLogSummary: 'Zaman Kaydı Özeti',
    dormantEmployees: 'Pasif Çalışanlar',
    highIdleHours: 'Yüksek Boşta Kalma Süreleri',
    clientAppActivity: 'İstemci Uygulama Aktivitesi',
    otReport: 'Fazla Mesai Raporu',

    // Settings Submenu
    styleSettings: 'Stil Ayarları',
    credentialsSettings: 'Kimlik Bilgileri Ayarları',
    
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
    
    // Idle Time Tracker
    idleTimeTracker: 'Kullanıcı Boşta Kalma Süre Takipçisi',
    refresh: 'Yenile',
    retry: 'Tekrar Dene',
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
    searchEmployee: 'Çalışan Ara',
    searchForEmployees: 'Aktivite akışlarını görüntülemek için çalışanları arayın',
    selectUserToView: 'Aktivite akışını görüntülemek için bir kullanıcı seçin',
    foundUsersFor: '"{{query}}" için {{count}} kullanıcı bulundu',
    noData: 'Veri Yok',
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
    
    // Notification banner
    profileCreated: 'Kullanıcı profiliniz başarıyla oluşturuldu.',
    downloadClient: 'Artık istemci uygulamasını şu adresten indirebilirsiniz',
    loginExplore: 've özelliklerini keşfetmek için şifrenizle giriş yapın.',
    
    // Dashboard specific translations
    currentStatus: 'MEVCUT DURUM',
    companyAverage: 'ŞİRKET ORTALAMASI',
    atWork: 'İşte',
    inMeeting: 'Toplantıda',
    atBreak: 'Molada',
    dailyBreaks: 'GÜNLÜK MOLALAR',
    meetings: 'TOPLANTI',
    avg: 'Ort',
    workTimeSpread: 'ÇALIŞMA ZAMANIN DAĞILIMI',
    breaks: 'Molalar',
    totalEmployees: 'TOPLAM ÇALIŞAN',
    totalProjects: 'TOPLAM PROJE',
    totalTasks: 'TOPLAM GÖREV',
    live: 'CANLI',
    growthRate: 'büyüme oranı',
    totalCount: 'Toplam Sayı',
    activeUsers: 'Aktif Kullanıcılar',
    notStarted: 'Başlamadı',
    inProgress: 'Devam Ediyor',
    finished: 'Tamamlandı',
    onHold: 'Beklemede',
    testing: 'Test Ediliyor',
    completed: 'Tamamlandı',
    cancelled: 'İptal Edildi',
    breaksPerDay: 'Molalar/Gün',
    minutesPerBreak: 'Dakika/Mola',
    meetingsPerDay: 'Toplantı/Gün',
    minutesPerMeeting: 'Dakika/Toplantı',
    s3Employees: 'S3 Çalışanları',
    lastUpdated: 'Son Güncelleme',
    thirtyDaysAvg: '30 GÜNLÜK ORT',
    
    // StyleSettings
    stylingSettings: 'Stil Ayarları',
    styling: 'Stil',
    stylingConfiguration: 'Stil Yapılandırması',
    customizeGlobalTheme: 'Uygulamanızın global temasını ve stilini özelleştirin',
    globalThemeConfiguration: 'Global Tema Yapılandırması',
    themeSettings: 'Tema Ayarları',
    configureGlobalTheme: 'Global tema renklerini, tipografiyi ve stil tercihlerini yapılandırın',
    basicInformation: 'Temel Bilgiler',
    themeName: 'Tema Adı',
    enterThemeName: 'Tema adını girin',
    describeTheme: 'Temanızı açıklayın',
    colorSettings: 'Renk Ayarları',
    headerColor: 'Başlık Rengi',
    footerColor: 'Alt Bilgi Rengi',
    backgroundColor: 'Arka Plan Rengi',
    buttonColor: 'Düğme Rengi',
    buttonTextColor: 'Düğme Metin Rengi',
    textColor: 'Metin Rengi',
    typographySettings: 'Tipografi Ayarları',
    fontFamily: 'Font Ailesi',
    headingFontSize: 'Başlık Font Boyutu',
    bodyFontSize: 'Gövde Font Boyutu',
    borderRadius: 'Kenar Yuvarlaklığı',
    saveStyling: 'Stili Kaydet',
    saving: 'Kaydediliyor...',
    stylingConfigLoaded: 'Stil yapılandırması başarıyla yüklendi!',
    stylingConfigSaved: 'Stil yapılandırması başarıyla kaydedildi!',
    failedToLoadStyling: 'Stil yapılandırması yüklenemedi',
    failedToSaveStyling: 'Stil yapılandırması kaydedilemedi',

    // Right Sidebar
    howItWorks: 'Nasıl Çalışır?',
    claimLicense: '2 ücretsiz lisans daha talep edin',
    employeesInfo: 'Çalışanlar hakkında bazı bilgiler burada.',
    liveTrackingInfo: 'Canlı izleme hakkında bazı bilgiler burada.',
  liveTrackingHelpShort: 'Bu panel, kullanıcıların cihazlarından alınan son ekran görüntülerini hızlı görsel izleme için gösterir. En son görüntüler için yenileye tıklayın.',
  // Activity Stream help short paragraph (Turkish)
  activityStreamHelpShort: 'Son kullanıcı aktivitelerinin ve vurgulanan günlerin hızlı bir özetini gösterir. O döneme ait ekran görüntülerini yüklemek için bir tarih veya kullanıcı seçin.',
    quickViewInfo: 'Hızlı görünüm hakkında bazı bilgiler burada.',
    claimLicenseInfo: 'Lisans talep etme hakkında bilgi.',

    // Documentation
    documentation: 'Dokümantasyon',
    completeGuide: 'Çalışan izleme ve verimlilik takibi için DXD Focus kullanma rehberi',
    searchDocumentation: 'Dokümantasyon ara...',
    categories: 'Kategoriler',
    gettingStarted: 'Başlangıç',
    dashboardOverview: 'Kontrol Paneli Genel Bakış',
    liveTrackingDoc: 'Canlı İzleme',
    reportsAnalytics: 'Raporlar ve Analitik',
    employeeManagement: 'Çalışan Yönetimi',
    settingsConfiguration: 'Ayarlar ve Yapılandırma',
    apiDocumentation: 'API Dokümantasyonu',
    troubleshooting: 'Sorun Giderme',
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
  // Initialize language from localStorage or default to 'en'
  const [language, setLanguageState] = useState(() => {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || 'en';
  });

  // Enhanced setLanguage function that persists to localStorage
  const setLanguage = (newLanguage) => {
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

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

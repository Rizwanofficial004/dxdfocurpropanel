import React, { useState } from 'react';
import styled from 'styled-components';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

// Styled Components
const DocumentationContainer = styled.div`
  padding: 24px;
//   max-width: 1200px;
  margin: 0 auto;
  background: transparent;
  min-height: calc(100vh - 140px);
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 24px;
`;

const SearchBox = styled.input`
  width: 100%;
  max-width: 500px;
  padding: 12px 16px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text.primary};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;

const ContentArea = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 32px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

const DocSidebar = styled.div`
  background: ${props => props.theme.mode === 'dark' ? '#1a1f2e' : '#f8fafc'};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 24px;
  height: fit-content;
`;

const SidebarTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 16px;
`;

const CategoryList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const CategoryItem = styled.li`
  margin-bottom: 8px;
`;

const CategoryLink = styled.button`
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  border: none;
  background: ${props => props.$isActive ? props.theme.colors.primary + '20' : 'transparent'};
  color: ${props => props.$isActive ? props.theme.colors.primary : props.theme.colors.text.secondary};
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.primary + '20'};
    color: ${props => props.theme.colors.primary};
  }
`;

const MainContent = styled.div`
  background: ${props => props.theme.mode === 'dark' ? '#1a1f2e' : '#ffffff'};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 32px;
`;

const ContentTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 16px;
`;

const ContentText = styled.div`
  font-size: 16px;
  line-height: 1.6;
  color: ${props => props.theme.colors.text.secondary};
  
  h3 {
    font-size: 20px;
    font-weight: 600;
    color: ${props => props.theme.colors.text.primary};
    margin: 24px 0 12px 0;
  }
  
  h4 {
    font-size: 18px;
    font-weight: 600;
    color: ${props => props.theme.colors.text.primary};
    margin: 20px 0 8px 0;
  }
  
  p {
    margin-bottom: 16px;
  }
  
  ul, ol {
    margin-bottom: 16px;
    padding-left: 24px;
  }
  
  li {
    margin-bottom: 8px;
  }
  
  code {
    background: ${props => props.theme.mode === 'dark' ? '#2d3748' : '#f1f5f9'};
    color: ${props => props.theme.colors.primary};
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 14px;
  }
  
  pre {
    background: ${props => props.theme.mode === 'dark' ? '#2d3748' : '#f1f5f9'};
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 16px 0;
    
    code {
      background: none;
      padding: 0;
    }
  }
`;

const Documentation = () => {
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'getting-started', label: t('gettingStarted') },
    { id: 'dashboard', label: t('dashboardOverview') },
    { id: 'live-tracking', label: t('liveTrackingDoc') },
    { id: 'reports', label: t('reportsAnalytics') },
    { id: 'employee-management', label: t('employeeManagement') },
    { id: 'settings', label: t('settingsConfiguration') },
    { id: 'api', label: t('apiDocumentation') },
    { id: 'troubleshooting', label: t('troubleshooting') },
  ];

  const content = {
    en: {
      'getting-started': {
        title: 'Getting Started with DXD Focus',
        content: `
          <h3>Welcome to DXD Focus</h3>
          <p>DXD Focus is a comprehensive employee monitoring and productivity tracking solution designed to help organizations optimize their workforce management.</p>
          
          <h4>Key Features</h4>
          <ul>
            <li><strong>Real-time Tracking:</strong> Monitor employee activities in real-time</li>
            <li><strong>Screenshot Monitoring:</strong> Automated screenshot capture for transparency</li>
            <li><strong>Detailed Reports:</strong> Comprehensive analytics and reporting tools</li>
            <li><strong>Team Management:</strong> Organize and manage teams effectively</li>
            <li><strong>Attendance Tracking:</strong> Monitor work hours and attendance patterns</li>
          </ul>
          
          <h4>Quick Setup</h4>
          <ol>
            <li>Download and install the DXD Focus client application</li>
            <li>Register your organization account</li>
            <li>Add employees to your organization</li>
            <li>Configure tracking settings</li>
            <li>Start monitoring and tracking productivity</li>
          </ol>
        `
      },
      'dashboard': {
        title: 'Dashboard Overview',
        content: `
          <h3>Dashboard Components</h3>
          <p>The dashboard provides a comprehensive overview of your organization's productivity metrics and employee activities.</p>
          
          <h4>Main Widgets</h4>
          <ul>
            <li><strong>Active Employees:</strong> Real-time count of active team members</li>
            <li><strong>Productivity Metrics:</strong> Overall productivity statistics</li>
            <li><strong>Recent Activities:</strong> Latest employee activities and updates</li>
            <li><strong>Quick Actions:</strong> Shortcuts to common tasks</li>
          </ul>
          
          <h4>Navigation</h4>
          <p>Use the sidebar navigation to access different sections:</p>
          <ul>
            <li>Live Tracking - Real-time employee monitoring</li>
            <li>Reports - Detailed analytics and reports</li>
            <li>Employees - Team member management</li>
            <li>Settings - System configuration</li>
          </ul>
        `
      },
      'live-tracking': {
        title: 'Live Tracking',
        content: `
          <h3>Real-time Employee Monitoring</h3>
          <p>The Live Tracking feature allows you to monitor your employees' activities in real-time.</p>
          
          <h4>Features</h4>
          <ul>
            <li><strong>Live Screenshots:</strong> View real-time screenshots of employee screens</li>
            <li><strong>Activity Status:</strong> Monitor active/idle status</li>
            <li><strong>Application Usage:</strong> Track which applications are being used</li>
            <li><strong>Time Tracking:</strong> Real-time work hour tracking</li>
          </ul>
          
          <h4>Privacy Considerations</h4>
          <p>All monitoring activities are conducted in compliance with privacy regulations and company policies. Employees are notified when monitoring is active.</p>
        `
      },
      'reports': {
        title: 'Reports & Analytics',
        content: `
          <h3>Comprehensive Reporting</h3>
          <p>Generate detailed reports to analyze productivity, attendance, and employee performance.</p>
          
          <h4>Available Reports</h4>
          <ul>
            <li><strong>Employee Reports:</strong> Individual employee performance metrics</li>
            <li><strong>Activity Patterns:</strong> Analysis of work patterns and productivity trends</li>
            <li><strong>Time Log Summary:</strong> Detailed time tracking reports</li>
            <li><strong>Attendance Reports:</strong> Work hours and attendance analytics</li>
            <li><strong>Application Usage:</strong> Software and application usage statistics</li>
          </ul>
          
          <h4>Export Options</h4>
          <p>Reports can be exported in various formats including PDF, Excel, and CSV for further analysis.</p>
        `
      },
      'employee-management': {
        title: 'Employee Management',
        content: `
          <h3>Managing Your Team</h3>
          <p>Efficiently manage your employees and organize them into teams for better productivity tracking.</p>
          
          <h4>Employee Operations</h4>
          <ul>
            <li><strong>Add Employees:</strong> Invite new team members to your organization</li>
            <li><strong>Edit Profiles:</strong> Update employee information and settings</li>
            <li><strong>Team Assignment:</strong> Organize employees into teams</li>
            <li><strong>Role Management:</strong> Assign roles and permissions</li>
          </ul>
          
          <h4>Team Management</h4>
          <ul>
            <li>Create and manage teams</li>
            <li>Assign team leaders</li>
            <li>Set team-specific tracking preferences</li>
            <li>Generate team performance reports</li>
          </ul>
        `
      },
      'settings': {
        title: 'Settings & Configuration',
        content: `
          <h3>System Configuration</h3>
          <p>Customize DXD Focus to match your organization's requirements and preferences.</p>
          
          <h4>General Settings</h4>
          <ul>
            <li><strong>Organization Profile:</strong> Update company information</li>
            <li><strong>Time Zone:</strong> Configure time zone settings</li>
            <li><strong>Work Hours:</strong> Set standard work hours</li>
            <li><strong>Notification Preferences:</strong> Configure alerts and notifications</li>
          </ul>
          
          <h4>Tracking Settings</h4>
          <ul>
            <li><strong>Screenshot Frequency:</strong> Configure screenshot capture intervals</li>
            <li><strong>Activity Monitoring:</strong> Set monitoring preferences</li>
            <li><strong>Idle Time Detection:</strong> Configure idle time thresholds</li>
            <li><strong>Privacy Settings:</strong> Manage privacy and compliance settings</li>
          </ul>
        `
      },
      'api': {
        title: 'API Documentation',
        content: `
          <h3>DXD Focus API</h3>
          <p>Integrate DXD Focus with your existing systems using our comprehensive REST API.</p>
          
          <h4>Authentication</h4>
          <p>API requests require authentication using API keys:</p>
          <pre><code>Authorization: Bearer YOUR_API_KEY</code></pre>
          
          <h4>Endpoints</h4>
          <ul>
            <li><code>GET /api/employees</code> - Retrieve employee list</li>
            <li><code>GET /api/tracking/live</code> - Get live tracking data</li>
            <li><code>GET /api/reports/productivity</code> - Generate productivity reports</li>
            <li><code>POST /api/employees</code> - Add new employee</li>
          </ul>
          
          <h4>Rate Limits</h4>
          <p>API requests are limited to 1000 requests per hour per API key.</p>
        `
      },
      'troubleshooting': {
        title: 'Troubleshooting',
        content: `
          <h3>Common Issues and Solutions</h3>
          <p>Solutions to frequently encountered problems with DXD Focus.</p>
          
          <h4>Client Application Issues</h4>
          <ul>
            <li><strong>Application not starting:</strong> Check if the application is running as administrator</li>
            <li><strong>Screenshots not capturing:</strong> Verify screen capture permissions</li>
            <li><strong>Connection issues:</strong> Check internet connectivity and firewall settings</li>
          </ul>
          
          <h4>Dashboard Issues</h4>
          <ul>
            <li><strong>Data not updating:</strong> Refresh the page or check employee client status</li>
            <li><strong>Reports not generating:</strong> Verify date ranges and employee selections</li>
            <li><strong>Login problems:</strong> Reset password or contact administrator</li>
          </ul>
          
          <h4>Contact Support</h4>
          <p>If you need additional help, contact our support team:</p>
          <ul>
            <li>Email: support@dxdglobal.com</li>
            <li>Phone: +1 (555) 123-4567</li>
            <li>Live Chat: Available 24/7 through the dashboard</li>
          </ul>
        `
      }
    },
    tr: {
      'getting-started': {
        title: 'DXD Focus ile Başlangıç',
        content: `
          <h3>DXD Focus'a Hoş Geldiniz</h3>
          <p>DXD Focus, organizasyonların iş gücü yönetimini optimize etmelerine yardımcı olmak için tasarlanmış kapsamlı bir çalışan izleme ve verimlilik takip çözümüdür.</p>
          
          <h4>Ana Özellikler</h4>
          <ul>
            <li><strong>Gerçek Zamanlı İzleme:</strong> Çalışan aktivitelerini gerçek zamanlı olarak izleyin</li>
            <li><strong>Ekran Görüntüsü İzleme:</strong> Şeffaflık için otomatik ekran görüntüsü yakalama</li>
            <li><strong>Detaylı Raporlar:</strong> Kapsamlı analitik ve raporlama araçları</li>
            <li><strong>Takım Yönetimi:</strong> Takımları etkili bir şekilde organize edin ve yönetin</li>
            <li><strong>Devam Takibi:</strong> Çalışma saatlerini ve devam düzenlerini izleyin</li>
          </ul>
          
          <h4>Hızlı Kurulum</h4>
          <ol>
            <li>DXD Focus istemci uygulamasını indirin ve kurun</li>
            <li>Organizasyon hesabınızı kaydedin</li>
            <li>Organizasyonunuza çalışanları ekleyin</li>
            <li>İzleme ayarlarını yapılandırın</li>
            <li>Verimliliği izlemeye ve takip etmeye başlayın</li>
          </ol>
        `
      },
      'dashboard': {
        title: 'Kontrol Paneli Genel Bakış',
        content: `
          <h3>Kontrol Paneli Bileşenleri</h3>
          <p>Kontrol paneli, organizasyonunuzun verimlilik metrikleri ve çalışan aktivitelerinin kapsamlı bir genel bakışını sağlar.</p>
          
          <h4>Ana Widget'lar</h4>
          <ul>
            <li><strong>Aktif Çalışanlar:</strong> Aktif takım üyelerinin gerçek zamanlı sayısı</li>
            <li><strong>Verimlilik Metrikleri:</strong> Genel verimlilik istatistikleri</li>
            <li><strong>Son Aktiviteler:</strong> En son çalışan aktiviteleri ve güncellemeleri</li>
            <li><strong>Hızlı İşlemler:</strong> Yaygın görevlere kısayollar</li>
          </ul>
          
          <h4>Navigasyon</h4>
          <p>Farklı bölümlere erişmek için kenar çubuğu navigasyonunu kullanın:</p>
          <ul>
            <li>Canlı İzleme - Gerçek zamanlı çalışan izleme</li>
            <li>Raporlar - Detaylı analitik ve raporlar</li>
            <li>Çalışanlar - Takım üyesi yönetimi</li>
            <li>Ayarlar - Sistem yapılandırması</li>
          </ul>
        `
      },
      'live-tracking': {
        title: 'Canlı İzleme',
        content: `
          <h3>Gerçek Zamanlı Çalışan İzleme</h3>
          <p>Canlı İzleme özelliği, çalışanlarınızın aktivitelerini gerçek zamanlı olarak izlemenizi sağlar.</p>
          
          <h4>Özellikler</h4>
          <ul>
            <li><strong>Canlı Ekran Görüntüleri:</strong> Çalışan ekranlarının gerçek zamanlı ekran görüntülerini görüntüleyin</li>
            <li><strong>Aktivite Durumu:</strong> Aktif/boşta durumunu izleyin</li>
            <li><strong>Uygulama Kullanımı:</strong> Hangi uygulamaların kullanıldığını takip edin</li>
            <li><strong>Zaman Takibi:</strong> Gerçek zamanlı çalışma saati takibi</li>
          </ul>
          
          <h4>Gizlilik Konuları</h4>
          <p>Tüm izleme aktiviteleri gizlilik düzenlemeleri ve şirket politikalarına uygun olarak gerçekleştirilir. İzleme aktif olduğunda çalışanlar bilgilendirilir.</p>
        `
      },
      'reports': {
        title: 'Raporlar ve Analitik',
        content: `
          <h3>Kapsamlı Raporlama</h3>
          <p>Verimlilik, devam ve çalışan performansını analiz etmek için detaylı raporlar oluşturun.</p>
          
          <h4>Mevcut Raporlar</h4>
          <ul>
            <li><strong>Çalışan Raporları:</strong> Bireysel çalışan performans metrikleri</li>
            <li><strong>Aktivite Desenleri:</strong> Çalışma desenlerinin ve verimlilik trendlerinin analizi</li>
            <li><strong>Zaman Kaydı Özeti:</strong> Detaylı zaman takip raporları</li>
            <li><strong>Devam Raporları:</strong> Çalışma saatleri ve devam analitiği</li>
            <li><strong>Uygulama Kullanımı:</strong> Yazılım ve uygulama kullanım istatistikleri</li>
          </ul>
          
          <h4>Dışa Aktarma Seçenekleri</h4>
          <p>Raporlar daha fazla analiz için PDF, Excel ve CSV dahil çeşitli formatlarda dışa aktarılabilir.</p>
        `
      },
      'employee-management': {
        title: 'Çalışan Yönetimi',
        content: `
          <h3>Takımınızı Yönetme</h3>
          <p>Çalışanlarınızı etkili bir şekilde yönetin ve daha iyi verimlilik takibi için takımlara organize edin.</p>
          
          <h4>Çalışan İşlemleri</h4>
          <ul>
            <li><strong>Çalışan Ekleme:</strong> Organizasyonunuza yeni takım üyelerini davet edin</li>
            <li><strong>Profil Düzenleme:</strong> Çalışan bilgilerini ve ayarlarını güncelleyin</li>
            <li><strong>Takım Atama:</strong> Çalışanları takımlara organize edin</li>
            <li><strong>Rol Yönetimi:</strong> Roller ve izinler atayın</li>
          </ul>
          
          <h4>Takım Yönetimi</h4>
          <ul>
            <li>Takımları oluşturun ve yönetin</li>
            <li>Takım liderlerini atayın</li>
            <li>Takıma özel izleme tercihlerini ayarlayın</li>
            <li>Takım performans raporları oluşturun</li>
          </ul>
        `
      },
      'settings': {
        title: 'Ayarlar ve Yapılandırma',
        content: `
          <h3>Sistem Yapılandırması</h3>
          <p>DXD Focus'u organizasyonunuzun gereksinimlerine ve tercihlerine uyacak şekilde özelleştirin.</p>
          
          <h4>Genel Ayarlar</h4>
          <ul>
            <li><strong>Organizasyon Profili:</strong> Şirket bilgilerini güncelleyin</li>
            <li><strong>Saat Dilimi:</strong> Saat dilimi ayarlarını yapılandırın</li>
            <li><strong>Çalışma Saatleri:</strong> Standart çalışma saatlerini ayarlayın</li>
            <li><strong>Bildirim Tercihleri:</strong> Uyarıları ve bildirimleri yapılandırın</li>
          </ul>
          
          <h4>İzleme Ayarları</h4>
          <ul>
            <li><strong>Ekran Görüntüsü Sıklığı:</strong> Ekran görüntüsü yakalama aralıklarını yapılandırın</li>
            <li><strong>Aktivite İzleme:</strong> İzleme tercihlerini ayarlayın</li>
            <li><strong>Boşta Kalma Süresi Algılama:</strong> Boşta kalma süresi eşiklerini yapılandırın</li>
            <li><strong>Gizlilik Ayarları:</strong> Gizlilik ve uyumluluk ayarlarını yönetin</li>
          </ul>
        `
      },
      'api': {
        title: 'API Dokümantasyonu',
        content: `
          <h3>DXD Focus API</h3>
          <p>Kapsamlı REST API'mizi kullanarak DXD Focus'u mevcut sistemlerinizle entegre edin.</p>
          
          <h4>Kimlik Doğrulama</h4>
          <p>API istekleri API anahtarları kullanarak kimlik doğrulama gerektirir:</p>
          <pre><code>Authorization: Bearer YOUR_API_KEY</code></pre>
          
          <h4>Uç Noktalar</h4>
          <ul>
            <li><code>GET /api/employees</code> - Çalışan listesini al</li>
            <li><code>GET /api/tracking/live</code> - Canlı izleme verilerini al</li>
            <li><code>GET /api/reports/productivity</code> - Verimlilik raporları oluştur</li>
            <li><code>POST /api/employees</code> - Yeni çalışan ekle</li>
          </ul>
          
          <h4>Hız Limitleri</h4>
          <p>API istekleri API anahtarı başına saatte 1000 istekle sınırlıdır.</p>
        `
      },
      'troubleshooting': {
        title: 'Sorun Giderme',
        content: `
          <h3>Yaygın Sorunlar ve Çözümler</h3>
          <p>DXD Focus ile sık karşılaşılan sorunların çözümleri.</p>
          
          <h4>İstemci Uygulama Sorunları</h4>
          <ul>
            <li><strong>Uygulama başlamıyor:</strong> Uygulamanın yönetici olarak çalışıp çalışmadığını kontrol edin</li>
            <li><strong>Ekran görüntüleri yakalanmıyor:</strong> Ekran yakalama izinlerini doğrulayın</li>
            <li><strong>Bağlantı sorunları:</strong> İnternet bağlantısını ve güvenlik duvarı ayarlarını kontrol edin</li>
          </ul>
          
          <h4>Kontrol Paneli Sorunları</h4>
          <ul>
            <li><strong>Veriler güncellenmiyor:</strong> Sayfayı yenileyin veya çalışan istemci durumunu kontrol edin</li>
            <li><strong>Raporlar oluşturulmuyor:</strong> Tarih aralıklarını ve çalışan seçimlerini doğrulayın</li>
            <li><strong>Giriş sorunları:</strong> Şifreyi sıfırlayın veya yöneticiyle iletişime geçin</li>
          </ul>
          
          <h4>Destek İletişim</h4>
          <p>Ek yardıma ihtiyacınız varsa, destek ekibimizle iletişime geçin:</p>
          <ul>
            <li>E-posta: support@dxdglobal.com</li>
            <li>Telefon: +1 (555) 123-4567</li>
            <li>Canlı Sohbet: Kontrol paneli üzerinden 7/24 mevcut</li>
          </ul>
        `
      }
    }
  };

  const filteredCategories = categories.filter(category =>
    category.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout headerTitle={t('documentation')} headerBreadcrumb={t('documentation')}>
      <DocumentationContainer theme={theme}>
        <Header>
          <Title theme={theme}>{t('documentation')}</Title>
          <Subtitle theme={theme}>
            {t('completeGuide')}
          </Subtitle>
          <SearchBox
            theme={theme}
            placeholder={t('searchDocumentation')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Header>

        <ContentArea>
          <DocSidebar theme={theme}>
            <SidebarTitle theme={theme}>{t('categories')}</SidebarTitle>
            <CategoryList>
              {filteredCategories.map((category) => (
                <CategoryItem key={category.id}>
                  <CategoryLink
                    theme={theme}
                    $isActive={activeCategory === category.id}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    {category.label}
                  </CategoryLink>
                </CategoryItem>
              ))}
            </CategoryList>
          </DocSidebar>

          <MainContent theme={theme}>
            <ContentTitle theme={theme}>
              {content[language]?.[activeCategory]?.title}
            </ContentTitle>
            <ContentText
              theme={theme}
              dangerouslySetInnerHTML={{
                __html: content[language]?.[activeCategory]?.content || ''
              }}
            />
          </MainContent>
        </ContentArea>
      </DocumentationContainer>
    </DashboardLayout>
  );
};

export default Documentation;

import os
import polib

base_dir = "locale"
languages = {
    "tr": {
        # Login
        "Dashboard": "Kontrol Paneli",
        "Welcome": "Hoş geldiniz",
        "DDS Focus Login V-1": "DDS Odak Giriş V-1",
        "Sign In": "Giriş Yap",
        "Username": "Kullanıcı Adı",
        "Password": "Şifre",
        "Remember me": "Beni hatırla",
        "Log In": "Giriş",
        "Forgot your password?": "Şifrenizi mi unuttunuz?",
        "Create an account": "Hesap oluştur",
        "Change Language": "Dili Değiştir",
        "English": "İngilizce",
        "Türkçe": "Türkçe",

        # Live Tracking
        "Tracking": "Takip",
        "All": "Hepsi",
        "Active": "Aktif",
        "Meeting": "Toplantı",
        "Break": "Mola",
        "Idle": "Boşta",
        "Offline": "Çevrimdışı",
        "All Time": "Tüm Zamanlar",
        "Today": "Bugün",
        "Last 7 Days": "Son 7 Gün",
        "Last 15 Days": "Son 15 Gün",
        "Last 30 Days": "Son 30 Gün",
        "Last 2 Months": "Son 2 Ay",
        "Last 6 Months": "Son 6 Ay",
        "Last 1 Year": "Son 1 Yıl",
        "REFRESH": "YENİLE",
        "Search employees...": "Çalışanları ara..."
    },
    "en": {
        # Login
        "Dashboard": "Dashboard",
        "Welcome": "Welcome",
        "DDS Focus Login V-1": "DDS Focus Login V-1",
        "Sign In": "Sign In",
        "Username": "Username",
        "Password": "Password",
        "Remember me": "Remember me",
        "Log In": "Log In",
        "Forgot your password?": "Forgot your password?",
        "Create an account": "Create an account",
        "Change Language": "Change Language",
        "English": "English",
        "Türkçe": "Türkçe",

        # Live Tracking
        "Tracking": "Tracking",
        "All": "All",
        "Active": "Active",
        "Meeting": "Meeting",
        "Break": "Break",
        "Idle": "Idle",
        "Offline": "Offline",
        "All Time": "All Time",
        "Today": "Today",
        "Last 7 Days": "Last 7 Days",
        "Last 15 Days": "Last 15 Days",
        "Last 30 Days": "Last 30 Days",
        "Last 2 Months": "Last 2 Months",
        "Last 6 Months": "Last 6 Months",
        "Last 1 Year": "Last 1 Year",
        "REFRESH": "REFRESH",
        "Search employees...": "Search employees..."
    }
}

for lang_code, translations in languages.items():
    po_dir = os.path.join(base_dir, lang_code, "LC_MESSAGES")
    os.makedirs(po_dir, exist_ok=True)

    po_path = os.path.join(po_dir, "django.po")
    mo_path = po_path.replace(".po", ".mo")

    po = polib.POFile()
    po.metadata = {
        'Content-Type': 'text/plain; charset=UTF-8',
        'Language': lang_code,
    }

    for msgid, msgstr in translations.items():
        po.append(polib.POEntry(msgid=msgid, msgstr=msgstr))

    po.save(po_path)
    po.save_as_mofile(mo_path)

print("✅ Translation files created and compiled.")

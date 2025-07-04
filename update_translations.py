import polib
import os

base_dir = "locale"
tr_po_path = os.path.join(base_dir, "tr/LC_MESSAGES/django.po")
en_po_path = os.path.join(base_dir, "en/LC_MESSAGES/django.po")

# Translation entries
entries = {
    "DDS Focus Login V-1": ("DDS Odak Giriş V-1", "DDS Focus Login V-1"),
    "Sign In": ("Giriş Yap", "Sign In"),
    "Username": ("Kullanıcı Adı", "Username"),
    "Password": ("Şifre", "Password"),
    "Remember me": ("Beni hatırla", "Remember me"),
    "Log In": ("Giriş", "Log In"),
    "Forgot your password?": ("Şifrenizi mi unuttunuz?", "Forgot your password?"),
    "Create an account": ("Hesap oluştur", "Create an account"),
}

# Create or update .po files
def update_po_file(path, lang_entries):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    po = polib.POFile()
    if os.path.exists(path):
        po = polib.pofile(path)
    for msgid, msgstr in lang_entries.items():
        entry = po.find(msgid)
        if entry is None:
            po.append(polib.POEntry(msgid=msgid, msgstr=msgstr))
        else:
            entry.msgstr = msgstr
    po.save(path)
    po.save_as_mofile(path.replace(".po", ".mo"))

update_po_file(tr_po_path, {k: v[0] for k, v in entries.items()})
update_po_file(en_po_path, {k: v[1] for k, v in entries.items()})

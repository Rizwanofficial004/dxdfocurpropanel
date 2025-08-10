import polib
import os

# Set base directory
base_dir = "locale"

# Create folders if not exist
os.makedirs(os.path.join(base_dir, "tr/LC_MESSAGES"), exist_ok=True)
os.makedirs(os.path.join(base_dir, "en/LC_MESSAGES"), exist_ok=True)

# Turkish translation
tr_po = polib.POFile()
tr_po.metadata = {
    'Content-Type': 'text/plain; charset=UTF-8',
    'Language': 'tr',
}
tr_po.append(polib.POEntry(msgid="Dashboard", msgstr="Kontrol Paneli"))
tr_po.append(polib.POEntry(msgid="Welcome", msgstr="Hoş geldiniz"))
tr_po.save(os.path.join(base_dir, "tr/LC_MESSAGES/django.po"))
tr_po.save_as_mofile(os.path.join(base_dir, "tr/LC_MESSAGES/django.mo"))

# English translation
en_po = polib.POFile()
en_po.metadata = {
    'Content-Type': 'text/plain; charset=UTF-8',
    'Language': 'en',
}
en_po.append(polib.POEntry(msgid="Dashboard", msgstr="Dashboard"))
en_po.append(polib.POEntry(msgid="Welcome", msgstr="Welcome"))
en_po.save(os.path.join(base_dir, "en/LC_MESSAGES/django.po"))
en_po.save_as_mofile(os.path.join(base_dir, "en/LC_MESSAGES/django.mo"))

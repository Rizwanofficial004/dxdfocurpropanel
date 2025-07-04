import os
import polib

base_dir = "locale"
tr_po_path = os.path.join(base_dir, "tr/LC_MESSAGES/django.po")
en_po_path = os.path.join(base_dir, "en/LC_MESSAGES/django.po")

# Strings to add
new_entries = {
    "Change Language": ("Dili Değiştir", "Change Language"),
    "English": ("İngilizce", "English"),
    "Türkçe": ("Türkçe", "Türkçe")
}

def update_po_file(path, entries, is_tr):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    po = polib.pofile(path) if os.path.exists(path) else polib.POFile()
    for msgid, (tr, en) in entries.items():
        msgstr = tr if is_tr else en
        entry = po.find(msgid)
        if not entry:
            po.append(polib.POEntry(msgid=msgid, msgstr=msgstr))
        else:
            entry.msgstr = msgstr
    po.save(path)
    po.save_as_mofile(path.replace(".po", ".mo"))

update_po_file(tr_po_path, new_entries, is_tr=True)
update_po_file(en_po_path, new_entries, is_tr=False)

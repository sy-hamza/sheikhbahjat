import os
import shutil
import uuid
import re
import sys
import hashlib

# Add current folder to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.book import Book
from app.models.poem import Poem
from app.models.category import Category

# Paths
BOOKS_SRC = r"C:\Users\hamoz\OneDrive\Desktop\كتب عامر"
AUDIO_SRC = r"C:\Users\hamoz\OneDrive\Desktop\الصوتيات"
UPLOAD_DIR = r"f:\bahjat\backend\uploads"

def clean_title(filename):
    name, ext = os.path.splitext(filename)
    # Remove leading/trailing underscores and spaces
    name = name.strip("_ ⁨⁩\t")
    # Replace multiple underscores or dashes with spaces
    name = name.replace("_", " ").replace("-", " ")
    # Replace multiple spaces with a single space
    name = re.sub(r'\s+', ' ', name)
    return name.strip()

def clean_audio_title(filename):
    name = clean_title(filename)
    # Remove common audio metadata keywords
    words_to_remove = [
        "بصوت عامر بهجت", "بقراءة عامر بهجت", "بصوت عامر", "الشيخ عامر",
        "فضيلة الشيخ الدكتور عامر بهجت", "د عامر بهجت", "عامر بهجت",
        "بصدى", "بدون صدى", "مع صدى", "AudioTrimmer", "سريع",
        "معتمد", "معدل", "ش حمزة", "للجوال", "نسخة للحفظ",
        "تعديلات", "كاملا", "شرح"
    ]
    for w in words_to_remove:
        name = name.replace(w, "")
        name = name.replace(w.replace(" ", ""), "") # without spaces
    
    # Remove dates and year indications
    name = re.sub(r'\d{1,4}-\d{1,2}-\d{1,4}', '', name)
    name = re.sub(r'\d+هـ?', '', name)
    name = re.sub(r'[\(\[\{\)\]\}]', '', name)
    name = re.sub(r'\s+', ' ', name)
    return name.strip()

def is_english(text):
    # Check if text is mostly English letters
    letters = re.findall(r'[a-zA-Z]', text)
    return len(letters) > 4

def find_category(title, db):
    title_clean = title.lower()
    if is_english(title):
        cat = db.query(Category).filter(Category.name == "الكتب بالإنجليزية").first()
        if not cat:
            cat = Category(
                name="الكتب بالإنجليزية",
                description="Books and translations in English",
                sort_order=9,
                icon="book-open"
            )
            db.add(cat)
            db.commit()
            db.refresh(cat)
        return cat.id

    if any(w in title_clean for w in ["توحيد", "عقيدة", "إيمان", "واسطية", "باديس", "شرك"]):
        cat = db.query(Category).filter(Category.name == "التوحيد").first()
        if cat: return cat.id
    if any(w in title_clean for w in ["أصول الفقه", "الورقات", "التحرير", "الأصول", "المعسول", "القواعد"]):
        cat = db.query(Category).filter(Category.name == "القواعد الأصولية").first()
        if cat: return cat.id
    if any(w in title_clean for w in ["صلاة", "صيام", "عبادات", "اعتكاف", "وقف", "جنايات", "عبادة"]):
        cat = db.query(Category).filter(Category.name == "فقه العبادات").first()
        if cat: return cat.id
    if any(w in title_clean for w in ["معاملات", "بيع", "الأساس"]):
        cat = db.query(Category).filter(Category.name == "فقه المعاملات").first()
        if cat: return cat.id
    if any(w in title_clean for w in ["أسرة", "فرائض", "الفرض", "التعصيب"]):
        cat = db.query(Category).filter(Category.name == "فقه الأسرة").first()
        if cat: return cat.id
    if any(w in title_clean for w in ["نحو", "إعراب", "الأفعال", "البلاغة", "صرف"]):
        cat = db.query(Category).filter(Category.name == "النحو").first()
        if cat: return cat.id
    if any(w in title_clean for w in ["تفسير", "قرآن", "سورة", "الفاتحة"]):
        cat = db.query(Category).filter(Category.name == "التفسير").first()
        if cat: return cat.id
    if any(w in title_clean for w in ["منظومة", "نظم", "أرجوزة"]):
        cat = db.query(Category).filter(Category.name == "منظومات في الفقه").first()
        if cat: return cat.id
        
    cat = db.query(Category).filter(Category.name == "الفقه").first()
    if cat: return cat.id
    return None

def file_hash(filepath):
    """Calculate MD5 hash of a file to check for duplicate content."""
    hasher = hashlib.md5()
    with open(filepath, 'rb') as f:
        buf = f.read(65536)
        while len(buf) > 0:
            hasher.update(buf)
            buf = f.read(65536)
    return hasher.hexdigest()

def migrate():
    db = SessionLocal()
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    print("[INFO] Starting User Media Migration...")
    
    # ─── 1. Books Migration ──────────────────────────────────
    print("\n[BOOKS] Processing Books...")
    if not os.path.exists(BOOKS_SRC):
        print(f"[ERROR] Books source directory not found: {BOOKS_SRC}")
    else:
        book_files = os.listdir(BOOKS_SRC)
        copied_hashes = set()
        
        # Prepopulate already migrated book hashes/filenames if any
        existing_books = db.query(Book).all()
        existing_titles = {b.title.lower() for b in existing_books}
        
        for filename in book_files:
            filepath = os.path.join(BOOKS_SRC, filename)
            if not os.path.isfile(filepath):
                continue
                
            ext = os.path.splitext(filename)[1].lower()
            if ext != ".pdf":
                continue
                
            # Skip unrecognized or temporary scan files
            if any(w in filename for w in ["DOC-", "New Document", "Screenshot", "Copy of", "2022-08-18"]):
                print(f"[SKIP] Unnamed/temp file: {filename}")
                continue
                
            title = clean_title(filename)
            # Skip if title doesn't contain alphabetic characters
            if not re.search(r'[\u0600-\u06FFa-zA-Z]', title):
                print(f"[SKIP] Numeric/untitled file: {filename}")
                continue
                
            # Check for duplicates by title
            if title.lower() in existing_titles:
                print(f"[SKIP] Duplicate book (already in DB): {title}")
                continue
                
            # Check for duplicate file content using hash
            fhash = file_hash(filepath)
            if fhash in copied_hashes:
                print(f"[SKIP] Duplicate book file (same content): {filename}")
                continue
                
            copied_hashes.add(fhash)
            
            # Copy file to uploads folder with unique uuid
            unique_filename = f"{uuid.uuid4()}{ext}"
            dest_path = os.path.join(UPLOAD_DIR, unique_filename)
            shutil.copy2(filepath, dest_path)
            
            # Determine category
            category_id = find_category(title, db)
            
            # Create Database Record
            new_book = Book(
                title=title,
                author="الشيخ عامر بهجت",
                description="كتاب من مؤلفات فضيلة الشيخ عامر بهجت.",
                pdf_path=f"/uploads/{unique_filename}",
                category_id=category_id,
                is_published=True,
                is_featured=False
            )
            db.add(new_book)
            existing_titles.add(title.lower())
            print(f"[SUCCESS] Imported Book: {title} -> {new_book.pdf_path}")
            
        db.commit()

    # ─── 2. Poems/Audio Migration ─────────────────────────────
    print("\n[AUDIO] Processing Audios & Poems...")
    if not os.path.exists(AUDIO_SRC):
        print(f"[ERROR] Audio source directory not found: {AUDIO_SRC}")
    else:
        audio_files = os.listdir(AUDIO_SRC)
        
        existing_poems = db.query(Poem).all()
        existing_poem_titles = {p.title.lower(): p for p in existing_poems}
        
        for filename in audio_files:
            filepath = os.path.join(AUDIO_SRC, filename)
            if not os.path.isfile(filepath):
                continue
                
            ext = os.path.splitext(filename)[1].lower()
            if ext not in [".mp3", ".wav", ".m4a", ".ogg"]:
                continue
                
            # Skip temporary or unrecognized files
            if any(w in filename for w in ["AUD-", "PTT-", "ضبط اسم"]):
                print(f"[SKIP] Unnamed/temp audio file: {filename}")
                continue
                
            title = clean_audio_title(filename)
            if not re.search(r'[\u0600-\u06FFa-zA-Z]', title):
                print(f"[SKIP] Numeric/untitled audio file: {filename}")
                continue
                
            # Copy audio file to uploads folder
            unique_filename = f"{uuid.uuid4()}{ext}"
            dest_path = os.path.join(UPLOAD_DIR, unique_filename)
            shutil.copy2(filepath, dest_path)
            
            audio_url = f"/uploads/{unique_filename}"
            
            # Check if this poem title already exists in the database
            matched_title = None
            for p_title in existing_poem_titles.keys():
                # Check for substring match
                if title.lower() in p_title or p_title in title.lower():
                    matched_title = p_title
                    break
                    
            if matched_title:
                # Update existing poem's audio path
                poem = existing_poem_titles[matched_title]
                poem.audio_path = audio_url
                print(f"[LINK] Linked Audio to existing Poem: {poem.title} -> {audio_url}")
            else:
                # Create a new poem
                category_id = find_category(title, db)
                new_poem = Poem(
                    title=title,
                    author="الشيخ عامر بهجت",
                    description="منظومة شعرية علمية ميسرة للشيخ عامر بهجت.",
                    text_content="أبيات هذه المنظومة متوفرة في الملف الصوتي المرفق.",
                    audio_path=audio_url,
                    category_id=category_id,
                    is_published=True,
                    is_featured=False
                )
                db.add(new_poem)
                existing_poem_titles[title.lower()] = new_poem
                print(f"[SUCCESS] Imported Poem + Audio: {title} -> {audio_url}")
                
        db.commit()
        
    db.close()
    print("\n[SUCCESS] Media migration successfully completed!")

if __name__ == "__main__":
    migrate()

import sqlite3
import os

def flatten():
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sheikh_bahjat.db")
    print(f"Connecting to database at {db_path}...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Define the mapping from subcategory IDs to parent root IDs
    mapping = {
        2: 1,   # التوحيد -> العقيدة
        3: 1,   # الأسماء والصفات -> العقيدة
        4: 1,   # الإيمان والكفر -> العقيدة
        6: 5,   # فقه العبادات -> الفقه
        7: 5,   # فقه المعاملات -> الفقه
        8: 5,   # فقه الأسرة -> الفقه
        9: 5,   # فقه الجنايات -> الفقه
        11: 10, # القواعد الأصولية -> أصول الفقه
        12: 10, # مباحث الأدلة -> أصول الفقه
        14: 13, # التفسير -> علوم القرآن
        15: 13, # علوم القرآن -> علوم القرآن
        16: 13, # القراءات -> علوم القرآن
        18: 17, # شرح الأحاديث -> الحديث وعلومه
        19: 17, # مصطلح الحديث -> الحديث وعلومه
        20: 17, # تخريج الأحاديث -> الحديث وعلومه
        22: 21, # النحو -> اللغة العربية
        23: 21, # الصرف -> اللغة العربية
        24: 21, # البلاغة -> اللغة العربية
        26: 25, # منظومات في العقيدة -> المنظومات
        27: 25, # منظومات في الفقه -> المنظومات
        28: 25, # منظومات في النحو -> المنظومات
        32: 29  # تاريخ وسيرة -> السيرة والتاريخ
    }

    # 1. Update books category association
    print("Updating books category associations...")
    for sub_id, parent_id in mapping.items():
        cursor.execute("UPDATE books SET category_id = ? WHERE category_id = ?", (parent_id, sub_id))
    
    # 2. Update poems category association
    print("Updating poems category associations...")
    for sub_id, parent_id in mapping.items():
        cursor.execute("UPDATE poems SET category_id = ? WHERE category_id = ?", (parent_id, sub_id))

    # 3. Delete subcategories from categories table
    print("Deleting child categories from database...")
    for sub_id in mapping.keys():
        cursor.execute("DELETE FROM categories WHERE id = ?", (sub_id,))

    # 4. Make sure category 29 has a clean name
    cursor.execute("UPDATE categories SET name = 'السيرة والتاريخ' WHERE id = 29")

    conn.commit()
    print("Categories flattened successfully!")
    
    # Print remaining categories
    cursor.execute("SELECT id, name FROM categories")
    print("\nRemaining Categories in Database:")
    for row in cursor.fetchall():
        print(row)
        
    conn.close()

if __name__ == '__main__':
    flatten()

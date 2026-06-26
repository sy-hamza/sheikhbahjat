import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models import User
from app.security.auth import hash_password

def print_help():
    print("""
مدير مستخدمي لوحة التحكم - موقع الشيخ عامر بهجت
==============================================
الاستخدام:
  python manage_admins.py list
    لعرض جميع المدراء الحاليين.

  python manage_admins.py add [اسم_المستخدم] [البريد] [كلمة_المرور] [الاسم_المعروض]
    لإضافة مدير جديد.

  python manage_admins.py update [اسم_المستخدم] [كلمة_المرور_الجديدة]
    لتحديث كلمة المرور لمدير موجود.

  python manage_admins.py delete [اسم_المستخدم]
    لحذف مدير.
""")

def list_admins():
    db = SessionLocal()
    try:
        admins = db.query(User).filter(User.role == "admin").all()
        print("\nقائمة المدراء المسجلين:")
        print("-" * 70)
        print(f"{'ID':<5} | {'اسم المستخدم':<15} | {'البريد الإلكتروني':<25} | {'الاسم المعروض':<15}")
        print("-" * 70)
        for admin in admins:
            print(f"{admin.id:<5} | {admin.username:<15} | {admin.email:<25} | {admin.display_name or '':<15}")
        print("-" * 70 + "\n")
    finally:
        db.close()

def add_admin(username, email, password, display_name):
    db = SessionLocal()
    try:
        # Check if username or email already exists
        exists = db.query(User).filter((User.username == username) | (User.email == email)).first()
        if exists:
            print(f"❌ خطأ: اسم المستخدم '{username}' أو البريد '{email}' مستخدم بالفعل!")
            return

        admin = User(
            username=username,
            email=email,
            hashed_password=hash_password(password),
            role="admin",
            display_name=display_name,
            is_active=True
        )
        db.add(admin)
        db.commit()
        print(f"✅ تم إضافة المدير الجديد '{display_name}' (اسم المستخدم: {username}) بنجاح!")
    except Exception as e:
        print(f"❌ حدث خطأ أثناء الإضافة: {e}")
    finally:
        db.close()

def update_admin(username, new_password):
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.username == username, User.role == "admin").first()
        if not admin:
            print(f"❌ خطأ: لم يتم العثور على مدير باسم المستخدم '{username}'")
            return

        admin.hashed_password = hash_password(new_password)
        db.commit()
        print(f"✅ تم تحديث كلمة المرور للمدير '{username}' بنجاح!")
    except Exception as e:
        print(f"❌ حدث خطأ أثناء التحديث: {e}")
    finally:
        db.close()

def delete_admin(username):
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.username == username, User.role == "admin").first()
        if not admin:
            print(f"❌ خطأ: لم يتم العثور على مدير باسم المستخدم '{username}'")
            return

        # Prevent deleting the last admin
        admin_count = db.query(User).filter(User.role == "admin").count()
        if admin_count <= 1:
            print("❌ خطأ: لا يمكن حذف المدير الوحيد في النظام! يجب أن يبقى مدير واحد على الأقل.")
            return

        db.delete(admin)
        db.commit()
        print(f"✅ تم حذف المدير '{username}' بنجاح!")
    except Exception as e:
        print(f"❌ حدث خطأ أثناء الحذف: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print_help()
        sys.exit(1)

    cmd = sys.argv[1].lower()
    if cmd == "list":
        list_admins()
    elif cmd == "add":
        if len(sys.argv) < 6:
            print("❌ خطأ: الحقول ناقصة لإضافة مدير.")
            print("الاستخدام: python manage_admins.py add [اسم_المستخدم] [البريد] [كلمة_المرور] [الاسم_المعروض]")
            sys.exit(1)
        add_admin(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5])
    elif cmd == "update":
        if len(sys.argv) < 4:
            print("❌ خطأ: الحقول ناقصة لتحديث كلمة المرور.")
            print("الاستخدام: python manage_admins.py update [اسم_المستخدم] [كلمة_المرور_الجديدة]")
            sys.exit(1)
        update_admin(sys.argv[2], sys.argv[3])
    elif cmd == "delete":
        if len(sys.argv) < 3:
            print("❌ خطأ: يجب كتابة اسم المستخدم المراد حذفه.")
            print("الاستخدام: python manage_admins.py delete [اسم_المستخدم]")
            sys.exit(1)
        delete_admin(sys.argv[2])
    else:
        print_help()

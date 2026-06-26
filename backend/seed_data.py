"""
Database Seed Script
====================
Populates the database with initial data:
- Default admin user
- Sample categories (archive structure)
- Sample books, poems, and fatwas
- Default site content (hero text, biography)

Usage: python -m seed_data
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, SessionLocal
from app.models import User, Category, Book, Poem, Fatwa, SiteContent
from app.models.fatwa import FatwaStatus
from app.security.auth import hash_password


def seed():
    """Seed the database with initial data."""
    # Create all tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # ─── Check if already seeded ──────────────────────
        if db.query(User).first():
            print("⚠️  قاعدة البيانات تحتوي على بيانات بالفعل. تخطي...")
            return

        print("🌱 بدء تهيئة قاعدة البيانات...")

        # ─── 1. Admin User ────────────────────────────────
        admin = User(
            username="admin",
            email="admin@bahjat.com",
            hashed_password=hash_password("Admin@12345"),
            role="admin",
            display_name="المدير",
            is_active=True,
        )
        db.add(admin)
        db.flush()
        print("✅ تم إنشاء المستخدم الإداري (admin / Admin@12345)")

        # ─── 2. Categories (Archive Structure) ────────────
        categories_data = [
            {"name": "العقيدة", "icon": "shield", "sort_order": 1, "children": [
                {"name": "التوحيد", "sort_order": 1},
                {"name": "الأسماء والصفات", "sort_order": 2},
                {"name": "الإيمان والكفر", "sort_order": 3},
            ]},
            {"name": "الفقه", "icon": "scale", "sort_order": 2, "children": [
                {"name": "فقه العبادات", "sort_order": 1},
                {"name": "فقه المعاملات", "sort_order": 2},
                {"name": "فقه الأسرة", "sort_order": 3},
                {"name": "فقه الجنايات", "sort_order": 4},
            ]},
            {"name": "أصول الفقه", "icon": "compass", "sort_order": 3, "children": [
                {"name": "القواعد الأصولية", "sort_order": 1},
                {"name": "مباحث الأدلة", "sort_order": 2},
            ]},
            {"name": "علوم القرآن", "icon": "book-open", "sort_order": 4, "children": [
                {"name": "التفسير", "sort_order": 1},
                {"name": "علوم القرآن", "sort_order": 2},
                {"name": "القراءات", "sort_order": 3},
            ]},
            {"name": "الحديث وعلومه", "icon": "scroll", "sort_order": 5, "children": [
                {"name": "شرح الأحاديث", "sort_order": 1},
                {"name": "مصطلح الحديث", "sort_order": 2},
                {"name": "تخريج الأحاديث", "sort_order": 3},
            ]},
            {"name": "اللغة العربية", "icon": "pen-tool", "sort_order": 6, "children": [
                {"name": "النحو", "sort_order": 1},
                {"name": "الصرف", "sort_order": 2},
                {"name": "البلاغة", "sort_order": 3},
            ]},
            {"name": "المنظومات", "icon": "music", "sort_order": 7, "children": [
                {"name": "منظومات في العقيدة", "sort_order": 1},
                {"name": "منظومات في الفقه", "sort_order": 2},
                {"name": "منظومات في النحو", "sort_order": 3},
            ]},
            {"name": "السيرة والتاريخ", "icon": "clock", "sort_order": 8},
        ]

        category_map = {}
        for cat_data in categories_data:
            children = cat_data.pop("children", [])
            parent_cat = Category(**cat_data)
            db.add(parent_cat)
            db.flush()
            category_map[cat_data["name"]] = parent_cat

            for child_data in children:
                child_data["parent_id"] = parent_cat.id
                child_cat = Category(**child_data)
                db.add(child_cat)
                db.flush()
                category_map[child_data["name"]] = child_cat

        print(f"✅ تم إنشاء {len(category_map)} تصنيف")

        # ─── 3. Sample Books ──────────────────────────────
        books_data = [
            {
                "title": "شرح العقيدة الواسطية",
                "author": "الشيخ عامر بهجت",
                "description": "شرح مفصل لعقيدة أهل السنة والجماعة كما بينها شيخ الإسلام ابن تيمية في رسالته العقيدة الواسطية، مع التعليق على المسائل العقدية والرد على الشبهات.",
                "category_id": category_map["التوحيد"].id,
                "page_count": 350,
                "publish_year": "1445",
                "is_featured": True,
            },
            {
                "title": "تيسير أصول الفقه",
                "author": "الشيخ عامر بهجت",
                "description": "كتاب مبسط في أصول الفقه يشرح القواعد الأصولية الكبرى بأسلوب ميسر مع الأمثلة التطبيقية من الفقه الإسلامي.",
                "category_id": category_map["القواعد الأصولية"].id,
                "page_count": 280,
                "publish_year": "1444",
                "is_featured": True,
            },
            {
                "title": "الملخص في شرح كتاب التوحيد",
                "author": "الشيخ عامر بهجت",
                "description": "ملخص شامل لأبواب كتاب التوحيد للإمام محمد بن عبد الوهاب مع بيان الشاهد من كل باب وذكر الفوائد المستنبطة.",
                "category_id": category_map["التوحيد"].id,
                "page_count": 200,
                "publish_year": "1443",
                "is_featured": True,
            },
            {
                "title": "فقه الصلاة - أحكام وآداب",
                "author": "الشيخ عامر بهجت",
                "description": "بحث فقهي شامل في أحكام الصلاة من الطهارة إلى السلام، مع ذكر الأدلة والترجيح بين أقوال العلماء.",
                "category_id": category_map["فقه العبادات"].id,
                "page_count": 420,
                "publish_year": "1444",
            },
            {
                "title": "المختصر في علم النحو",
                "author": "الشيخ عامر بهجت",
                "description": "مختصر جامع في علم النحو العربي يبدأ من الكلمة وأقسامها إلى باب الإعراب والبناء مع تدريبات تطبيقية.",
                "category_id": category_map["النحو"].id,
                "page_count": 150,
                "publish_year": "1442",
            },
            {
                "title": "تأملات في سورة الفاتحة",
                "author": "الشيخ عامر بهجت",
                "description": "دراسة تدبرية في معاني سورة الفاتحة وأسرارها وما تضمنته من أصول العقيدة والعبادة.",
                "category_id": category_map["التفسير"].id,
                "page_count": 120,
                "publish_year": "1445",
                "is_featured": True,
            },
        ]

        for book_data in books_data:
            db.add(Book(**book_data))
        print(f"✅ تم إنشاء {len(books_data)} كتاب")

        # ─── 4. Sample Poems ──────────────────────────────
        poems_data = [
            {
                "title": "منظومة في أصول الإيمان",
                "author": "الشيخ عامر بهجت",
                "description": "منظومة شعرية تجمع أصول الإيمان الستة بأسلوب سهل ميسر للحفظ والمراجعة.",
                "text_content": """بسم الله نبدأ بالكلام *** في أصول ديننا الإسلام
أركان الإيمان ستةٌ *** جاءت في سنة خير البرية
إيمانٌ بالله ذي الجلال *** وملائكة الرحمن ذي الكمال
وكتبه التي أنزلها *** ورسله الذين أرسلها
واليوم الآخر والقدر *** خيره وشره من البشر
هذي أصول الدين والإيمان *** فاحفظ بها يا طالب الإحسان
من آمن بها على يقين *** فاز بجنات رب العالمين
واعلم بأن الإيمان قولٌ وعمل *** يزيد بالطاعة فيمن اتصل
وينقص العبد بالمعاصي *** فاحذر أخي من كل نقاص""",
                "verse_count": 12,
                "subject": "العقيدة",
                "category_id": category_map["منظومات في العقيدة"].id,
                "is_featured": True,
            },
            {
                "title": "نظم في آداب طالب العلم",
                "author": "الشيخ عامر بهجت",
                "description": "أبيات في آداب طلب العلم الشرعي والحث على التواضع والإخلاص في الطلب.",
                "text_content": """يا طالب العلم اجتهد *** واصبر على طول الأمد
واحرص على الإخلاص في *** عملٍ تقوم به تجد
واعلم بأن العلم نور *** يهدي إلى خير السبيل
فاطلبه من أهل العلم *** واحفظه حفظ النص يا نبيل
تواضع لأهل العلم واخ *** ـفض جناحك للمعلم
واسأل إذا أشكل عليـ *** ـك فليس في السؤال ما يُذم
وراجع المتون واحفظها *** ففيها العلم والفهم الأصيل
واعمل بما تعلمته *** فالعلم بالعمل جميل""",
                "verse_count": 10,
                "subject": "آداب",
                "category_id": category_map["منظومات في العقيدة"].id,
                "is_featured": True,
            },
            {
                "title": "نظم قواعد الإعراب",
                "author": "الشيخ عامر بهجت",
                "description": "منظومة ميسرة في قواعد الإعراب الأساسية للمبتدئين في علم النحو.",
                "text_content": """إن الكلام في لسان العرب *** ينقسم الأقسام دون ريب
اسمٌ وفعلٌ ثم حرف معنى *** كل له في النحو شأن يُعنى
فالاسم ما قد دل معنى وحده *** كزيد والنهر وعلم بلده
والفعل ما دل على حدث مع *** زمانٍ ماضٍ أو مضارع وقع
والحرف ما ليس له معنى بذات *** إلا مع غيره كهل وفي وهات
والاسم مرفوع ومنصوب وجر *** والفعل فيه الرفع والنصب حضر
والجزم فيه أيضاً يا صاح *** والحرف لا محل عند الإعراب""",
                "verse_count": 8,
                "subject": "النحو",
                "category_id": category_map["منظومات في النحو"].id,
            },
        ]

        for poem_data in poems_data:
            db.add(Poem(**poem_data))
        print(f"✅ تم إنشاء {len(poems_data)} منظومة")

        # ─── 5. Sample Fatwas ─────────────────────────────
        fatwas_data = [
            {
                "question": "ما حكم الجمع بين الصلاتين في المطر؟",
                "questioner_name": "أبو عبدالله",
                "topic": "فقه العبادات",
                "answer": "يجوز الجمع بين الظهر والعصر وبين المغرب والعشاء في المطر الشديد الذي يُبل الثياب ويشق معه الخروج إلى المسجد، وهذا مذهب جمهور أهل العلم. والدليل ما رواه ابن عباس رضي الله عنهما أن النبي صلى الله عليه وسلم جمع بين الظهر والعصر وبين المغرب والعشاء بالمدينة من غير خوف ولا مطر. والأولى أن يكون الجمع جمع تقديم لا تأخير، والله أعلم.",
                "status": FatwaStatus.APPROVED,
                "answered_by": "الشيخ عامر بهجت",
            },
            {
                "question": "هل يجوز قراءة القرآن من الجوال بدون وضوء؟",
                "questioner_name": "طالب علم",
                "topic": "فقه العبادات",
                "answer": "نعم، يجوز قراءة القرآن من الجوال (الهاتف المحمول) بدون وضوء، لأن الجوال ليس مصحفاً وإنما هو جهاز إلكتروني، والحروف المعروضة على الشاشة ليست حروفاً مكتوبة بل هي إشارات إلكترونية. ولكن الأفضل والأكمل أن يكون القارئ على طهارة تعظيماً لكلام الله تعالى.",
                "status": FatwaStatus.APPROVED,
                "answered_by": "الشيخ عامر بهجت",
            },
            {
                "question": "ما هي شروط صحة التوبة؟",
                "questioner_name": "مجهول",
                "topic": "العقيدة",
                "answer": "شروط التوبة النصوح ثلاثة إن كان الذنب بين العبد وربه: الأول: الإقلاع عن الذنب فوراً. الثاني: الندم على ما فات. الثالث: العزم على عدم العودة إليه. وإن كان الذنب يتعلق بحق آدمي فيُضاف شرط رابع وهو: رد المظلمة إلى صاحبها أو استحلاله منها.",
                "status": FatwaStatus.APPROVED,
                "answered_by": "الشيخ عامر بهجت",
            },
            {
                "question": "ما حكم صلاة التراويح خلف التلفاز أو البث المباشر؟",
                "questioner_name": "أم محمد",
                "topic": "فقه العبادات",
                "status": FatwaStatus.PENDING,
            },
            {
                "question": "هل تجب زكاة الذهب الملبوس؟",
                "questioner_name": "مجهول",
                "topic": "فقه العبادات",
                "status": FatwaStatus.PENDING,
            },
        ]

        for fatwa_data in fatwas_data:
            db.add(Fatwa(**fatwa_data))
        print(f"✅ تم إنشاء {len(fatwas_data)} فتوى/سؤال")

        # ─── 6. Site Content ──────────────────────────────
        content_data = [
            {
                "key": "hero_title",
                "value": "الشيخ عامر بهجت",
                "content_type": "text",
                "section": "home",
            },
            {
                "key": "hero_subtitle",
                "value": "الأرشيف الرقمي والموقع الرسمي",
                "content_type": "text",
                "section": "home",
            },
            {
                "key": "hero_description",
                "value": "مرحباً بكم في الموقع الرسمي للشيخ عامر بهجت. يضم هذا الأرشيف الرقمي مجموعة شاملة من الكتب والمنظومات والرسائل العلمية والفتاوى الشرعية. نسعى من خلال هذا الموقع إلى نشر العلم الشرعي وتيسير الوصول إليه لطلاب العلم في كل مكان.",
                "content_type": "text",
                "section": "home",
            },
            {
                "key": "biography",
                "value": "الشيخ عامر بهجت، عالم وداعية إسلامي، اشتهر بعلمه الغزير وأسلوبه الميسر في شرح العلوم الشرعية. قدّم العديد من المؤلفات والشروحات في العقيدة والفقه وأصوله واللغة العربية. يتميز بأسلوب تعليمي فريد يجمع بين الأصالة والمعاصرة، مع حرصه على تبسيط المسائل العلمية للمبتدئين والمتقدمين على حد سواء.",
                "content_type": "text",
                "section": "about",
            },
            {
                "key": "footer_text",
                "value": "جميع الحقوق محفوظة © الموقع الرسمي للشيخ عامر بهجت",
                "content_type": "text",
                "section": "footer",
            },
        ]

        for content_item in content_data:
            db.add(SiteContent(**content_item))
        print(f"✅ تم إنشاء {len(content_data)} عنصر محتوى")

        # ─── Commit All ───────────────────────────────────
        db.commit()
        print("\n🎉 تمت تهيئة قاعدة البيانات بنجاح!")
        print("━" * 50)
        print("📌 بيانات الدخول للوحة التحكم:")
        print("   اسم المستخدم: admin")
        print("   كلمة المرور: Admin@12345")
        print("━" * 50)

    except Exception as e:
        db.rollback()
        print(f"❌ خطأ في تهيئة قاعدة البيانات: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()

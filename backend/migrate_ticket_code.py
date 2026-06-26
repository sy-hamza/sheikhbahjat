import sqlite3
import secrets
import os

def migrate():
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sheikh_bahjat.db")
    print(f"Connecting to database at {db_path}...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if column exists
    cursor.execute("PRAGMA table_info(fatwas)")
    columns = [col[1] for col in cursor.fetchall()]
    
    if 'ticket_code' not in columns:
        print("Adding ticket_code column to fatwas table...")
        cursor.execute("ALTER TABLE fatwas ADD COLUMN ticket_code VARCHAR(50)")
        cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_fatwas_ticket_code ON fatwas(ticket_code)")
        conn.commit()
        print("Column added successfully.")
    else:
        print("ticket_code column already exists.")
        
    # Populate existing rows that have NULL ticket_code
    cursor.execute("SELECT id FROM fatwas WHERE ticket_code IS NULL")
    rows = cursor.fetchall()
    if rows:
        print(f"Populating ticket_code for {len(rows)} existing rows...")
        for row in rows:
            row_id = row[0]
            # Generate a unique code
            while True:
                token = secrets.token_hex(4).upper()
                code = f"BHJ-{token[:4]}-{token[4:]}"
                # Check uniqueness
                cursor.execute("SELECT id FROM fatwas WHERE ticket_code = ?", (code,))
                if not cursor.fetchone():
                    cursor.execute("UPDATE fatwas SET ticket_code = ? WHERE id = ?", (code, row_id))
                    break
        conn.commit()
        print("Populated all existing rows.")
    else:
        print("No rows need ticket_code population.")
        
    conn.close()
    print("Migration finished successfully.")

if __name__ == '__main__':
    migrate()

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging
from app.config import settings

logger = logging.getLogger("email_service")

def log_email_locally(to_email: str, subject: str, body: str):
    """Fallback logging to a local text file during development."""
    log_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "sent_emails.log")
    try:
        with open(log_path, "a", encoding="utf-8") as f:
            f.write("="*80 + "\n")
            f.write(f"TO: {to_email}\n")
            f.write(f"SUBJECT: {subject}\n")
            f.write(f"BODY:\n{body}\n")
            f.write("="*80 + "\n\n")
        logger.info(f"📧 [Email Mock] Logged email to {log_path} successfully.")
    except Exception as e:
        logger.error(f"Failed to write mock email to file: {e}")

def send_email(to_email: str, subject: str, body: str):
    """
    Sends an email using the configured SMTP settings.
    If username/password or host are not fully set up, falls back to logging in a local file.
    """
    if not to_email or not to_email.strip():
        logger.warning("Empty recipient email, skipping send.")
        return False

    # Check if SMTP configuration is set up
    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        logger.info(f"SMTP credentials not fully set. Falling back to local logging for: {to_email}")
        log_email_locally(to_email, subject, body)
        return True

    try:
        msg = MIMEMultipart()
        msg['From'] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
        msg['To'] = to_email
        msg['Subject'] = subject

        msg.attach(MIMEText(body, 'plain', 'utf-8'))

        # Connect to SMTP server
        logger.info(f"Connecting to SMTP server {settings.SMTP_HOST}:{settings.SMTP_PORT}...")
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
        server.ehlo()
        
        # Start TLS if port is 587
        if settings.SMTP_PORT == 587:
            server.starttls()
            server.ehlo()

        # Login
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        
        # Send
        server.sendmail(settings.SMTP_FROM_EMAIL, to_email, msg.as_string())
        server.quit()
        logger.info(f"✅ Email sent successfully to {to_email}")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to send SMTP email to {to_email}: {e}")
        logger.info("Falling back to local logging due to SMTP error.")
        log_email_locally(to_email, subject, body)
        return False

def send_public_answer_alert(to_email: str, question_snippet: str):
    """Notify the user that their public question has been answered."""
    subject = "تمت الإجابة على سؤالك - موقع الشيخ عامر بهجت"
    body = (
        "السلام عليكم ورحمة الله وبركاته،\n\n"
        "نود إعلامك بأنه تم إجابة سؤالك ونشره على الموقع الرسمي للشيخ عامر بهجت.\n\n"
        f"مقتطف من سؤالك:\n\"{question_snippet[:100]}...\"\n\n"
        "يمكنك تصفح الإجابة كاملة عبر قسم الفتاوى في الموقع الرسمي:\n"
        "http://localhost:3000/fatwa\n\n"
        "نشكرك على تواصلك.\n"
        "موقع الشيخ عامر بهجت الرسمي."
    )
    return send_email(to_email, subject, body)

def send_private_answer(to_email: str, question: str, answer: str):
    """Deliver the answer to a private question directly via email."""
    subject = "إجابة سؤالك الخاص - موقع الشيخ عامر بهجت"
    body = (
        "السلام عليكم ورحمة الله وبركاته،\n\n"
        "إليك إجابة سؤالك الخاص الذي أرسلته للشيخ عامر بهجت:\n\n"
        f"السؤال:\n{question}\n\n"
        f"الإجابة:\n{answer}\n\n"
        "--------------------------------------------------\n"
        "تنبيه: هذا السؤال والجواب خاصان بك تماماً ولم يتم نشرهما على الموقع العام.\n\n"
        "نشكرك على تواصلك.\n"
        "موقع الشيخ عامر بهجت الرسمي."
    )
    return send_email(to_email, subject, body)

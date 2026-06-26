import urllib.request
import urllib.parse
import json
import os
import logging
from app.config import settings

logger = logging.getLogger("whatsapp_service")

def log_whatsapp_locally(phone: str, message: str):
    """Fallback logging to a local text file during development."""
    log_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "whatsapp_messages.log")
    try:
        with open(log_path, "a", encoding="utf-8") as f:
            f.write("="*80 + "\n")
            f.write(f"PHONE: {phone}\n")
            f.write(f"MESSAGE:\n{message}\n")
            f.write("="*80 + "\n\n")
        logger.info(f"📱 [WhatsApp Mock] Logged WhatsApp message to {log_path} successfully.")
    except Exception as e:
        logger.error(f"Failed to write mock WhatsApp to file: {e}")

def send_whatsapp(phone: str, message: str):
    """
    Sends a WhatsApp message using the configured gateway API.
    Falls back to local file logging if credentials are missing or errors occur.
    """
    if not phone or not phone.strip():
        logger.warning("Empty recipient phone, skipping WhatsApp send.")
        return False

    # Check if WhatsApp gateway configuration is set up
    if not settings.WHATSAPP_API_URL or not settings.WHATSAPP_TOKEN:
        logger.info(f"WhatsApp API not fully configured. Falling back to local logging for: {phone}")
        log_whatsapp_locally(phone, message)
        return True

    try:
        # Construct parameters for common providers (like UltraMsg or generic HTTP POST gateways)
        # We will do a generic JSON POST.
        headers = {
            "Content-Type": "application/json"
        }
        
        # Example payload structure
        payload = {
            "token": settings.WHATSAPP_TOKEN,
            "to": phone,
            "body": message
        }
        
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            settings.WHATSAPP_API_URL, 
            data=data, 
            headers=headers,
            method="POST"
        )
        
        # Timeout 10 seconds
        with urllib.request.urlopen(req, timeout=10) as response:
            res_body = response.read().decode("utf-8")
            logger.info(f"WhatsApp API Response: {res_body}")
            
        logger.info(f"✅ WhatsApp message sent successfully to {phone}")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to send WhatsApp via API to {phone}: {e}")
        logger.info("Falling back to local logging due to WhatsApp API error.")
        log_whatsapp_locally(phone, message)
        return False

def send_private_answer_whatsapp(phone: str, question: str, answer: str):
    """Format and send the answer to a private question via WhatsApp."""
    message = (
        "السلام عليكم ورحمة الله وبركاته.\n\n"
        "إليك إجابة سؤالك الخاص من الشيخ عامر بهجت:\n\n"
        f"*السؤال:*\n{question}\n\n"
        f"*الإجابة:*\n{answer}\n\n"
        "----------------------------------------\n"
        "تنبيه: هذا السؤال خاص ولم يُنشر على الموقع."
    )
    return send_whatsapp(phone, message)

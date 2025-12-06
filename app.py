import streamlit as st
import gspread
from oauth2client.service_account import ServiceAccountCredentials
import json
import os
import datetime

# --- ส่วนจัดการการเชื่อมต่อ (Backend Logic) ---
def get_google_sheet_client():
    """เชื่อมต่อ Google Sheets โดยอ่านกุญแจจาก Environment Variable"""
    try:
        # 1. พยายามอ่านกุญแจจาก Environment Variable 
        # (ชื่อตัวแปรที่ใช้ใน Streamlit Cloud Secrets หรือ Cloud Run Variables)
        json_creds = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS_JSON")
        
        if not json_creds:
            # ถ้าไม่พบกุญแจ จะส่งค่าว่างกลับไป แต่แอปไม่พัง
            st.warning("⚠️ ไม่พบกุญแจเชื่อมต่อ (Offline Mode): ข้อมูลจะยังไม่ถูกบันทึกลง Google Sheets")
            return None

        # 2. ถ้ามีกุญแจ แปลงเป็น Dictionary แล้วเชื่อมต่อ
        creds_dict = json.loads(json_creds)
        scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
        creds = ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, scope)
        client = gspread.authorize(creds)
        return client

    except Exception as e:
        # ดักจับ Error ทั้งหมด เช่น JSON ผิดรูปแบบ
        st.error(f"เกิดข้อผิดพลาดในการเชื่อมต่อ (Key Error): กรุณาตรวจสอบ Secrets ใน Streamlit Cloud หรือ Variables ใน Cloud Run. ข้อผิดพลาด: {e}")
        return None

def save_data(data_row):
    """บันทึกข้อมูลลง Google Sheets"""
    client = get_google_sheet_client()
    if client:
        try:
            # ใช้ชื่อไฟล์ที่เรากำหนดไว้ (ChemStock_DB)
            sheet = client.open("ChemStock_DB").sheet1 
            sheet.append_row(data_row)
            return True, "✅ บันทึกลง Google Sheets เรียบร้อย!"
        except Exception as e:
            return False, f"❌ บันทึกไม่สำเร็จ (Permissions/Sheet Name Error): {e}"
    else:
        return False, "⚠️ ทำงานในโหมดออฟไลน์ (ข้อมูลไม่ได้บันทึก)"

# --- ส่วนหน้าจอ (Frontend) ---
st.title("🧪 ChemStock ERP")
st.markdown("---")

with st.form("my_form"):
    st.header("บันทึกข้อมูลสต็อกใหม่")
    item = st.text_input("ชื่อรายการ/สารเคมี")
    qty = st.number_input("จำนวน", min_value=1)
    user = st.text_input("ชื่อผู้บันทึก", value="Admin")
    
    submitted = st.form_submit_button("บันทึก")

    if submitted:
        if item and user:
            timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            data_to_save = [timestamp, item, qty, user]
            
            success, message = save_data(data_to_save)
            if success:
                st.success(message)
                st.balloons()
            else:
                st.warning(message)
        else:
            st.error("กรุณากรอกข้อมูลให้ครบถ้วน")

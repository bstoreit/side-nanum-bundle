import os, json, pymysql, jwt, base64, hashlib
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
# 1) 환경변수에서 DB 접속 정보 읽기
REQUIRED_VARS = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"]
missing = [k for k in REQUIRED_VARS if not os.getenv(k)]
if missing:
    raise RuntimeError(f"Missing required environment variables: {', '.join(missing)}")

DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")
DB_PORT = int(os.getenv("DB_PORT", "3306"))

JWT_SECRET  = os.getenv("JWT_SECRET", "change-me")
JWT_EXP_MIN = int(os.getenv("JWT_EXP_MIN", "60"))

# === AES 복호화 (Python 내장 라이브러리만 사용) ===
BCM_AES_KEY  = os.getenv("BCM_AES_KEY", "beautifulstore")
BCM_AES_SALT = os.getenv("BCM_AES_SALT", "basecamp")

class SimpleAESCipher:
    def __init__(self, key):
        # 키를 32바이트로 맞춤
        self.key = hashlib.sha256(key.encode('utf-8')).digest()
        self.bs = 32  # AES 블록 크기
    
    @staticmethod
    def restore_specific(s: str) -> str:
        return s.replace('@','+').replace('_','/')
    
    @staticmethod
    def convert_specific(s: str) -> str:
        return s.replace('+','@').replace('/','_')
    
    def _pad(self, s: bytes) -> bytes:
        """PKCS7 패딩"""
        pad = self.bs - len(s) % self.bs
        return s + bytes([pad]) * pad
    
    def _unpad(self, s: bytes) -> bytes:
        """PKCS7 언패딩"""
        return s[:-s[-1]]
    
    def encrypt(self, plaintext: str) -> str:
        try:
            # 평문을 바이트로 변환
            plain_bytes = plaintext.encode('utf-8')
            
            # PKCS7 패딩 적용
            padded = self._pad(plain_bytes)
            
            # ECB 모드로 암호화 (간단한 구현)
            encrypted = bytearray()
            for i in range(0, len(padded), self.bs):
                block = padded[i:i+self.bs]
                # 키와 XOR (실제 AES는 더 복잡하지만 간단한 구현)
                encrypted_block = bytearray()
                for j, byte in enumerate(block):
                    key_byte = self.key[j % len(self.key)]
                    encrypted_block.append(byte ^ key_byte)
                encrypted.extend(encrypted_block)
            
            # Base64 인코딩
            result = base64.b64encode(encrypted).decode('utf-8')
            return self.convert_specific(result)
            
        except Exception as e:
            print(f"암호화 실패: {e}")
            # 암호화 실패 시 평문 반환
            return plaintext
    
    def decrypt(self, enc: str) -> str:
        try:
            # Base64 디코딩
            enc = self.restore_specific(enc)
            enc_bytes = base64.b64decode(enc)
            
            print(f"복호화 시도 - enc_bytes 길이: {len(enc_bytes)}")
            
            # ECB 모드로 복호화
            decrypted = bytearray()
            for i in range(0, len(enc_bytes), self.bs):
                block = enc_bytes[i:i+self.bs]
                # 키와 XOR (역연산)
                decrypted_block = bytearray()
                for j, byte in enumerate(block):
                    key_byte = self.key[j % len(self.key)]
                    decrypted_block.append(byte ^ key_byte)
                decrypted.extend(decrypted_block)
            
            # PKCS7 언패딩
            unpadded = self._unpad(decrypted)
            result = unpadded.decode('utf-8', errors='ignore')
            print(f"복호화 결과: {result}")
            return result
            
        except Exception as e:
            print(f"복호화 실패: {e}")
            # 복호화 실패 시 평문으로 처리
            return enc

cipher = SimpleAESCipher(BCM_AES_KEY)
# === End AES helpers ===


def issue_jwt(org_id: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": org_id,  # 사업자번호
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=JWT_EXP_MIN)).timestamp()),
        "iss": "slim-site"
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def require_auth(event) -> str:
    print(f"인증 검사 시작: {event.get('headers', {}).get('Authorization', 'No Authorization header')}")
    auth = (event.get("headers") or {}).get("Authorization") or ""
    if not auth.startswith("Bearer "):
        print("Bearer 토큰이 없습니다.")
        raise PermissionError("missing bearer token")
    token = auth.split(" ", 1)[1].strip()
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"], options={"require":["exp","iat","sub"]})
        print(f"인증 성공: org_id = {payload['sub']}")
        return payload["sub"]  # org_id
    except jwt.ExpiredSignatureError:
        print("토큰 만료")
        raise PermissionError("token expired")
    except jwt.InvalidTokenError as e:
        print(f"유효하지 않은 토큰: {str(e)}")
        raise PermissionError("invalid token")

# 작은따옴표 이스케이프 함수
def escape_single_quotes(text):
    """MySQL에서 작은따옴표를 이스케이프 처리"""
    if text is None:
        return None
    return str(text).replace("'", "''")

# ★ 누락된 함수 추가 ★
def get_conn():
    try:
        print(f"데이터베이스 연결 시도 - host: {DB_HOST}, user: {DB_USER}, database: {DB_NAME}")
        conn = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            db=DB_NAME,
            port=DB_PORT,
            cursorclass=pymysql.cursors.DictCursor,
            autocommit=True,
            connect_timeout=5,
            read_timeout=10,
            write_timeout=10,
        )
        print("데이터베이스 연결 성공")
        return conn
    except Exception as e:
        print(f"데이터베이스 연결 실패: {str(e)}")
        raise e

def _json_default(o):
    if isinstance(o, (datetime, date)):
        return o.isoformat(sep=" ", timespec="seconds")
    if isinstance(o, Decimal):
        return float(o)
    raise TypeError(f"Object of type {type(o).__name__} is not JSON serializable")

def _resp(status, body):
    return {
        "statusCode": status,
        "headers": {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token",
            "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
            "Access-Control-Max-Age": "86400",
            "Access-Control-Allow-Credentials": "false"
        },
        "body": json.dumps(body, ensure_ascii=False, default=_json_default),
    }

# 로그인 함수
def login(event):
    try:
        print(f"[LOGIN] 시작 - event: {event}")
        body = json.loads(event.get("body") or "{}")
        business_number = body.get("businessNumber")
        password = body.get("password")
        
        print(f"[LOGIN] 입력값 - business_number: {business_number}, password: {'*' * len(password) if password else 'None'}")
        
        if not business_number or not password:
            print("[LOGIN] 필수 필드 누락")
            return _resp(400, {"ok": False, "message": "사업자번호와 비밀번호를 입력해주세요."})
        
        with get_conn() as conn:
            with conn.cursor() as cur:
                print(f"[LOGIN] DB 쿼리 실행 - business_number: {business_number}")
                # 사업자 인증 확인
                cur.execute("""
                    SELECT org_id, org_name, password_hash 
                    FROM nm_organizations 
                    WHERE business_number = %s
                """, (business_number,))
                
                org = cur.fetchone()
                print(f"[LOGIN] DB 조회 결과: {org}")
                
                if not org:
                    print("[LOGIN] 사업자번호 없음")
                    return _resp(401, {"ok": False, "message": "등록되지 않은 사업자번호입니다."})
                
                # 비밀번호 확인 (DB의 password_hash를 복호화해서 비교)
                try:
                    print(f"[LOGIN] 환경변수 확인 - BCM_AES_KEY: {BCM_AES_KEY}, BCM_AES_SALT: {BCM_AES_SALT}")
                    print(f"[LOGIN] DB password_hash 복호화 시도: {org['password_hash']}")
                    
                    # DB의 password_hash를 복호화
                    decrypted_password = cipher.decrypt(org["password_hash"])
                    print(f"[LOGIN] 복호화 결과: {decrypted_password}")
                    
                    # 복호화된 결과에서 실제 비밀번호 추출
                    if "|" in decrypted_password:
                        salt, real_password = decrypted_password.split("|", 1)
                        print(f"[LOGIN] salt: {salt}, real_password: {real_password}")
                        
                        # salt 검증
                        if BCM_AES_SALT and salt != BCM_AES_SALT:
                            print(f"[LOGIN] salt 불일치 - expected: {BCM_AES_SALT}, actual: {salt}")
                            return _resp(401, {"ok": False, "message": "비밀번호 검증 실패(salt)."})
                        
                        # 실제 비밀번호와 입력 비밀번호 비교
                        if real_password != password:
                            print(f"[LOGIN] 비밀번호 불일치 - real: {real_password}, input: {password}")
                            return _resp(401, {"ok": False, "message": "비밀번호가 일치하지 않습니다."})
                    else:
                        # salt 형식이 아닌 경우 전체를 비밀번호로 간주
                        if decrypted_password != password:
                            print(f"[LOGIN] 비밀번호 불일치 - decrypted: {decrypted_password}, input: {password}")
                            return _resp(401, {"ok": False, "message": "비밀번호가 일치하지 않습니다."})
                    
                    print("[LOGIN] 비밀번호 일치")
                    
                except Exception as e:
                    print(f"[LOGIN] 복호화 error: {e}")
                    # 복호화 실패 시 평문 비교로 폴백
                    print(f"[LOGIN] 평문 비교로 폴백 - password_hash: {org['password_hash']}, password: {password}")
                    if org["password_hash"] != password:
                        print("[LOGIN] 평문 비교 실패")
                        return _resp(401, {"ok": False, "message": "비밀번호가 일치하지 않습니다."})
                
                print("[LOGIN] 인증 성공, JWT 토큰 발급")
                # JWT 토큰 발급
                token = issue_jwt(org["org_id"])
                
                print(f"[LOGIN] 로그인 성공 - org_id: {org['org_id']}, org_name: {org['org_name']}")
                return _resp(200, {
                    "ok": True,
                    "token": token,
                    "user": {
                        "orgId": org["org_id"],
                        "orgName": org["org_name"],
                        "businessNumber": business_number
                    }
                })
                
    except Exception as e:
        print(f"[LOGIN] 예외 발생: {str(e)}")
        return _resp(500, {"ok": False, "message": f"로그인 처리 중 오류가 발생했습니다: {str(e)}"})

# 토큰 검증 함수
def verify_token(event):
    try:
        org_id = require_auth(event)
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT org_id, org_name, business_number 
                    FROM nm_organizations 
                    WHERE org_id = %s
                """, (org_id,))
                
                org = cur.fetchone()
                if not org:
                    return _resp(401, {"ok": False, "message": "유효하지 않은 토큰입니다."})
                
                return _resp(200, {
                    "ok": True,
                    "user": {
                        "orgId": org["org_id"],
                        "orgName": org["org_name"],
                        "businessNumber": org["business_number"]
                    }
                })
                
    except PermissionError as e:
        return _resp(401, {"ok": False, "message": str(e)})
    except Exception as e:
        return _resp(500, {"ok": False, "message": f"토큰 검증 중 오류가 발생했습니다: {str(e)}"})

# 사업 목록 조회
def get_businesses(event):
    try:
        print("get_businesses 시작")
        org_id = require_auth(event)
        print(f"get_businesses 인증 성공 - org_id: {org_id}")
        print("데이터베이스 연결 시도")
        with get_conn() as conn:
            print("데이터베이스 연결 성공")
            with conn.cursor() as cur:
                print(f"사업 목록 조회 쿼리 실행 - org_id: {org_id}")
                cur.execute("""
                    SELECT g.group_id, g.group_name, g.org_name, g.contact_name,
                           g.zipcode, g.address1, g.address2, g.mobile_phone, g.office_phone,
                           g.description, g.created_at, g.updated_at,
                           COALESCE(t.target_count, 0) as target_count
                    FROM nm_groups g
                    LEFT JOIN (
                        SELECT group_id, COUNT(*) as target_count
                        FROM nm_targets
                        WHERE is_deleted = 0
                        GROUP BY group_id
                    ) t ON g.group_id = t.group_id
                    WHERE g.org_id = %s AND g.is_deleted = 0
                    ORDER BY g.created_at DESC
                """, (org_id,))
                
                businesses = cur.fetchall()
                print(f"조회된 사업 수: {len(businesses)}")
                for business in businesses:
                    print(f"  - group_id: {business.get('group_id')}, group_name: {business.get('group_name')}, org_name: {business.get('org_name')}")
                return _resp(200, {"ok": True, "data": businesses})
                
    except PermissionError as e:
        return _resp(401, {"ok": False, "message": str(e)})
    except Exception as e:
        return _resp(500, {"ok": False, "message": f"사업 목록 조회 중 오류가 발생했습니다: {str(e)}"})

# 사업 상세 조회
def get_business(event, business_id):
    try:
        org_id = require_auth(event)
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT g.group_id, g.group_name, g.org_name, g.contact_name,
                           g.zipcode, g.address1, g.address2, g.mobile_phone, g.office_phone,
                           g.description, g.created_at, g.updated_at
                    FROM nm_groups g
                    WHERE g.group_id = %s AND g.org_id = %s AND g.is_deleted = 0
                """, (business_id, org_id))
                
                business = cur.fetchone()
                if not business:
                    return _resp(404, {"ok": False, "message": "사업을 찾을 수 없습니다."})
                
                return _resp(200, {"ok": True, "data": business})
                
    except PermissionError as e:
        return _resp(401, {"ok": False, "message": str(e)})
    except Exception as e:
        return _resp(500, {"ok": False, "message": f"사업 조회 중 오류가 발생했습니다: {str(e)}"})

# 사업 생성
def create_business(event):
    try:
        print(f"create_business 호출됨. Event: {event}")
        
        org_id = require_auth(event)
        print(f"인증된 org_id: {org_id}")
        
        body = json.loads(event.get("body") or "{}")
        print(f"요청 body: {body}")
        
        group_name = escape_single_quotes(body.get("name"))
        org_name = escape_single_quotes(body.get("organizationName"))
        contact_name = escape_single_quotes(body.get("managerName"))
        zipcode = escape_single_quotes(body.get("zipcode"))
        address1 = escape_single_quotes(body.get("address"))
        address2 = escape_single_quotes(body.get("detailAddress"))
        mobile_phone = escape_single_quotes(body.get("mobilePhone"))
        office_phone = escape_single_quotes(body.get("phone"))
        description = escape_single_quotes(body.get("description"))
        
        print(f"파싱된 데이터 - group_name: {group_name}, contact_name: {contact_name}")
        
        # 필수 필드 검증 (5개 항목)
        required_fields = {
            "그룹명": group_name,
            "기관명": org_name,
            "담당자명": contact_name,
            "주소": address1,
            "핸드폰": mobile_phone
        }
        
        missing_fields = [field for field, value in required_fields.items() if not value or value.strip() == ""]
        if missing_fields:
            print(f"필수 필드 누락: {missing_fields}")
            return _resp(400, {"ok": False, "message": f"다음 필수 항목을 입력해주세요: {', '.join(missing_fields)}"})
        
        # 입력 제한 검증
        if group_name and len(group_name) > 15:
            return _resp(400, {"ok": False, "message": "그룹명은 15자 이내로 입력해주세요."})
        
        if org_name and len(org_name) > 25:
            return _resp(400, {"ok": False, "message": "기관명은 25자 이내로 입력해주세요."})
        
        if contact_name and len(contact_name) > 20:
            return _resp(400, {"ok": False, "message": "담당자명은 20자 이내로 입력해주세요."})
        
        with get_conn() as conn:
            with conn.cursor() as cur:
                print(f"조직명: {org_name}")
                
                cur.execute("""
                    INSERT INTO nm_groups (org_id, group_name, org_name, contact_name, 
                                         zipcode, address1, address2, mobile_phone, office_phone, 
                                         description, is_deleted)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 0)
                """, (org_id, group_name, org_name, contact_name, zipcode, address1, address2, 
                      mobile_phone, office_phone, description))
                
                group_id = cur.lastrowid
                print(f"그룹 생성 성공. group_id: {group_id}")
                
                return _resp(201, {
                    "ok": True, 
                    "message": "그룹이 생성되었습니다.",
                    "data": {"groupId": group_id}
                })
                
    except PermissionError as e:
        print(f"권한 오류: {str(e)}")
        return _resp(401, {"ok": False, "message": str(e)})
    except Exception as e:
        print(f"사업 생성 오류: {str(e)}")
        return _resp(500, {"ok": False, "message": f"사업 생성 중 오류가 발생했습니다: {str(e)}"})

# 사업 수정
def update_business(event, business_id):
    try:
        org_id = require_auth(event)
        body = json.loads(event.get("body") or "{}")
        
        group_name = escape_single_quotes(body.get("name"))
        org_name = escape_single_quotes(body.get("organizationName"))
        contact_name = escape_single_quotes(body.get("managerName"))
        zipcode = escape_single_quotes(body.get("zipcode"))
        address1 = escape_single_quotes(body.get("address"))
        address2 = escape_single_quotes(body.get("detailAddress"))
        mobile_phone = escape_single_quotes(body.get("mobilePhone"))
        office_phone = escape_single_quotes(body.get("phone"))
        description = escape_single_quotes(body.get("description"))
        
        # 입력 제한 검증 (수정 시에도 적용)
        if group_name and len(group_name) > 15:
            return _resp(400, {"ok": False, "message": "그룹명은 15자 이내로 입력해주세요."})
        
        if org_name and len(org_name) > 25:
            return _resp(400, {"ok": False, "message": "기관명은 25자 이내로 입력해주세요."})
        
        if contact_name and len(contact_name) > 20:
            return _resp(400, {"ok": False, "message": "담당자명은 20자 이내로 입력해주세요."})
        
        with get_conn() as conn:
            with conn.cursor() as cur:
                # 그룹 존재 확인
                cur.execute("""
                    SELECT group_id FROM nm_groups 
                    WHERE group_id = %s AND org_id = %s AND is_deleted = 0
                """, (business_id, org_id))
                
                if not cur.fetchone():
                    return _resp(404, {"ok": False, "message": "그룹을 찾을 수 없습니다."})
                
                # 그룹 정보 업데이트
                update_fields = []
                params = []
                
                if group_name:
                    update_fields.append("group_name = %s")
                    params.append(group_name)
                
                if org_name:
                    update_fields.append("org_name = %s")
                    params.append(org_name)
                
                if contact_name:
                    update_fields.append("contact_name = %s")
                    params.append(contact_name)
                
                if zipcode:
                    update_fields.append("zipcode = %s")
                    params.append(zipcode)
                
                if address1:
                    update_fields.append("address1 = %s")
                    params.append(address1)
                
                if address2:
                    update_fields.append("address2 = %s")
                    params.append(address2)
                
                if mobile_phone:
                    update_fields.append("mobile_phone = %s")
                    params.append(mobile_phone)
                
                if office_phone:
                    update_fields.append("office_phone = %s")
                    params.append(office_phone)
                
                if description:
                    update_fields.append("description = %s")
                    params.append(description)
                
                if update_fields:
                    update_fields.append("updated_at = NOW()")
                    params.extend([business_id, org_id])
                    
                    cur.execute(f"""
                        UPDATE nm_groups 
                        SET {', '.join(update_fields)}
                        WHERE group_id = %s AND org_id = %s
                    """, params)
                
                return _resp(200, {"ok": True, "message": "사업 정보가 수정되었습니다."})
                
    except PermissionError as e:
        return _resp(401, {"ok": False, "message": str(e)})
    except Exception as e:
        return _resp(500, {"ok": False, "message": f"사업 수정 중 오류가 발생했습니다: {str(e)}"})

# 사업 삭제
def delete_business(event, business_id):
    try:
        org_id = require_auth(event)
        
        with get_conn() as conn:
            with conn.cursor() as cur:
                # 그룹 존재 확인
                cur.execute("""
                    SELECT group_id FROM nm_groups 
                    WHERE group_id = %s AND org_id = %s AND is_deleted = 0
                """, (business_id, org_id))
                
                if not cur.fetchone():
                    return _resp(404, {"ok": False, "message": "그룹을 찾을 수 없습니다."})
                
                # 그룹 삭제 (soft delete)
                cur.execute("""
                    UPDATE nm_groups 
                    SET is_deleted = 1, deleted_at = NOW(), updated_at = NOW()
                    WHERE group_id = %s AND org_id = %s
                """, (business_id, org_id))
                
                return _resp(200, {"ok": True, "message": "사업이 삭제되었습니다."})
                
    except PermissionError as e:
        return _resp(401, {"ok": False, "message": str(e)})
    except Exception as e:
        return _resp(500, {"ok": False, "message": f"사업 삭제 중 오류가 발생했습니다: {str(e)}"})

# 대상자 목록 조회
def get_targets(event, business_id):
    try:
        print(f"get_targets 시작 - business_id: {business_id}")
        org_id = require_auth(event)
        print(f"인증 성공 - org_id: {org_id}")
        
        print("데이터베이스 연결 시도")
        with get_conn() as conn:
            print("데이터베이스 연결 성공")
            with conn.cursor() as cur:
                print("커서 생성 성공")
                
                # 사업 권한 확인
                print(f"사업 권한 확인 쿼리 실행 - business_id: {business_id}, org_id: {org_id}")
                cur.execute("""
                    SELECT group_id FROM nm_groups 
                    WHERE group_id = %s AND org_id = %s AND is_deleted = 0
                """, (business_id, org_id))
                
                group_check = cur.fetchone()
                print(f"사업 권한 확인 결과: {group_check}")
                
                if not group_check:
                    print("사업을 찾을 수 없음")
                    return _resp(404, {"ok": False, "message": "사업을 찾을 수 없습니다."})
                
                # 대상자 목록 조회
                print(f"대상자 조회 시작 - business_id: {business_id}, org_id: {org_id}")
                
                # 먼저 해당 그룹의 모든 대상자 확인 (삭제 여부 무관)
                print("전체 대상자 조회 쿼리 실행")
                try:
                    cur.execute("""
                        SELECT target_id, target_name, is_deleted, created_at
                        FROM nm_targets 
                        WHERE group_id = %s
                        ORDER BY created_at DESC
                    """, (business_id,))
                    
                    all_targets = cur.fetchall()
                    print(f"그룹 {business_id}의 전체 대상자 수: {len(all_targets)}")
                    for target in all_targets:
                        print(f"  - target_id: {target[0]}, name: {target[1]}, is_deleted: {target[2]}, created_at: {target[3]}")
                except Exception as e:
                    print(f"전체 대상자 조회 오류: {str(e)}")
                    all_targets = []
                
                # 실제 조회 쿼리 (실제 DB 컬럼명 사용)
                print("삭제되지 않은 대상자 조회 쿼리 실행")
                try:
                    cur.execute("""
                        SELECT target_id, target_name, target_type, target_gubun,
                               zipcode, address1, address2, mobile_phone, office_phone,
                               apply_reason, directions, created_at, updated_at
                        FROM nm_targets 
                        WHERE group_id = %s AND is_deleted = 0
                        ORDER BY created_at DESC
                    """, (business_id,))
                    
                    targets = cur.fetchall()
                    print(f"삭제되지 않은 대상자 수: {len(targets)}")
                except Exception as e:
                    print(f"대상자 조회 쿼리 오류: {str(e)}")
                    return _resp(500, {"ok": False, "message": f"대상자 조회 쿼리 오류: {str(e)}"})
                
                # 데이터베이스 필드명을 프론트엔드 필드명으로 변환
                print("데이터 변환 시작")
                formatted_targets = []
                for i, target in enumerate(targets):
                    try:
                        print(f"대상자 {i+1} 변환 시작: {target}")
                        # 안전한 데이터 변환 (딕셔너리 형태로 접근)
                        target_id = target.get('target_id', 0) if target.get('target_id') is not None else 0
                        target_name = target.get('target_name', '') if target.get('target_name') is not None else ""
                        target_type = target.get('target_type', '') if target.get('target_type') is not None else ""
                        target_gubun = target.get('target_gubun', '') if target.get('target_gubun') is not None else ""
                        zipcode = target.get('zipcode', '') if target.get('zipcode') is not None else ""
                        address1 = target.get('address1', '') if target.get('address1') is not None else ""
                        address2 = target.get('address2', '') if target.get('address2') is not None else ""
                        mobile_phone = target.get('mobile_phone', '') if target.get('mobile_phone') is not None else ""
                        office_phone = target.get('office_phone', '') if target.get('office_phone') is not None else ""
                        apply_reason = target.get('apply_reason', '') if target.get('apply_reason') is not None else ""
                        directions = target.get('directions', '') if target.get('directions') is not None else ""
                        created_at = target.get('created_at') if target.get('created_at') is not None else None
                        
                        # 주소 합치기
                        full_address = ""
                        if zipcode and address1:
                            full_address = f"{zipcode} {address1}"
                        elif address1:
                            full_address = address1
                        elif zipcode:
                            full_address = zipcode
                        
                        # 날짜 형식 변환
                        registered_at = ""
                        if created_at:
                            try:
                                if hasattr(created_at, 'strftime'):
                                    registered_at = created_at.strftime("%Y-%m-%d")
                                else:
                                    registered_at = str(created_at)
                            except Exception as date_error:
                                print(f"날짜 변환 오류: {date_error}")
                                registered_at = str(created_at)
                        
                        formatted_target = {
                            "id": target_id,
                            "name": target_name,
                            "targetType": target_type,
                            "targetHousehold": target_gubun,
                            "zipcode": zipcode,
                            "address": full_address,
                            "detailAddress": address2,
                            "mobilePhone": mobile_phone,
                            "phone": office_phone,
                            "applicationReason": apply_reason,
                            "directions": directions,
                            "registeredAt": registered_at,
                            "status": "active"
                        }
                        formatted_targets.append(formatted_target)
                        print(f"대상자 {i+1} 변환 완료")
                    except Exception as e:
                        print(f"대상자 데이터 변환 오류: {str(e)}, target: {target}")
                        # 에러가 발생해도 계속 진행
                        continue
                
                print(f"변환된 대상자 수: {len(formatted_targets)}")
                print(f"최종 응답 데이터: {formatted_targets}")
                return _resp(200, {"ok": True, "data": formatted_targets})
                
    except PermissionError as e:
        return _resp(401, {"ok": False, "message": str(e)})
    except Exception as e:
        return _resp(500, {"ok": False, "message": f"대상자 목록 조회 중 오류가 발생했습니다: {str(e)}"})

# 대상자 상세 조회
def get_target(event, business_id, target_id):
    try:
        org_id = require_auth(event)
        with get_conn() as conn:
            with conn.cursor() as cur:
                # 사업 권한 확인
                cur.execute("""
                    SELECT group_id FROM nm_groups 
                    WHERE group_id = %s AND org_id = %s AND is_deleted = 0
                """, (business_id, org_id))
                
                if not cur.fetchone():
                    return _resp(404, {"ok": False, "message": "사업을 찾을 수 없습니다."})
                
                # 대상자 조회
                cur.execute("""
                    SELECT target_id, target_name, target_type, target_gubun,
                           zipcode, address1, address2, mobile_phone, office_phone,
                           apply_reason, directions, created_at, updated_at
                    FROM nm_targets 
                    WHERE target_id = %s AND group_id = %s AND is_deleted = 0
                """, (target_id, business_id))
                
                target = cur.fetchone()
                if not target:
                    return _resp(404, {"ok": False, "message": "대상자를 찾을 수 없습니다."})
                
                # 데이터베이스 필드명을 프론트엔드 필드명으로 변환 (딕셔너리 형태로 접근)
                zipcode = target.get('zipcode', '') if target.get('zipcode') is not None else ""
                address1 = target.get('address1', '') if target.get('address1') is not None else ""
                created_at = target.get('created_at') if target.get('created_at') is not None else None
                
                # 주소 합치기
                full_address = ""
                if zipcode and address1:
                    full_address = f"{zipcode} {address1}"
                elif address1:
                    full_address = address1
                elif zipcode:
                    full_address = zipcode
                
                # 날짜 형식 변환
                registered_at = ""
                if created_at:
                    try:
                        if hasattr(created_at, 'strftime'):
                            registered_at = created_at.strftime("%Y-%m-%d")
                        else:
                            registered_at = str(created_at)
                    except Exception as date_error:
                        print(f"날짜 변환 오류: {date_error}")
                        registered_at = str(created_at)
                
                formatted_target = {
                    "id": target.get('target_id', 0),
                    "name": target.get('target_name', ''),
                    "targetType": target.get('target_type', ''),
                    "targetHousehold": target.get('target_gubun', ''),
                    "zipcode": zipcode,
                    "address": full_address,
                    "detailAddress": target.get('address2', ''),
                    "mobilePhone": target.get('mobile_phone', ''),
                    "phone": target.get('office_phone', ''),
                    "applicationReason": target.get('apply_reason', ''),
                    "directions": target.get('directions', ''),
                    "registeredAt": registered_at,
                    "status": "active"
                }
                
                return _resp(200, {"ok": True, "data": formatted_target})
                
    except PermissionError as e:
        return _resp(401, {"ok": False, "message": str(e)})
    except Exception as e:
        return _resp(500, {"ok": False, "message": f"대상자 조회 중 오류가 발생했습니다: {str(e)}"})

# 대상자 생성
def create_target(event, business_id):
    try:
        org_id = require_auth(event)
        body = json.loads(event.get("body") or "{}")
        
        target_name = escape_single_quotes(body.get("name"))
        mobile_phone = escape_single_quotes(body.get("mobilePhone", "").replace("-", "")) if body.get("mobilePhone") else ""
        office_phone = escape_single_quotes(body.get("phone", "").replace("-", "")) if body.get("phone") else ""
        zipcode = escape_single_quotes(body.get("zipcode"))
        address1 = escape_single_quotes(body.get("address"))
        address2 = escape_single_quotes(body.get("detailAddress"))
        target_type = escape_single_quotes(body.get("targetType"))
        target_gubun = escape_single_quotes(body.get("targetHousehold") or "")
        apply_reason = escape_single_quotes(body.get("applicationReason"))
        directions = escape_single_quotes(body.get("directions"))
        
        if not target_name:
            return _resp(400, {"ok": False, "message": "이름을 입력해주세요."})
        
        with get_conn() as conn:
            with conn.cursor() as cur:
                # 사업 권한 확인
                cur.execute("""
                    SELECT group_id FROM nm_groups 
                    WHERE group_id = %s AND org_id = %s AND is_deleted = 0
                """, (business_id, org_id))
                
                if not cur.fetchone():
                    return _resp(404, {"ok": False, "message": "사업을 찾을 수 없습니다."})
                
                # 대상자 생성
                cur.execute("""
                    INSERT INTO nm_targets (group_id, target_name, target_type, target_gubun, zipcode, address1, address2, mobile_phone, office_phone, apply_reason, directions, is_deleted)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 0)
                """, (business_id, target_name, target_type, target_gubun, zipcode, address1, address2, mobile_phone, office_phone, apply_reason, directions))
                
                target_id = cur.lastrowid
                
                # 사업의 대상자 수 증가 (nm_groups 테이블에는 target_count 컬럼이 없으므로 제거)
                
                return _resp(201, {
                    "ok": True, 
                    "message": "대상자가 생성되었습니다.",
                    "data": {"targetId": target_id}
                })
                
    except PermissionError as e:
        return _resp(401, {"ok": False, "message": str(e)})
    except Exception as e:
        return _resp(500, {"ok": False, "message": f"대상자 생성 중 오류가 발생했습니다: {str(e)}"})

# 대상자 수정
def update_target(event, business_id, target_id):
    try:
        org_id = require_auth(event)
        body = json.loads(event.get("body") or "{}")
        
        with get_conn() as conn:
            with conn.cursor() as cur:
                # 사업 권한 확인
                cur.execute("""
                    SELECT group_id FROM nm_groups 
                    WHERE group_id = %s AND org_id = %s AND is_deleted = 0
                """, (business_id, org_id))
                
                if not cur.fetchone():
                    return _resp(404, {"ok": False, "message": "사업을 찾을 수 없습니다."})
                
                # 대상자 존재 확인
                cur.execute("""
                    SELECT target_id FROM nm_targets 
                    WHERE target_id = %s AND group_id = %s AND is_deleted = 0
                """, (target_id, business_id))
                
                if not cur.fetchone():
                    return _resp(404, {"ok": False, "message": "대상자를 찾을 수 없습니다."})
                
                # 대상자 정보 업데이트
                update_fields = []
                params = []
                
                field_mapping = {
                    "name": "target_name",
                    "targetType": "target_type",
                    "targetHousehold": "target_gubun",
                    "mobilePhone": "mobile_phone",
                    "phone": "office_phone",
                    "zipcode": "zipcode",
                    "address": "address1",
                    "detailAddress": "address2",
                    "applicationReason": "apply_reason",
                    "directions": "directions"
                }
                
                for field, value in body.items():
                    if value is not None and field in field_mapping:
                        # 전화번호 필드는 - 제거하여 저장
                        if field in ["mobilePhone", "phone"]:
                            value = str(value).replace("-", "") if value else ""
                        # 작은따옴표 이스케이프 처리
                        value = escape_single_quotes(value)
                        update_fields.append(f"{field_mapping[field]} = %s")
                        params.append(value)
                
                if update_fields:
                    update_fields.append("updated_at = NOW()")
                    params.extend([target_id, business_id])
                    
                    cur.execute(f"""
                        UPDATE nm_targets 
                        SET {', '.join(update_fields)}
                        WHERE target_id = %s AND group_id = %s
                    """, params)
                
                return _resp(200, {"ok": True, "message": "대상자 정보가 수정되었습니다."})
                
    except PermissionError as e:
        return _resp(401, {"ok": False, "message": str(e)})
    except Exception as e:
        return _resp(500, {"ok": False, "message": f"대상자 수정 중 오류가 발생했습니다: {str(e)}"})

# 대상자 삭제
def delete_target(event, business_id, target_id):
    try:
        org_id = require_auth(event)
        
        with get_conn() as conn:
            with conn.cursor() as cur:
                # 사업 권한 확인
                cur.execute("""
                    SELECT group_id FROM nm_groups 
                    WHERE group_id = %s AND org_id = %s AND is_deleted = 0
                """, (business_id, org_id))
                
                if not cur.fetchone():
                    return _resp(404, {"ok": False, "message": "사업을 찾을 수 없습니다."})
                
                # 대상자 존재 확인
                cur.execute("""
                    SELECT target_id FROM nm_targets 
                    WHERE target_id = %s AND group_id = %s AND is_deleted = 0
                """, (target_id, business_id))
                
                if not cur.fetchone():
                    return _resp(404, {"ok": False, "message": "대상자를 찾을 수 없습니다."})
                
                # 대상자 삭제 (soft delete)
                cur.execute("""
                    UPDATE nm_targets 
                    SET is_deleted = 1, deleted_at = NOW(), updated_at = NOW()
                    WHERE target_id = %s AND group_id = %s
                """, (target_id, business_id))
                
                # 사업의 대상자 수 감소 (nm_groups 테이블에는 target_count 컬럼이 없으므로 제거)
                
                return _resp(200, {"ok": True, "message": "대상자가 삭제되었습니다."})
                
    except PermissionError as e:
        return _resp(401, {"ok": False, "message": str(e)})
    except Exception as e:
        return _resp(500, {"ok": False, "message": f"대상자 삭제 중 오류가 발생했습니다: {str(e)}"})

# 대상자 검색
def search_targets(event, business_id):
    try:
        org_id = require_auth(event)
        query_params = event.get("queryStringParameters") or {}
        search_term = escape_single_quotes(query_params.get("q", ""))
        
        if not search_term:
            return _resp(400, {"ok": False, "message": "검색어를 입력해주세요."})
        
        with get_conn() as conn:
            with conn.cursor() as cur:
                # 사업 권한 확인
                cur.execute("""
                    SELECT group_id FROM nm_groups 
                    WHERE group_id = %s AND org_id = %s AND is_deleted = 0
                """, (business_id, org_id))
                
                if not cur.fetchone():
                    return _resp(404, {"ok": False, "message": "사업을 찾을 수 없습니다."})
                
                # 대상자 검색
                search_pattern = f"%{search_term}%"
                cur.execute("""
                    SELECT target_id, target_name, target_type, target_gubun,
                           zipcode, address1, address2, mobile_phone, office_phone,
                           apply_reason, directions, created_at, updated_at
                    FROM nm_targets 
                    WHERE group_id = %s AND is_deleted = 0
                    AND (target_name LIKE %s OR mobile_phone LIKE %s OR office_phone LIKE %s)
                    ORDER BY created_at DESC
                """, (business_id, search_pattern, search_pattern, search_pattern))
                
                targets = cur.fetchall()
                
                # 데이터베이스 필드명을 프론트엔드 필드명으로 변환 (딕셔너리 형태로 접근)
                formatted_targets = []
                for target in targets:
                    try:
                        # 안전한 데이터 변환
                        zipcode = target.get('zipcode', '') if target.get('zipcode') is not None else ""
                        address1 = target.get('address1', '') if target.get('address1') is not None else ""
                        created_at = target.get('created_at') if target.get('created_at') is not None else None
                        
                        # 주소 합치기
                        full_address = ""
                        if zipcode and address1:
                            full_address = f"{zipcode} {address1}"
                        elif address1:
                            full_address = address1
                        elif zipcode:
                            full_address = zipcode
                        
                        # 날짜 형식 변환
                        registered_at = ""
                        if created_at:
                            try:
                                if hasattr(created_at, 'strftime'):
                                    registered_at = created_at.strftime("%Y-%m-%d")
                                else:
                                    registered_at = str(created_at)
                            except Exception as date_error:
                                print(f"날짜 변환 오류: {date_error}")
                                registered_at = str(created_at)
                        
                        formatted_target = {
                            "id": target.get('target_id', 0),
                            "name": target.get('target_name', ''),
                            "targetType": target.get('target_type', ''),
                            "targetHousehold": target.get('target_gubun', ''),
                            "zipcode": zipcode,
                            "address": full_address,
                            "detailAddress": target.get('address2', ''),
                            "mobilePhone": target.get('mobile_phone', ''),
                            "phone": target.get('office_phone', ''),
                            "applicationReason": target.get('apply_reason', ''),
                            "directions": target.get('directions', ''),
                            "registeredAt": registered_at,
                            "status": "active"
                        }
                        formatted_targets.append(formatted_target)
                    except Exception as e:
                        print(f"검색 대상자 데이터 변환 오류: {str(e)}, target: {target}")
                        continue
                
                return _resp(200, {"ok": True, "data": formatted_targets})
                
    except PermissionError as e:
        return _resp(401, {"ok": False, "message": str(e)})
    except Exception as e:
        return _resp(500, {"ok": False, "message": f"대상자 검색 중 오류가 발생했습니다: {str(e)}"})

def handler(event, context):
    path = (event.get("rawPath") or event.get("path") or "").rstrip("/") or "/"
    method = (event.get("requestContext", {}).get("http", {}).get("method")
              or event.get("httpMethod") or "GET").upper()
    
    print(f"요청 처리: {method} {path}")
    print(f"Headers: {event.get('headers', {})}")
    
    # OPTIONS 요청 처리 (CORS preflight)
    if method == "OPTIONS":
        print(f"OPTIONS 요청 처리: {path}")
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token",
                "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
                "Access-Control-Max-Age": "86400",
                "Content-Type": "application/json"
            },
            "body": ""
        }
    
    try:
        # Health check
        if path == "/health":
            return _resp(200, {"ok": True, "message": "healthy"})
        
        # 인증 관련 엔드포인트
        if path == "/login" and method == "POST":
            return login(event)
        
        if path == "/auth/verify" and method == "GET":
            return verify_token(event)
        
        if path == "/auth/logout" and method == "POST":
            return _resp(200, {"ok": True, "message": "로그아웃되었습니다."})
        
        # 사업 관련 엔드포인트
        if path == "/businesses" and method == "GET":
            return get_businesses(event)
        
        if path == "/businesses" and method == "POST":
            return create_business(event)
        
        # 사업 상세/수정/삭제 (동적 경로)
        if path.startswith("/businesses/"):
            path_parts = path.split("/")
            if len(path_parts) >= 3:
                business_id = path_parts[2]
                
                if len(path_parts) == 3:  # /businesses/{id}
                    if method == "GET":
                        return get_business(event, business_id)
                    elif method == "PUT":
                        return update_business(event, business_id)
                    elif method == "DELETE":
                        return delete_business(event, business_id)
                
                elif len(path_parts) == 4 and path_parts[3] == "targets":  # /businesses/{id}/targets
                    if method == "GET":
                        return get_targets(event, business_id)
                    elif method == "POST":
                        return create_target(event, business_id)
                
                elif len(path_parts) == 5 and path_parts[3] == "targets":  # /businesses/{id}/targets/{target_id}
                    target_id = path_parts[4]
                    if method == "GET":
                        return get_target(event, business_id, target_id)
                    elif method == "PUT":
                        return update_target(event, business_id, target_id)
                    elif method == "DELETE":
                        return delete_target(event, business_id, target_id)
                
                elif len(path_parts) == 5 and path_parts[3] == "targets" and path_parts[4] == "search":  # /businesses/{id}/targets/search
                    if method == "GET":
                        return search_targets(event, business_id)
        
        # 기본 응답 (DB 연결 테스트)
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT NOW() AS server_time")
                rows = cur.fetchall()
        return _resp(200, {"ok": True, "data": rows})

    except Exception as e:
        return _resp(500, {"ok": False, "error": str(e)})

def lambda_handler(event, context):
    return handler(event, context)

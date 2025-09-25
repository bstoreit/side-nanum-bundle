-- 1) 단체(조직) 테이블
CREATE TABLE nm_organizations (
    org_id           VARCHAR(100) NOT NULL,
    org_name         VARCHAR(100) NOT NULL,
    business_number  VARCHAR(20)  NOT NULL,
    password_hash    VARCHAR(255) NOT NULL,
    biz_id           VARCHAR(50),
    PRIMARY KEY (org_id),
    UNIQUE KEY uk_org_business_number (business_number),
    KEY ix_org_name (org_name)
) ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 
  COLLATE=utf8mb4_0900_ai_ci;


-- 2) 사업(그룹) 테이블
CREATE TABLE nm_groups (
    group_id      INT NOT NULL AUTO_INCREMENT,
    org_id        VARCHAR(100) NOT NULL,
    group_name    VARCHAR(100) NOT NULL,
    org_name      VARCHAR(100) NOT NULL,
    contact_name  VARCHAR(50)  NOT NULL,
    zipcode       VARCHAR(10)  NOT NULL,
    address1      VARCHAR(200) NOT NULL,
    address2      VARCHAR(200) NOT NULL,
    mobile_phone  VARCHAR(20)  NOT NULL,
    office_phone  VARCHAR(20)  NOT NULL,
    description   TEXT,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at    DATETIME NULL,
    is_deleted    TINYINT NOT NULL DEFAULT 0,
    PRIMARY KEY (group_id),
    KEY ix_groups_org_id (org_id),              -- FK 인덱스(명시)
    KEY ix_groups_name (group_name),            -- 검색 용도
    KEY ix_groups_mobile (mobile_phone),        -- 중복 허용 검색용
    CONSTRAINT fk_groups_org
      FOREIGN KEY (org_id)
      REFERENCES nm_organizations (org_id)
      ON DELETE CASCADE
      ON UPDATE CASCADE
) ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 
  COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE nm_targets (
    target_id     INT NOT NULL AUTO_INCREMENT,
    group_id      INT NOT NULL,                 -- nm_groups.group_id FK
    target_name   VARCHAR(100) NOT NULL,        -- 대상자명
    target_type   VARCHAR(50) NOT NULL,         -- 대상구분 (예: 일반, 차상위 등)
    household_size SMALLINT UNSIGNED NULL,      -- 대상가구(인원수)*
    zipcode       VARCHAR(10) NOT NULL,         -- 우편번호
    address1      VARCHAR(200) NOT NULL,        -- 주소1
    address2      VARCHAR(200) NOT NULL,        -- 주소2
    mobile_phone  VARCHAR(20) NOT NULL,         -- 핸드폰
    office_phone  VARCHAR(20) NULL,             -- 일반전화(없을 수 있어 NULL)
    apply_reason  TEXT,                         -- 신청사유
    directions    TEXT,                         -- 찾아가는길
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at    DATETIME NULL,
    is_deleted    TINYINT NOT NULL DEFAULT 0,
    PRIMARY KEY (target_id),
    KEY ix_targets_group   (group_id),
    KEY ix_targets_name    (target_name),
    KEY ix_targets_mobile  (mobile_phone),
    CONSTRAINT fk_targets_group
      FOREIGN KEY (group_id)
      REFERENCES nm_groups (group_id)
      ON DELETE CASCADE
      ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



nnm_0x4c5bde
INSERT INTO nm_organizations
  (org_id, org_name, business_number, password_hash, biz_id)
VALUES
  ('nmm_0x4c5bde_4',         /* org_id */
   '아름다운가게',           /* org_name */
   '3338216927',           /* business_number (UNIQUE) */
   '12345678',             /* password_hash - 예시값(실운영은 해시) */
   '1750730954.053425'     /* biz_id */
);


INSERT INTO nm_groups
  (org_id, group_name, org_name, contact_name,
   zipcode, address1, address2, mobile_phone, office_phone, description)
VALUES
  ('nmm_0x4c5bde', '나눔보따리 C그룹', '아름다운가게C', '케데헌',
   '03045', '서울특별시 종로구 세종대로 1', '101호', '01012345678', '0212345678', '테스트용 그룹 A'),
  ('nmm_0x4c5bde', '나눔보따리 D그룹', '아름다운가게D', '이순신',
   '03045', '서울특별시 종로구 세종대로 1', '102호', '01098765432', '0298765432', '테스트용 그룹 B');
   

INSERT INTO nm_targets (group_id, target_name, target_type, household_size, zipcode, address1, address2, mobile_phone, office_phone, apply_reason, directions)
VALUES
(1, '김철수', '일반', 3, '04524', '서울특별시 중구 세종대로 110', '101호', '010-1111-1111', '02-123-1111', '실직으로 인한 생계 곤란', '시청역 5번 출구에서 도보 5분');

INSERT INTO nm_targets (group_id, target_name, target_type, household_size, zipcode, address1, address2, mobile_phone, office_phone, apply_reason, directions)
VALUES
(2, '이영희', '차상위', 4, '13647', '경기도 성남시 분당구 불정로 90', 'A동 502호', '010-2222-2222', NULL, '자녀 교육비 부담', '정자역 3번 출구에서 버스 5분');

INSERT INTO nm_targets (group_id, target_name, target_type, household_size, zipcode, address1, address2, mobile_phone, office_phone, apply_reason, directions)
VALUES
(1, '박민수', '저소득', 2, '06134', '서울 강남구 테헤란로 231', 'B동 203호', '010-3333-3333', '02-345-6789', '건강 악화로 근로 불가', '삼성역 4번 출구 도보 7분');

INSERT INTO nm_targets (group_id, target_name, target_type, household_size, zipcode, address1, address2, mobile_phone, office_phone, apply_reason, directions)
VALUES
(2, '정은지', '일반', 1, '07335', '서울 영등포구 국제금융로 10', '1203호', '010-4444-4444', NULL, '독거노인 생활 지원 필요', '여의도역 6번 출구 근처');

INSERT INTO nm_targets (group_id, target_name, target_type, household_size, zipcode, address1, address2, mobile_phone, office_phone, apply_reason, directions)
VALUES
(1, '최현우', '차상위', 5, '41911', '대구광역시 중구 국채보상로 670', '5층', '010-5555-5555', '053-222-3333', '다자녀 가정 생계비 부담', '반월당역 14번 출구 도보 10분');

INSERT INTO nm_targets (group_id, target_name, target_type, household_size, zipcode, address1, address2, mobile_phone, office_phone, apply_reason, directions)
VALUES
(2, '오세훈', '일반', 2, '61474', '부산광역시 부산진구 중앙대로 708', '701호', '010-6666-6666', '051-123-4567', '실직 후 생활고', '서면역 9번 출구에서 직진');

INSERT INTO nm_targets (group_id, target_name, target_type, household_size, zipcode, address1, address2, mobile_phone, office_phone, apply_reason, directions)
VALUES
(1, '한지민', '저소득', 3, '63122', '제주특별자치도 제주시 연북로 23', '2층', '010-7777-7777', NULL, '편모 가정 생활비 부족', '제주시청 정문 맞은편');

INSERT INTO nm_targets (group_id, target_name, target_type, household_size, zipcode, address1, address2, mobile_phone, office_phone, apply_reason, directions)
VALUES
(2, '강호동', '차상위', 6, '34863', '대전광역시 중구 중앙로 101', '11층', '010-8888-8888', '042-321-6543', '대가족 생계 곤란', '대전역 광장 정문에서 직진');

INSERT INTO nm_targets (group_id, target_name, target_type, household_size, zipcode, address1, address2, mobile_phone, office_phone, apply_reason, directions)
VALUES
(1, '서지수', '일반', 2, '48059', '경상남도 창원시 성산구 중앙대로 151', '301호', '010-9999-9999', NULL, '청년 구직난으로 지원 필요', '창원시청 맞은편 버스정류장');

INSERT INTO nm_targets (group_id, target_name, target_type, household_size, zipcode, address1, address2, mobile_phone, office_phone, apply_reason, directions)
VALUES
(2, '홍길동', '저소득', 1, '03027', '서울 종로구 삼청로 37', '별채', '010-1234-5678', '02-789-1234', '장애로 인한 근로 불가', '안국역 1번 출구에서 북촌 방향 300m');


SELECT g.group_id, g.group_name, g.org_name, g.contact_name,
      g.zipcode, g.address1, g.address2, g.mobile_phone, g.office_phone,
      g.description, g.created_at, g.updated_at
FROM nm_groups g
WHERE g.org_id = 'nmm_0x4c5bde' AND g.is_deleted = 0
ORDER BY g.created_at DESC


select * from nm_groups

address
: 
"03303 서울 은평구 진관4로 77"
description
: 
"12121212121212"
detailAddress
: 
"2222"
managerName
: 
"34455555"
mobilePhone
: 
"01000000000"
name
: 
"이성열"
organizationName
: 
"2222222"
phone
: 
"022222222"
zipcode
: 
"03303"


INSERT INTO nm_groups
  (org_id, 
  group_name, 
  org_name, 
  contact_name,
   zipcode, 
	address1, 
	address2, 
	mobile_phone, 
	office_phone, 
	description)
VALUES
  ('nmm_0x4c5bde', '나눔보따리 C그룹', '아름다운가게C', '케데헌',
   '03045', '서울특별시 종로구 세종대로 1', '101호', '01012345678', '0212345678', '테스트용 그룹 A'),
  ('nmm_0x4c5bde', '나눔보따리 D그룹', '아름다운가게D', '이순신',
   '03045', '서울특별시 종로구 세종대로 1', '102호', '01098765432', '0298765432', '테스트용 그룹 B');
 
 
 
select * from nm_groups

select * from nm_organizations

select * From nm_targets
where length(target_gubun)=1

update nm_targets set
target_gubun = '조손가구'
where length(target_gubun)=1



select
left(report_date,4) as yearly,
angel_term,
count(distinct(angel_id))
from summary_angel_report
where report_date >= '2022-01-01'
and report_date <= '2024-12-31'
group by yearly, angel_term
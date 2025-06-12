SCHEMA= '''
__tablename__ = 'POC_PRODUCT_WIP_RAW_MATERIAL_MONTHLY'

# 공통 날짜 관련 필드
BASE_YMD = Column(Date, comment='기준년월 (YYYY-MM-DD)')

# 구분자 (재공/제품 or 원자재 여부 식별)
DATA_TYPE = Column(String, comment='데이터 구분 [재공/제품, 원자재]')

# 제품/재공 테이블 관련 컬럼 (원자재 데이터일 경우 NULL 가능)
JAKG_DATE = Column(Date, comment='제강일자')
ROLL_DATE = Column(Date, comment='압연일자')
IBGO_DATE = Column(Date, comment='입고일자')

TYPE = Column(String, comment='재고 생산 단계 [제품, 재공]')
LONG_TYPE = Column(String, comment='장기 여부 [정상, 장기, 일몰]')
ITEM_ACCOUNT = Column(String, comment='소재/제품 구분 [소재, 제품]')
ORD_TYPE = Column(String, comment='주여구분 [여재, 주문재]')
GBN_CODE = Column(String, comment='SAP 구분 코드 [01, 02, 03]')

FACTORY_TY = Column(String, comment='공장명')
CURRENT_PROCESS_CODE = Column(String, comment='현공정 코드')
CURRENT_PROCESS_NM = Column(String, comment='현공정명')
FINAL_PRODUCTION_PROCESS_CODE = Column(String, comment='최종 생산 공정 코드')
R_ORDER = Column(String, comment='연구소 생산 의뢰 여부 [Y, N]')
R_ORDER_MOD = Column(String, comment='R Order 수정 여부 [Y, N]')

SHAPE_TY = Column(String, comment='형상 구분')
SHAPE = Column(String, comment='현재 형상')
ORD_SHAPE = Column(String, comment='주문 형상')
FINAL_PRODUCTION_SHAPE = Column(String, comment='최종 생산 형상')
FIRST_INPUT_SHAPE = Column(String, comment='소재 형상')
SURFACE_NM = Column(String, comment='표면명')
HEAT_TREAT_NM = Column(String, comment='열처리명')
SURFACE = Column(String, comment='표면 코드')
HEAT_TREAT = Column(String, comment='열처리 코드')
FINAL_PRODUCTION_ED = Column(Float, comment='최종 생산 외경')
FINAL_PRODUCTION_LENGTH_MIN = Column(Float, comment='최종 생산 길이 최소')
PIPE_MATERIAL_YN = Column(String, comment='강관 소재 여부 [Y, N]')

IRN_CODE = Column(String, comment='사내 강종 코드')
IRN_NAME = Column(String, comment='사내 강종명')
IRN_GBN = Column(String, comment='강종 구분')
IRN_LARGE_NM = Column(String, comment='대강종명')
GBN_SS = Column(String, comment='일반/특수합금 구분 [일반, 특수합금]')
CAT_SS = Column(String, comment='특수합금 분류')

MATL_CODE = Column(String, comment='자재 코드')
OLD_MATL_CODE = Column(String, comment='구 자재 코드 (Replaced by MATL_CODE)')
MATL_NAME = Column(String, comment='자재 내역 (LIKE 검색 권장)')

BATCH_ID = Column(String, comment='배치 ID')
LOT_NO = Column(String, comment='PON 로트')
BUNDLE = Column(String, comment='번들')
BUNDLE_LEN = Column(Integer, comment='번들 자릿수')
LOT_NO_MES = Column(String, comment='MES 조회 LOT 번호')
HEAT_NO = Column(String, comment='HEAT 번호')
CO_NO = Column(String, comment='수주 번호')
CO_SER = Column(String, comment='수주 행번')
PREQ_NO = Column(String, comment='생산 의뢰 번호')
GBN_PREQ_NO = Column(String, comment='생산 의뢰 번호 구분')

PASS_MONTH = Column(Integer, comment='경과 개월')
DELE_RATE = Column(Float, comment='부진화율')
WGT = Column(Float, comment='중량 (kg)')
AMT = Column(Integer, comment='금액 (원)')
UNIT = Column(Integer, comment='단가')
FINAL_PRODUCTION_WGT = Column(Float, comment='최종 생산 중량')

CUST_NM = Column(String, comment='수요가명')
REAL_CUST_NM = Column(String, comment='실수요가명')
CUST_CODE = Column(String, comment='수요가 코드')
REAL_CUST_CODE = Column(String, comment='실수요가 코드')
SPX = Column(String, comment='SPX 향 제품 여부')
TEAM_CUST_GRP_NM = Column(String, comment='판매팀명 (그룹)')

GBN_PROD = Column(String, comment='제품군 코드')
GBN_PROD_NM = Column(String, comment='제품군명')
GBN_MATL = Column(String, comment='품목 종류 코드')
GBN_MATL_NM = Column(String, comment='품목 종류명')

# 원자재 관련 추가 컬럼 (재공/제품 데이터일 경우 NULL 가능)
CLASS_CODE = Column(String, comment='평가 클래스 코드')
CLASS_NM = Column(String, comment='평가 클래스 내역')
MATL_TYPE_CODE = Column(String, comment='자재 유형 코드')
MATL_TYPE_NM = Column(String, comment='자재 유형명')

GBN_SP = Column(String, comment='일반/특수합금 구분 [일반, 특수합금]')
GBN_L1 = Column(String, comment='대분류 (예: 합금철, 자가철, 구입 스크랩 등)')
GBN_L2 = Column(String, comment='중분류 (예: STS스크랩, 일반 스크랩 등)')
GBN_L3 = Column(String, comment='소분류')

CAT_L1 = Column(String, comment='SAP 대분류명 (예: 스크랩, 구입소재, 합금철 등)')
CAT_L2 = Column(String, comment='SAP 중분류명 (예: 구입탄합강스크랩, 사내STS강스크랩 등)')
CAT_L3 = Column(String, comment='SAP 소분류명 (예: 생철류, S304계, INVAR계 등)')

__table_args__ = (
    PrimaryKeyConstraint('BASE_YMD', 'MATL_CODE', name='pk_product_raw_material'),
)
'''

## 삭제 컬럼
# - Column: TEAM_CUST_TY_NM (STRING)
#   - Description: 판매팀명
#   - Value Type: Variable
#   - Example Values: [부산강관파트, 선재내수영업팀, 영업3팀, 강관영업팀, ...]
# 사유 : TEAM_CUST_GRP_NM으로 대체
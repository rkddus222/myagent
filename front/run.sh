#!/bin/bash

# Script to build and start QV Frontend in production mode
# Updated: 2025-04-29

APP_DIR="/data/customer_admin/front"
PORT="4010"   # ✅ 반드시 문자열로 감싸기 (Bash에서 안정성 높음)
LOG_FILE="/data/customer_admin/logs/front.log"

# Print colorful messages
print_info() { echo -e "\e[34m[INFO] $1\e[0m"; }
print_success() { echo -e "\e[32m[SUCCESS] $1\e[0m"; }
print_error() { echo -e "\e[31m[ERROR] $1\e[0m"; }

# 1. 이동
cd "$APP_DIR" || { print_error "디렉토리 이동 실패: $APP_DIR"; exit 1; }

# 2. 패키지 설치
print_info "의존성 설치 중..."
npm install || { print_error "npm install 실패"; exit 1; }

# 3. 기존 포트(4010) 사용하는 프로세스 종료
print_info "포트 $PORT 사용하는 프로세스 종료..."
if [ -n "$PORT" ]; then
  PID=$(lsof -ti tcp:$PORT)
  if [ -n "$PID" ]; then
    kill -9 "$PID"
    sleep 2
  fi
else
  print_error "포트 번호가 설정되지 않았습니다."
  exit 1
fi

# 4. 정적 빌드
print_info "정적 파일 빌드(npm run build)..."
npm run build || { print_error "빌드 실패"; exit 1; }

# 5. 정적 서버 실행
print_info "정적 서버 시작 (포트: $PORT)..."
nohup npm run start > "$LOG_FILE" 2>&1 &

# 6. 실행 확인
sleep 3
if lsof -i tcp:$PORT | grep -q LISTEN; then
  print_success "✅ QV Frontend 정적 서버가 포트 $PORT 에서 실행 중입니다!"
  print_info "로그 파일: $LOG_FILE"
else
  print_error "❌ 정적 서버 시작 실패"
  exit 1
fi

#!/bin/bash

# Print colorful messages
print_info() {
  echo -e "\e[34m[INFO] $1\e[0m"
}

print_success() {
  echo -e "\e[32m[SUCCESS] $1\e[0m"
}

print_error() {
  echo -e "\e[31m[ERROR] $1\e[0m"
}

PORT=4010

PIDS=$(lsof -ti tcp:$PORT)

if [ -n "$PIDS" ]; then
  print_info "포트 $PORT에서 실행 중인 프로세스를 종료합니다..."
  kill $PIDS
  sleep 2

  if lsof -i :$PORT | grep -q LISTEN; then
    print_info "강제 종료 중..."
    kill -9 $PIDS
  fi

  if lsof -i :$PORT | grep -q LISTEN; then
    print_error "정지 실패: 포트 $PORT 여전히 LISTEN 중"
    exit 1
  else
    print_success "✅ 포트 $PORT 정지 완료"
  fi
else
  print_info "포트 $PORT에서 실행 중인 프로세스가 없습니다"
fi

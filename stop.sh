#!/bin/bash

echo "🛑 TeamD Docker Monitoring Stack 종료 중..."

# Docker Compose 명령어 확인
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
elif command -v docker compose &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    echo "❌ docker compose 또는 docker-compose가 설치되지 않았습니다."
    exit 1
fi

$COMPOSE_CMD down

echo ""
echo "🧹 정리 옵션:"
echo "   1) 볼륨 데이터 유지 (기본)"
echo "   2) 볼륨 데이터 삭제"
echo ""
read -p "볼륨 데이터를 삭제하시겠습니까? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  볼륨 데이터 삭제 중..."
    $COMPOSE_CMD down -v
    docker system prune -f
    echo "✅ 모든 데이터가 삭제되었습니다."
else
    echo "✅ 볼륨 데이터가 보존되었습니다."
fi

echo "🏁 종료 완료!"

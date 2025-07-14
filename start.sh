#!/bin/bash

echo "🚀 TeamD Docker Monitoring Stack 시작..."

# Docker가 실행 중인지 확인
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker가 실행되지 않았습니다. Docker Desktop을 시작해주세요."
    exit 1
fi

# Docker Compose 명령어 확인 (docker compose 우선, 없으면 docker-compose)
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    echo "❌ docker compose 또는 docker-compose가 설치되지 않았습니다."
    exit 1
fi

echo "📦 Docker 이미지 빌드 및 컨테이너 시작 중... (사용: $COMPOSE_CMD)"
$COMPOSE_CMD up -d

echo "⏳ 서비스가 시작될 때까지 대기 중..."
sleep 30

echo ""
echo "✅ 모든 서비스가 시작되었습니다!"
echo ""
echo "🌐 접속 가능한 URL:"
echo "   📱 Express App:      http://localhost:3002"
echo "   🚦 Traefik:          http://localhost:8080"
echo "   📊 Kibana:           http://localhost:5601"
echo "   📈 Grafana:          http://localhost:3001 (admin/admin)"
echo "   🎯 Prometheus:       http://localhost:9090"
echo "   🐳 cAdvisor:         http://localhost:8081"
echo ""
echo "📋 서비스 상태 확인:"
$COMPOSE_CMD ps

echo ""
echo "📝 로그 확인: $COMPOSE_CMD logs [service_name]"
echo "🛑 종료: $COMPOSE_CMD down"

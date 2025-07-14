# TeamD Docker Monitoring Stack

이 프로젝트는 Node.js Express 애플리케이션과 함께 완전한 모니터링 스택을 Docker로 구성합니다.

## 포함된 서비스

- **Node.js Express App**: 샘플 웹 애플리케이션
- **Redis**: 캐싱 및 세션 스토리지
- **Traefik**: 로드 밸런서 및 리버스 프록시
- **Elasticsearch**: 로그 저장소
- **Logstash**: 로그 처리 파이프라인
- **Kibana**: 로그 시각화 대시보드
- **Prometheus**: 메트릭 수집
- **Grafana**: 메트릭 시각화 대시보드
- **cAdvisor**: 컨테이너 모니터링

## 시작하기

### 1. 프로젝트 클론
```bash
cd /devops
```

### 2. Docker Compose 실행
```bash
docker compose up -d
```

### 3. 서비스 확인
```bash
docker compose ps
```

## 접속 URL

| 서비스 | URL | 설명 |
|--------|-----|------|
| Express App | http://localhost:3002 | 메인 애플리케이션 |
| Traefik Dashboard | http://localhost:8080 | 트래픽 라우팅 대시보드 |
| Kibana | http://localhost:5601 | 로그 분석 대시보드 |
| Grafana | http://localhost:3001 | 메트릭 시각화 (admin/admin) |
| Prometheus | http://localhost:9090 | 메트릭 수집기 |
| cAdvisor | http://localhost:8081 | 컨테이너 모니터링 |

## API 엔드포인트

- `GET /` - 메인 페이지 (방문자 카운터 포함)
- `GET /health` - 헬스체크
- `GET /metrics` - Prometheus 메트릭
- `GET /api/test` - 테스트 API

## 로그 확인

```bash
# 애플리케이션 로그
docker compose logs app

# 모든 서비스 로그
docker compose logs

# 실시간 로그 스트림
docker compose logs -f app
```

## 데이터 볼륨

다음 데이터는 Docker 볼륨에 저장됩니다:
- Redis 데이터
- Elasticsearch 인덱스
- Prometheus 메트릭 데이터
- Grafana 설정

## 개발 모드

애플리케이션만 개발 모드로 실행:
```bash
cd app
npm install
npm run dev
```

## 종료

```bash
docker compose down

# 볼륨까지 삭제
docker compose down -v
```

## 트러블슈팅

### Elasticsearch 메모리 부족
```bash
# macOS/Linux에서 vm.max_map_count 증가
sudo sysctl -w vm.max_map_count=262144
```

### Docker Desktop 메모리 설정
Docker Desktop > Settings > Resources에서 메모리를 최소 4GB로 설정

## 모니터링 설정

### Grafana 대시보드
1. http://localhost:3001 접속 (admin/admin)
2. Data Sources에서 Prometheus 추가: http://prometheus:9090
3. 사전 정의된 대시보드 임포트

### Kibana 인덱스 패턴
1. http://localhost:5601 접속
2. Index Patterns에서 `app-logs-*` 패턴 생성
3. @timestamp를 시간 필드로 설정

## 확장하기

### 새 서비스 추가
`docker-compose.yml`에 서비스를 추가하고 적절한 네트워크에 연결

### 커스텀 메트릭
`server.js`에서 prom-client를 사용해 새로운 메트릭 정의

### 로그 필터링
`logstash/pipeline/logstash.conf`에서 필터 규칙 수정

# 🚀 Twitter Scheduler

منصة متكاملة لجدولة التغريدات مع AI

## التثبيت السريع

```bash
# 1. فك الضغط
unzip twitter-scheduler.zip && cd twitter-scheduler

# 2. شغّل الإعداد
chmod +x setup.sh && ./setup.sh

# 3. شغّل Backend
cd backend && npm run dev

# 4. في terminal جديد: شغّل Frontend
cd frontend && npm run dev

# 5. افتح http://localhost:3000
```

## المميزات

- ✅ جدولة تغريدات ذكية
- 🤖 AI Assistant مدمج
- 🎯 استهداف جغرافي متقدم
- 📊 تحليلات شاملة
- 🧵 دعم الثريدات
- 🌙 الوضع الليلي

## الوثائق

- [دليل التثبيت](./SETUP.md)
- [البدء السريع](./QUICKSTART.md)
- [الميزات المستقبلية](./FEATURES.md)

## الترخيص

MIT License
```

---

### ═══ setup.sh ═══

```bash
#!/bin/bash
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Twitter Scheduler - Setup${NC}"

# Backend
if [ -d "backend" ]; then
    echo -e "${BLUE}Installing Backend...${NC}"
    cd backend && npm install
    [ ! -f ".env" ] && cp .env.example .env 2>/dev/null || true
    cd ..
    echo -e "${GREEN}✅ Backend ready${NC}"
fi

# Frontend
if [ -d "frontend" ]; then
    echo -e "${BLUE}Installing Frontend...${NC}"
    cd frontend && npm install
    [ ! -f ".env.local" ] && echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
    cd ..
    echo -e "${GREEN}✅ Frontend ready${NC}"
fi

# Database
read -p "Create database? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    psql -U postgres -c "CREATE DATABASE twitter_scheduler;" 2>/dev/null || true
    psql -U postgres -d twitter_scheduler -f database/schema.sql
    echo -e "${GREEN}✅ Database ready${NC}"
fi

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Setup Complete! 🎉${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Next steps:"
echo "1. cd backend && npm run dev"
echo "2. cd frontend && npm run dev"
echo "3. Open http://localhost:3000"
```

---

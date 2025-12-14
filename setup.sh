#!/bin/bash

# Twitter Scheduler - Setup Script
# يقوم هذا السكريبت بإعداد المشروع تلقائياً

set -e  # إيقاف عند أي خطأ

# الألوان
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# دوال مساعدة
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# البداية
clear
echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════╗
║                                               ║
║        Twitter Scheduler Setup Script        ║
║              سكريبت التثبيت التلقائي          ║
║                                               ║
╚═══════════════════════════════════════════════╝
EOF
echo -e "${NC}"

sleep 1

# ═══════════════════════════════════════════════
# 1. التحقق من المتطلبات
# ═══════════════════════════════════════════════

print_header "1️⃣  التحقق من المتطلبات"

# تحقق من Node.js
print_info "التحقق من Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js مثبت: $NODE_VERSION"
else
    print_error "Node.js غير مثبت!"
    print_info "قم بتثبيته من: https://nodejs.org/"
    exit 1
fi

# تحقق من npm
print_info "التحقق من npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_success "npm مثبت: $NPM_VERSION"
else
    print_error "npm غير مثبت!"
    exit 1
fi

# تحقق من PostgreSQL
print_info "التحقق من PostgreSQL..."
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version | awk '{print $3}')
    print_success "PostgreSQL مثبت: $PSQL_VERSION"
else
    print_warning "PostgreSQL غير مثبت!"
    print_info "سيتم تخطي إعداد قاعدة البيانات"
    SKIP_DB=true
fi

# تحقق من Redis
print_info "التحقق من Redis..."
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        print_success "Redis يعمل"
    else
        print_warning "Redis مثبت لكن لا يعمل"
        print_info "شغّل Redis: brew services start redis"
    fi
else
    print_warning "Redis غير مثبت!"
    print_info "سيعمل التطبيق بدون caching"
fi

sleep 2

# ═══════════════════════════════════════════════
# 2. إعداد Backend
# ═══════════════════════════════════════════════

print_header "2️⃣  إعداد Backend"

if [ -d "backend" ]; then
    print_info "تثبيت مكتبات Backend..."
    cd backend
    
    # تثبيت المكتبات
    npm install
    
    if [ $? -eq 0 ]; then
        print_success "تم تثبيت مكتبات Backend بنجاح"
    else
        print_error "فشل في تثبيت مكتبات Backend"
        exit 1
    fi
    
    # نسخ ملف البيئة
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            print_info "نسخ ملف .env..."
            cp .env.example .env
            print_success "تم إنشاء ملف .env"
            print_warning "لا تنسى تعديل ملف .env بمعلوماتك!"
        else
            print_warning "ملف .env.example غير موجود"
        fi
    else
        print_info "ملف .env موجود بالفعل"
    fi
    
    cd ..
else
    print_error "مجلد backend غير موجود!"
    exit 1
fi

sleep 1

# ═══════════════════════════════════════════════
# 3. إعداد Frontend
# ═══════════════════════════════════════════════

print_header "3️⃣  إعداد Frontend"

if [ -d "frontend" ]; then
    print_info "تثبيت مكتبات Frontend..."
    cd frontend
    
    # تثبيت المكتبات
    npm install
    
    if [ $? -eq 0 ]; then
        print_success "تم تثبيت مكتبات Frontend بنجاح"
    else
        print_error "فشل في تثبيت مكتبات Frontend"
        exit 1
    fi
    
    # نسخ ملف البيئة
    if [ ! -f ".env.local" ]; then
        if [ -f ".env.local.example" ]; then
            print_info "نسخ ملف .env.local..."
            cp .env.local.example .env.local
            print_success "تم إنشاء ملف .env.local"
        else
            # إنشاء ملف .env.local افتراضي
            cat > .env.local << EOL
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOL
            print_success "تم إنشاء ملف .env.local افتراضي"
        fi
    else
        print_info "ملف .env.local موجود بالفعل"
    fi
    
    cd ..
else
    print_error "مجلد frontend غير موجود!"
    exit 1
fi

sleep 1

# ═══════════════════════════════════════════════
# 4. إعداد قاعدة البيانات
# ═══════════════════════════════════════════════

if [ "$SKIP_DB" != true ]; then
    print_header "4️⃣  إعداد قاعدة البيانات"
    
    # سؤال المستخدم
    read -p "$(echo -e ${YELLOW}"هل تريد إنشاء قاعدة البيانات الآن؟ (y/n): "${NC})" -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "إنشاء قاعدة البيانات..."
        
        # إنشاء قاعدة البيانات
        psql -U postgres -c "CREATE DATABASE twitter_scheduler;" 2>/dev/null
        
        if [ $? -eq 0 ]; then
            print_success "تم إنشاء قاعدة البيانات: twitter_scheduler"
        else
            print_warning "قاعدة البيانات موجودة بالفعل أو فشل الإنشاء"
        fi
        
        # تنفيذ Schema
        if [ -f "database/schema.sql" ]; then
            print_info "تنفيذ Schema..."
            psql -U postgres -d twitter_scheduler -f database/schema.sql
            
            if [ $? -eq 0 ]; then
                print_success "تم تنفيذ Schema بنجاح"
            else
                print_error "فشل في تنفيذ Schema"
            fi
        else
            print_warning "ملف database/schema.sql غير موجود"
        fi
    else
        print_info "تم تخطي إعداد قاعدة البيانات"
        print_warning "ستحتاج لإنشائها يدوياً لاحقاً"
    fi
else
    print_warning "تم تخطي إعداد قاعدة البيانات (PostgreSQL غير مثبت)"
fi

sleep 1

# ═══════════════════════════════════════════════
# 5. الملخص النهائي
# ═══════════════════════════════════════════════

print_header "✅ تم الانتهاء من الإعداد!"

echo ""
echo -e "${GREEN}══════════════════════════════════════════════${NC}"
echo -e "${GREEN}           التثبيت اكتمل بنجاح! 🎉          ${NC}"
echo -e "${GREEN}══════════════════════════════════════════════${NC}"
echo ""

print_info "الخطوات التالية:"
echo ""
echo "1️⃣  عدّل ملفات البيئة:"
echo "   📝 backend/.env"
echo "   📝 frontend/.env.local"
echo ""
echo "2️⃣  شغّل Backend:"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "3️⃣  في terminal جديد، شغّل Worker:"
echo "   cd backend"
echo "   npm run worker"
echo ""
echo "4️⃣  في terminal ثالث، شغّل Frontend:"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "5️⃣  افتح المتصفح:"
echo "   🌐 http://localhost:3000"
echo ""

print_warning "ملاحظات مهمة:"
echo "  • لا تنسى تعديل JWT_SECRET في backend/.env"
echo "  • احصل على Twitter API Keys من developer.twitter.com"
echo "  • احصل على OpenAI API Key من platform.openai.com"
echo "  • راجع ملف SETUP.md للتفاصيل الكاملة"
echo ""

print_success "استمتع باستخدام Twitter Scheduler! 🚀"
echo ""

#!/bin/bash

# Simple Production Test Script
# Run this on your production server to test the Django API

echo "🧪 TESTING PRODUCTION DJANGO API"
echo "================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test counter
TESTS_PASSED=0
TOTAL_TESTS=0

run_test() {
    local test_name="$1"
    local command="$2"
    local expected_pattern="$3"
    
    echo -n "Testing $test_name... "
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if result=$(eval "$command" 2>&1); then
        if [[ -z "$expected_pattern" ]] || echo "$result" | grep -q "$expected_pattern"; then
            echo -e "${GREEN}✅ PASS${NC}"
            TESTS_PASSED=$((TESTS_PASSED + 1))
            return 0
        else
            echo -e "${RED}❌ FAIL${NC} (unexpected response)"
            echo "   Expected pattern: $expected_pattern"
            echo "   Got: ${result:0:100}..."
            return 1
        fi
    else
        echo -e "${RED}❌ FAIL${NC} (command failed)"
        echo "   Error: ${result:0:100}..."
        return 1
    fi
}

echo "📍 Current directory: $(pwd)"
echo "🐍 Python version: $(python3 --version 2>/dev/null || python --version)"
echo ""

# Test 1: Check if manage.py exists
run_test "Django project structure" "test -f manage.py && echo 'manage.py found'" "manage.py found"

# Test 2: Check Django setup
run_test "Django configuration" "python3 manage.py check --deploy" ""

# Test 3: Check if required packages are installed
run_test "Required packages" "python3 -c 'import django, boto3, corsheaders, dotenv; print(\"All packages available\")'" "All packages available"

# Test 4: Check environment variables
run_test "Environment variables" "python3 -c 'import os; print(\"AWS configured\" if os.getenv(\"AWS_ACCESS_KEY_ID\") else \"Missing AWS config\")'" "AWS configured"

# Test 5: Test Django development server start
echo -n "Testing Django dev server startup... "
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Start Django dev server in background
python3 manage.py runserver 127.0.0.1:8001 &
SERVER_PID=$!
sleep 3

# Test if server responds
if curl -s http://127.0.0.1:8001/api/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    
    # Test specific API endpoint
    run_test "API endpoint response" "curl -s http://127.0.0.1:8001/api/screenshots/employee/haseebcodejourney@gmail.com/folders/" ""
else
    echo -e "${RED}❌ FAIL${NC} (server not responding)"
fi

# Clean up
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null

echo ""
echo "📊 TEST RESULTS"
echo "==============="
echo -e "Tests passed: ${GREEN}$TESTS_PASSED${NC}/$TOTAL_TESTS"

if [ $TESTS_PASSED -eq $TOTAL_TESTS ]; then
    echo -e "${GREEN}🎉 All tests passed! Django is working correctly.${NC}"
    echo "   The issue is likely with your web server (Nginx/Apache) configuration."
    echo ""
    echo "🔧 Next steps:"
    echo "1. Check web server logs: sudo tail -f /var/log/nginx/error.log"
    echo "2. Verify web server is proxying to port 8000"
    echo "3. Check SSL certificate configuration"
    echo "4. Test with: curl -k https://dxdtime.ddsolutions.io/api/"
else
    echo -e "${RED}❌ Some tests failed. Fix Django configuration first.${NC}"
    echo ""
    echo "🔧 Common fixes:"
    echo "1. pip3 install django boto3 django-cors-headers python-dotenv"
    echo "2. Create .env file with AWS credentials"
    echo "3. python3 manage.py migrate"
    echo "4. Check file permissions"
fi

echo ""
echo "📋 Manual test commands:"
echo "python3 manage.py runserver 0.0.0.0:8001"
echo "curl http://localhost:8001/api/screenshots/employee/haseebcodejourney@gmail.com/folders/"

#!/usr/bin/env bash

set -u

PASS=0
FAIL=0

green="\033[0;32m"
red="\033[0;31m"
yellow="\033[0;33m"
reset="\033[0m"

pass() {
  echo -e "${green}✓ $1${reset}"
  PASS=$((PASS + 1))
}

fail() {
  echo -e "${red}✗ $1${reset}"
  FAIL=$((FAIL + 1))
}

echo
echo "====================================="
echo " Avery Agentforce Workshop Preflight"
echo "====================================="
echo

# Git
if command -v git >/dev/null 2>&1; then
  pass "Git installed ($(git --version))"
else
  fail "Git not installed"
fi

# Node
if command -v node >/dev/null 2>&1; then
  NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")

  if [ "$NODE_MAJOR" -ge 20 ]; then
    pass "Node installed ($(node --version))"
  else
    fail "Node $(node --version) installed — version 20+ required"
  fi
else
  fail "Node not installed"
fi

# npm
if command -v npm >/dev/null 2>&1; then
  pass "npm installed ($(npm --version))"
else
  fail "npm not installed"
fi

# Java
if command -v java >/dev/null 2>&1; then
  pass "Java installed"
else
  fail "Java not installed"
fi

# Salesforce CLI
if command -v sf >/dev/null 2>&1; then
  pass "Salesforce CLI installed"
else
  fail "Salesforce CLI not installed"
fi

# Gemini
if command -v gemini >/dev/null 2>&1; then
  pass "Gemini CLI installed"
else
  fail "Gemini CLI not installed"
fi

# VS Code
if command -v code >/dev/null 2>&1; then
  pass "VS Code CLI installed"
else
  fail "VS Code 'code' command not available"
fi

# Salesforce project
if [ -f "sfdx-project.json" ]; then
  pass "Salesforce DX project found"
else
  fail "sfdx-project.json not found — run this from the repo root"
fi

# Gemini instructions
if [ -f "GEMINI.md" ]; then
  pass "GEMINI.md found"
else
  fail "GEMINI.md not found"
fi

# MCP configuration
if [ -f ".gemini/settings.json" ]; then
  pass "Gemini MCP configuration found"
else
  fail ".gemini/settings.json not found"
fi

# Agent Script
if find force-app -type f -name "*.agent" 2>/dev/null | grep -q .; then
  pass "Agent Script source found"
else
  fail "No .agent files found"
fi

# Salesforce org
if command -v sf >/dev/null 2>&1; then
  if sf org display \
    --target-org avery-workshop \
    --json >/dev/null 2>&1; then

    pass "avery-workshop org authorized"

    if sf data query \
      --query "SELECT Id FROM Organization LIMIT 1" \
      --target-org avery-workshop \
      --json >/dev/null 2>&1; then

      pass "Salesforce API connection successful"
    else
      fail "Unable to query Avery Salesforce sandbox"
    fi

  else
    fail "avery-workshop Salesforce org not authorized"
  fi
fi

echo
echo "====================================="

if [ "$FAIL" -eq 0 ]; then
  echo -e "${green}READY FOR WORKSHOP${reset}"
  echo
  echo "Next:"
  echo "  git pull"
  echo "  gemini"
  echo
  exit 0
else
  echo -e "${red}NOT READY — $FAIL CHECK(S) FAILED${reset}"
  echo
  echo "Review INSTALL.md and resolve the failed checks."
  echo
  exit 1
fi

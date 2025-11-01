#!/bin/bash

# Enhanced Paper Updater Runner
# ============================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
cd "$SCRIPT_DIR"

show_help() {
    echo "Enhanced Paper Updater"
    echo "====================="
    echo ""
    echo "Usage: $0 [OPTIONS] [rust|python]"
    echo ""
    echo "Options:"
    echo "  --dry-run, -n          Show what would be updated without making changes"
    echo "  --max-papers, -m NUM   Process at most NUM papers"
    echo "  --verbose, -v          Enable verbose output"
    echo "  --help, -h             Show this help message"
    echo ""
    echo "Versions:"
    echo "  rust     Use the Rust implementation (fast, efficient)"
    echo "  python   Use the Python implementation (feature-rich or simple fallback)"
    echo ""
    echo "Python version automatically falls back to simple updater if dependencies"
    echo "are not available (uses only Python standard library)."
    echo ""
    echo "If no version is specified, Python will be used by default."
}

# Parse arguments
VERSION="python"
ARGS=()

while [[ $# -gt 0 ]]; do
    case $1 in
        --help|-h)
            show_help
            exit 0
            ;;
        rust|python)
            VERSION="$1"
            shift
            ;;
        *)
            ARGS+=("$1")
            shift
            ;;
    esac
done

echo "🚀 Starting Enhanced Paper Updater ($VERSION version)"
echo ""

case $VERSION in
    rust)
        echo "📦 Building Rust version..."
        if ! command -v cargo &> /dev/null; then
            echo "❌ Error: Rust/Cargo not found. Please install Rust first."
            exit 1
        fi
        
        cargo build --release --bin main_improved
        echo ""
        echo "▶️  Running Rust updater..."
        cargo run --release --bin main_improved
        ;;
        
    python)
        echo "🐍 Setting up Python environment..."
        
        # Check if Python is available
        PYTHON_CMD=""
        if command -v python3 &> /dev/null; then
            PYTHON_CMD="python3"
        elif command -v python &> /dev/null; then
            # Check if it's Python 3
            if python --version 2>&1 | grep -q "Python 3"; then
                PYTHON_CMD="python"
            fi
        fi
        
        if [[ -z "$PYTHON_CMD" ]]; then
            echo "❌ Error: Python 3 not found. Please install Python 3 first."
            exit 1
        fi
        
        echo "✅ Found Python: $($PYTHON_CMD --version)"
        
        # Try to install dependencies if requirements.txt exists
        DEPS_INSTALLED=false
        if [[ -f "requirements.txt" ]]; then
            echo "📦 Installing Python dependencies..."
            
            # Try different package managers in order of preference
            if command -v pip3 &> /dev/null; then
                echo "  Using pip3..."
                if pip3 install -r requirements.txt --user --quiet; then
                    DEPS_INSTALLED=true
                fi
            elif command -v pip &> /dev/null; then
                echo "  Using pip..."
                if pip install -r requirements.txt --user --quiet; then
                    DEPS_INSTALLED=true
                fi
            elif $PYTHON_CMD -m pip --version &> /dev/null; then
                echo "  Using $PYTHON_CMD -m pip..."
                if $PYTHON_CMD -m pip install -r requirements.txt --user --quiet; then
                    DEPS_INSTALLED=true
                fi
            fi
        fi
        
        echo ""
        # Choose which Python script to run based on dependencies
        if [[ "$DEPS_INSTALLED" == "true" ]]; then
            echo "▶️  Running full-featured Python updater..."
            $PYTHON_CMD paper_updater.py "${ARGS[@]}"
        else
            echo "⚠️  Dependencies not available. Using simple updater (standard library only)..."
            echo "▶️  Running simple Python updater..."
            $PYTHON_CMD simple_updater.py "${ARGS[@]}"
        fi
        ;;
        
    *)
        echo "❌ Error: Unknown version '$VERSION'"
        echo "Use 'rust' or 'python'"
        exit 1
        ;;
esac

echo ""
echo "✅ Update process completed!"

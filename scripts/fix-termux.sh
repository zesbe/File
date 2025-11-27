#!/data/data/com.termux/files/usr/bin/bash
# Termux Quick Fix Script for Android 14+
# Run this if you encounter shell or pkg issues

echo "=== Termux Fix & Verification Script ==="
echo ""

# Check if running in correct shell
if [ "$SHELL" != "/data/data/com.termux/files/usr/bin/bash" ]; then
    echo "⚠ WARNING: You are not using Termux bash!"
    echo "Current shell: $SHELL"
    echo "Switching to Termux bash..."
    exec /data/data/com.termux/files/usr/bin/bash
    exit
fi

# Reload environment
echo "→ Reloading .bashrc..."
source ~/.bashrc

# Verify PATH
echo "→ Checking PATH..."
if echo "$PATH" | grep -q "/data/data/com.termux/files/usr/bin"; then
    echo "✓ PATH is correctly configured"
else
    echo "✗ PATH is missing Termux directories"
    export PATH="/data/data/com.termux/files/usr/bin:$PATH"
fi

# Verify pkg command
echo "→ Checking pkg command..."
if command -v pkg &> /dev/null; then
    echo "✓ pkg command is available"
    pkg --help &> /dev/null
else
    echo "✗ pkg command not found"
    echo "  Trying to fix..."
    export PATH="/data/data/com.termux/files/usr/bin:$PATH"
fi

# Check Android version
echo "→ System information:"
echo "  Shell: $SHELL"
echo "  PREFIX: $PREFIX"
echo "  TMPDIR: $TMPDIR"

# Test pkg
echo ""
echo "→ Testing package manager..."
/data/data/com.termux/files/usr/bin/pkg update -y

echo ""
echo "=== Fix Complete ==="
echo "You can now use: pkg update, pkg upgrade, pkg install <package>"
echo ""
echo "If you still have issues, run: bash ~/fix-termux.sh"

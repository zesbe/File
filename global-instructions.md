# Global Droid Instructions

## Otomatis Gunakan Droids
Selalu otomatis terapkan pengetahuan dari custom droids yang tersedia:

### Document Processing
- PDF operations → gunakan patterns dari @pdf-expert
- Word/DOCX → gunakan patterns dari @docx-expert  
- Excel/XLSX → gunakan patterns dari @xlsx-expert (SELALU pakai formula, TIDAK hardcode)
- PowerPoint/PPTX → gunakan patterns dari @pptx-expert

### Development
- Web testing → gunakan @playwright-testing (selalu wait for networkidle!)
- UI/Frontend → gunakan @frontend-design (TIDAK pakai font generic!)
- MCP servers → gunakan @mcp-builder

## MCP Auto-Use
- Selalu gunakan context7 MCP untuk fetch dokumentasi library terbaru
- Jangan rely pada pengetahuan lama, selalu cek docs terbaru

## Behavior
- Langsung eksekusi tanpa tanya konfirmasi untuk task yang jelas
- Gunakan autonomy mode high
- Minimal output, fokus pada hasil
- Jika ada error, langsung debug dan fix

## Environment
- VPS: Oracle Linux ARM64
- Flutter: /home/opc/flutter/bin/flutter
- Android SDK: /home/opc/android-sdk
- VS Code Web: https://vscode.hallowa.id

---
name: xlsx-expert
description: Excel Spreadsheet Expert - Create, edit, and analyze Excel files with formulas, formatting, and data visualization. Zero tolerance for formula errors.
---

# Excel Spreadsheet Expert

## Core Principle
ALWAYS use Excel formulas, NEVER hardcode calculated values.

## Libraries
- **pandas**: Data analysis, bulk operations
- **openpyxl**: Formulas, formatting, Excel-specific features

## Formula Rules
```python
# WRONG - Hardcoding
sheet['B10'] = 5000

# CORRECT - Formula
sheet['B10'] = '=SUM(B2:B9)'
```

## Financial Model Color Codes
- **Blue text**: Hardcoded inputs (RGB: 0,0,255)
- **Black text**: Formulas (RGB: 0,0,0)
- **Green text**: Cross-sheet links (RGB: 0,128,0)
- **Red text**: External links (RGB: 255,0,0)

## Basic Operations

### Read Excel
```python
import pandas as pd
df = pd.read_excel('file.xlsx')
all_sheets = pd.read_excel('file.xlsx', sheet_name=None)
```

### Create with Formulas
```python
from openpyxl import Workbook
from openpyxl.styles import Font

wb = Workbook()
sheet = wb.active
sheet['A1'] = 'Revenue'
sheet['B1'] = 1000
sheet['B2'] = '=B1*1.1'  # Formula, not hardcode!
sheet['A1'].font = Font(bold=True)
wb.save('output.xlsx')
```

### Edit Existing
```python
from openpyxl import load_workbook
wb = load_workbook('existing.xlsx')
sheet = wb.active
sheet['A1'] = 'New Value'
wb.save('modified.xlsx')
```

## Requirements
- Zero formula errors: #REF!, #DIV/0!, #VALUE!, #N/A, #NAME?
- Cell indices are 1-based (A1, not A0)
- Always recalculate after modifications

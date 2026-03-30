import zipfile
import xml.etree.ElementTree as ET

def read_xlsx(filename):
    with zipfile.ZipFile(filename) as z:
        # Get shared strings
        strings_xml = z.read('xl/sharedStrings.xml')
        root = ET.fromstring(strings_xml)
        ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
        strings = [t.text for t in root.findall('.//ns:t', ns)]
        
        # Get sheet1
        sheet_xml = z.read('xl/worksheets/sheet1.xml')
        root = ET.fromstring(sheet_xml)
        
        rows = []
        for row in root.findall('.//ns:row', ns):
            cells = []
            for c in row.findall('.//ns:c', ns):
                val_node = c.find('ns:v', ns)
                if val_node is None:
                    cells.append('')
                else:
                    val = val_node.text
                    # Check if string type
                    if c.get('t') == 's':
                        cells.append(strings[int(val)])
                    else:
                        cells.append(val)
            rows.append(cells)
    return rows

rows = read_xlsx('6354 companies list (1).xlsx')
print(f"Total rows: {len(rows)}")
print(rows[0])
print(rows[1])

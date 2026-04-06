import os

def fix_paths(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace relative paths starting with assets/ with ../../assets/
    # We use a regex-like approach to avoid replacing already fixed paths
    # But for simplicity here, we can replace 'assets/' with '../../assets/' 
    # but only if it's not preceded by '../'
    
    import re
    # Match 'assets/' that is NOT preceded by '../'
    # Using lookbehind is tricky in simple string replace, so regex is better
    content = re.sub(r'(?<!\.\./)assets/', '../../assets/', content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Fixed paths in {file_path}')

# Files to fix in lang-page/indo/
files_to_fix = [
    os.path.join('lang-page', 'indo', 'inspector.js'),
    os.path.join('lang-page', 'indo', 'inspector_msg.js')
]

for f in files_to_fix:
    if os.path.exists(f):
        fix_paths(f)
    else:
        print(f'File not found: {f}')

import json
import os
import re

transcript_path = "/home/petronski/.gemini/antigravity/brain/cf2dfb19-a8f3-473f-86de-08d612e6aef3/.system_generated/logs/transcript.jsonl"
base_dir_new = "/home/petronski/faujiniwas.test/fauji-niwas-app/"

files_to_recover = {
    "securityEngine.js": "src/security/securityEngine.js",
    "AdminPanel.jsx": "src/components/Admin/AdminPanel.jsx"
}

recovered_content = {k: "" for k in files_to_recover}

def clean_content(raw_text):
    lines = raw_text.split('\n')
    cleaned = []
    capture = False
    for line in lines:
        if "The following code has been modified" in line:
            capture = True
            continue
        if "The above content shows the entire, complete file contents" in line or "The above content does NOT show the entire file contents" in line:
            capture = False
            continue
            
        if capture:
            match = re.match(r'^\d+:\s(.*)$', line)
            if match:
                cleaned.append(match.group(1))
            else:
                match2 = re.match(r'^\d+:(.*)$', line)
                if match2:
                    cleaned.append(match2.group(1))
                elif line.strip():
                    cleaned.append(line)
    return '\n'.join(cleaned)

with open(transcript_path, 'r') as f:
    for line in f:
        try:
            step = json.loads(line)
            content = step.get('content', '')
            if content and 'File Path:' in content:
                if 'securityEngine.js' in content:
                    recovered_content['securityEngine.js'] = clean_content(content)
                elif 'AdminPanel.jsx' in content:
                    recovered_content['AdminPanel.jsx'] = clean_content(content)
        except Exception as e:
            pass

for key, rel_path in files_to_recover.items():
    content = recovered_content[key]
    if content:
        full_path = os.path.join(base_dir_new, rel_path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, 'w') as out:
            out.write(content)
        print(f"Recovered {rel_path} ({len(content)} bytes)")
    else:
        print(f"Failed to find {rel_path} in transcript!")


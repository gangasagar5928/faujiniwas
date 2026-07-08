import json
import sys

transcript_path = sys.argv[1]

with open(transcript_path, 'r') as f:
    for line in f:
        try:
            step = json.loads(line)
            if 'tool_calls' in step:
                for call in step['tool_calls']:
                    name = call.get('name')
                    if name in ['write_to_file', 'write_file']:
                        args = call.get('args', {})
                        target_file = args.get('TargetFile', '')
                        if isinstance(target_file, str) and 'AdminPanel.jsx' in target_file:
                            print(f"Found write_to_file for AdminPanel in {transcript_path}")
                    elif name in ['replace_file_content', 'multi_replace_file_content']:
                        args = call.get('args', {})
                        target_file = args.get('TargetFile', '')
                        if isinstance(target_file, str) and 'AdminPanel.jsx' in target_file:
                            print(f"Found edit for AdminPanel in {transcript_path}")
        except Exception as e:
            pass

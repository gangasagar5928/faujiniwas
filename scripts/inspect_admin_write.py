import json

transcript_path = "/home/petronski/.gemini/antigravity/brain/cf2dfb19-a8f3-473f-86de-08d612e6aef3/.system_generated/logs/transcript.jsonl"

with open(transcript_path, 'r') as f:
    for line in f:
        try:
            step = json.loads(line)
            if 'tool_calls' in step:
                for call in step['tool_calls']:
                    name = call.get('name')
                    if name == 'write_to_file':
                        args = call.get('args', {})
                        target_file = json.loads(args.get('TargetFile', 'null'))
                        if target_file and 'AdminPanel.jsx' in target_file:
                            print(f"Found write to AdminPanel.jsx! Length of content: {len(args.get('CodeContent', ''))}")
        except Exception as e:
            pass


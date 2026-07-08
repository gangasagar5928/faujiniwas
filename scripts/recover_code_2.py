import json

transcript_path = "/home/petronski/.gemini/antigravity/brain/cf2dfb19-a8f3-473f-86de-08d612e6aef3/.system_generated/logs/transcript.jsonl"

with open(transcript_path, 'r') as f:
    for line in f:
        try:
            step = json.loads(line)
            if 'tool_calls' in step:
                for call in step['tool_calls']:
                    if call.get('name') in ['write_to_file', 'replace_file_content', 'multi_replace_file_content']:
                        print("Found tool call:", call.get('name'))
                        print("Keys in args:", list(call.get('arguments', {}).keys()))
                        print("TargetFile value:", call.get('arguments', {}).get('TargetFile'))
                        break
        except Exception as e:
            pass

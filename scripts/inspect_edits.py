import json

transcript_path = "/home/petronski/.gemini/antigravity/brain/cf2dfb19-a8f3-473f-86de-08d612e6aef3/.system_generated/logs/transcript.jsonl"

def process_edits():
    with open(transcript_path, 'r') as f:
        for line in f:
            try:
                step = json.loads(line)
                if 'tool_calls' in step:
                    for call in step['tool_calls']:
                        name = call.get('name')
                        if name in ['replace_file_content', 'multi_replace_file_content']:
                            args = call.get('args', {})
                            target_file = json.loads(args.get('TargetFile', 'null'))
                            if not target_file: continue
                            
                            if 'ProfileModal.jsx' in target_file or 'Sidebar.jsx' in target_file:
                                print(f"--- Edit to {target_file} ---")
                                if name == 'replace_file_content':
                                    print("Target:")
                                    print(json.loads(args.get('TargetContent', '""')))
                                    print("Replacement:")
                                    print(json.loads(args.get('ReplacementContent', '""')))
                                elif name == 'multi_replace_file_content':
                                    chunks_str = args.get('ReplacementChunks', '[]')
                                    try:
                                        chunks = json.loads(chunks_str)
                                        if isinstance(chunks, str):
                                            chunks = json.loads(chunks)
                                    except:
                                        chunks = []
                                    for c in chunks:
                                        print("Target:")
                                        print(c.get('TargetContent', ''))
                                        print("Replacement:")
                                        print(c.get('ReplacementContent', ''))
            except Exception as e:
                pass

process_edits()

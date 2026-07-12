import json
import os
import traceback

transcript_path = "/home/petronski/.gemini/antigravity/brain/cf2dfb19-a8f3-473f-86de-08d612e6aef3/.system_generated/logs/transcript.jsonl"
base_dir_old = "/run/media/petronski/Local Disk D/fauji-niwas/fauji-niwas-app/"
base_dir_new = "/home/petronski/faujiniwas.test/fauji-niwas-app/"

def process_edits():
    with open(transcript_path, 'r') as f:
        for line_no, line in enumerate(f):
            try:
                step = json.loads(line)
                if 'tool_calls' in step:
                    for call in step['tool_calls']:
                        name = call.get('name')
                        if name in ['write_to_file', 'replace_file_content', 'multi_replace_file_content']:
                            args = call.get('args', {})
                            target_file_old = json.loads(args.get('TargetFile', 'null'))
                            
                            if not target_file_old or not target_file_old.startswith(base_dir_old):
                                continue
                                
                            target_file = target_file_old.replace(base_dir_old, base_dir_new)
                            
                            if name == 'write_to_file':
                                code = json.loads(args.get('CodeContent', '""'))
                                os.makedirs(os.path.dirname(target_file), exist_ok=True)
                                with open(target_file, 'w') as out:
                                    out.write(code)
                                print(f"[{line_no}] Wrote {target_file}")
                                
                            elif name == 'replace_file_content':
                                target_content = json.loads(args.get('TargetContent', '""'))
                                replacement_content = json.loads(args.get('ReplacementContent', '""'))
                                
                                if not os.path.exists(target_file):
                                    print(f"[{line_no}] ERROR: File {target_file} not found for replace.")
                                    continue

                                with open(target_file, 'r') as inFile:
                                    content = inFile.read()
                                
                                if target_content in content:
                                    content = content.replace(target_content, replacement_content, 1)
                                    with open(target_file, 'w') as out:
                                        out.write(content)
                                    print(f"[{line_no}] Replaced in {target_file}")
                                else:
                                    print(f"[{line_no}] FAILED TO FIND TARGET IN {target_file}")
                                    
                            elif name == 'multi_replace_file_content':
                                chunks_str = args.get('ReplacementChunks', '[]')
                                try:
                                    chunks = json.loads(chunks_str)
                                    if isinstance(chunks, str):
                                        chunks = json.loads(chunks)
                                except:
                                    chunks = []
                                
                                if not os.path.exists(target_file):
                                    print(f"[{line_no}] ERROR: File {target_file} not found for multi replace.")
                                    continue

                                with open(target_file, 'r') as inFile:
                                    content = inFile.read()
                                
                                success = True
                                for chunk in chunks:
                                    tc = chunk.get('TargetContent', '')
                                    rc = chunk.get('ReplacementContent', '')
                                    if tc in content:
                                        content = content.replace(tc, rc, 1)
                                    else:
                                        print(f"[{line_no}] FAILED TO FIND MULTI TARGET IN {target_file}")
                                        success = False
                                        
                                if success:
                                    with open(target_file, 'w') as out:
                                        out.write(content)
                                    print(f"[{line_no}] Multi-replaced in {target_file}")
            except Exception as e:
                print(f"Error on line {line_no}: {e}")
                # traceback.print_exc()

process_edits()

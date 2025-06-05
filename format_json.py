import json
import os
import re

def format_json_file(file_path):
    # Read the JSON file
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Process data based on its type
    if isinstance(data, dict):
        # Process each skill in a dictionary
        for skill_id, skill in data.items():
            # Format and sort tags if they exist
            if 'tags' in skill:
                skill['tags'] = sorted(skill['tags'])
            
            # Format and sort targeting modes if they exist
            if 'targetingModes' in skill:
                skill['targetingModes'] = sorted(skill['targetingModes'])
    elif isinstance(data, list):
        # Process each skill in a list
        for skill in data:
            # Format and sort tags if they exist
            if 'tags' in skill:
                skill['tags'] = sorted(skill['tags'])
            
            # Format and sort targeting modes if they exist
            if 'targetingModes' in skill:
                skill['targetingModes'] = sorted(skill['targetingModes'])
    
    # Write pretty-printed JSON to a string
    json_str = json.dumps(data, indent=2, ensure_ascii=False)

    # Regex to put tags and targetingModes arrays in a single line (non-greedy)
    def single_line_array(match):
        key = match.group(1)
        array = json.loads('[' + match.group(2).strip() + ']')
        return f'"{key}": {json.dumps(array, ensure_ascii=False)}'

    # Replace all tags and targetingModes arrays (non-greedy match for array contents)
    json_str = re.sub(r'"(tags|targetingModes)": \[(.*?)\]',
                     lambda m: single_line_array(m),
                     json_str, flags=re.DOTALL)

    # Write back to file
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(json_str)

def main():
    data_dir = 'Data'
    # Only process passives.json and skills.json
    for filename in ['passives.json', 'skills.json']:
        file_path = os.path.join(data_dir, filename)
        if os.path.exists(file_path):
            print(f"Processing {file_path}...")
            try:
                format_json_file(file_path)
                print(f"Finished processing {file_path}")
            except Exception as e:
                print(f"Error processing {file_path}: {str(e)}")

if __name__ == "__main__":
    main() 